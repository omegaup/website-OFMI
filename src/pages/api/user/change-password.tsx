import { parseValueError } from "@/lib/typebox";
import { PasswordChangeRequestSchema } from "@/types/auth.schema";
import { Value } from "@sinclair/typebox/value";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { validateRecoveryToken } from "@/lib/passwordRecoveryToken";
import { emailer } from "@/lib/emailer";
import { hashPassword } from "@/lib/hashPassword";

async function requestPasswordChangeHandler(
  password: string,
  userId: string,
): Promise<{ status: 200 | 400; message: string }> {
  try {
    const user = await prisma.userAuth.update({
      where: {
        id: userId,
      },
      data: {
        password: hashPassword(password),
      },
    });
    await emailer.notifySuccessfulPasswordRecovery(user.email);
    return {
      status: 200,
      message: "La contraseña fue actualizada exitosamente",
    };
  } catch (e) {
    return {
      status: 400,
      message: "No se pudo actualizar la contraseña",
    };
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === "POST") {
    const { body } = req;
    if (!Value.Check(PasswordChangeRequestSchema, body)) {
      const firstError = Value.Errors(
        PasswordChangeRequestSchema,
        body,
      ).First();
      return res.status(400).json({
        message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
      });
    }
    const { token, password } = body;
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 8 caracteres" });
    }
    const validatedToken = await validateRecoveryToken(token);
    if (validatedToken.success == false) {
      return res.status(400).json({ message: validatedToken.message });
    }
    const result = await requestPasswordChangeHandler(
      password,
      validatedToken.userId,
    );
    return res.status(result.status).json({ message: result.message });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
