import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  findAllParticipantsInVenueQuotas,
  findAllVenueQuotas,
  findParticipantsWithoutVenue,
} from "@/lib/venue";
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
const dummyEmail1 = "venueLib1@test.com";
const dummyEmail2 = "venueLib2@test.com";
const dummyEmail3 = "venueLib3@test.com";

let ofmiId: string;
let vq1id: string;
let vq2id: string;
let cpId1: string;
let cpId2: string;

beforeAll(async () => {
  const ofmi = await createOfmi(cleanup, { edition: 1000 });
  ofmiId = ofmi.id;

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

  const vq1 = await createVenueQuota(cleanup, {
    venueId: venue1.id,
    ofmiId: ofmi.id,
    capacity: 10,
    occupied: 1,
  });
  vq1id = vq1.id;

  const vq2 = await createVenueQuota(cleanup, {
    venueId: venue2.id,
    ofmiId: ofmi.id,
    capacity: 10,
  });
  vq2id = vq2.id;

  const school = await createSchool(cleanup, {
    name: "VenueTestSchool",
    state: "S",
    country: "C",
  });

  const users = await Promise.all(
    [
      { email: dummyEmail1, firstName: "Juan 1" },
      { email: dummyEmail2, firstName: "Juan 2" },
      { email: dummyEmail3, firstName: "Juan 3" },
    ].map(async ({ email, firstName }) => {
      const auth = await createUserAuth(cleanup, { email });
      const user = await createUser(cleanup, {
        userAuthId: auth.id,
        overrides: { firstName },
      });
      return user;
    }),
  );

  const cp1 = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: vq1.id,
  });
  cpId1 = cp1.id;

  const cp2 = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: vq2.id,
  });
  cpId2 = cp2.id;

  const cp3 = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: null,
  });

  await createParticipation(cleanup, {
    userId: users[0].id,
    ofmiId: ofmi.id,
    contestantParticipationId: cp1.id,
  });
  await createParticipation(cleanup, {
    userId: users[1].id,
    ofmiId: ofmi.id,
    contestantParticipationId: cp2.id,
  });
  await createParticipation(cleanup, {
    userId: users[2].id,
    ofmiId: ofmi.id,
    contestantParticipationId: cp3.id,
  });
});

afterAll(() => cleanup.run());

describe("venue lib", () => {
  it("findAllVenueQuotas ", async () => {
    const allVenues = await findAllVenueQuotas(ofmiId);

    expect(allVenues).not.toBeNull();
    expect(allVenues?.length).toBe(2);
  });

  it("findAllParticipantsInVenueQuotas ", async () => {
    const participantsInVenue = await findAllParticipantsInVenueQuotas(
      [vq1id, vq2id],
      ofmiId,
    );

    const listOfVqId = [vq1id, vq2id];
    const listOfEmails = [dummyEmail1, dummyEmail2];

    expect(participantsInVenue).not.toBeNull();
    expect(participantsInVenue?.length).toBe(2);
    expect(listOfVqId).toContain(participantsInVenue[0].venueQuotaId);
    expect(listOfVqId).toContain(participantsInVenue[1].venueQuotaId);
    expect(listOfEmails).toContain(participantsInVenue[0].email);
    expect(listOfEmails).toContain(participantsInVenue[1].email);
  });

  it("findParticipantsWithoutVenue ", async () => {
    const participants = await findParticipantsWithoutVenue(ofmiId);

    expect(participants).not.toBeNull();
    expect(participants?.length).toBe(1);
    expect(participants[0].firstName).toBe("Juan 3");
    expect(participants[0].deletedAt).toBeNull();
  });

  it("findParticipantsWithoutVenue includes deleted participants with deletedAt", async () => {
    await prisma.contestantParticipation.update({
      where: { id: cpId1 },
      data: { venueQuotaId: null, deletedAt: new Date() },
    });

    const participants = await findParticipantsWithoutVenue(ofmiId);

    expect(participants.length).toBe(2);

    const active = participants.find((p) => p.email === dummyEmail3);
    const deleted = participants.find((p) => p.email === dummyEmail1);

    expect(active).toBeDefined();
    expect(active?.deletedAt).toBeNull();

    expect(deleted).toBeDefined();
    expect(deleted?.deletedAt).not.toBeNull();

    await prisma.contestantParticipation.update({
      where: { id: cpId1 },
      data: { venueQuotaId: vq1id, deletedAt: null },
    });
  });

  it("findAllParticipantsInVenueQuotas excludes deleted participants", async () => {
    await prisma.contestantParticipation.update({
      where: { id: cpId2 },
      data: { deletedAt: new Date() },
    });

    const participantsInVenue = await findAllParticipantsInVenueQuotas(
      [vq1id, vq2id],
      ofmiId,
    );

    expect(participantsInVenue.length).toBe(1);
    expect(participantsInVenue[0].email).toBe(dummyEmail1);

    await prisma.contestantParticipation.update({
      where: { id: cpId2 },
      data: { deletedAt: null },
    });
  });
});
