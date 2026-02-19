import path from "path";
import * as google from "googleapis";
import config from "@/config/default";
import { findMostRecentOfmi, friendlyOfmiName } from "@/lib/ofmi";
import {
  listFolderChildren,
  getGoogleAuth,
  listResourceChildren,
  getOrCreateFolder,
  FOLDER_MIME_TYPE,
  // trashResource,
} from "@/lib/gcloud";
import { ofmiUserAuthId } from "@/lib/ofmiUserImpersonator";

async function removeMediaRec({
  folderId,
  rootFolderId,
  service,
}: {
  folderId: string;
  rootFolderId: string;
  service: google.drive_v3.Drive;
}): Promise<void> {
  const videoFiles = await listResourceChildren({
    folderId,
    service,
    mimeType: "video/",
    mimeTypeOp: "contains",
  });
  for (const file of videoFiles) {
    if (typeof file.id === "string" && typeof file.name === "string") {
      console.log(`Deleting file: ${file.name} (${file.id}): ${file.mimeType}`);
      // Uncomment the following line to actually trash the file
      // await trashResource({ id: file.id, service });
    }
  }

  const driveFolders = await listFolderChildren({
    folderId,
    service,
  });
  for (const folder of driveFolders) {
    if (typeof folder.id === "string") {
      await removeMediaRec({
        folderId: folder.id,
        rootFolderId,
        service,
      });
    }
  }
}

export async function removeMedia(): Promise<void> {
  const ofmi = await findMostRecentOfmi();
  const userAuthId = await ofmiUserAuthId();
  const service = new google.drive_v3.Drive({
    auth: await getGoogleAuth(userAuthId),
  });
  const participantsFolderId = await getOrCreateFolder({
    dir: path.join(friendlyOfmiName(ofmi.edition), "Assets", "Participants"),
    service,
    parentFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
  });

  // Extrañamente no sirve hacer directo `removeMediaRec` desde aquí.
  // Tiene cara de ser un bug al hacer la query de Google API
  // Buscamos los folders de participantes a mano.
  const { data } = await service.files.list({
    q: `trashed=false and mimeType = '${FOLDER_MIME_TYPE}'`,
    fields: "files(id, name, parents)",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  await data.files
    ?.filter((file) => file.parents?.includes(participantsFolderId))
    .forEach(async (file) => {
      if (typeof file.id === "string") {
        console.log(
          `Iterating folder: ${file.name} (${file.id}): ${file.mimeType}`,
        );
        await removeMediaRec({
          folderId: file.id,
          rootFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
          service,
        });
      }
    });
}

removeMedia()
  .then(() => {
    console.log("Media removed successfully.");
  })
  .catch((e) => {
    console.error("Error removing media:", e);
  });
