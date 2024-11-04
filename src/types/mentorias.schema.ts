import { toISOStringReg } from "@/lib/validators/date";
import { Static, Type } from "@sinclair/typebox";

export type ScheduleMentoriaResponse = Static<
  typeof ScheduleMentoriaResponseSchema
>;
export const ScheduleMentoriaResponseSchema = Type.Object({
  success: Type.Boolean(),
});

export type ScheduleMentoriaRequest = Static<
  typeof ScheduleMentoriaRequestSchema
>;
export const ScheduleMentoriaRequestSchema = Type.Object({
  contestantParticipantId: Type.String({ minLength: 1 }),
  volunteerAuthId: Type.String({ minLength: 1 }),
  volunteerParticipationId: Type.String({ minLength: 1 }),
  meetingTimeOpt: Type.Optional(Type.String({ pattern: toISOStringReg })),
  calendlyPayload: Type.Object({
    event: Type.Object({ uri: Type.String() }),
    invitee: Type.Object({ uri: Type.String() }),
  }),
});
