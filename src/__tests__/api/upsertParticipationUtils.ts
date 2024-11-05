import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { expect } from "vitest";
import { ParticipationRole } from "@prisma/client";
import upsertParticipationHandler from "@/pages/api/ofmi/upsertParticipation";
import { prisma } from "@/lib/prisma";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

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

export const validVolunteerParticipationInput = {
  role: ParticipationRole.VOLUNTEER,
  educationalLinkageOptIn: true,
  fundraisingOptIn: true,
  communityOptIn: true,
  trainerOptIn: true,
  problemSetterOptIn: true,
  mentorOptIn: true,
};

export function mockRequestResponse({
  method = "POST",
  body,
}: {
  method?: RequestMethod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): {
  req: ApiRequest;
  res: APiResponse;
} {
  const { req, res } = createMocks<ApiRequest, APiResponse>({
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
  return { req, res };
}

export async function cleanParticipation(email: string): Promise<void> {
  // Remove contestant participation of dummy email
  await prisma.contestantParticipation.deleteMany({
    where: {
      Participation: { every: { user: { UserAuth: { email } } } },
    },
  });

  // Remove volunteer participation
  await prisma.volunteerParticipation.deleteMany({
    where: {
      Participation: { every: { user: { UserAuth: { email } } } },
    },
  });

  // Remove participation of dummy email
  await prisma.participation.deleteMany({
    where: { user: { UserAuth: { email } } },
  });

  // Remove user
  await prisma.user.deleteMany({
    where: { UserAuth: { email } },
  });
}

export async function insertAndCheckSuccessfullyDummyParticipation(
  email: string,
  role: ParticipationRole,
): Promise<APiResponse> {
  const validRequest = {
    ofmiEdition: validOfmi.edition,
    user: validUserInput(email),
    userParticipation:
      role === "CONTESTANT"
        ? validUserParticipationInput
        : validVolunteerParticipationInput,
  };
  const { req, res } = mockRequestResponse({ body: validRequest });
  await upsertParticipationHandler(req, res);

  console.log(res._getJSONData());
  expect(res.statusCode).toBe(201);
  expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
  return res;
}
