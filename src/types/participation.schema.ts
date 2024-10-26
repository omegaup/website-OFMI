import { Type, Static } from "@sinclair/typebox";
import {
  Participation,
  ParticipationRole,
  SchoolStage,
  ShirtSize,
} from "@prisma/client";
import { countryReg, phoneReg, zipcodeReg } from "@/lib/validators/address";
import { emailReg } from "@/lib/validators";
import { ShirtStyles } from "./shirt";
import { Pronouns } from "./pronouns";
import { toISOStringReg } from "@/lib/validators/date";
import { exhaustiveMatchingGuard } from "@/utils";

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

const ShirtStyleSchema = Type.Union(
  ShirtStyles.map((value) => Type.Literal(value)),
);

const ShirtSizeSchema = Type.Enum(ShirtSize);

export type Pronouns = Static<typeof PronounsSchema>;
const PronounsSchema = Type.Union(Pronouns.map((value) => Type.Literal(value)));

const MailingAddressSchema = Type.Object({
  // Persona que recibe
  recipient: Type.Optional(Type.String({ minLength: 1 })),
  street: Type.String({ minLength: 1 }),
  externalNumber: Type.String({ minLength: 1 }),
  internalNumber: Type.Optional(Type.String({ minLength: 1 })),
  zipcode: Type.String({ pattern: zipcodeReg }),
  country: Type.String({ pattern: countryReg }),
  state: Type.String({ minLength: 1 }),
  municipality: Type.String(),
  locality: Type.Optional(Type.String()),
  references: Type.Optional(Type.String({ minLength: 1 })),
  phone: Type.String({ pattern: phoneReg }),
});

const UserInputSchema = Type.Object({
  // email - user identifier
  email: Type.String({ pattern: emailReg }),
  firstName: Type.String({ minLength: 1 }),
  lastName: Type.String({ minLength: 1 }),
  preferredName: Type.Optional(Type.String({ minLength: 1 })),
  // Type.Date is unsupported for JSON serialization/deserialization
  // Lets use Date.toISOString to send Dates and make sure the format
  // comes from toISOString
  birthDate: Type.String({ pattern: toISOStringReg }),
  governmentId: Type.String({ minLength: 1 }),
  pronouns: PronounsSchema,
  shirtSize: ShirtSizeSchema,
  shirtStyle: ShirtStyleSchema,
  mailingAddress: MailingAddressSchema,
});

export type ContestantParticipationInput = Static<
  typeof ContestantParticipationInputSchema
>;
const ContestantParticipationInputSchema = Type.Object({
  role: Type.Literal(ParticipationRole.CONTESTANT),
  schoolName: Type.String({ minLength: 1 }),
  schoolStage: SchoolStageSchema,
  schoolGrade: Type.Integer({ minimum: 1 }),
  schoolCountry: Type.String({ pattern: countryReg.toString() }),
  schoolState: Type.String({ minLength: 1 }),
  disqualificationReason: Type.String({ default: "N/A" }),
});

const VolunteerParticipationInputSchema = Type.Object({
  role: Type.Literal(ParticipationRole.VOLUNTEER),
  educationalLinkageOptIn: Type.Boolean(),
  fundraisingOptIn: Type.Boolean(),
  communityOptIn: Type.Boolean(),
  trainerOptIn: Type.Boolean(),
  problemSetterOptIn: Type.Boolean(),
  mentorOptIn: Type.Boolean(),
});

export type UserParticipation = Static<typeof UserParticipationSchema>;
export const UserParticipationSchema = Type.Union([
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

export type UpsertParticipationRequest = Static<
  typeof UpsertParticipationRequestSchema
>;
export const UpsertParticipationRequestSchema = Type.Omit(
  ParticipationRequestInputSchema,
  ["registeredAt"],
);

export interface UpsertParticipationResponse {
  participation: Participation;
}
