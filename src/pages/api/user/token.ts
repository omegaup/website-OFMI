import { VerifyEmailRequestSchema, VerifyEmailResponse } from "@/types/auth.schema";
import { BadRequestError } from "@/types/badRequestError.schema";
import { Value } from "@sinclair/typebox/value";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import generateAndSendVerificationToken from "@/lib/email-verification-token";

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse<VerifyEmailResponse | BadRequestError>,
): Promise<void> {
    if (req.method === "POST") {
        /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
        await resendEmailVerificationTokenHandler(req, res);
      } else {
        return res.status(405).json({ message: "Method Not allowed" });
      }
}

async function resendEmailVerificationTokenHandler(
    req: NextApiRequest,
    res: NextApiResponse,
  ): Promise<void> {
    const { body } = req;
    if (!Value.Check(VerifyEmailRequestSchema, body)) {
        return res.status(400).json({ message: "Invalid request body" });
    }
    const { email } = body;

    const user = await prisma.userAuth.findFirst({
        where: {
            email: email
        },
    });

    if (user != null && user.emailVerified == null) {
        generateAndSendVerificationToken(user.id, email);
    }

    return res.status(200).json({
        message: "Si hay una cuenta registrada con ese correo, recibirás una liga con el nuevo token."
    });
  }
  