import { prisma } from "@/lib/prisma";
import { BadRequestError } from "@/types/errors";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { NextApiRequest, NextApiResponse } from "next";

const MentorshipStatus = Type.Object({
  volunteerParticipationId: Type.String(),
  mentorshipEnabled: Type.Boolean(),
});

const UpdateMentorshipStatusRequest = Type.Array(MentorshipStatus);
type UpdateMentorshipStatusRequest = Static<typeof UpdateMentorshipStatusRequest>;

const getMentorshipList = async (res: NextApiResponse) => {
  const volunteers = await prisma.volunteerParticipation.findMany({
    where: {
      mentorOptIn: true,
    },
    select: {
      id: true,
      mentorshipEnabled: true,
      Participation: {
        where: { role: 'VOLUNTEER' },
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              UserAuth: { // The relation field on User model
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const response = volunteers
    .filter(v => v.Participation && v.Participation.length > 0)
    .map((v) => ({
      volunteerParticipationId: v.id,
      mentorshipEnabled: v.mentorshipEnabled,
      firstName: v.Participation[0].user.firstName,
      lastName: v.Participation[0].user.lastName,
      email: v.Participation[0].user.UserAuth?.email,
    }));

  return res.status(200).json(response);
};

const updateMentorshipStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (!Value.Check(UpdateMentorshipStatusRequest, req.body)) {
    const error = parseValueError(
      Value.Errors(UpdateMentorshipStatusRequest, req.body),
    );
    return res.status(400).json({ message: "Bad Request", error });
  }
  const updates = req.body as UpdateMentorshipStatusRequest;

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
  return res.status(200).json({ message: "Updates successful" });
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<any | BadRequestError>,
): Promise<void> {
  try {
    if (req.method === "GET") {
      return await getMentorshipList(res);
    }
    if (req.method === "POST") {
      return await updateMentorshipStatus(req, res);
    }
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Error in /api/admin/volunteers/mentorship:", error);
    return res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
  }
}
