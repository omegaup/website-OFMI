import { deleteContestantParticipation } from "@/lib/admin";
import {
  DeleteContestantParticipationRequestSchema,
  DeleteContestantParticipationResponse,
} from "@/types/admin.schema";
import { BadRequestError } from "@/types/errors";
import { Value } from "@sinclair/typebox/value";
import type { NextApiRequest, NextApiResponse } from "next/types";

async function deleteContestantParticipationHandler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteContestantParticipationResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(DeleteContestantParticipationRequestSchema, body)) {
    const firstError = Value.Errors(
      DeleteContestantParticipationRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? firstError.message : "Invalid request body."}`,
    });
  }

  const { emails, ofmiEdition } = body;
  const selectedOfmiEdition =
    typeof ofmiEdition === "number" ? ofmiEdition : undefined;

  const results = await Promise.all(
    emails.map(async (email) => {
      try {
        const deletedAt = await deleteContestantParticipation({
          email,
          ofmiEdition: selectedOfmiEdition,
        });
        return { email, success: true, deletedAt: deletedAt.toISOString() };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return { email, success: false, error: errorMessage };
      }
    }),
  );

  return res.status(200).json({ results });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<DeleteContestantParticipationResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    await deleteContestantParticipationHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
