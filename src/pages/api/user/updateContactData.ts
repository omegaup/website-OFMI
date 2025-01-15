import { prisma } from "@/lib/prisma";
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

  const { user: userInput } = body;
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

  // Upsert User - Mailing address
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
  const user = await prisma.user.update({
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

  return res.status(201).json({ user });
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
