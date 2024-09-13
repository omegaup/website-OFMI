import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  CreateUserRequestSchema,
  CreateUserResponse,
  CreateUserResponseSchema,
} from "@/types/auth.schema";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import generateAndSendVerificationToken from "@/lib/emailVerificationToken";
import { hashPassword } from "@/lib/hashPassword";
import { parseValueError } from "@/lib/typebox";

// function to create user in our database
async function createUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<CreateUserResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(CreateUserRequestSchema, body)) {
    const firstError = Value.Errors(CreateUserRequestSchema, body).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { password } = body;

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 8 caracteres" });
  }
  try {
    const user = await prisma.userAuth.create({
      data: { ...body, password: hashPassword(body.password) },
    });

    await generateAndSendVerificationToken(user.id, body.email);

    return res.status(201).json(Value.Cast(CreateUserResponseSchema, { user }));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        // Docs: https://www.prisma.io/docs/orm/reference/error-reference#p2002
        return res
          .status(400)
          .json({ message: "Ya existe una cuenta con ese email." });
      }
      return res.status(400).json({ message: e.message });
    }
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<CreateUserResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    // create user
    await createUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
