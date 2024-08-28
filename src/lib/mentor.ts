import { prisma } from "@/lib/prisma";
import { getAvailabilities } from "./calendly";
import { getAccessToken } from "./oauth";
import { UserAvailability } from "@/types/mentor.schema";

export async function getAllAvailabilities({
  ofmiEdition,
  startTime,
  endTime,
}: {
  ofmiEdition: number;
  startTime: Date;
  endTime: Date;
}): Promise<Array<UserAvailability>> {
  // Get all mentors that are connected with Calendly
  const mentorsDb = await prisma.participation.findMany({
    where: {
      ofmi: { edition: ofmiEdition },
      role: "MENTOR",
      user: { UserAuth: { UserOauth: { some: { provider: "CALENDLY" } } } },
    },
    include: {
      user: {
        include: {
          UserAuth: {
            include: {
              UserOauth: true,
            },
          },
        },
      },
    },
  });

  const mentors: Array<UserAvailability> = [];
  for (const participation of mentorsDb) {
    const userOauth = participation.user.UserAuth.UserOauth[0];
    const userAuthId = participation.user.UserAuth.id;
    const availabilities = await getAvailabilities({
      token: await getAccessToken(userAuthId, userOauth.provider, userOauth),
      startTime,
      endTime,
    });
    if (!availabilities) {
      continue;
    }
    mentors.push({
      firstName: participation.user.firstName,
      lastName: participation.user.lastName,
      ...availabilities,
    });
  }

  return mentors;
}
