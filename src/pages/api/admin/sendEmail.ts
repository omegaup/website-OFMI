import { emailer } from "@/lib/emailer";
import { OFMI_EMAIL_SMTP_USER_KEY } from "@/lib/emailer/template";
import { getSecretOrError } from "@/lib/secret";
import { parseValueError } from "@/lib/typebox";
import {
  SendEmailRequestSchema,
  SendEmailResponse,
} from "@/types/admin.schema";
import { BadRequestError } from "@/types/errors";
import { Value } from "@sinclair/typebox/value";
import type { NextApiRequest, NextApiResponse } from "next/types";

async function sendEmailHandler(
  req: NextApiRequest,
  res: NextApiResponse<SendEmailResponse | BadRequestError>,
): Promise<void> {
  const { body } = req;
  if (!Value.Check(SendEmailRequestSchema, body)) {
    const firstError = Value.Errors(SendEmailRequestSchema, body).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }
  const { email, subject, content } = body;

  await emailer.sendEmail({
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject,
    text: subject,
    html: content,
  });

  return res.status(200).json({
    success: true,
  });
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<SendEmailResponse | BadRequestError>,
): Promise<void> {
  if (req.method === "POST") {
    // register to OFMI
    await sendEmailHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}
