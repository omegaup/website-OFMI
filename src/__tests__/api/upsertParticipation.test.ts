import { describe, it, expect, beforeEach } from "vitest";
import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import upsertParticipationHandler from "@/pages/api/ofmi/upsertParticipation";
import { emailReg } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { seed } from "@/scripts/seed";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const validOfmiEdition = 1;
const birthDayLimit = new Date("2005-07-01");

beforeEach(async () => {
  // Seed db
  await seed();
  // update ofmi birth day limit
  await prisma.ofmi.update({
    where: { edition: validOfmiEdition },
    data: {
      birthDateRequirement: birthDayLimit,
    },
  });
});

describe("/api/ofmi/registerParticipation API Endpoint", () => {
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

  const validUserInput = {
    email: "ofmi@omegaup.com",
    firstName: "Juan Carlos",
    lastName: "Sigler Priego",
    preferredName: "Juanito",
    birthDate: new Date("2006-11-24"),
    pronouns: "HE",
    governmentId: "HEGG061124MVZRRL02",
    shirtSize: "M",
    shirtStyle: "UNISEX",
    mailingAddress: {
      street: "Calle",
      externalNumber: "#8Bis",
      zipcode: "01234",
      country: "MEX",
      state: "Aguascalientes",
      municipality: "Aguascalientes",
      locality: "Aguascalientes",
      phone: "5511223344",
    },
  };

  const validUserParticipationInput = {
    role: "CONTESTANT",
    schoolName: "Colegio Carol Baur",
    schoolGrade: 3,
    schoolStage: "High",
  };

  const validRequest = {
    ofmiEdition: 1,
    country: "MEX",
    state: "Aguascalientes",
    user: validUserInput,
    userParticipation: validUserParticipationInput,
  };

  it("should return a successful response", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });
    await upsertParticipationHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
  });

  it("invalid OFMI edition", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        ofmiEdition: 1000000, // Espero no llegar a edición tan lejana
      },
    });
    await upsertParticipationHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: "La edición de la OFMI que buscas no existe",
    });
    expect(res.statusCode).toBe(400);
  });

  it("invalid email", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        user: {
          ...validUserInput,
          email: "juanito.omegaup.com",
        },
      },
    });
    await upsertParticipationHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: `El campo /user/email no cumple con los requerimientos. Expected string to match '${emailReg}'`,
    });
    expect(res.statusCode).toBe(400);
  });

  it("user not found", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        user: {
          ...validUserInput,
          email: "dont@exist.com",
        },
      },
    });
    await upsertParticipationHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: "El usuario con ese correo no existe",
    });
    expect(res.statusCode).toBe(400);
  });

  describe("birthdate", async () => {
    it("invalid birthdate", async () => {
      const { req, res } = mockRequestResponse({
        body: {
          ...validRequest,
          user: {
            ...validUserInput,
            birthDate: "0006-12-12",
          },
        },
      });
      await upsertParticipationHandler(req, res);

      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message: "Se esperaba un Date para el campo /user/birthDate",
      });
      expect(res.statusCode).toBe(400);
    });

    it("CURP do not match with birthdate", async () => {
      const { req, res } = mockRequestResponse({
        body: {
          ...validRequest,
          user: {
            ...validUserInput,
            birthDate: new Date("2008-12-12"),
          },
        },
      });
      await upsertParticipationHandler(req, res);

      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message:
          "Invalid CURP. La fecha de nacimiento no coincide con la de la CURP",
      });
      expect(res.statusCode).toBe(400);
    });

    it("Birthdate after maximum allowed", async () => {
      const { req, res } = mockRequestResponse({
        body: {
          ...validRequest,
          user: {
            ...validUserInput,
            birthDate: new Date("2004-12-12"),
          },
        },
      });
      await upsertParticipationHandler(req, res);

      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message:
          "No puedes competir en esta OFMI. No cumples con el requisito de haber nacido después del Fri Jul 01 2005",
      });
      expect(res.statusCode).toBe(403);
    });
  });

  it("invalid school grade", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        userParticipation: {
          ...validUserParticipationInput,
          schoolStage: "INVALID",
        },
      },
    });
    await upsertParticipationHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message:
        "El campo /userParticipation/schoolStage solo acepta los siguientes valores: [Elementary,string], [Secondary,string], [High,string]",
    });
    expect(res.statusCode).toBe(400);
  });
});
