import { prisma } from "@/lib/prisma";
import { hashPassword } from "./create";
import { NextApiRequest, NextApiResponse } from "next";
import { Value } from "@sinclair/typebox/value";
import { LoginUserRequestSchema, LoginUserResponse } from "@/types/auth.schema";
import { BadRequestError } from "@/types/errors";

async function loginUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<LoginUserResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(LoginUserRequestSchema, body)) {
    return res.status(400).json({ message: "Invalid inputs" });
  }
  const { email, password } = body;
  if (email == null || password == null) {
    return res.status(400).json({ message: "Invalid inputs" });
  }
  const user = await prisma.userAuth.findUnique({
    where: { email },
  });
  if (user == null || user.password !== hashPassword(password)) {
    return res
      .status(400)
      .json({ message: "Usuario o contraseña incorrectos." });
  }
  if (user.emailVerified === null) {
    return res.status(401).json({
      message:
        "Para poder iniciar sesión es necesario que verifiques tu email.",
    });
  }

  return res.status(200).json({ user });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<LoginUserResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    await loginUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
