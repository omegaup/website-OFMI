import { TTLCache } from "./cache";
import { prisma } from "./prisma";
import { getSecretOrError } from "./secret";
import config from "@/config/default";
import { getOrCreateDriveFolder } from "./gcloud";
import path from "path";
import { friendlyOfmiName } from "./ofmi";
import { ParticipationRole } from "@prisma/client";

const ACT_AS_OFMI_TOKEN_KEY = "ACT_AS_OFMI_TOKEN";

const caches = {
  ofmiUserAuthId: new TTLCache<string>(),
};

async function ofmiUserAuthId(): Promise<string> {
  // Check if the cache has the result
  const ttlCache = caches["ofmiUserAuthId"];
  const cacheKey = "ofmiUserAuthId";
  const cacheValue = ttlCache.get(cacheKey);
  if (cacheValue) {
    return cacheValue;
  }

  const user = await prisma.userAuth.findUnique({
    where: { email: config.OFMI_USER_EMAIL },
  });
  if (!user) {
    throw Error(`There is no user ${config.OFMI_USER_EMAIL}`);
  }

  ttlCache.set(cacheKey, user.id);
  return user.id;
}

export async function assertCanIActAsOfmiUser(token: string): Promise<string> {
  if (token !== getSecretOrError(ACT_AS_OFMI_TOKEN_KEY)) {
    throw Error(`You can not act as ${config.OFMI_USER_EMAIL}`);
  }
  return await ofmiUserAuthId();
}

export async function findOrCreateDriveFolderForParticipant({
  email,
  ofmiEdition,
}: {
  email: string;
  ofmiEdition: number;
}): Promise<string> {
  const userAuthId = await ofmiUserAuthId();
  return await getOrCreateDriveFolder({
    dir: path.join(friendlyOfmiName(ofmiEdition), `Assets`, email, "shared"),
    userAuthId,
    rootFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
  });
}
