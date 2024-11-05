import { JSONValue } from "@/types/json";
import { ParticipationRole } from "@prisma/client";

export const validOfmi = {
  edition: 1,
  birthDateRequirement: new Date("2005-07-01"),
  year: 2024,
  registrationOpenTime: new Date("2024-07-07"),
  registrationCloseTime: new Date("2050-08-08"),
};

export const validMailingAddressInput = {
  street: "Calle",
  externalNumber: "#8Bis",
  zipcode: "01234",
  country: "MEX",
  state: "Aguascalientes",
  municipality: "Aguascalientes",
  locality: "Aguascalientes",
  phone: "5511223344",
  references: "Hasta el fondo",
};

export const validUserInput = (email: string): object => {
  return {
    email,
    firstName: "Juan Carlos",
    lastName: "Sigler Priego",
    preferredName: "Juanito",
    birthDate: new Date("2006-11-24").toISOString(),
    pronouns: "HE",
    governmentId: "HEGG061124MVZRRL02",
    shirtSize: "M",
    shirtStyle: "STRAIGHT",
    mailingAddress: validMailingAddressInput,
  };
};

export const validUserParticipationInput = {
  role: ParticipationRole.CONTESTANT,
  schoolName: "Colegio Carol Baur",
  schoolStage: "HIGH",
  schoolGrade: 3,
  schoolCountry: "MEX",
  schoolState: "Aguascalientes",
};
