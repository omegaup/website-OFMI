import { Type, Static } from "@sinclair/typebox";
import {
  Participation,
  ParticipationRole,
  Prisma,
  SchoolStage,
} from "@prisma/client";
import { countryReg } from "@/lib/validators/address";
import { toISOStringReg } from "@/lib/validators/date";
import { exhaustiveMatchingGuard } from "@/utils";
import { UserInputSchema } from "./user.schema";

export const ParticipationRoleOfString = (
  role: string,
): ParticipationRole | undefined => {
  return role in ParticipationRole
    ? ParticipationRole[role as keyof typeof ParticipationRole]
    : undefined;
};

export const ParticipationRoleName = (role: ParticipationRole): string => {
  switch (role) {
    case "CONTESTANT":
      return "Participante";
    case "VOLUNTEER":
      return "Voluntario";
    default: {
      return exhaustiveMatchingGuard(role);
    }
  }
};

const SchoolStageSchema = Type.Enum(SchoolStage);

export type ContestantParticipationInput = Static<
  typeof ContestantParticipationInputSchema
>;
export const ContestantParticipationInputSchema = Type.Object({
  role: Type.Literal(ParticipationRole.CONTESTANT),
  schoolName: Type.String({ minLength: 1 }),
  schoolStage: SchoolStageSchema,
  schoolGrade: Type.Integer({ minimum: 1 }),
  schoolCountry: Type.String({ pattern: countryReg.toString() }),
  schoolState: Type.String({ minLength: 1 }),
  venueQuotaId: Type.Optional(Type.String()),
});

export const VolunteerParticipationInputSchema = Type.Object({
  role: Type.Literal(ParticipationRole.VOLUNTEER),
  educationalLinkageOptIn: Type.Boolean(),
  fundraisingOptIn: Type.Boolean(),
  communityOptIn: Type.Boolean(),
  trainerOptIn: Type.Boolean(),
  problemSetterOptIn: Type.Boolean(),
  mentorOptIn: Type.Boolean(),
});

export type UserParticipation = Static<typeof UserParticipationSchema>;
const UserParticipationSchema = Type.Union([
  ContestantParticipationInputSchema,
  VolunteerParticipationInputSchema,
]);

export type ParticipationRequestInput = Static<
  typeof ParticipationRequestInputSchema
>;
export const ParticipationRequestInputSchema = Type.Object({
  ofmiEdition: Type.Integer({ minimum: 1 }),
  user: UserInputSchema,
  registeredAt: Type.String({ pattern: toISOStringReg }),
  userParticipation: UserParticipationSchema,
});

export type ParticipationOutput = Static<typeof ParticipationOutputSchema>;
export const ParticipationOutputSchema = Type.Object({
  // input schema of request
  input: ParticipationRequestInputSchema,
  contestantParticipantId: Type.Union([Type.Null(), Type.String()]),
});

export type UpsertParticipationRequest = Static<
  typeof UpsertParticipationRequestSchema
>;
export const UpsertParticipationRequestSchema = Type.Omit(
  ParticipationRequestInputSchema,
  ["registeredAt"],
);

export type ParticipationWithUserOauth = Prisma.ParticipationGetPayload<{
  include: {
    user: {
      include: {
        UserAuth: {
          include: {
            UserOauth: true;
          };
        };
      };
    };
  };
}>;

export interface UpsertParticipationResponse {
  participation: Participation;
}

export type GenerateIdentitiesRequest = Static<
  typeof GenerateIdentitiesRequestInputSchema
>;

export const GenerateIdentitiesRequestInputSchema = Type.Object({
  ofmiEdition: Type.Integer({ minimum: 1 }),
});
