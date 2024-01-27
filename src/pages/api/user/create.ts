import { SHA256 as sha256 } from "crypto-js";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  CreateUserRequestSchema,
  CreateUserResponse,
} from "@/types/auth.schema";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/errors";
import generateAndSendVerificationToken from "@/lib/email-verification-token";

// We hash the user entered password using crypto.js
export const hashPassword = (string: string): string => {
  return sha256(string).toString();
};

// function to create user in our database
async function createUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<CreateUserResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(CreateUserRequestSchema, body)) {
    return res.status(400).json({ message: "Invalid request body" });
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

    return res.status(201).json({ user });
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
