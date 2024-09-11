import config from "@/config/default";
import { getOrCreateDriveFolder } from "./gcloud";
import path from "path";
import { friendlyOfmiName } from "./ofmi";
import { ofmiUserAuthId } from "./ofmiUserImpersonator";

export async function findOrCreateDriveFolderForParticipant({
  email,
  ofmiEdition,
}: {
  email: string;
  ofmiEdition: number;
}): Promise<string> {
  const userAuthId = await ofmiUserAuthId();
  return await getOrCreateDriveFolder({
    dir: path.join(
      friendlyOfmiName(ofmiEdition),
      "Assets",
      "Participants",
      email,
    ),
    userAuthId,
    rootFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
  });
}
