import { Type, Static } from "@sinclair/typebox";
import { Participation, SchoolStage } from "@prisma/client";
import { countryReg, phoneReg, zipcodeReg } from "@/lib/validators/address";
import { emailReg } from "@/lib/validators";
import { ShirtSizes, ShirtStyles } from "./shirt";
import { Pronouns } from "./pronouns";
import { toISOStringReg } from "@/lib/validators/date";

const CONTESTANT = "CONTESTANT";
const MENTOR = "MENTOR";
export type ContestantParticipationRole = typeof CONTESTANT;
export type ParticipationRole = ContestantParticipationRole | typeof MENTOR;

const SchoolStageSchema = Type.Enum(SchoolStage);

const ShirtStyleSchema = Type.Union(
  ShirtStyles.map((value) => Type.Literal(value)),
);

const ShirtSizeSchema = Type.Union(
  ShirtSizes.map((value) => Type.Literal(value)),
);

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
  municipality: Type.Optional(Type.String({ minLength: 1 })),
  locality: Type.Optional(Type.String({ minLength: 1 })),
  references: Type.Optional(Type.String({ minLength: 1 })),
  phone: Type.String({ pattern: phoneReg }),
});

const UserInputSchema = Type.Object({
  // email - user identifier
  email: Type.String({ pattern: emailReg }),
  firstName: Type.String({ minLength: 1 }),
  lastName: Type.String({ minLength: 1 }),
  preferredName: Type.String({ minLength: 1 }),
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

const ContestantParticipationInputSchema = Type.Object({
  role: Type.Literal(CONTESTANT),
  schoolName: Type.String({ minLength: 1 }),
  schoolStage: SchoolStageSchema,
  schoolGrade: Type.Integer({ minimum: 1 }),
});

export type ParticipationRequestInput = Static<
  typeof ParticipationRequestInputSchema
>;
export const ParticipationRequestInputSchema = Type.Object({
  // Ofmi edition
  ofmiEdition: Type.Integer({ minimum: 1 }),
  // User
  user: UserInputSchema,
  // The country code
  country: Type.String({ pattern: countryReg.toString() }),
  state: Type.String({ minLength: 1 }),
  userParticipation: Type.Union([ContestantParticipationInputSchema]),
});

export type UpsertParticipationRequest = Static<
  typeof UpsertParticipationRequestSchema
>;
export const UpsertParticipationRequestSchema = ParticipationRequestInputSchema;

export interface UpsertParticipationResponse {
  participation: Participation;
}
