import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hashPassword";
import {
  createMocks,
  createRequest,
  createResponse,
  RequestMethod,
} from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { ShirtSize } from "@prisma/client";
import { ShirtStyles } from "@/types/shirt";
import updateContactDataHandler from "@/pages/api/user/updateContactData";
type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const dummyEmail = "upsertUser@test.com";

const mailingAddressDB = {
  street: "Calle",
  externalNumber: "#8Bis",
  zipcode: "01234",
  country: "MEX",
  state: "Aguascalientes",
  references: "Por ahí",
  phone: "5511223344",
  county: "Aguascalientes",
  neighborhood: "Aguascalientes",
  name: "Yosshua V",
};

const validUserInput = {
  firstName: "Yosshua",
  lastName: "Villasana",
  preferredName: "Yosshua",
  birthDate: new Date("2006-11-24").toISOString(),
  pronouns: "HE",
  governmentId: "HEGG061124MVZRRL02",
  shirtSize: ShirtSize.M,
  shirtStyle: ShirtStyles[0],
};

beforeAll(async () => {
  // Upsert the valid user Auth
  const authUser = await prisma.userAuth.upsert({
    where: { email: dummyEmail },
    update: {},
    create: { email: dummyEmail, password: hashPassword("pass") },
  });

  await prisma.user.upsert({
    where: { userAuthId: authUser?.id },
    update: {},
    create: {
      ...validUserInput,
      UserAuth: {
        connect: {
          id: authUser?.id,
        },
      },
      MailingAddress: {
        create: { ...mailingAddressDB },
      },
    },
  });
});

describe("/api/user/updateContactData API Endpoint", () => {
  function mockRequestResponse({
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

  const updatedFields = {
    firstName: "Yosshua E",
    lastName: "C Villasana",
    preferredName: "Yossh",
    birthDate: new Date("2006-11-24").toISOString(),
    pronouns: "HE",
    governmentId: "HEGG061124MVZRRL02",
    shirtSize: ShirtSize.S,
    shirtStyle: ShirtStyles[1],
    mailingAddress: {
      street: "Nueva calle",
      externalNumber: "123",
      zipcode: "01234",
      country: "MEX",
      state: "Durango",
      references: "En la esq",
      phone: "5511223355",
      municipality: "Canatlán",
      locality: "Alamitos",
      recipient: "Other recipient",
    },
  };

  it("should return a successful response", async () => {
    const validRequest = {
      user: {
        email: dummyEmail,
        ...updatedFields,
      },
    };

    const { req, res } = mockRequestResponse({ body: validRequest });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    // Check update in DB
    const userAuth = await prisma.userAuth.findUniqueOrThrow({
      where: { email: dummyEmail },
    });
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: {
        userAuthId: userAuth.id,
      },
    });
    expect(updatedUser.firstName).toBe(updatedFields.firstName);
    expect(updatedUser.lastName).toBe(updatedFields.lastName);
    expect(updatedUser.preferredName).toBe(updatedFields.preferredName);
    expect(updatedUser.birthDate.toISOString()).toBe(
      updatedFields.birthDate.toString(),
    );
    expect(updatedUser.pronouns).toBe(updatedFields.pronouns);
    expect(updatedUser.governmentId).toBe(updatedFields.governmentId);
    expect(updatedUser.shirtSize).toBe(updatedFields.shirtSize);
    expect(updatedUser.shirtStyle).toBe(updatedFields.shirtStyle);
  });

  it("should fail due to invalid address", async () => {
    const validRequest = {
      user: {
        email: dummyEmail,
        ...updatedFields,
        mailingAddress: {
          ...mailingAddressDB,
          municipality: "Invalid county",
        },
      },
    };

    const { req, res } = mockRequestResponse({ body: validRequest });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: "Campo: Dirección de envío. Municipio inválido.",
    });
  });

  it("should fail due to non existent user", async () => {
    const validRequest = {
      user: {
        email: "fakemail@gmail.com",
        ...updatedFields,
        mailingAddress: {
          ...mailingAddressDB,
          municipality: "Invalid county",
        },
      },
    };

    const { req, res } = mockRequestResponse({ body: validRequest });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
  });
});
