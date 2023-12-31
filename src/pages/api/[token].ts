import { NextApiRequest, NextApiResponse } from "next";
import { VerifyEmailResponse } from "@/types/auth.schema";
import { BadRequestError } from "@/types/badRequestError.schema";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<VerifyEmailResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "GET") {
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    await verifyEmailHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}

async function verifyEmailHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { token } = req.query;
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
      return res.status(400).json({
        message:
          "Este correo ya fue verificado previamente, ya puedes hacer login",
      });
    }

    await prisma.userAuth.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "El token ha expirado, por favor solicita uno nuevo",
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }

  res.redirect(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/login`);
}
