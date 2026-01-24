import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import { validateCURP, validateMailingAddressLocation } from "@/lib/validators";
import { parseValueError } from "@/lib/typebox";
import {
  UpdateContactDataRequestSchema,
  UpdateContactDataResponse,
} from "@/types/user.schema";

// Function to update contact data in our database
async function updateContactDataHandler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateContactDataResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;

  if (!Value.Check(UpdateContactDataRequestSchema, body)) {
    const firstError = Value.Errors(
      UpdateContactDataRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }

  const { user: userInput, venueQuotaId } = body;
  const { mailingAddress: mailingAddressInput } = userInput;
  const birthDate = new Date(userInput.birthDate);

  // Check user Auth
  const authUser = await prisma.userAuth.findUnique({
    where: { email: userInput.email },
  });
  if (!authUser) {
    return res.status(400).json({
      message: "El usuario con ese correo no existe",
    });
  }

  // More validations
  const validations = [
    {
      field: "CURP",
      result: validateCURP(body.user.governmentId, {
        birthDate,
      }),
    },
    {
      field: "Dirección de envío",
      result: validateMailingAddressLocation({
        country: mailingAddressInput.country,
        state: mailingAddressInput.state,
        municipality: mailingAddressInput.municipality,
      }),
    },
  ];

  const firstError = validations.find((result) => !result.result.ok);
  if (firstError && !firstError.result.ok) {
    return res.status(400).json({
      message: `Campo: ${firstError.field}. ${firstError.result.message}`,
    });
  }

  const fullName = `${userInput.firstName} ${userInput.lastName}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const userInputPayload = {
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        preferredName: userInput.preferredName ?? fullName,
        pronouns: userInput.pronouns,
        shirtSize: userInput.shirtSize,
        shirtStyle: userInput.shirtStyle,
      };
      const mailingAddressPayload = {
        street: mailingAddressInput.street,
        externalNumber: mailingAddressInput.externalNumber,
        internalNumber: mailingAddressInput.internalNumber,
        zipcode: mailingAddressInput.zipcode,
        state: mailingAddressInput.state,
        country: mailingAddressInput.country,
        references: mailingAddressInput.references,
        phone: mailingAddressInput.phone,
        county: mailingAddressInput.municipality ?? "",
        neighborhood: mailingAddressInput.locality ?? "",
        name: mailingAddressInput.recipient ?? fullName,
      };

      const user = await tx.user.update({
        where: { userAuthId: authUser.id },
        data: {
          ...userInputPayload,
          MailingAddress: {
            update: {
              ...mailingAddressPayload,
            },
          },
        },
      });

      if (venueQuotaId !== undefined) {
        // Identify which OFMI edition we are talking about
        // If venueQuotaId is set, use it to find OFMI.
        // If empty string (unselect), we need to find the user's active participation another way.

        let ofmiId: string | undefined;

        if (venueQuotaId) {
          const targetQuota = await tx.venueQuota.findUnique({
            where: { id: venueQuotaId },
          });
          if (!targetQuota) throw new Error("La sede seleccionada no existe");
          ofmiId = targetQuota.ofmiId;
        }

        const participation = await tx.participation.findFirst({
          where: {
            userId: user.id,
            role: "CONTESTANT",
            ...(ofmiId ? { ofmiId } : {}),
          },
          orderBy: { ofmi: { edition: "desc" } },
          include: { ContestantParticipation: true },
        });

        if (participation && participation.ContestantParticipation) {
          const currentVenueId =
            participation.ContestantParticipation.venueQuotaId;
          const newVenueId = venueQuotaId || null;

          if (currentVenueId !== newVenueId) {
            if (currentVenueId) {
              await tx.venueQuota.update({
                where: { id: currentVenueId },
                data: { occupied: { decrement: 1 } },
              });
            }

            if (newVenueId) {
              await tx.venueQuota.update({
                where: { id: newVenueId },
                data: { occupied: { increment: 1 } },
              });
            }

            await tx.contestantParticipation.update({
              where: { id: participation.ContestantParticipation.id },
              data: { venueQuotaId: newVenueId },
            });
          }
        }
      }

      return user;
    });

    return res.status(201).json({ user: result });
  } catch (error) {
    console.error("Update Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isPrismaError = error instanceof Prisma.PrismaClientKnownRequestError;
    const errorCode = isPrismaError ? error.code : undefined;

    if (
      errorCode === "P2002" ||
      errorMessage.includes("check_venue_capacity")
    ) {
      return res
        .status(409)
        .json({ message: "La sede seleccionada ya no tiene cupo disponible." });
    }
    return res
      .status(500)
      .json({ message: "Error interno al actualizar datos." });
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<UpdateContactDataResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    await updateContactDataHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
