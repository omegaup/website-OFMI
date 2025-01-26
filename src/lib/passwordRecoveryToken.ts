import jwt from "jsonwebtoken";
import config from "@/config/default";
import {
  verificationEmailToken,
  verificationEmailTokenSchema,
} from "./emailVerificationToken";
import { jwtSign, jwtVerify } from "./jwt";
import { getSecretOrError } from "./secret";

const VERIFICATION_EMAIL_SECRET_KEY = "VERIFICATION_EMAIL_SECRET";

export default async function generateRecoveryToken(
  userId: string,
): Promise<string> {
  const payload: verificationEmailToken = { userAuthId: userId };
  const emailToken = await jwtSign(
    payload,
    getSecretOrError(VERIFICATION_EMAIL_SECRET_KEY),
    {
      expiresIn: config.VERIFICATION_TOKEN_EXPIRATION_MS,
    },
  );
  return emailToken;
}

export async function validateRecoveryToken(token: string): Promise<
  | {
      message: string;
      success: false;
    }
  | { success: true; userId: string }
> {
  try {
    const result = await jwtVerify(
      verificationEmailTokenSchema,
      token,
      getSecretOrError(VERIFICATION_EMAIL_SECRET_KEY),
    );
    return {
      success: true,
      userId: result.userAuthId,
    };
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message: "El token ha expirado, por favor solicita uno nuevo",
      };
    }
    return {
      success: false,
      message: "El token es invalido",
    };
  }
}
