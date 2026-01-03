import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import {
  UpsertParticipationRequestSchema,
  UpsertParticipationResponse,
} from "@/types/participation.schema";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import {
  validateCURP,
  validateCountryState,
  validateSchoolGrade,
  validateMailingAddressLocation,
} from "@/lib/validators";
import { parseValueError } from "@/lib/typebox";
import { emailer } from "@/lib/emailer";
import {
  validateOFMIContestantRequirements,
  validateOFMIOpenAndCloseTime,
} from "@/lib/validators/ofmi";
import { findOrCreateDriveFolderForParticipant } from "@/lib/admin";
// Function to register participation in our database
async function upsertParticipationHandler(
  req: NextApiRequest,
  res: NextApiResponse<UpsertParticipationResponse | BadRequestError>,
): Promise<void> {
  const requestStartTime = new Date(Date.now());
  const { body } = req;

  if (!Value.Check(UpsertParticipationRequestSchema, body)) {
    const firstError = Value.Errors(
      UpsertParticipationRequestSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }

  const { ofmiEdition: ofmiEditionInput, user: userInput } = body;
  const { mailingAddress: mailingAddressInput } = userInput;
  const birthDate = new Date(userInput.birthDate);
  const role = body.userParticipation.role;
  const contestantParticipationInput =
    role === "CONTESTANT" ? body.userParticipation : undefined;
  const volunteerParticipationInput =
    role === "VOLUNTEER" ? body.userParticipation : undefined;

  // Check OFMI edition
  const ofmi = await prisma.ofmi.findUnique({
    where: { edition: ofmiEditionInput },
  });
  if (!ofmi) {
    return res.status(400).json({
      message: `La edición de la OFMI que buscas no existe`,
    });
  }

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
    {
      field: "Fechas de registro OFMI",
      result: validateOFMIOpenAndCloseTime(ofmi, {
        role,
        registrationTime: requestStartTime,
      }),
    },
  ];

  if (contestantParticipationInput) {
    // Contestant participation validations
    validations.push(
      ...[
        {
          field: "Lugar participación",
          result: validateCountryState({
            country: contestantParticipationInput.schoolCountry,
            state: contestantParticipationInput.schoolState,
          }),
        },
        {
          field: "Grado escolar",
          result: validateSchoolGrade({
            schoolGrade: contestantParticipationInput.schoolGrade,
            schoolStage: contestantParticipationInput.schoolStage,
          }),
        },
        {
          field: "Edición OFMI",
          result: validateOFMIContestantRequirements(ofmi, {
            birthDate: birthDate,
            schoolStage: contestantParticipationInput.schoolStage,
            schoolGrade: contestantParticipationInput.schoolGrade,
          }),
        },
      ],
    );
  }

  const firstError = validations.find((result) => !result.result.ok);
  if (firstError && !firstError.result.ok) {
    return res.status(400).json({
      message: `Campo: ${firstError.field}. ${firstError.result.message}`,
    });
  }

  const fullName = `${userInput.firstName} ${userInput.lastName}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      //  Upsert User - Mailing address
      const userInputPayload = {
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        birthDate,
        governmentId: userInput.governmentId,
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

      const user = await tx.user.upsert({
        where: { userAuthId: authUser.id },
        update: {
          ...userInputPayload,
          MailingAddress: { update: mailingAddressPayload },
        },
        create: {
          ...userInputPayload,
          UserAuth: { connect: { id: authUser.id } },
          MailingAddress: { create: mailingAddressPayload },
        },
      });

      if (contestantParticipationInput?.venueQuotaId) {
        const existingParticipation = await tx.participation.findUnique({
          where: { userId_ofmiId: { userId: user.id, ofmiId: ofmi.id } },
          include: { ContestantParticipation: true },
        });

        const currentVenueId =
          existingParticipation?.ContestantParticipation?.venueQuotaId;
        const newVenueId = contestantParticipationInput.venueQuotaId;

        if (currentVenueId !== newVenueId) {
          if (currentVenueId) {
            await tx.venueQuota.update({
              where: { id: currentVenueId },
              data: { occupied: { decrement: 1 } },
            });
          }

          await tx.venueQuota.update({
            where: { id: newVenueId },
            data: { occupied: { increment: 1 } },
          });
        }
      }

      const venueQuotaConnect = contestantParticipationInput?.venueQuotaId
        ? { connect: { id: contestantParticipationInput.venueQuotaId } }
        : undefined;

      const venueQuotaDisconnect = !contestantParticipationInput?.venueQuotaId
        ? { disconnect: true }
        : undefined;

      const baseContestantPayload = contestantParticipationInput
        ? {
            schoolGrade: contestantParticipationInput.schoolGrade,
            disqualified: false,
            School: {
              connectOrCreate: {
                where: {
                  name_stage_state_country: {
                    name: contestantParticipationInput.schoolName,
                    stage: contestantParticipationInput.schoolStage,
                    state: contestantParticipationInput.schoolState,
                    country: contestantParticipationInput.schoolCountry,
                  },
                },
                create: {
                  name: contestantParticipationInput.schoolName,
                  stage: contestantParticipationInput.schoolStage,
                  state: contestantParticipationInput.schoolState,
                  country: contestantParticipationInput.schoolCountry,
                },
              },
            },
          }
        : undefined;

      const contestantParticipationCreate = baseContestantPayload
        ? {
            ...baseContestantPayload,
            venueQuota: venueQuotaConnect,
          }
        : undefined;

      const contestantParticipationUpdate = baseContestantPayload
        ? {
            ...baseContestantPayload,
            venueQuota: venueQuotaConnect || venueQuotaDisconnect,
          }
        : undefined;

      const volunteerParticipationPayload = volunteerParticipationInput
        ? {
            educationalLinkageOptIn:
              volunteerParticipationInput.educationalLinkageOptIn,
            fundraisingOptIn: volunteerParticipationInput.fundraisingOptIn,
            communityOptIn: volunteerParticipationInput.communityOptIn,
            trainerOptIn: volunteerParticipationInput.trainerOptIn,
            problemSetterOptIn: volunteerParticipationInput.problemSetterOptIn,
            mentorOptIn: volunteerParticipationInput.mentorOptIn,
          }
        : undefined;

      const participation = await tx.participation.upsert({
        where: {
          userId_ofmiId: {
            userId: user.id,
            ofmiId: ofmi.id,
          },
        },
        update: {
          role,
          ContestantParticipation: contestantParticipationUpdate && {
            upsert: {
              create: contestantParticipationCreate!,
              update: contestantParticipationUpdate,
            },
          },
          VolunteerParticipation: volunteerParticipationPayload && {
            upsert: {
              create: volunteerParticipationPayload,
              update: volunteerParticipationPayload,
            },
          },
        },
        create: {
          role,
          user: { connect: { id: user.id } },
          ofmi: { connect: { id: ofmi.id } },
          ContestantParticipation: contestantParticipationCreate && {
            create: contestantParticipationCreate,
          },
          VolunteerParticipation: volunteerParticipationPayload && {
            create: volunteerParticipationPayload,
          },
        },
      });

      return participation;
    });

    let gDriveFolderUrl = "";
    try {
      gDriveFolderUrl = await findOrCreateDriveFolderForParticipant({
        email: userInput.email,
        ofmiEdition: ofmi.edition,
      });
    } catch (e) {
      console.error("Error findOrCreateDriveFolderForParticipant", e);
    }

    if (requestStartTime.getTime() <= result.createdAt.getTime()) {
      await emailer.notifySuccessfulOfmiRegistration(
        userInput.email,
        gDriveFolderUrl,
      );
    }

    return res.status(201).json({ participation: result });
  } catch (error) {
    console.error("Registration Error:", error);
    // TODO: check for constraint violation specifying types for error (error.code === 'P2002')
    return res
      .status(500)
      .json({ message: "Error interno al procesar el registro." });
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<UpsertParticipationResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    // register to OFMI
    await upsertParticipationHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
