import { Type, Static } from "@sinclair/typebox";
import { Participation, SchoolStage } from "@prisma/client";
import { countryReg, phoneReg, zipcodeReg } from "@/lib/validators/address";
import { emailReg } from "@/lib/validators";
import { ShirtSizes, ShirtStyles } from "./shirt";
import { Pronouns } from "./pronouns";

const CONTESTANT = "CONTESTANT";
const MENTOR = "MENTOR";
export type ParticipationRole = typeof CONTESTANT | typeof MENTOR;

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
  birthDate: Type.Date(),
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

export type UpsertParticipationRequest = Static<
  typeof UpsertParticipationRequestSchema
>;
export const UpsertParticipationRequestSchema = Type.Object({
  // Ofmi edition
  ofmiEdition: Type.Integer({ minimum: 1 }),
  // User
  user: UserInputSchema,
  // The country code
  country: Type.String({ pattern: countryReg.toString() }),
  state: Type.String({ minLength: 1 }),
  userParticipation: Type.Union([ContestantParticipationInputSchema]),
});

export interface UpsertParticipationResponse {
  participation: Participation;
}
