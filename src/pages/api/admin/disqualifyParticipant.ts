import { emailer } from "@/lib/emailer";
import { prisma } from "@/lib/prisma";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { NextApiRequest, NextApiResponse } from "next";
import {
  DisqualifyParticipantCreateRequestSchema,
  DisqualifyParticipantUpdateRequestSchema,
} from "@/types/admin.schema";
import {
  findMostRecentOfmi,
  findOfmiByEdition,
  friendlyOfmiName,
} from "@/lib/ofmi";

type ofmiAndContestantInfo = {
  ofmiName: string;
  preferredName: string;
  disqualificationId: string | null;
  participationId: string;
  message: string;
};

const fetchOfmiAndContestantInfo = async (
  email: string,
  ofmiEdition?: number,
): Promise<ofmiAndContestantInfo | string> => {
  const ofmi = !ofmiEdition
    ? await findMostRecentOfmi()
    : await findOfmiByEdition(ofmiEdition);
  if (!ofmi) {
    return "No se encontró edición de la OFMI";
  }
  const ofmiName = friendlyOfmiName(ofmi.edition, true);
  const participation = await prisma.participation.findFirst({
    where: {
      ofmiId: ofmi.id,
      user: { UserAuth: { email: email } },
      role: "CONTESTANT",
      volunteerParticipationId: null,
      contestantParticipationId: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          preferredName: true,
        },
      },
      ContestantParticipation: {
        include: {
          Disqualification: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
  if (!participation || !participation.ContestantParticipation) {
    return `No se encontró participación de ${email} en la ${ofmiName}`;
  }
  const contestant = participation.user;
  const fullName = `${contestant.firstName} ${contestant.lastName}`;
  return {
    message: `Descalificación de ${fullName} de la ${ofmiName}`,
    disqualificationId:
      participation.ContestantParticipation.DisqualificationId,
    participationId: participation.ContestantParticipation.id,
    preferredName: contestant.preferredName,
    ofmiName: ofmiName,
  };
};

async function createParticipantDisqualification(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(DisqualifyParticipantCreateRequestSchema, body)) {
    const firstError = Value.Errors(
      DisqualifyParticipantCreateRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { email, ofmiEdition, sendEmail, ...others } = Value.Cast(
    DisqualifyParticipantCreateRequestSchema,
    body,
  );
  try {
    const sharedInfo = await fetchOfmiAndContestantInfo(email, ofmiEdition);
    if (typeof sharedInfo === "string") {
      return res.status(404).json({ message: sharedInfo });
    }
    const {
      message,
      ofmiName,
      preferredName,
      disqualificationId,
      participationId,
    } = sharedInfo;
    if (disqualificationId) {
      return res.status(401).json({
        message: `Esta concursante ya ha sido descalificada de la ${ofmiName}.`,
      });
    }
    await prisma.disqualification.create({
      data: {
        ...others,
        ContestantParticipation: { connect: { id: participationId } },
      },
    });
    if (sendEmail) {
      await emailer.notifyContestantDisqualification(
        email,
        ofmiName,
        preferredName,
        others.reason,
      );
    }
    return res.status(201).json({
      message: `${message} creada`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateParticipantDisqualification(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(DisqualifyParticipantUpdateRequestSchema, body)) {
    const firstError = Value.Errors(
      DisqualifyParticipantUpdateRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { email, ofmiEdition, sendEmail, ...others } = Value.Cast(
    DisqualifyParticipantUpdateRequestSchema,
    body,
  );
  try {
    const sharedInfo = await fetchOfmiAndContestantInfo(email, ofmiEdition);
    if (typeof sharedInfo === "string") {
      return res.status(404).json({ message: sharedInfo });
    }
    const { message, ofmiName, preferredName, disqualificationId } = sharedInfo;
    if (!disqualificationId) {
      return res.status(401).json({
        message: `Esta participante no ha sido descalificada de la ${ofmiName}.`,
      });
    }
    await prisma.disqualification.update({
      where: {
        id: disqualificationId,
      },
      data: others,
    });
    if (sendEmail && "appealed" in others) {
      await emailer.notifyContestantDisqualificationUpdate(
        email,
        ofmiName,
        preferredName,
        others["appealed"],
      );
    }
    return res.status(200).json({
      message: `${message} actualizada`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { method } = req;
  if (method === "POST") {
    await createParticipantDisqualification(req, res);
  } else if (method === "PUT") {
    await updateParticipantDisqualification(req, res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
