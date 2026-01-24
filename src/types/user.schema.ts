import { Static, Type } from "@sinclair/typebox";
import { ShirtStyles } from "./shirt";
import { ShirtSize, User } from "@prisma/client";
import { countryReg, phoneReg, zipcodeReg } from "@/lib/validators/address";
import { emailReg } from "@/lib/validators";
import { toISOStringReg } from "@/lib/validators/date";
import { Pronouns } from "./pronouns";

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

export type UserRequestInput = Static<typeof UserInputSchema>;
export const UserInputSchema = Type.Object({
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

export type UserOutput = Static<typeof UserOutputSchema>;
export const UserOutputSchema = Type.Object({
  input: UserInputSchema,
});

export type UpdateContactDataRequest = Static<
  typeof UpdateContactDataRequestSchema
>;

export const UpdateContactDataRequestSchema = Type.Object({
  user: UserInputSchema,
  venueQuotaId: Type.Optional(Type.String()),
});

export interface UpdateContactDataResponse {
  user: User;
}
