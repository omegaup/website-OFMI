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

export type FindOrCreateDriveFolderForParticipantResponse = Static<
  typeof FindOrCreateDriveFolderForParticipantResponseSchema
>;
export const FindOrCreateDriveFolderForParticipantResponseSchema = Type.Object({
  gDriveFolderUrl: Type.String(),
});

export type FindOrCreateDriveFolderForParticipantRequest = Static<
  typeof FindOrCreateDriveFolderForParticipantRequestSchema
>;
export const FindOrCreateDriveFolderForParticipantRequestSchema = Type.Object({
  email: Type.String(),
  ofmiEdition: Type.Integer(),
});

export type DeleteContestantParticipationRequest = Static<
  typeof DeleteContestantParticipationRequestSchema
>;
export const DeleteContestantParticipationRequestSchema = Type.Object(
  {
    emails: Type.Array(Type.String(), { minItems: 1 }),
    ofmiEdition: Type.Optional(Type.Integer({ minimum: 1 })),
  },
  {
    description:
      "Marca participantes concursantes como eliminados y libera sus sedes",
  },
);

const DeleteContestantParticipationResultSchema = Type.Object({
  email: Type.String(),
  success: Type.Boolean(),
  deletedAt: Type.Optional(Type.String()),
  error: Type.Optional(Type.String()),
});

export type DeleteContestantParticipationResponse = Static<
  typeof DeleteContestantParticipationResponseSchema
>;
export const DeleteContestantParticipationResponseSchema = Type.Object({
  results: Type.Array(DeleteContestantParticipationResultSchema),
});
