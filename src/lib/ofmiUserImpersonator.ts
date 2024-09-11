import config from "@/config/default";
import { TTLCache } from "./cache";
import { UserAuth, prisma } from "./prisma";

const caches = {
  ofmiUserAuth: new TTLCache<UserAuth>(),
};

export async function ofmiUserAuth(): Promise<UserAuth> {
  // Check if the cache has the result
  const ttlCache = caches["ofmiUserAuth"];
  const cacheKey = "ofmiUserAuth";
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

  ttlCache.set(cacheKey, user);
  return user;
}

export async function ofmiUserAuthId(): Promise<string> {
  // Check if the cache has the result
  return (await ofmiUserAuth()).id;
}
