import { emailReg } from "@/lib/validators";
import { Static, Type } from "@sinclair/typebox";

export type SendEmailResponse = Static<typeof SendEmailResponseSchema>;
export const SendEmailResponseSchema = Type.Object({
  success: Type.Boolean(),
});

export type SendEmailRequest = Static<typeof SendEmailRequestSchema>;
export const SendEmailRequestSchema = Type.Object(
  {
    email: Type.String(),
    subject: Type.String({ minLength: 1 }),
    // Html of the email content
    content: Type.String({ minLength: 1 }),
  },
  { description: "Envía un correo desde la cuenta de ofmi-no-reply" },
);

export const BaseDisqualifyParticipantRequestSchema = Type.Object({
  ofmiEdition: Type.Optional(Type.Number({ minimum: 1 })),
  email: Type.String({ minLength: 6, pattern: emailReg }),
  sendEmail: Type.Boolean({ default: true }),
  reason: Type.String({ minLength: 1 }),
  appealed: Type.Boolean(),
});

const excludeCommonFieldsFromDPRS = Type.Omit(
  BaseDisqualifyParticipantRequestSchema,
  ["appealed"],
);

const excludeCommonUpdateFieldsFromDPRS = Type.Omit(
  excludeCommonFieldsFromDPRS,
  ["reason"],
);

export const updateDisqualificationReasonSchema = Type.Composite([
  excludeCommonUpdateFieldsFromDPRS,
  Type.Pick(BaseDisqualifyParticipantRequestSchema, ["reason"]),
]);

export const updateDisqualificationAppealSchema = Type.Composite([
  excludeCommonUpdateFieldsFromDPRS,
  Type.Pick(BaseDisqualifyParticipantRequestSchema, ["appealed"]),
]);

export const DisqualifyParticipantCreateRequestSchema = Type.Composite([
  excludeCommonFieldsFromDPRS,
  Type.Object({
    appealed: Type.Boolean({ default: false }),
  }),
]);

export const DisqualifyParticipantUpdateRequestSchema = Type.Union([
  updateDisqualificationReasonSchema,
  updateDisqualificationAppealSchema,
  BaseDisqualifyParticipantRequestSchema,
]);

export const DisqualifyParticipantRequestSchema = Type.Union([
  DisqualifyParticipantCreateRequestSchema,
  DisqualifyParticipantUpdateRequestSchema,
]);

export type DisqualifyParticipantRequest = Static<
  typeof DisqualifyParticipantRequestSchema
>;
