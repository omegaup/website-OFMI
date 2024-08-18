import { prisma } from "@/lib/prisma";
import { Ofmi, SchoolStage } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  UpsertParticipationRequestSchema,
  UpsertParticipationResponse,
} from "@/types/participation.schema";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import {
  validateCURP,
  validateAddressLocation,
  validateCountryState,
  validateSchoolGrade,
  validateGraduationDate,
} from "@/lib/validators";
import { parseValueError } from "@/lib/typebox";
import type { ValidationResult } from "@/lib/validators/types";
import { emailer } from "@/lib/emailer";

// Check user is able to compete in ofmi
function validateOfmi(
  ofmi: Ofmi,
  {
    birthDate,
    schoolStage,
    schoolGrade,
  }: { birthDate: Date; schoolStage: SchoolStage; schoolGrade: number },
): ValidationResult {
  const now = new Date(Date.now());

  if (ofmi.registrationOpenTime > now) {
    return {
      ok: false,
      message: `Las inscripciones para esta OFMI aun no han abierto.`,
    };
  }
  if (ofmi.registrationCloseTime < new Date(Date.now())) {
    return {
      ok: false,
      message: "Las inscripciones para esta OFMI han finalizado.",
    };
  }

  if (ofmi.birthDateRequirement && birthDate < ofmi.birthDateRequirement) {
    return {
      ok: false,
      message: `No cumples con el requisito de haber nacido después del ${ofmi.birthDateRequirement.toDateString()}`,
    };
  }

  // Lets be optimistic and assume contestant was in schoolGrade when Ofmi registration began.
  // Assume also that it started on that day the schoolGrade
  if (ofmi.studyingHighScoolDateRequirement) {
    const result = validateGraduationDate({
      schoolGrade,
      schoolStage,
      started: ofmi.registrationOpenTime,
      highSchoolGraduationLimit: ofmi.studyingHighScoolDateRequirement,
    });
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}

// Function to register participation in our database
async function upsertParticipationHandler(
  req: NextApiRequest,
  res: NextApiResponse<UpsertParticipationResponse | BadRequestError>,
): Promise<void> {
  const requestStartTime = Date.now();
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

  const {
    ofmiEdition: ofmiEditionInput,
    user: userInput,
    userParticipation: userParticipationInput,
  } = body;
  const { mailingAddress: mailingAddressInput } = userInput;

  // Check OFMI edition
  const ofmi = await prisma.ofmi.findUnique({
    where: { edition: ofmiEditionInput },
  });
  if (!ofmi) {
    return res.status(400).json({
      message: `La edición de la OFMI que buscas no existe`,
    });
  }
  const ofmiValidation = validateOfmi(ofmi, {
    birthDate: userInput.birthDate,
    schoolGrade: userParticipationInput.schoolGrade,
    schoolStage: userParticipationInput.schoolStage,
  });
  if (!ofmiValidation.ok) {
    return res.status(403).json({
      message: `No puedes competir en esta OFMI. ${ofmiValidation.message}`,
    });
  }

  // Check role
  const role = await prisma.participationRole.findUnique({
    where: { name: userParticipationInput.role },
  });
  if (!role) {
    return res.status(400).json({
      message: `El rol de ${userParticipationInput.role} no existe`,
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

  // More
  // Validate CURP
  const firstError = [
    {
      field: "CURP",
      result: validateCURP(body.user.governmentId, {
        birthDate: userInput.birthDate,
      }),
    },
    {
      field: "Dirección de envío",
      result: validateAddressLocation({
        country: mailingAddressInput.country,
        state: mailingAddressInput.state,
        municipality: mailingAddressInput.municipality,
        locality: mailingAddressInput.locality,
      }),
    },
    {
      field: "Lugar participación",
      result: validateCountryState({
        country: body.country,
        state: body.state,
      }),
    },
    {
      field: "Grado escolar",
      result: validateSchoolGrade({
        schoolGrade: body.userParticipation.schoolGrade,
        schoolStage: body.userParticipation.schoolStage,
      }),
    },
  ].find((result) => !result.result.ok);
  if (firstError && !firstError.result.ok) {
    return res.status(400).json({
      message: `Invalid ${firstError.field}. ${firstError.result.message}`,
    });
  }

  // Upsert User - Mailing address
  const userPayload = {
    first_name: userInput.firstName,
    last_name: userInput.lastName,
    birth_date: userInput.birthDate,
    government_id: userInput.governmentId,
    preferred_name: userInput.preferredName,
    pronouns: userInput.pronouns,
    shirt_size: userInput.shirtSize,
    shirt_style: userInput.shirtStyle,
  };
  const mailingAddressPayload = {
    street: mailingAddressInput.street,
    external_number: mailingAddressInput.externalNumber,
    internal_number: mailingAddressInput.internalNumber,
    country: mailingAddressInput.country,
    state: mailingAddressInput.state,
    county: mailingAddressInput.municipality ?? "",
    neighborhood: mailingAddressInput.locality ?? "",
    zip_code: mailingAddressInput.zipcode,
    name:
      mailingAddressInput.recipient ??
      `${userInput.firstName} ${userInput.lastName}`,
    phone: mailingAddressInput.phone,
    references: mailingAddressInput.references,
  };

  const user = await prisma.user.upsert({
    where: { user_auth_id: authUser.id },
    update: {
      ...userPayload,
      mailing_address: {
        update: {
          ...mailingAddressPayload,
        },
      },
    },
    create: {
      ...userPayload,
      UserAuth: {
        connect: {
          id: authUser.id,
        },
      },
      mailing_address: {
        create: { ...mailingAddressPayload },
      },
    },
  });

  // Upsert User and Mailing Address
  const participationPayload = {
    country: body.country,
    state: body.state,
  };
  const contestantParticipationPayload = {
    school_grade: userParticipationInput.schoolGrade,
    disqualified: false,
  };
  const schoolConnectOrCreate = {
    where: {
      name_stage: {
        name: userParticipationInput.schoolName,
        stage: userParticipationInput.schoolStage,
      },
    },
    create: {
      name: userParticipationInput.schoolName,
      stage: userParticipationInput.schoolStage,
    },
  };
  const participation = await prisma.participation.upsert({
    where: {
      user_id_ofmi_id_role_id: {
        user_id: user.id,
        ofmi_id: ofmi.id,
        role_id: role.id,
      },
    },
    update: {
      ...participationPayload,
      contestant_participation: {
        upsert: {
          create: {
            ...contestantParticipationPayload,
            school: {
              connectOrCreate: schoolConnectOrCreate,
            },
          },
          update: {
            ...contestantParticipationPayload,
            school: {
              connectOrCreate: schoolConnectOrCreate,
            },
          },
        },
      },
    },
    create: {
      ...participationPayload,
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
      role: {
        connect: {
          id: role.id,
        },
      },
      contestant_participation: {
        create: {
          ...contestantParticipationPayload,
          school: {
            connectOrCreate: schoolConnectOrCreate,
          },
        },
      },
    },
  });

  if (requestStartTime <= participation.createdAt.getTime()) {
    // Participation was created
    await emailer.notifySuccessfulOfmiRegistration(userInput.email);
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
