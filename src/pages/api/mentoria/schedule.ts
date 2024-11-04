import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import { prisma } from "@/lib/prisma";
import {
  ScheduleMentoriaResponse,
  ScheduleMentoriaRequestSchema,
} from "@/types/mentorias.schema";
import { getEvent } from "@/lib/calendly";
import { getAccessToken } from "@/lib/oauth";
import { OauthProvider } from "@prisma/client";

async function scheduleMentoriaHandler(
  req: NextApiRequest,
  res: NextApiResponse<ScheduleMentoriaResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(ScheduleMentoriaRequestSchema, body)) {
    return res.status(400).json({ message: "Invalid inputs" });
  }
  const {
    contestantParticipantId,
    volunteerAuthId,
    volunteerParticipationId,
    meetingTimeOpt,
    calendlyPayload,
  } = body;

  let meetingTime = meetingTimeOpt || null;
  try {
    const eventPayload = await getEvent({
      token: await getAccessToken(volunteerAuthId, OauthProvider.CALENDLY),
      eventUri: calendlyPayload.event.uri,
    });
    calendlyPayload.event = eventPayload;
    if (eventPayload.start_time) {
      meetingTime = eventPayload.start_time;
    }
  } catch (e) {
    console.error(e);
  }

  meetingTime = meetingTime || new Date(Date.now()).toISOString();

  await prisma.mentoria.upsert({
    where: {
      volunteerParticipationId_contestantParticipantId_meetingTime: {
        volunteerParticipationId,
        contestantParticipantId,
        meetingTime,
      },
    },
    update: {},
    create: {
      volunteerParticipationId,
      contestantParticipantId,
      status: "SCHEDULED",
      meetingTime,
      metadata: {
        calendly: calendlyPayload,
      },
    },
  });

  return res.status(200).json({ success: true });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<ScheduleMentoriaResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    await scheduleMentoriaHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
