import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { mockEmailer } from "./mocks/emailer";
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
import { hashPassword } from "@/lib/hashPassword";
import { ParticipationRole } from "@/types/participation.schema";
import { toISOStringReg } from "@/lib/validators/date";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const dummyEmail = "upsertParticipation@test.com";
const validOfmi = {
  edition: 1,
  birthDateRequirement: new Date("2005-07-01"),
  year: 2024,
  registrationOpenTime: new Date("2024-07-07"),
  registrationCloseTime: new Date("2050-08-08"),
};
const validRole: ParticipationRole = "CONTESTANT";

beforeAll(async () => {
  // ofmi is Needed
  await prisma.ofmi.upsert({
    where: { edition: validOfmi.edition },
    update: {
      ...validOfmi,
    },
    create: {
      ...validOfmi,
    },
  });
  // Rol is needed
  await prisma.participationRole.upsert({
    where: {
      name: validRole,
    },
    update: {},
    create: {
      name: validRole,
    },
  });
  // Upsert the valid user Auth
  await prisma.userAuth.upsert({
    where: { email: dummyEmail },
    update: {},
    create: { email: dummyEmail, password: hashPassword("pass") },
  });
});

beforeEach(async () => {
  // Remove contestant participation of dummy email
  await prisma.contestantParticipation.deleteMany({
    where: {
      Participation: { every: { user: { UserAuth: { email: dummyEmail } } } },
    },
  });
  // Remove participation of dummy email
  await prisma.participation.deleteMany({
    where: { user: { UserAuth: { email: dummyEmail } } },
  });
  // Remover contestant participation
  mockEmailer.resetMock();
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

  const validMailingAddressInput = {
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

  const validUserInput = {
    email: dummyEmail,
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

  const validUserParticipationInput = {
    role: validRole,
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
    const participation = res._getJSONData()["participation"];

    // Check update in DB
    const participationModel = await prisma.participation.findUnique({
      where: {
        user_id_ofmi_id_role_id: {
          user_id: participation["user_id"],
          ofmi_id: participation["ofmi_id"],
          role_id: participation["role_id"],
        },
      },
    });

    expect(participationModel).not.toBeNull();
  });

  it("should update", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });
    await upsertParticipationHandler(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    const participation = res._getJSONData()["participation"];

    const newCountry = "USA";
    const newFirstName = "Other Name";
    const newSchool = "Other school";
    const newZipcode = "06200";
    const { req: req2, res: res2 } = mockRequestResponse({
      body: {
        ...validRequest,
        country: newCountry,
        user: {
          ...validUserInput,
          firstName: newFirstName,
          mailingAddress: {
            ...validMailingAddressInput,
            zipcode: newZipcode,
          },
        },
        userParticipation: {
          ...validUserParticipationInput,
          schoolName: newSchool,
        },
      },
    });
    await upsertParticipationHandler(req2, res2);
    expect(res2.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res2._getJSONData()).toMatchObject({
      participation: {
        country: newCountry,
        user_id: participation["user_id"],
        contestant_participation_id:
          participation["contestant_participation_id"],
      },
    });
    expect(res2.statusCode).toBe(201);

    // Check update in DB
    const participationModel = await prisma.participation.findUnique({
      include: {
        user: {
          include: {
            mailing_address: true,
          },
        },
        contestant_participation: {
          include: {
            school: true,
          },
        },
      },
      where: {
        user_id_ofmi_id_role_id: {
          user_id: participation["user_id"],
          ofmi_id: participation["ofmi_id"],
          role_id: participation["role_id"],
        },
      },
    });
    if (!participationModel) {
      expect(participationModel).not.toBeNull();
    }

    expect(participationModel).toMatchObject({
      user_id: participation["user_id"],
      ofmi_id: participation["ofmi_id"],
      role_id: participation["role_id"],
      country: newCountry,
      user: {
        first_name: newFirstName,
        mailing_address: {
          zip_code: newZipcode,
        },
      },
      contestant_participation: {
        school: {
          name: newSchool,
        },
      },
    });
  });

  it("should sent email on registration", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });
    await upsertParticipationHandler(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject: "Te has registrado exitosamente a la OFMI",
        },
      },
    ]);

    // Update a field and check that this time we don't get an email
    mockEmailer.resetMock();

    const { req: req2, res: res2 } = mockRequestResponse({
      body: {
        ...validRequest,
        country: "USA",
      },
    });
    await upsertParticipationHandler(req2, res2);
    expect(res2.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res2._getJSONData()).toMatchObject({
      participation: {
        country: "USA",
      },
    });
    expect(res2.statusCode).toBe(201);

    expect(mockEmailer.getSentEmails()).toMatchObject([]);
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
        message: `El campo /user/birthDate no cumple con los requerimientos. Expected string to match '${toISOStringReg}'`,
      });
      expect(res.statusCode).toBe(400);
    });

    it("CURP do not match with birthdate", async () => {
      const { req, res } = mockRequestResponse({
        body: {
          ...validRequest,
          user: {
            ...validUserInput,
            birthDate: new Date("2008-12-12").toISOString(),
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
            birthDate: new Date("2004-12-12").toISOString(),
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
