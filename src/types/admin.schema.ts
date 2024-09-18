import { Static, Type } from "@sinclair/typebox";
//import { emailReg } from "@/lib/validators";

export type SendEmailResponse = Static<typeof SendEmailResponseSchema>;
export const SendEmailResponseSchema = Type.Object({
  success: Type.Boolean(),
});

export type SendEmailRequest = Static<typeof SendEmailRequestSchema>;
export const SendEmailRequestSchema = Type.Object({
  email: Type.String(),
  subject: Type.String({ minLength: 1 }),
  // Html of the email content
  content: Type.String({ minLength: 1 }),
});
