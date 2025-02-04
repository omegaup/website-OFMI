import { findOrCreateDriveFolderForParticipant as find } from "@/lib/admin";
import { parseValueError } from "@/lib/typebox";
import {
  FindOrCreateDriveFolderForParticipantRequestSchema,
  FindOrCreateDriveFolderForParticipantResponse,
  SendEmailRequestSchema,
} from "@/types/admin.schema";
import { BadRequestError } from "@/types/errors";
import { Value } from "@sinclair/typebox/value";
import type { NextApiRequest, NextApiResponse } from "next/types";

async function findOrCreateDriveFolderForParticipant(
  req: NextApiRequest,
  res: NextApiResponse<
    FindOrCreateDriveFolderForParticipantResponse | BadRequestError
  >,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(FindOrCreateDriveFolderForParticipantRequestSchema, body)) {
    const firstError = Value.Errors(SendEmailRequestSchema, body).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { email, ofmiEdition } = body;

  const gDriveFolderUrl = await find({ email, ofmiEdition });

  return res.status(200).json({
    gDriveFolderUrl,
  });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<
    FindOrCreateDriveFolderForParticipantResponse | BadRequestError
  >,
): Promise<void> {
  if (req.method === "POST") {
    // register to OFMI
    await findOrCreateDriveFolderForParticipant(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
