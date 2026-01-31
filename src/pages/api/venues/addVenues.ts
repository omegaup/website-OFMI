import { prisma } from "@/lib/prisma";
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

  const venues = Object.values(body);
  try {
    await prisma.venue.createMany({
      data: venues,
    });

    return res.status(201).json({ success: true });
  } catch (e) {
    console.log("Error mientras se insertaban sedes", e);
    return res.status(500).json({ message: "Internal server error" });
  }
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
