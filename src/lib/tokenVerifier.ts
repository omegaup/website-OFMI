import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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
    const result = jwt.verify(
      token as string,
      process.env.VERIFICATION_EMAIL_SECRET as string,
    );
    if (typeof result === "string") {
      throw new Error(result);
    }
    const user = await prisma.userAuth.findFirstOrThrow({
      where: {
        id: result.user,
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
