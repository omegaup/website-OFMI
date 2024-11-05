import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import { prisma } from "@/lib/prisma";
import {
  ScheduleMentoriaResponse,
  ScheduleMentoriaRequestSchema,
} from "@/types/mentorias.schema";
import { getEventOrInvitee } from "@/lib/calendly";
import { getAccessToken } from "@/lib/oauth";
import { OauthProvider } from "@prisma/client";
import type { JSONValue } from "@/types/json";

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

  let eventPayload: JSONValue = calendlyPayload.event;
  let inviteePayload: JSONValue = calendlyPayload.invitee;
  let meetingTime = meetingTimeOpt || null;
  try {
    const token = await getAccessToken(volunteerAuthId, OauthProvider.CALENDLY);
    eventPayload = await getEventOrInvitee({
      token,
      url: calendlyPayload.event.uri,
    });
    if (
      eventPayload !== null &&
      typeof eventPayload === "object" &&
      "start_time" in eventPayload &&
      typeof eventPayload.start_time === "string"
    ) {
      meetingTime = eventPayload.start_time;
    }
    inviteePayload = await getEventOrInvitee({
      token,
      url: calendlyPayload.invitee.uri,
    });
  } catch (e) {
    console.error(e);
  }

  meetingTime = meetingTime || new Date(Date.now()).toISOString();

  try {
    await prisma.mentoria.create({
      data: {
        volunteerParticipationId,
        contestantParticipantId,
        status: "SCHEDULED",
        meetingTime,
        metadata: {
          calendly: {
            event: eventPayload,
            invitee: inviteePayload,
          },
        },
      },
    });
  } catch (e) {
    console.error("scheduleMentoriaHandler: could not store mentoria", e);
    return res.status(500).json({ message: "Internal server error" });
  }
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
