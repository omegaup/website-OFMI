import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ShirtSize } from "@prisma/client";
import { ShirtStyles } from "@/types/shirt";
import updateContactDataHandler from "@/pages/api/user/updateContactData";
import { clearAppConfigCache } from "@/lib/appConfig";
import {
  TestCleanup,
  createOfmi,
  createUserAuth,
  createUser,
  createSchool,
  createVenue,
  createVenueQuota,
  createContestantParticipation,
  createParticipation,
  mockRequestResponse,
  DEFAULTS,
} from "../factories";

const cleanup = new TestCleanup();
const dummyEmail = "upsertUser@test.com";
const testOfmiEdition = 77700;

let sourceVenueQuotaId: string;
let destVenueQuotaId: string;

beforeAll(async () => {
  const userAuth = await createUserAuth(cleanup, { email: dummyEmail });
  const user = await createUser(cleanup, {
    userAuthId: userAuth.id,
    overrides: { firstName: "Yosshua", lastName: "Villasana" },
  });

  const ofmi = await createOfmi(cleanup, { edition: testOfmiEdition });

  const venue1 = await createVenue(cleanup, {
    name: "V1",
    address: "A1",
    state: "S1",
  });
  const venue2 = await createVenue(cleanup, {
    name: "V2",
    address: "A2",
    state: "S2",
  });

  const q1 = await createVenueQuota(cleanup, {
    venueId: venue1.id,
    ofmiId: ofmi.id,
    capacity: 10,
    occupied: 5,
  });
  const q2 = await createVenueQuota(cleanup, {
    venueId: venue2.id,
    ofmiId: ofmi.id,
    capacity: 10,
    occupied: 0,
  });
  sourceVenueQuotaId = q1.id;
  destVenueQuotaId = q2.id;

  const school = await createSchool(cleanup, {
    name: "S",
    state: "S",
    country: "C",
  });

  const cp = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: sourceVenueQuotaId,
  });

  await createParticipation(cleanup, {
    userId: user.id,
    ofmiId: ofmi.id,
    contestantParticipationId: cp.id,
  });
});

afterAll(() => cleanup.run());
beforeEach(() => clearAppConfigCache());

describe("/api/user/updateContactData API Endpoint", () => {
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
    const { req, res } = mockRequestResponse({
      body: {
        user: { email: dummyEmail, ...updatedFields },
      },
    });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    const userAuth = await prisma.userAuth.findUniqueOrThrow({
      where: { email: dummyEmail },
    });
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { userAuthId: userAuth.id },
    });
    expect(updatedUser.firstName).toBe(updatedFields.firstName);
    expect(updatedUser.lastName).toBe(updatedFields.lastName);
    expect(updatedUser.preferredName).toBe(updatedFields.preferredName);
    expect(updatedUser.birthDate.toISOString()).toBe(updatedFields.birthDate);
    expect(updatedUser.pronouns).toBe(updatedFields.pronouns);
    expect(updatedUser.governmentId).toBe(updatedFields.governmentId);
    expect(updatedUser.shirtSize).toBe(updatedFields.shirtSize);
    expect(updatedUser.shirtStyle).toBe(updatedFields.shirtStyle);
  });

  it("should ignore venue selection when venue update is disabled", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        user: { email: dummyEmail, ...updatedFields },
        venueQuotaId: destVenueQuotaId,
      },
    });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(201);

    const userAuth = await prisma.userAuth.findUniqueOrThrow({
      where: { email: dummyEmail },
      include: { User: true },
    });
    const participation = await prisma.participation.findFirstOrThrow({
      where: { userId: userAuth.User!.id, ofmi: { edition: testOfmiEdition } },
      include: { ContestantParticipation: true },
    });
    expect(participation.ContestantParticipation?.venueQuotaId).toBe(
      sourceVenueQuotaId,
    );

    const q1 = await prisma.venueQuota.findUniqueOrThrow({
      where: { id: sourceVenueQuotaId },
    });
    const q2 = await prisma.venueQuota.findUniqueOrThrow({
      where: { id: destVenueQuotaId },
    });

    expect(q1.occupied).toBe(5);
    expect(q2.occupied).toBe(0);
  });

  it("should fail due to invalid address", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        user: {
          email: dummyEmail,
          ...updatedFields,
          mailingAddress: {
            ...DEFAULTS.mailingAddress,
            municipality: "Invalid county",
          },
        },
      },
    });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: "Campo: Dirección de envío. Municipio inválido.",
    });
  });

  it("should fail due to non existent user", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        user: {
          email: "fakemail@gmail.com",
          ...updatedFields,
          mailingAddress: {
            ...DEFAULTS.mailingAddress,
            municipality: "Invalid county",
          },
        },
      },
    });
    await updateContactDataHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
  });
});
