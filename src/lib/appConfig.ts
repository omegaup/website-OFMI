import { prisma } from "@/lib/prisma";
import { TTLCache } from "@/lib/cache";

const TWELVE_HOURS_IN_SECONDS = 12 * 60 * 60;

const cache = new TTLCache<string>({ ttl: TWELVE_HOURS_IN_SECONDS });

export async function getFlag(flagName: string): Promise<string | null> {
  const cached = cache.get(flagName);
  if (cached !== null) {
    return cached;
  }

  const config = await prisma.appConfig.findUnique({
    where: { flagName },
  });

  if (!config) {
    return null;
  }

  cache.set(flagName, config.value);
  return config.value;
}

export async function getBooleanFlag(flagName: string): Promise<boolean> {
  const value = await getFlag(flagName);
  if (value === null) {
    return false;
  }
  return value === "true";
}

export function clearAppConfigCache(): void {
  cache.clear();
}
