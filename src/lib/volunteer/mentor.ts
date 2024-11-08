import { prisma } from "@/lib/prisma";
import { getAvailabilities } from "@/lib/calendly";
import { getAccessToken } from "@/lib/oauth";
import { UserAvailability } from "@/types/mentor.schema";
import pLimit from "p-limit";
import { ParticipationWithUserOauth } from "@/types/participation.schema";

async function getAvailiabity(
  participation: ParticipationWithUserOauth,
  startTime: Date,
  endTime: Date,
): Promise<UserAvailability | null> {
  const userOauth = participation.user.UserAuth.UserOauth[0];
  const userAuthId = participation.user.UserAuth.id;
  const availabilities = await getAvailabilities({
    token: await getAccessToken(userAuthId, userOauth.provider, userOauth),
    startTime,
    endTime,
  });

  if (!availabilities) return null;

  return {
    volunteerAuthId: userAuthId,
    volunteerParticipationId: participation.volunteerParticipationId!,
    firstName: participation.user.firstName,
    lastName: participation.user.lastName,
    ...availabilities,
  };
}

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
      role: "VOLUNTEER",
      VolunteerParticipation: { mentorOptIn: true },
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

  // Limit concurrent active promises to 5
  const limit = pLimit(5);
  const mentors: Array<UserAvailability> = [];

  const result = await Promise.allSettled(
    mentorsDb.map((participation) =>
      limit(() => getAvailiabity(participation, startTime, endTime)),
    ),
  );

  result.map((res) => {
    if (res.status === "fulfilled") {
      if (res.value !== null) {
        mentors.push(res.value);
      }
    }
  });

  return mentors;
}
