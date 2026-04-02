import { prisma } from "@/lib/prisma";
import { BadRequestError } from "@/types/errors";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { NextApiRequest, NextApiResponse } from "next";
import { findMostRecentOfmi } from "@/lib/ofmi";

const MentorshipStatus = Type.Object({
  volunteerParticipationId: Type.String(),
  mentorshipEnabled: Type.Boolean(),
});

const UpdateMentorshipStatusRequest = Type.Object({
  updates: Type.Array(MentorshipStatus),
});
type UpdateMentorshipStatusRequest = Static<
  typeof UpdateMentorshipStatusRequest
>;

export type MentorResponse = {
  volunteerParticipationId: string;
  mentorshipEnabled: boolean;
  firstName: string;
  lastName: string;
  email?: string;
};

const getMentorshipList = async (
  res: NextApiResponse<MentorResponse[] | BadRequestError>,
): Promise<void> => {
  const ofmi = await findMostRecentOfmi();

  const participations = await prisma.participation.findMany({
    where: {
      ofmiId: ofmi.id,
      role: "VOLUNTEER",
      VolunteerParticipation: {
        mentorOptIn: true,
      },
    },
    select: {
      VolunteerParticipation: {
        select: {
          id: true,
          mentorshipEnabled: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          UserAuth: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  const response: MentorResponse[] = participations.map((p) => ({
    volunteerParticipationId: p.VolunteerParticipation!.id,
    mentorshipEnabled: p.VolunteerParticipation!.mentorshipEnabled,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
    email: p.user.UserAuth?.email,
  }));

  res.status(200).json(response);
};

const updateMentorshipStatus = async (
  req: NextApiRequest,
  res: NextApiResponse<BadRequestError>,
): Promise<void> => {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ message: "Bad Request: Body must be an object" });
    return;
  }

  if (!Value.Check(UpdateMentorshipStatusRequest, req.body)) {
    try {
      const error = parseValueError(
        Value.Errors(UpdateMentorshipStatusRequest, req.body).First()!,
      );
      res.status(400).json({ message: `Bad Request: ${error}` });
      return;
    } catch (e) {
      res.status(400).json({ message: "Bad Request: Invalid data format" });
      return;
    }
  }
  const { updates } = req.body as UpdateMentorshipStatusRequest;

  await prisma.$transaction(
    updates.map((update) =>
      prisma.volunteerParticipation.update({
        where: {
          id: update.volunteerParticipationId,
        },
        data: {
          mentorshipEnabled: update.mentorshipEnabled,
        },
      }),
    ),
  );
  res.status(200).json({ message: "Updates successful" });
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<MentorResponse[] | BadRequestError>,
): Promise<void> {
  try {
    if (req.method === "GET") {
      await getMentorshipList(res);
      return;
    }
    if (req.method === "POST") {
      await updateMentorshipStatus(req, res);
      return;
    }
    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Error in /api/admin/volunteers/mentorship:", error);
    res.status(500).json({
      message: `Internal Server Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
