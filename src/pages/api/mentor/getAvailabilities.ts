import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import {
  GetAvailabilitiesRequestSchema,
  GetAvailabilitiesResponse,
  UserAvailability,
} from "@/types/mentor.schema";
import { parseValueError } from "@/lib/typebox";
import { prisma } from "@/lib/prisma";
import { getAccessToken } from "@/lib/oauth";
import { getAvailabilities } from "@/lib/calendly";

const MAX_TIME_RANGE_MILLIS = 30 * 24 * 60 * 60 * 1000;

async function getAvailabilitiesHandler(
  req: NextApiRequest,
  res: NextApiResponse<GetAvailabilitiesResponse | BadRequestError>,
): Promise<void> {
  const { query } = req;
  const body = {
    ofmiEdition: Number(query.ofmiEdition),
    startTime: query.startTime,
    endTime: query.endTime,
  };

  if (!Value.Check(GetAvailabilitiesRequestSchema, body)) {
    const firstError = Value.Errors(
      GetAvailabilitiesRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request query."}`,
    });
  }
  const ofmiEdition = body.ofmiEdition;
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);

  if (
    startTime.getTime() < Date.now() ||
    startTime.getTime() > endTime.getTime() ||
    endTime.getTime() - startTime.getTime() > MAX_TIME_RANGE_MILLIS
  ) {
    return res.status(400).json({
      message:
        "El rango solicitado debe ser del futuro, y no puede exceder 30 días",
    });
  }

  // Get all mentors that are connected with Calendly
  const mentorsDb = await prisma.mentorParticipation.findMany({
    where: {
      Participation: {
        some: {
          ofmi: { edition: ofmiEdition },
          role: "MENTOR",
          user: { UserAuth: { UserOauth: { some: { provider: "CALENDLY" } } } },
        },
      },
    },
    include: {
      Participation: {
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
      },
    },
  });

  const mentors = await Promise.all(
    mentorsDb.map(async (mentor) => {
      if (mentor.Participation.length == 0) {
        return null;
      }
      const participation = mentor.Participation[0];
      if (participation.user.UserAuth.UserOauth.length == 0) {
        return null;
      }
      const userOauth = participation.user.UserAuth.UserOauth[0];
      const userAuthId = participation.user.UserAuth.id;
      const availabilities = await getAvailabilities({
        token: await getAccessToken(userAuthId, userOauth.provider, userOauth),
        startTime,
        endTime,
      });
      if (!availabilities) {
        return null;
      }
      return {
        firstName: participation.user.firstName,
        lastName: participation.user.lastName,
        ...availabilities,
      };
    }),
  );

  // Filter did not work out, let's push
  const availabilities: Array<UserAvailability> = [];
  mentors.forEach((v) => {
    if (v !== null) availabilities.push(v);
  });

  return res.status(200).json({ availabilities });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<GetAvailabilitiesResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "GET") {
    await getAvailabilitiesHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
