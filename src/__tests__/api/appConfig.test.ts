import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ShirtSize } from "@prisma/client";
import { ShirtStyles } from "@/types/shirt";
import updateContactDataHandler from "@/pages/api/user/updateContactData";
import appConfigHandler from "@/pages/api/appConfig/[flagName]";
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
} from "../factories";

const cleanup = new TestCleanup();
const dummyEmail = "appConfigVenue@test.com";
const testOfmiEdition = 88800;
const FLAG_NAME = "UPDATE_VENUE_DISABLED";

let sourceVenueQuotaId: string;
let destVenueQuotaId: string;

beforeAll(async () => {
  const userAuth = await createUserAuth(cleanup, { email: dummyEmail });
  const user = await createUser(cleanup, {
    userAuthId: userAuth.id,
    overrides: { firstName: "Config", lastName: "Test" },
  });

  const ofmi = await createOfmi(cleanup, { edition: testOfmiEdition });

  const venue1 = await createVenue(cleanup, {
    name: "ConfigV1",
    address: "A1",
    state: "S1",
  });
  const venue2 = await createVenue(cleanup, {
    name: "ConfigV2",
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
    name: "ConfigS",
    state: "ConfigState",
    country: "CC",
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

afterAll(async () => {
  await prisma.appConfig.deleteMany({
    where: { flagName: FLAG_NAME },
  });
  await cleanup.run();
});

const updatedFields = {
  firstName: "Config",
  lastName: "Test",
  preferredName: "CT",
  birthDate: new Date("2006-11-24").toISOString(),
  pronouns: "HE",
  governmentId: "HEGG061124MVZRRL02",
  shirtSize: ShirtSize.S,
  shirtStyle: ShirtStyles[1],
  mailingAddress: {
    street: "Calle",
    externalNumber: "123",
    zipcode: "01234",
    country: "MEX",
    state: "Durango",
    phone: "5511223355",
    municipality: "Canatlán",
  },
};

describe("/api/appConfig/[flagName] endpoint", () => {
  it("returns false for a boolean flag that does not exist", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: { flagName: FLAG_NAME, type: "boolean" },
    });
    await appConfigHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      flagName: FLAG_NAME,
      value: false,
    });
  });

  it("returns true when the boolean flag is set to 'true'", async () => {
    await prisma.appConfig.upsert({
      where: { flagName: FLAG_NAME },
      update: { value: "true" },
      create: { flagName: FLAG_NAME, value: "true" },
    });
    clearAppConfigCache();

    const { req, res } = mockRequestResponse({
      method: "GET",
      query: { flagName: FLAG_NAME, type: "boolean" },
    });
    await appConfigHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      flagName: FLAG_NAME,
      value: true,
    });

    await prisma.appConfig.delete({ where: { flagName: FLAG_NAME } });
  });

  it("returns null for a string flag that does not exist", async () => {
    clearAppConfigCache();
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: { flagName: "NONEXISTENT_FLAG" },
    });
    await appConfigHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      flagName: "NONEXISTENT_FLAG",
      value: null,
    });
  });
});

describe("venue update always disabled (hardcoded)", () => {
  it("ignores venue change even when flag is not set", async () => {
    clearAppConfigCache();

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
      where: {
        userId: userAuth.User!.id,
        ofmi: { edition: testOfmiEdition },
      },
      include: { ContestantParticipation: true },
    });
    expect(participation.ContestantParticipation?.venueQuotaId).toBe(
      sourceVenueQuotaId,
    );
  });

  it("ignores venue change when flag is also set to true", async () => {
    await prisma.appConfig.upsert({
      where: { flagName: FLAG_NAME },
      update: { value: "true" },
      create: { flagName: FLAG_NAME, value: "true" },
    });
    clearAppConfigCache();

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
      where: {
        userId: userAuth.User!.id,
        ofmi: { edition: testOfmiEdition },
      },
      include: { ContestantParticipation: true },
    });
    expect(participation.ContestantParticipation?.venueQuotaId).toBe(
      sourceVenueQuotaId,
    );
  });
});
