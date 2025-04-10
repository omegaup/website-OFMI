import path from "path";
import * as google from "googleapis";
import config from "@/config/default";
import { findMostRecentOfmi, friendlyOfmiName } from "@/lib/ofmi";
import {
  listFolderChildren,
  getGoogleAuth,
  listResourceChildren,
  // trashResource,
} from "@/lib/gcloud";
import { ofmiUserAuthId } from "@/lib/ofmiUserImpersonator";

async function removeMediaRec({
  dir,
  rootFolderId,
  service,
}: {
  dir: string;
  rootFolderId: string;
  service: google.drive_v3.Drive;
}): Promise<void> {
  const videoFiles = await listResourceChildren({
    dir,
    rootFolderId,
    service,
    mimeType: "video/",
    mimeTypeOp: "contains",
  });
  for (const file of videoFiles) {
    if (typeof file.id === "string" && typeof file.name === "string") {
      const filePath = path.join(dir, file.name);
      console.log(`Deleting file: ${filePath} (${file.id}): ${file.mimeType}`);
      // Uncomment the following line to actually trash the file
      // await trashResource({ id: file.id, service });
    }
  }
  const driveFolders = await listFolderChildren({
    dir,
    rootFolderId,
    service,
  });
  for (const folder of driveFolders) {
    if (typeof folder.name === "string") {
      const folderDir = path.join(dir, folder.name);
      await removeMediaRec({
        dir: folderDir,
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
  await removeMediaRec({
    dir: path.join(friendlyOfmiName(ofmi.edition), "Assets", "Participants"),
    rootFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
    service,
  });
}

removeMedia()
  .then(() => {
    console.log("Media removed successfully.");
  })
  .catch((e) => {
    console.error("Error removing media:", e);
  });
