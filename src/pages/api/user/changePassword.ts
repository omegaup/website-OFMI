import { parseValueError } from "@/lib/typebox";
import { PasswordChangeRequestSchema } from "@/types/auth.schema";
import { Value } from "@sinclair/typebox/value";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { validateRecoveryToken } from "@/lib/passwordRecoveryToken";
import { emailer } from "@/lib/emailer";
import { hashPassword } from "@/lib/hashPassword";

async function requestPasswordChangeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(PasswordChangeRequestSchema, body)) {
    const firstError = Value.Errors(PasswordChangeRequestSchema, body).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { token, password } = body;
  const validatedToken = await validateRecoveryToken(token);
  if (validatedToken.success === false) {
    return res.status(400).json({ message: validatedToken.message });
  }
  try {
    const user = await prisma.userAuth.update({
      where: {
        id: validatedToken.userId,
      },
      data: {
        password: hashPassword(password),
      },
    });
    await emailer.notifySuccessfulPasswordRecovery(user.email);
    return res
      .status(200)
      .json({ message: "La contraseña fue actualizada exitosamente" });
  } catch (e) {
    console.error("Error requestPasswordChangeHandler", e);
    return res
      .status(400)
      .json({ message: "No se pudo actualizar la contraseña" });
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === "POST") {
    await requestPasswordChangeHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
