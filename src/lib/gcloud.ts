import { prisma } from "@/lib/prisma";
import { getAccessToken } from "./oauth";
import { OauthProvider, ParticipationRole } from "@prisma/client";
import path from "path";
import * as google from "googleapis";

const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const SPREADSHEETS_MIME_TYPE = "application/vnd.google-apps.spreadsheet";

async function findOrCreateResource({
  mimeType,
  name,
  parentFolderId,
  service,
}: {
  mimeType: string;
  name: string;
  parentFolderId: string;
  service: google.drive_v3.Drive;
}): Promise<string> {
  const { data } = await service.files.list({
    q: `trashed=false and name='${name}' and '${parentFolderId}' in parents and mimeType = '${mimeType}'`,
  });
  if (!data.files) {
    throw Error("Google Drive API failed. findOrCreateResource -> not files");
  }

  let id: string | null = null;

  if (data.files.length === 0) {
    id =
      (
        await service.files.create({
          requestBody: {
            mimeType: mimeType,
            name: name,
            parents: [parentFolderId],
          },
          fields: "id",
        })
      ).data.id ?? null;
  } else {
    id = data.files[0].id ?? null;
  }

  if (!id) {
    throw Error(
      "Google Drive API failed. findOrCreateResource -> not folderId",
    );
  }

  return id;
}

async function getOrCreateFolder({
  dir,
  parentId,
  service,
}: {
  parentId: string;
  dir: string;
  service: google.drive_v3.Drive;
}): Promise<string> {
  if (!dir) {
    return parentId;
  }
  const parts = dir.split("/");
  const base = parts[0];
  const rest = parts.slice(1).join("/");

  const folderId = await findOrCreateResource({
    mimeType: FOLDER_MIME_TYPE,
    name: base,
    parentFolderId: parentId,
    service,
  });

  return await getOrCreateFolder({ dir: rest, parentId: folderId, service });
}

async function getOrCreateFile({
  filepath,
  rootFolderId,
  service,
  mimeType,
}: {
  filepath: string;
  rootFolderId: string;
  service: google.drive_v3.Drive;
  mimeType: string;
}): Promise<string> {
  const filename = path.basename(filepath);
  const dir = path.dirname(filepath);
  const folderId = await getOrCreateFolder({
    dir,
    parentId: rootFolderId,
    service,
  });
  return await findOrCreateResource({
    mimeType,
    parentFolderId: folderId,
    name: filename,
    service,
  });
}

async function getOrCreateSheets({
  names,
  spreadsheetId,
  service,
}: {
  names: Array<string>;
  spreadsheetId: string;
  service: google.sheets_v4.Sheets;
}): Promise<Array<number>> {
  const existingSheetsResponse = await service.spreadsheets.get({
    spreadsheetId,
  });
  const existingSheets =
    existingSheetsResponse.data.sheets?.slice(0, names.length) || [];

  const { data } = await service.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Upsert sheet names
        ...names.map((title, index) => {
          const existingSheetProperties = existingSheets.at(index)?.properties;
          if (!existingSheetProperties) {
            return {
              addSheet: {
                properties: { title, index },
              },
            };
          }

          return {
            updateSheetProperties: {
              fields: "*",
              properties: { ...existingSheetProperties, title },
            },
          };
        }),
      ],
    },
  });

  return names.map((_, index) => {
    const dataSheetId = data.replies?.at(index)?.addSheet?.properties?.sheetId;
    const existingSheetId = existingSheets.at(index)?.properties?.sheetId;
    const sheetId = dataSheetId || existingSheetId;
    if (sheetId === null || sheetId === undefined) {
      throw Error("Could not find sheet Id");
    }
    return sheetId;
  });
}

export async function listOFMIFolders(): Promise<void> {
  const oauth = await prisma.userOauth.findFirst({
    where: {
      UserAuth: { email: "ofmi@omegaup.com" },
    },
    include: {
      UserAuth: true,
    },
  });
  const userAuthId = oauth?.UserAuth.id;
  if (!userAuthId) {
    return;
  }
  const token = await getAccessToken(userAuthId, OauthProvider.GCLOUD, oauth);

  const auth = new google.Auth.OAuth2Client({
    credentials: {
      access_token: token,
    },
  });
  const service = new google.drive_v3.Drive({
    auth,
  });

  const spreadsheetId = await getOrCreateFile({
    filepath: "4ta-ofmi/registro-participantes",
    rootFolderId: "1Jrpl6n5zhdCdhXLXehHlNoaxtDvo51Sd",
    service,
    mimeType: SPREADSHEETS_MIME_TYPE,
  });

  const sheets = new google.sheets_v4.Sheets({ auth });

  const sheetNames = Object.keys(ParticipationRole);
  const sheetIds = await getOrCreateSheets({
    names: sheetNames,
    spreadsheetId,
    service: sheets,
  });

  console.log({ spreadsheetId, sheetNames, sheetIds });
}
