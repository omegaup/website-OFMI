import config from "@/config/default";
import { TTLCache } from "./cache";
import { prisma } from "./prisma";

const caches = {
  ofmiUserAuthId: new TTLCache<string>(),
};

export async function ofmiUserAuthId(): Promise<string> {
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
