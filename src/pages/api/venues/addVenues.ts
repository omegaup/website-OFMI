import { BadRequestError } from "@/types/errors";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { NextApiRequest, NextApiResponse } from "next";
import {
  AddVenuesRequestSchema,
  AddVenuesResponse,
} from "@/types/venue.schema";

async function addVenuesHandler(
  req: NextApiRequest,
  res: NextApiResponse<AddVenuesResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(AddVenuesRequestSchema, body)) {
    const firstError = Value.Errors(AddVenuesRequestSchema, body).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }

  return res.status(200).json({
    success: true,
  });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<AddVenuesResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    // register to OFMI
    await addVenuesHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
