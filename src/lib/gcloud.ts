import path from "path";
import * as google from "googleapis";
import { getAccessToken } from "./oauth";
import { OauthProvider, Ofmi, ParticipationRole } from "@prisma/client";
import { findParticipants, friendlyOfmiName } from "./ofmi";
import { PronounName } from "@/types/pronouns";
import { jsonToCsv } from "@/utils";
import config from "@/config/default";
import { TTLCache } from "./cache";
import { findAllParticipantsInVenue, findAllVenueQuotas } from "./venue";
import { UserWithVenueQuota } from "@/types/user.schema";
import { Venue, VenueQuotas } from "@/types/venue.schema";

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const SPREADSHEETS_MIME_TYPE = "application/vnd.google-apps.spreadsheet";

export const spreadsheetURL = (id: string): string =>
  `https://docs.google.com/spreadsheets/d/${id}`;

const caches = {
  findOrCreateResource: new TTLCache<string>(),
};

export async function getGoogleAuth(
  userAuthId: string,
): Promise<google.Auth.OAuth2Client> {
  const token = await getAccessToken(userAuthId, OauthProvider.GCLOUD);

  return new google.Auth.OAuth2Client({
    credentials: {
      access_token: token,
    },
  });
}

// Returns the id of the resource
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
  // Check if the cache has the result
  const ttlCache = caches["findOrCreateResource"];
  const cacheKey = `${name}:${parentFolderId}:${mimeType}`;
  const cacheValue = ttlCache.get(cacheKey);
  if (cacheValue) {
    return cacheValue;
  }

  const { data } = await service.files.list({
    q: `trashed=false and name='${name}' and '${parentFolderId}' in parents and mimeType = '${mimeType}'`,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
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
          supportsAllDrives: true,
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

  ttlCache.set(cacheKey, id);
  return id;
}

async function getOrCreateFolder({
  dir,
  service,
  parentFolderId,
}: {
  dir: string;
  service: google.drive_v3.Drive;
  parentFolderId: string;
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
  parentFolderId,
}: {
  filepath: string;
  service: google.drive_v3.Drive;
  mimeType: string;
  parentFolderId: string;
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

// Returns the URL of the Drive Folder
export async function getOrCreateDriveFolder({
  userAuthId,
  dir,
  rootFolderId,
}: {
  userAuthId: string;
  dir: string;
  rootFolderId: string;
}): Promise<string> {
  const auth = await getGoogleAuth(userAuthId);
  const service = new google.drive_v3.Drive({
    auth,
  });
  const id = await getOrCreateFolder({
    dir,
    service,
    parentFolderId: rootFolderId,
  });
  return `https://drive.google.com/drive/folders/${id}`;
}

async function listFolderChildren({
  userAuthId,
  dir,
  rootFolderId,
}: {
  userAuthId: string;
  dir: string;
  rootFolderId: string;
}): Promise<google.drive_v3.Schema$File[]> {
  const auth = await getGoogleAuth(userAuthId);
  const service = new google.drive_v3.Drive({
    auth,
  });
  const id = await getOrCreateFolder({
    dir,
    service,
    parentFolderId: rootFolderId,
  });
  const { data } = await service.files.list({
    q: `trashed=false and '${id}' in parents and mimeType = '${FOLDER_MIME_TYPE}'`,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  return data.files || [];
}

export async function exportParticipants({
  userAuthId,
  ofmi,
  spreadsheetName,
}: {
  userAuthId: string;
  ofmi: Ofmi;
  spreadsheetName: string;
}): Promise<string> {
  const auth = await getGoogleAuth(userAuthId);
  const service = new google.drive_v3.Drive({
    auth,
  });

  const spreadsheetId = await getOrCreateFile({
    filepath: spreadsheetName,
    service,
    mimeType: SPREADSHEETS_MIME_TYPE,
    parentFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
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
  const driveFolders = await listFolderChildren({
    dir: path.join(friendlyOfmiName(ofmi.edition), "Assets", "Participants"),
    userAuthId,
    rootFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
  });

  const createData = (role: ParticipationRole): string => {
    const json = participants
      .filter((v) => v.userParticipation.role === role)
      .map((participation) => {
        const optInToString = (f: boolean): string => {
          return f ? "Sí" : "No";
        };
        let data: Record<string, string> = {
          "Nombre completo": `${participation.user.firstName.trim()} ${participation.user.lastName.trim()}`,
          Email: participation.user.email.trim(),
          Pronombre: PronounName(participation.user.pronouns),
          "Fecha de nacimiento": `=DATEVALUE(MID("${participation.user.birthDate}",1,10))+TIMEVALUE(MID("${participation.user.birthDate}",12,8))`,
          "Google Drive Folder": `https://drive.google.com/drive/folders/${
            driveFolders.find((file) => file.name === participation.user.email)
              ?.id || ""
          }`,
        };
        const { userParticipation } = participation;
        if (userParticipation.role === "CONTESTANT") {
          data = {
            ...data,
            "Fecha de registro": `=DATEVALUE(MID("${participation.registeredAt}",1,10))+TIMEVALUE(MID("${participation.registeredAt}",12,8))`,
            Estado: userParticipation.schoolState,
            Escuela: userParticipation.schoolName.trim(),
          };
        } else if (userParticipation.role === "VOLUNTEER") {
          data = {
            ...data,
            Teléfono: participation.user.mailingAddress.phone,
            "Comunidad / Redes": optInToString(
              userParticipation.communityOptIn,
            ),
            "Vinculación educativa": optInToString(
              userParticipation.educationalLinkageOptIn,
            ),
            Fundraising: optInToString(userParticipation.fundraisingOptIn),
            Entrenamientos: optInToString(userParticipation.trainerOptIn),
            Problemsetter: optInToString(userParticipation.problemSetterOptIn),
            Mentorías: optInToString(userParticipation.mentorOptIn),
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

export async function exportVenueInfo({
  userAuthId,
  ofmi,
  spreadsheetName,
}: {
  userAuthId: string;
  ofmi: Ofmi;
  spreadsheetName: string;
}): Promise<string> {
  const auth = await getGoogleAuth(userAuthId);
  const service = new google.drive_v3.Drive({
    auth,
  });

  const spreadsheetId = await getOrCreateFile({
    filepath: spreadsheetName,
    service,
    mimeType: SPREADSHEETS_MIME_TYPE,
    parentFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
  });

  const sheets = new google.sheets_v4.Sheets({ auth });

  const sheetNames = ["SedesParticipantes", "SedesCupos"];
  const sheetIds = await getOrCreateSheets({
    names: sheetNames,
    spreadsheetId,
    service: sheets,
  });

  const venueParticipants = sheetIds.at(0);
  const venueQuotas = sheetIds.at(1);
  if (venueParticipants === undefined || venueQuotas === undefined) {
    throw Error("Bug: Sheet id do not coincide");
  }

  const activeVenueQuotas: VenueQuotas = await findAllVenueQuotas(ofmi.id);
  const mapVenueQuotasToVenue = new Map(
    (await activeVenueQuotas).map((vq) => [vq.id, vq.venue]),
  );
  const participantsRegistered: UserWithVenueQuota[] =
    await findAllParticipantsInVenue(
      (await activeVenueQuotas).map((vq) => vq.id),
    );

  const createParticipantRegistrationData = (
    participantsRegistered: UserWithVenueQuota[],
    mapVenueQuotasToVenue: Map<string, Venue>,
  ): string => {
    const json = participantsRegistered.map((pr) => {
      return {
        "Nombre completo": `${pr.firstName.trim()} ${pr.lastName.trim()}`,
        Sede: `${pr.venueQuotaId ? mapVenueQuotasToVenue.get(pr.venueQuotaId)?.name : ""}`,
      };
    });
    return jsonToCsv(json);
  };

  const createVenueData = (activeVenueQuotas: VenueQuotas): string => {
    const json = activeVenueQuotas.map((vq) => {
      return {
        Sede: `${vq.venue.name}`,
        Cupo: `${vq.capacity}`,
        Registrados: `${vq.occupied}`,
      };
    });
    return jsonToCsv(json);
  };

  // Paste data
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Update Participants sheet
        {
          pasteData: {
            coordinate: {
              sheetId: venueParticipants,
              rowIndex: 0,
              columnIndex: 0,
            },
            data: createParticipantRegistrationData(
              participantsRegistered,
              mapVenueQuotasToVenue,
            ),
            delimiter: ",",
          },
        },
        // Update Venue Information sheet
        {
          pasteData: {
            coordinate: {
              sheetId: venueQuotas,
              rowIndex: 0,
              columnIndex: 0,
            },
            data: createVenueData(activeVenueQuotas),
            delimiter: ",",
          },
        },
      ],
    },
  });

  return spreadsheetId;
}
