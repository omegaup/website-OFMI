import path from "path";
import * as google from "googleapis";
import { getAccessToken } from "./oauth";
import { OauthProvider, Ofmi, ParticipationRole } from "@prisma/client";
import { findParticipants } from "./ofmi";
import { PronounName } from "@/types/pronouns";
import { jsonToCsv } from "@/utils";
import config from "@/config/default";

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
  service,
  parentFolderId = config.GDRIVE_ROOT_FOLDER,
}: {
  dir: string;
  service: google.drive_v3.Drive;
  parentFolderId?: string;
}): Promise<string> {
  if (!dir) {
    return parentFolderId;
  }
  const parts = dir.split("/");
  const base = parts[0];
  const rest = parts.slice(1).join("/");

  const folderId = await findOrCreateResource({
    mimeType: FOLDER_MIME_TYPE,
    name: base,
    parentFolderId: parentFolderId,
    service,
  });

  return await getOrCreateFolder({
    dir: rest,
    parentFolderId: folderId,
    service,
  });
}

async function getOrCreateFile({
  filepath,
  service,
  mimeType,
  parentFolderId = config.GDRIVE_ROOT_FOLDER,
}: {
  filepath: string;
  service: google.drive_v3.Drive;
  mimeType: string;
  parentFolderId?: string;
}): Promise<string> {
  const filename = path.basename(filepath);
  const dir = path.dirname(filepath);
  const folderId = await getOrCreateFolder({
    dir,
    service,
    parentFolderId,
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

export async function exportParticipants({
  userAuthId,
  ofmi,
}: {
  userAuthId: string;
  ofmi: Ofmi;
}): Promise<string> {
  const token = await getAccessToken(userAuthId, OauthProvider.GCLOUD);

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
    service,
    mimeType: SPREADSHEETS_MIME_TYPE,
  });

  const sheets = new google.sheets_v4.Sheets({ auth });

  const sheetNames = [
    ParticipationRole.CONTESTANT,
    ParticipationRole.VOLUNTEER,
  ];
  const sheetIds = await getOrCreateSheets({
    names: sheetNames,
    spreadsheetId,
    service: sheets,
  });
  const contestantSheetId = sheetIds.at(0);
  const volunteerSheetId = sheetIds.at(1);
  if (contestantSheetId === undefined || volunteerSheetId === undefined) {
    throw Error("Bug: Sheet id do not coincide");
  }

  // Retrieve data
  const participants = await findParticipants(ofmi);

  const createData = (role: ParticipationRole): string => {
    const json = participants
      .filter((v) => v.userParticipation.role === role)
      .map((participation) => {
        let data: Record<string, string> = {
          "Nombre completo": `${participation.user.firstName} ${participation.user.lastName}`,
          Email: participation.user.email,
          Pronombre: PronounName(participation.user.pronouns),
        };
        const { userParticipation } = participation;
        if (userParticipation.role === "CONTESTANT") {
          data = {
            ...data,
            Estado: userParticipation.schoolState,
            Escuela: userParticipation.schoolName,
            "Fecha de nacimiento": participation.user.birthDate,
          };
        }
        return data;
      });
    return jsonToCsv(json);
  };

  // Paste data
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Update CONTESTANT sheet
        {
          pasteData: {
            coordinate: {
              sheetId: contestantSheetId,
              rowIndex: 0,
              columnIndex: 0,
            },
            data: createData(ParticipationRole.CONTESTANT),
            delimiter: ",",
          },
        },
        // Update VOLUNTEER sheet
        {
          pasteData: {
            coordinate: {
              sheetId: volunteerSheetId,
              rowIndex: 0,
              columnIndex: 0,
            },
            data: createData(ParticipationRole.VOLUNTEER),
            delimiter: ",",
          },
        },
      ],
    },
  });

  return spreadsheetId;
}