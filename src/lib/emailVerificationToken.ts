import jwt from "jsonwebtoken";
import config from "@/config/default";
import { emailer } from "./emailer";
import { prisma } from "@/lib/prisma";
import { Static, Type } from "@sinclair/typebox";
import { decrypt, encrypt } from "./jwt";

export type verificationEmailToken = Static<
  typeof verificationEmailTokenSchema
>;
const verificationEmailTokenSchema = Type.Object({
  userAuthId: Type.String(), // User auth id
});

export default async function generateAndSendVerificationToken(
  userAuthId: string,
  email: string,
): Promise<void> {
  const payload: verificationEmailToken = { userAuthId };
  const emailToken = encrypt(payload, config.VERIFICATION_EMAIL_SECRET, {
    expiresIn: config.VERIFICATION_TOKEN_EXPIRATION,
  });

  const url: string = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/login?verifyToken=${emailToken}`;

  await emailer.notifyUserForSignup(email, url);
}

export async function verifyEmail({ token }: { token: string }): Promise<
  | {
      email: string;
      success: true;
    }
  | {
      errorMsg: string;
      success: false;
    }
> {
  try {
    const result = await decrypt(
      verificationEmailTokenSchema,
      token,
      process.env.VERIFICATION_EMAIL_SECRET as string,
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

    await prisma.userAuth.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    return { email: user.email, success: true };
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
