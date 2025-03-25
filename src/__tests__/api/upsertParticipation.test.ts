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
import { toISOStringReg } from "@/lib/validators/date";
import {
  cleanParticipation,
  insertAndCheckSuccessfullyDummyParticipation,
  validMailingAddressInput,
  validOfmi,
  validUserInput,
  validUserParticipationInput,
} from "./upsertParticipationUtils";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const dummyEmail = "upsertParticipation@test.com";

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
  // Upsert the valid user Auth
  await prisma.userAuth.upsert({
    where: { email: dummyEmail },
    update: {},
    create: { email: dummyEmail, password: hashPassword("pass") },
  });
});

beforeEach(async () => {
  await cleanParticipation(dummyEmail);
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

  const validUser = validUserInput(dummyEmail);

  const validRequest = {
    ofmiEdition: validOfmi.edition,
    user: validUser,
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
        userId_ofmiId: {
          userId: participation["userId"],
          ofmiId: participation["ofmiId"],
        },
      },
    });

    expect(participationModel).not.toBeNull();
  });

  it("should register volunteer", async () => {
    await insertAndCheckSuccessfullyDummyParticipation(dummyEmail, "VOLUNTEER");
  });

  it("should update", async () => {
    const res = await insertAndCheckSuccessfullyDummyParticipation(
      dummyEmail,
      "CONTESTANT",
    );
    const participation = res._getJSONData()["participation"];

    const newFirstName = "Other Name";
    const newSchool = "Other school";
    const newZipcode = "06200";
    const { req: req2, res: res2 } = mockRequestResponse({
      body: {
        ...validRequest,
        user: {
          ...validUser,
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
        userId: participation["userId"],
        contestantParticipationId: participation["contestantParticipationId"],
      },
    });
    expect(res2.statusCode).toBe(201);

    // Check update in DB
    const participationModel = await prisma.participation.findUnique({
      include: {
        user: {
          include: {
            MailingAddress: true,
          },
        },
        ContestantParticipation: {
          include: {
            School: true,
          },
        },
      },
      where: {
        userId_ofmiId: {
          userId: participation["userId"],
          ofmiId: participation["ofmiId"],
        },
      },
    });
    if (!participationModel) {
      expect(participationModel).not.toBeNull();
    }

    expect(participationModel).toMatchObject({
      userId: participation["userId"],
      ofmiId: participation["ofmiId"],
      user: {
        firstName: newFirstName,
        MailingAddress: {
          zipcode: newZipcode,
        },
      },
      ContestantParticipation: {
        School: {
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
        userParticipation: {
          ...validUserParticipationInput,
          schoolName: "Colegio nuevo",
        },
      },
    });
    await upsertParticipationHandler(req2, res2);
    expect(res2.getHeaders()).toEqual({ "content-type": "application/json" });
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
          ...validUser,
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
          ...validUser,
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
            ...validUser,
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
            ...validUser,
            birthDate: new Date("2008-12-12").toISOString(),
          },
        },
      });
      await upsertParticipationHandler(req, res);

      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message:
          "Campo: CURP. La fecha de nacimiento no coincide con la de la CURP",
      });
      expect(res.statusCode).toBe(400);
    });

    it("Birthdate after maximum allowed", async () => {
      const { req, res } = mockRequestResponse({
        body: {
          ...validRequest,
          user: {
            ...validUser,
            birthDate: new Date("2004-12-12").toISOString(),
            governmentId: "PELJ041212HDFXXX04",
          },
        },
      });
      await upsertParticipationHandler(req, res);

      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message:
          "Campo: Edición OFMI. No cumples con el requisito de haber nacido después del Fri Jul 01 2005",
      });
      expect(res.statusCode).toBe(400);
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
    expect(res.statusCode).toBe(400);
  });
});
