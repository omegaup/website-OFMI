import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import {
  GetAvailabilitiesRequestSchema,
  GetAvailabilitiesResponse,
} from "@/types/mentor.schema";
import { parseValueError } from "@/lib/typebox";
import { getAllAvailabilities } from "@/lib/mentor";

const MAX_TIME_RANGE_MILLIS = 30 * 24 * 60 * 60 * 1000;

async function getAvailabilitiesHandler(
  req: NextApiRequest,
  res: NextApiResponse<GetAvailabilitiesResponse | BadRequestError>,
): Promise<void> {
  const { query } = req;
  const body = {
    ofmiEdition: Number(query.ofmiEdition),
    startTime: query.startTime,
    endTime: query.endTime,
  };

  if (!Value.Check(GetAvailabilitiesRequestSchema, body)) {
    const firstError = Value.Errors(
      GetAvailabilitiesRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request query."}`,
    });
  }
  const ofmiEdition = body.ofmiEdition;
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);

  if (
    startTime.getTime() < Date.now() ||
    startTime.getTime() > endTime.getTime() ||
    endTime.getTime() - startTime.getTime() > MAX_TIME_RANGE_MILLIS
  ) {
    return res.status(400).json({
      message:
        "El rango solicitado debe ser del futuro, y no puede exceder 30 días",
    });
  }

  const availabilities = await getAllAvailabilities({
    ofmiEdition,
    startTime,
    endTime,
  });

  return res.status(200).json({ availabilities });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<GetAvailabilitiesResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "GET") {
    await getAvailabilitiesHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
