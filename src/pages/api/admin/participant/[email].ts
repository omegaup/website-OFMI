import { findMostRecentOfmi, findParticipation } from "@/lib/ofmi";
import { BadRequestError } from "@/types/errors";
import { ParticipationRequestInput } from "@/types/participation.schema";
import type { NextApiRequest, NextApiResponse } from "next/types";

async function exportParticipantsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ParticipationRequestInput | BadRequestError>,
): Promise<void> {
  const { email } = req.query;
  if (typeof email !== "string") {
    return res.status(400).json({ message: "Bad Request." });
  }
  const ofmi = await findMostRecentOfmi();
  const participation = await findParticipation(ofmi, email);

  if (!participation) {
    return res.status(400).json({
      message: `Participation for the ${ofmi.edition}-ofmi not found.`,
    });
  }
  return res.status(200).json(participation.input);
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<ParticipationRequestInput | BadRequestError>,
): Promise<void> {
  if (req.method === "GET") {
    // register to OFMI
    await exportParticipantsHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
