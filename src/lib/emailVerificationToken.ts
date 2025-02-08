import jwt from "jsonwebtoken";
import config from "@/config/default";
import { emailer } from "./emailer";
import { prisma } from "@/lib/prisma";
import { Static, Type } from "@sinclair/typebox";
import { jwtSign, jwtVerify } from "./jwt";
import { Role } from "@prisma/client";
import { getSecretOrError } from "./secret";

const VERIFICATION_EMAIL_SECRET_KEY = "VERIFICATION_EMAIL_SECRET";

export type verificationEmailToken = Static<
  typeof verificationEmailTokenSchema
>;
export const verificationEmailTokenSchema = Type.Object({
  userAuthId: Type.String(), // User auth id
});

export default async function generateAndSendVerificationToken(
  userAuthId: string,
  email: string,
): Promise<void> {
  const payload: verificationEmailToken = { userAuthId };
  const emailToken = await jwtSign(
    payload,
    getSecretOrError(VERIFICATION_EMAIL_SECRET_KEY),
    {
      expiresIn: config.VERIFICATION_TOKEN_EXPIRATION_MS,
    },
  );

  const url: string = `${config.BASE_URL}/login?verifyToken=${emailToken}`;

  await emailer.notifyUserForSignup(email, url);
}

export async function verifyEmail({ token }: { token: string }): Promise<
  | {
      userAuthId: string;
      email: string;
      role: Role;
      success: true;
    }
  | {
      errorMsg: string;
      success: false;
    }
> {
  try {
    const result = await jwtVerify(
      verificationEmailTokenSchema,
      token,
      getSecretOrError(VERIFICATION_EMAIL_SECRET_KEY),
    );

    const user = await prisma.userAuth.findFirstOrThrow({
      where: {
        id: result.userAuthId,
      },
    });

    if (user.emailVerified != null) {
      return {
        success: false,
        errorMsg:
          "Este correo ya fue verificado previamente, ya puedes hacer login",
      };
    }

    const userAuth = await prisma.userAuth.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    // Send successful verification email
    await emailer.notifyUserSuccessfulSignup(user.email);

    return {
      email: userAuth.email,
      userAuthId: userAuth.id,
      role: userAuth.role,
      success: true,
    };
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        errorMsg: "El token ha expirado, por favor solicita uno nuevo",
      };
    }
    throw e;
  }
}
