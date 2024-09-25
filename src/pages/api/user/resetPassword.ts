import { parseValueError } from "@/lib/typebox";
import { PasswordResetRequestSchema } from "@/types/auth.schema";
import { Value } from "@sinclair/typebox/value";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import generateRecoveryToken from "@/lib/passwordRecoveryToken";
import config from "@/config/default";
import { emailer } from "@/lib/emailer";

async function requestPasswordResetHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(PasswordResetRequestSchema, body)) {
    const firstError = Value.Errors(PasswordResetRequestSchema, body).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { email } = req.body;
  const user = await prisma.userAuth.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    const token = await generateRecoveryToken(user.id);
    const url = `${config.BASE_URL}/changePassword?token=${token}`;
    await emailer.notifyPasswordRecoveryAttempt(user.email, url);
  }
  res.status(200).json({
    message:
      "Si el usuario existe, se le ha enviado un correo con las instrucciones para cambiar su contraseña",
  });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === "POST") {
    await requestPasswordResetHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
