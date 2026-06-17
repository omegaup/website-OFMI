import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import deleteContestantParticipationHandler from "@/pages/api/admin/deleteContestantParticipation";
import { prisma } from "@/lib/prisma";
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
} from "../factories";

const cleanup = new TestCleanup();
let dummyEmail: string;
let contestantParticipationId: string;
let oldContestantParticipationId: string;
let venueQuotaId: string;

beforeAll(async () => {
  const oldOfmi = await createOfmi(cleanup, { edition: 9998, year: 2029 });
  const ofmi = await createOfmi(cleanup, { edition: 9999, year: 2030 });

  const venue = await createVenue(cleanup);
  const vq = await createVenueQuota(cleanup, {
    venueId: venue.id,
    ofmiId: ofmi.id,
    capacity: 10,
    occupied: 1,
  });
  venueQuotaId = vq.id;

  const email = `deleteContestant+${Date.now()}@test.com`;
  dummyEmail = email;

  const userAuth = await createUserAuth(cleanup, { email });
  const user = await createUser(cleanup, { userAuthId: userAuth.id });
  const school = await createSchool(cleanup);

  const oldCp = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: null,
  });
  oldContestantParticipationId = oldCp.id;

  await createParticipation(cleanup, {
    userId: user.id,
    ofmiId: oldOfmi.id,
    contestantParticipationId: oldCp.id,
  });

  const cp = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: vq.id,
  });
  contestantParticipationId = cp.id;

  await createParticipation(cleanup, {
    userId: user.id,
    ofmiId: ofmi.id,
    contestantParticipationId: cp.id,
  });
});

afterAll(() => cleanup.run());

describe("/api/admin/deleteContestantParticipation endpoint", () => {
  it("marks the latest contestant participation as deleted, clears venue association, and decrements quota", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        emails: [dummyEmail],
        ofmiEdition: 9999,
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
