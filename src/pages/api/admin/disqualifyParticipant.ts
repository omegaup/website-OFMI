import { prisma } from "@/lib/prisma";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { NextApiRequest, NextApiResponse } from "next";
import {
  DisqualifyParticipantCreateRequestSchema,
  DisqualifyParticipantUpdateRequestSchema,
} from "@/types/admin.schema";
import {
  findContestantByOfmiAndEmail,
  findMostRecentOfmi,
  findOfmiByEdition,
  friendlyOfmiName,
} from "@/lib/ofmi";
import { Prisma } from "@prisma/client";
import { emailer } from "@/lib/emailer";

type ofmiInfo = {
  ofmiId: string;
  ofmiName: string;
};

type ContestantInfo = {
  preferredName: string;
  contestantId: string;
  message: string;
};

type ofmiAndContestantInfo = {
  ofmiInfo: ofmiInfo;
  contestantInfo: ContestantInfo;
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
  const contestant = await findContestantByOfmiAndEmail(ofmi, email);
  if (!contestant) {
    return `No hay participante registrada en la ${ofmiName} con ese correo`;
  }
  const fullName = `${contestant.firstName} ${contestant.lastName}`;
  return {
    ofmiInfo: {
      ofmiId: ofmi.id,
      ofmiName,
    },
    contestantInfo: {
      message: `Descalificación de ${fullName} de la ${ofmiName}`,
      preferredName: contestant.preferredName,
      contestantId: contestant.id,
    },
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
    const { ofmiInfo, contestantInfo } = sharedInfo;
    await prisma.disqualification.create({
      data: {
        userId: contestantInfo.contestantId,
        ofmiId: ofmiInfo.ofmiId,
        ...others,
      },
    });
    if (sendEmail) {
      await emailer.notifyContestantDisqualification(
        email,
        ofmiInfo.ofmiName,
        contestantInfo.preferredName,
        others.reason,
      );
    }
    return res.status(201).json({
      message: `${contestantInfo.message} creada`,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(500).json({
          message: `Esta concursante ya ha sido descalificada de la ${!ofmiEdition ? "última OFMI" : friendlyOfmiName(ofmiEdition, true)}.`,
        });
      }
    }
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
    const { ofmiInfo, contestantInfo } = sharedInfo;
    await prisma.disqualification.update({
      where: {
        userId_ofmiId: {
          userId: contestantInfo.contestantId,
          ofmiId: ofmiInfo.ofmiId,
        },
      },
      data: others,
    });
    if (sendEmail && "appealed" in others) {
      await emailer.notifyContestantDisqualificationUpdate(
        email,
        ofmiInfo.ofmiName,
        contestantInfo.preferredName,
        others["appealed"],
      );
    }
    return res.status(200).json({
      message: `${contestantInfo.message} actualizada`,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2001") {
        return res.status(500).json({
          message: `Esta participante no ha sido descalificada de la ${!ofmiEdition ? "última OFMI" : friendlyOfmiName(ofmiEdition, true)}.`,
        });
      }
    }
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
