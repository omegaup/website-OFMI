import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { mockEmailer } from "./mocks/emailer";
import upsertParticipationHandler from "@/pages/api/ofmi/upsertParticipation";
import { emailReg } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { toISOStringReg } from "@/lib/validators/date";
import { ParticipationRole } from "@prisma/client";
import {
  TestCleanup,
  createOfmi,
  createUserAuth,
  createVenue,
  createVenueQuota,
  mockRequestResponse,
} from "../factories";

const cleanup = new TestCleanup();
const dummyEmail = "upsertParticipation@test.com";
let testVenueQuotaId: string;
let fullVenueQuotaId: string;

beforeAll(async () => {
  const ofmi = await createOfmi(cleanup, {
    edition: 77711,
    year: 2024,
    birthDateRequirement: new Date("2005-07-01"),
    registrationOpenTime: new Date("2024-07-07"),
    registrationCloseTime: new Date("2050-08-08"),
  });

  const venue = await createVenue(cleanup);
  const vq = await createVenueQuota(cleanup, {
    venueId: venue.id,
    ofmiId: ofmi.id,
    capacity: 100,
  });
  testVenueQuotaId = vq.id;

  const fullVenue = await createVenue(cleanup, {
    name: "Full Venue",
    address: "Full Address",
  });
  const fullVq = await createVenueQuota(cleanup, {
    venueId: fullVenue.id,
    ofmiId: ofmi.id,
    capacity: 0,
  });
  fullVenueQuotaId = fullVq.id;

  await createUserAuth(cleanup, { email: dummyEmail });
});

afterAll(() => cleanup.run());

beforeEach(async () => {
  const participations = await prisma.participation.findMany({
    where: { user: { UserAuth: { email: dummyEmail } } },
    select: { id: true, contestantParticipationId: true },
  });
  const cpIds = participations
    .map((p) => p.contestantParticipationId)
    .filter((id): id is string => id != null);
  await prisma.participation.deleteMany({
    where: { id: { in: participations.map((p) => p.id) } },
  });
  if (cpIds.length > 0) {
    await prisma.contestantParticipation.deleteMany({
      where: { id: { in: cpIds } },
    });
  }
  mockEmailer.resetMock();
});

describe("/api/ofmi/registerParticipation API Endpoint", () => {
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
    role: "CONTESTANT" as ParticipationRole,
    schoolName: "Colegio Carol Baur",
    schoolStage: "HIGH",
    schoolGrade: 3,
    schoolCountry: "MEX",
    schoolState: "Aguascalientes",
  };

  const validRequest = {
    ofmiEdition: 77711,
    user: validUserInput,
    userParticipation: validUserParticipationInput,
  };

  it("should return a successful response", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });
    await upsertParticipationHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    const participation = res._getJSONData()["participation"];

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

  it("should update", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });
    await upsertParticipationHandler(req, res);
    expect(res.statusCode).toBe(201);
    const participation = res._getJSONData()["participation"];

    const newFirstName = "Other Name";
    const newSchool = "Other school";
    const newZipcode = "06200";
    const { req: req2, res: res2 } = mockRequestResponse({
      body: {
        ...validRequest,
        user: {
          ...validUserInput,
          firstName: newFirstName,
          mailingAddress: { ...validMailingAddressInput, zipcode: newZipcode },
        },
        userParticipation: {
          ...validUserParticipationInput,
          schoolName: newSchool,
        },
      },
    });
    await upsertParticipationHandler(req2, res2);
    expect(res2.statusCode).toBe(201);
    expect(res2._getJSONData()).toMatchObject({
      participation: {
        userId: participation["userId"],
        contestantParticipationId: participation["contestantParticipationId"],
      },
    });

    const participationModel = await prisma.participation.findUnique({
      include: {
        user: { include: { MailingAddress: true } },
        ContestantParticipation: { include: { School: true } },
      },
      where: {
        userId_ofmiId: {
          userId: participation["userId"],
          ofmiId: participation["ofmiId"],
        },
      },
    });

    expect(participationModel).not.toBeNull();
    expect(participationModel).toMatchObject({
      userId: participation["userId"],
      ofmiId: participation["ofmiId"],
      user: {
        firstName: newFirstName,
        MailingAddress: { zipcode: newZipcode },
      },
      ContestantParticipation: {
        School: { name: newSchool },
      },
    });
  });

  it("should sent email on registration", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });
    await upsertParticipationHandler(req, res);
    expect(res.statusCode).toBe(201);

    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject:
            "¡Bienvenida a la 5a Olimpiada Femenil Mexicana de Informática (OFMI)!",
        },
      },
    ]);

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
    expect(res2.statusCode).toBe(201);

    expect(mockEmailer.getSentEmails()).toMatchObject([]);
  });

  it("invalid OFMI edition", async () => {
    const { req, res } = mockRequestResponse({
      body: { ...validRequest, ofmiEdition: 1000000 },
    });
    await upsertParticipationHandler(req, res);

    expect(res._getJSONData()).toMatchObject({
      message: "La edición de la OFMI que buscas no existe",
    });
    expect(res.statusCode).toBe(400);
  });

  it("invalid email", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        user: { ...validUserInput, email: "juanito.omegaup.com" },
      },
    });
    await upsertParticipationHandler(req, res);

    expect(res._getJSONData()).toMatchObject({
      message: `El campo /user/email no cumple con los requerimientos. Expected string to match '${emailReg}'`,
    });
    expect(res.statusCode).toBe(400);
  });

  it("user not found", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        user: { ...validUserInput, email: "dont@exist.com" },
      },
    });
    await upsertParticipationHandler(req, res);

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
          user: { ...validUserInput, birthDate: "0006-12-12" },
        },
      });
      await upsertParticipationHandler(req, res);

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
            ...validUserInput,
            birthDate: new Date("2004-12-12").toISOString(),
            governmentId: "PELJ041212HDFXXX04",
          },
        },
      });
      await upsertParticipationHandler(req, res);

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

    expect(res.statusCode).toBe(400);
  });

  it("should register with venue selection", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        userParticipation: {
          ...validUserParticipationInput,
          venueQuotaId: testVenueQuotaId,
        },
      },
    });

    await upsertParticipationHandler(req, res);

    expect(res.statusCode).toBe(201);
    const participationData = res._getJSONData()["participation"];

    const cp = await prisma.contestantParticipation.findFirst({
      where: {
        Participation: {
          some: { userId: participationData.userId },
        },
      },
    });

    expect(cp?.venueQuotaId).toBe(testVenueQuotaId);
  });

  it("should return error when venue is full", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        ...validRequest,
        userParticipation: {
          ...validUserParticipationInput,
          venueQuotaId: fullVenueQuotaId,
        },
      },
    });

    await upsertParticipationHandler(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toMatchObject({
      message: "La sede seleccionada ya no tiene cupo disponible.",
    });
  });
});
