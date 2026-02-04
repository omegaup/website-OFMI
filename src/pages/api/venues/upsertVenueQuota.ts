import { prisma } from "@/lib/prisma";
import { BadRequestError } from "@/types/errors";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { NextApiRequest, NextApiResponse } from "next";
import { CreateVenueQuotaRequestSchema } from "../../../types/venue.schema";
import { CreateVenueQuotaOutput } from "@/types/venue.schema";

async function addVenueQuotaHandler(
  req: NextApiRequest,
  res: NextApiResponse<CreateVenueQuotaOutput | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(CreateVenueQuotaRequestSchema, body)) {
    const firstError = Value.Errors(
      CreateVenueQuotaRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }

  const existingQuota = await prisma.venueQuota.findFirst({
    where: {
      venueId: body.venueId,
      ofmiId: body.ofmiId,
    },
  });

  if (existingQuota) {
    if (existingQuota.occupied > body.capacity) {
      return res.status(400).json({
        message:
          "El nuevo cupo no puede ser menor que la cantidad de participantes registrad@s.",
      });
    } else {
      try {
        await prisma.venueQuota.update({
          where: {
            id: existingQuota.id,
          },
          data: {
            capacity: body.capacity,
          },
        });
      } catch (error) {
        console.log("Error while updating venue quota", error);
        return res
          .status(500)
          .json({ message: "Error interno al actualizar cupo de la sede." });
      }
      return res.status(200).json({
        success: true,
        message: `Se actualizo el cupo a ${body.capacity} para la sede correctamente`,
      });
    }
  }

  // No VenueQuota for given ofmi
  try {
    await prisma.venueQuota.create({
      data: {
        ...body,
      },
    });
  } catch (error) {
    console.log("Error while creating venue quota", error);
    return res
      .status(500)
      .json({ message: "Error interno al crear cupo de la sede." });
  }

  return res.status(201).json({
    success: true,
    message: `Se creo la cuota con éxito`,
  });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<CreateVenueQuotaOutput | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    await addVenueQuotaHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
