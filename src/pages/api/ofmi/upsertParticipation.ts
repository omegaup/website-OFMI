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

  // Upsert User - Mailing address
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
  const user = await prisma.user.upsert({
    where: { userAuthId: authUser.id },
    update: {
      ...userInputPayload,
      MailingAddress: {
        update: {
          ...mailingAddressPayload,
        },
      },
    },
    create: {
      ...userInputPayload,
      UserAuth: {
        connect: {
          id: authUser.id,
        },
      },
      MailingAddress: {
        create: { ...mailingAddressPayload },
      },
    },
  });

  // ContestantParticipation
  const contestantParticipationPayload = contestantParticipationInput
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

  // Volunteer participation
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

  const participation = await prisma.participation.upsert({
    where: {
      userId_ofmiId: {
        userId: user.id,
        ofmiId: ofmi.id,
      },
    },
    update: {
      role,
      ContestantParticipation: contestantParticipationPayload && {
        upsert: {
          create: {
            ...contestantParticipationPayload,
          },
          update: {
            ...contestantParticipationPayload,
          },
        },
      },
      VolunteerParticipation: volunteerParticipationPayload && {
        upsert: {
          create: {
            ...volunteerParticipationPayload,
          },
          update: {
            ...volunteerParticipationPayload,
          },
        },
      },
    },
    create: {
      role,
      user: {
        connect: {
          id: user.id,
        },
      },
      ofmi: {
        connect: {
          id: ofmi.id,
        },
      },
      ContestantParticipation: contestantParticipationPayload && {
        create: {
          ...contestantParticipationPayload,
        },
      },
      VolunteerParticipation: volunteerParticipationPayload && {
        create: { ...volunteerParticipationPayload },
      },
    },
  });

  // Create participant folder
  let gDriveFolderUrl = "";
  try {
    gDriveFolderUrl = await findOrCreateDriveFolderForParticipant({
      email: userInput.email,
      ofmiEdition: ofmi.edition,
    });
  } catch (e) {
    console.error("Error findOrCreateDriveFolderForParticipant", e);
  }

  if (requestStartTime.getTime() <= participation.createdAt.getTime()) {
    // Participation was created
    await emailer.notifySuccessfulOfmiRegistration(
      userInput.email,
      gDriveFolderUrl,
    );
  }

  return res.status(201).json({ participation });
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
