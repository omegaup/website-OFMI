import { SHA256 as sha256 } from "crypto-js";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  CreateUserRequestSchema,
  CreateUserResponse,
} from "@/types/auth.schema";
import { Value } from "@sinclair/typebox/value";
import { BadRequestError } from "@/types/badRequestError.schema";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<CreateUserResponse | BadRequestError>,
) {
  if (req.method === "POST") {
    // create user
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    await createUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}

// We hash the user entered password using crypto.js
export const hashPassword = (string: string): string => {
  return sha256(string).toString();
};

// function to create user in our database
async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req;
  if (!Value.Check(CreateUserRequestSchema, body)) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { password } = body;

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "password length should be more than 8 characters" });
  }
  try {
    const user = await prisma.userAuth.create({
      data: { ...body, password: hashPassword(body.password) },
    });

    return res.status(201).json({ user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res.status(400).json({ message: e.message });
      }
      return res.status(400).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
