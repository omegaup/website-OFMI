import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import deleteContestantParticipationHandler from "@/pages/api/admin/deleteContestantParticipation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hashPassword";
import { ParticipationRole, SchoolStage } from "@prisma/client";

const uniqueSuffix = Date.now();
const dummyEmail = `deleteContestant+${uniqueSuffix}@test.com`;
const validOfmi = {
  edition: 9999,
  year: 2030,
  registrationOpenTime: new Date("2025-01-01T00:00:00.000Z"),
  registrationCloseTime: new Date("2030-12-31T23:59:59.000Z"),
};

let ofmiId: string;
let oldOfmiId: string;
let userAuthId: string;
let userId: string;
let mailingAddressId: string;
let schoolId: string;
let venueId: string;
let venueQuotaId: string;
let contestantParticipationId: string;
let oldContestantParticipationId: string;
let participationId: string;
let oldParticipationId: string;

beforeAll(async () => {
  const oldOfmi = await prisma.ofmi.create({
    data: {
      edition: 9998,
      year: 2029,
      registrationOpenTime: new Date("2024-01-01T00:00:00.000Z"),
      registrationCloseTime: new Date("2029-12-31T23:59:59.000Z"),
    },
  });
  oldOfmiId = oldOfmi.id;

  const ofmi = await prisma.ofmi.create({
    data: validOfmi,
  });
  ofmiId = ofmi.id;

  const userAuth = await prisma.userAuth.create({
    data: {
      email: dummyEmail,
      password: hashPassword("test-pass"),
    },
  });
  userAuthId = userAuth.id;

  const mailingAddress = await prisma.mailingAddress.create({
    data: {
      street: "Test Street",
      externalNumber: "1",
      internalNumber: "A",
      zipcode: "12345",
      state: "CDMX",
      country: "MX",
      neighborhood: "Centro",
      references: "Ninguna",
      county: "Benito Juárez",
      name: "Test User",
      phone: "5551234567",
    },
  });
  mailingAddressId = mailingAddress.id;

  const user = await prisma.user.create({
    data: {
      userAuthId: userAuth.id,
      firstName: "Test",
      lastName: "Delete",
      birthDate: new Date("2010-01-01"),
      governmentId: "TEST1234567890",
      preferredName: "Test Delete",
      pronouns: "they/them",
      shirtSize: "M",
      shirtStyle: "Classic",
      mailingAddressId: mailingAddress.id,
    },
  });
  userId = user.id;

  const school = await prisma.school.create({
    data: {
      name: `Escuela ${uniqueSuffix}`,
      stage: SchoolStage.HIGH,
      state: "CDMX",
      country: "MX",
    },
  });
  schoolId = school.id;

  const venue = await prisma.venue.create({
    data: {
      name: `Venue ${uniqueSuffix}`,
      address: "Venue Address",
      state: "CDMX",
    },
  });
  venueId = venue.id;

  const venueQuota = await prisma.venueQuota.create({
    data: {
      venueId: venue.id,
      ofmiId: ofmi.id,
      capacity: 10,
      occupied: 1,
    },
  });
  venueQuotaId = venueQuota.id;

  const oldCp = await prisma.contestantParticipation.create({
    data: {
      schoolId: school.id,
      schoolGrade: 1,
      disqualified: false,
      venueQuotaId: null,
    },
  });
  oldContestantParticipationId = oldCp.id;

  const oldParticipation = await prisma.participation.create({
    data: {
      userId: user.id,
      ofmiId: oldOfmiId,
      role: ParticipationRole.CONTESTANT,
      contestantParticipationId: oldCp.id,
    },
  });
  oldParticipationId = oldParticipation.id;

  const cp = await prisma.contestantParticipation.create({
    data: {
      schoolId: school.id,
      schoolGrade: 1,
      disqualified: false,
      venueQuotaId: venueQuota.id,
    },
  });
  contestantParticipationId = cp.id;

  const participation = await prisma.participation.create({
    data: {
      userId: user.id,
      ofmiId: ofmi.id,
      role: ParticipationRole.CONTESTANT,
      contestantParticipationId: cp.id,
    },
  });
  participationId = participation.id;
});

afterAll(async () => {
  await prisma.participation.deleteMany({
    where: { id: { in: [participationId, oldParticipationId] } },
  });
  await prisma.contestantParticipation.deleteMany({
    where: {
      id: { in: [contestantParticipationId, oldContestantParticipationId] },
    },
  });
  await prisma.user.deleteMany({
    where: { id: userId },
  });
  await prisma.userAuth.deleteMany({
    where: { id: userAuthId },
  });
  await prisma.mailingAddress.deleteMany({
    where: { id: mailingAddressId },
  });
  await prisma.school.deleteMany({
    where: { id: schoolId },
  });
  await prisma.venueQuota.deleteMany({
    where: { id: venueQuotaId },
  });
  await prisma.venue.deleteMany({
    where: { id: venueId },
  });
  await prisma.ofmi.deleteMany({
    where: { id: { in: [ofmiId, oldOfmiId] } },
  });
});

describe("/api/admin/deleteContestantParticipation endpoint", () => {
  it("marks the latest contestant participation as deleted, clears venue association, and decrements quota", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        emails: [dummyEmail],
      },
    });

    await deleteContestantParticipationHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const json = res._getJSONData();
    expect(json.results).toHaveLength(1);
    expect(json.results[0].success).toBe(true);
    expect(typeof json.results[0].deletedAt).toBe("string");

    const updatedCp = await prisma.contestantParticipation.findUnique({
      where: { id: contestantParticipationId },
    });
    expect(updatedCp).not.toBeNull();
    expect(updatedCp?.deletedAt).not.toBeNull();
    expect(updatedCp?.venueQuotaId).toBeNull();

    const oldCp = await prisma.contestantParticipation.findUnique({
      where: { id: oldContestantParticipationId },
    });
    expect(oldCp).not.toBeNull();
    expect(oldCp?.deletedAt).toBeNull();

    const venueQuota = await prisma.venueQuota.findUnique({
      where: { id: venueQuotaId },
    });
    expect(venueQuota?.occupied).toBe(0);
  });
});
