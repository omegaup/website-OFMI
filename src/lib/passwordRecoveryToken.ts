import jwt from "jsonwebtoken";
import config from "@/config/default";
import {
  verificationEmailToken,
  verificationEmailTokenSchema,
} from "./emailVerificationToken";
import { jwtSign, jwtVerify } from "./jwt";
import { getSecretOrError } from "./secret";
import { emailer } from "./emailer";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "./hashPassword";

const VERIFICATION_EMAIL_SECRET_KEY = "VERIFICATION_EMAIL_SECRET";

export default async function generateAndSendRecoveryToken(
  email: string,
): Promise<void> {
  const user = await prisma.userAuth.findFirst({
    where: {
      email: email,
    },
  });
  if (user == null) {
    return;
  }
  const payload: verificationEmailToken = { userAuthId: user.id };
  const emailToken = await jwtSign(
    payload,
    getSecretOrError(VERIFICATION_EMAIL_SECRET_KEY),
    {
      expiresIn: config.VERIFICATION_TOKEN_EXPIRATION,
    },
  );
  const url = `${config.BASE_URL}/change-password?token=${emailToken}`;
  await emailer.notifyUserForSignup(email, url);
}

export async function changePassword({
  pass,
  token,
  passConfirm,
}: {
  pass: string;
  token: string;
  passConfirm: string;
}): Promise<{
  message: string;
  success: boolean;
}> {
  if (pass != passConfirm) {
    return {
      success: false,
      message: "Las contraseñas no coinciden",
    };
  }
  if (pass.length < 8) {
    return {
      success: false,
      message: "Las contraseña debe tener al menos 8 caracteres",
    };
  }
  try {
    const result = await jwtVerify(
      verificationEmailTokenSchema,
      token,
      getSecretOrError(VERIFICATION_EMAIL_SECRET_KEY),
    );
    const user = await prisma.userAuth.update({
      where: {
        id: result.userAuthId,
      },
      data: {
        password: hashPassword(pass),
      },
    });
    if (user == null) {
      return {
        success: false,
        message: "El usuario no existe",
      };
    }
    await emailer.notifySuccessfulPasswordRecovery(user.email);
    return {
      success: true,
      message: "La contraseña ha sido cambiada exitosamente",
    };
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message: "El token ha expirado, por favor solicita uno nuevo",
      };
    }
    throw e;
  }
}
