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

type Shared = {
  ofmiId: string;
  ofmiName: string;
  preferredName: string;
  contestantId: string;
  message: string;
};

const fetchShared = async (
  email: string,
  ofmiEdition?: number,
): Promise<Shared> => {
  const ofmi = !ofmiEdition
    ? await findMostRecentOfmi()
    : await findOfmiByEdition(ofmiEdition);
  if (!ofmi) {
    const error = new Error("Edicion de la OFMI no encontrada");
    error.name = "Handled Not Found";
    throw error;
  }
  const ofmiName = friendlyOfmiName(ofmi.edition, true);
  const contestant = await findContestantByOfmiAndEmail(ofmi, email);
  if (!contestant) {
    const error = new Error(
      `No se encontro participante registrado a la ${ofmiName} con ese correo`,
    );
    error.name = "Handled Not Found";
    throw error;
  }
  const fullName = `${contestant.firstName} ${contestant.lastName}`;
  return {
    ofmiId: ofmi.id,
    message: `Descalificacion de ${fullName} de la ${ofmiName}`,
    preferredName: contestant.preferredName,
    contestantId: contestant.id,
    ofmiName,
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
    const shared = await fetchShared(email, ofmiEdition);
    await prisma.disqualification.create({
      data: {
        userId: shared.contestantId,
        ofmiId: shared.ofmiId,
        ...others,
      },
    });
    if (sendEmail) {
      await emailer.notifyContestantDisqualification(
        email,
        shared.ofmiName,
        shared.preferredName,
        others.reason,
      );
    }
    return res.status(201).json({
      message: `${shared.message} creada`,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const error = new Error(
          `Este concursante ya ha sido descalificado de la ${!ofmiEdition ? "ultima OFMI" : friendlyOfmiName(ofmiEdition, true)}.`,
        );
        error.name = "Handled";
        throw error;
      }
    }
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
    const shared = await fetchShared(email, ofmiEdition);
    await prisma.disqualification.update({
      where: {
        userId_ofmiId: {
          userId: shared.contestantId,
          ofmiId: shared.ofmiId,
        },
      },
      data: others,
    });
    if (sendEmail && "appealed" in others) {
      await emailer.notifyContestantDisqualificationUpdate(
        email,
        shared.ofmiName,
        shared.preferredName,
        others["appealed"],
      );
    }
    return res.status(201).json({
      message: `${shared.message} actualizada`,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2001") {
        const error = new Error(
          `Este participante no ha sido descalificado de la ${!ofmiEdition ? "ultima OFMI" : friendlyOfmiName(ofmiEdition, true)}.`,
        );
        error.name = "Handled Not Found";
        throw error;
      }
    }
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { method } = req;
  try {
    if (method === "POST") {
      await createParticipantDisqualification(req, res);
    } else if (method === "PUT") {
      await updateParticipantDisqualification(req, res);
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ message: error.message });
    }
    const { name, message: _message } = error as Error;
    let message = "Internal Server Error";
    let code = 500;
    if (name.includes("Handled")) {
      message = _message;
    }
    if (name === "Handled Not Found") {
      code = 404;
    }
    return res.status(code).json({ message });
  }
}
