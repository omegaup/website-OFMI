import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { ParticipationRole, ShirtSize } from "@prisma/client";
import { hashPassword } from "@/lib/hashPassword";
import {
  findAllParticipantsInVenueQuotas,
  findAllVenueQuotas,
} from "@/lib/venue";

const testOfmiEdition = 1000;
const dummyEmail1 = "upsertParticipation1@test.com";
const dummyEmail2 = "upsertParticipation2@test.com";
let ofmiId: string;
let venueId1: string;
let venueId2: string;
let cpId1: string;
let cpId2: string;
let userId1: string;
let userId2: string;
let authUserId1: string;
let authUserId2: string;
let participationId1: string;
let participationId2: string;
let vq1id: string;
let vq2id: string;
let schoolId: string;

beforeAll(async () => {
  const ofmi = await prisma.ofmi.upsert({
    where: { edition: testOfmiEdition },
    update: {},
    create: {
      edition: testOfmiEdition,
      year: 2027,
      registrationOpenTime: new Date(),
      registrationCloseTime: new Date(),
    },
  });
  ofmiId = ofmi.id;

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

  const validUserInput1 = {
    firstName: "Juan Carlos 1",
    lastName: "Sigler Priego",
    preferredName: "Juanito",
    birthDate: new Date("2006-11-24").toISOString(),
    pronouns: "HE",
    governmentId: "HEGG061124MVZRRL02",
    shirtSize: ShirtSize.M,
    shirtStyle: "STRAIGHT",
  };
  const validUserInput2 = {
    firstName: "Juan Carlos 2",
    lastName: "Sigler Priego",
    preferredName: "Juanito",
    birthDate: new Date("2006-11-24").toISOString(),
    pronouns: "HE",
    governmentId: "HEGG061124MVZRRL02",
    shirtSize: ShirtSize.M,
    shirtStyle: "STRAIGHT",
  };

  // Upsert the valid user Auth
  const authUser1 = await prisma.userAuth.upsert({
    where: { email: dummyEmail1 },
    update: {},
    create: { email: dummyEmail1, password: hashPassword("pass") },
  });
  authUserId1 = authUser1.id;

  // Upsert the valid user Auth
  const authUser2 = await prisma.userAuth.upsert({
    where: { email: dummyEmail2 },
    update: {},
    create: { email: dummyEmail2, password: hashPassword("pass") },
  });
  authUserId2 = authUser2.id;

  const user1 = await prisma.user.upsert({
    where: { userAuthId: authUser1.id },
    update: {
      ...validUserInput1,
    },
    create: {
      ...validUserInput1,
      UserAuth: { connect: { id: authUser1.id } },
      MailingAddress: { create: { ...mailingAddressDB } },
    },
  });
  userId1 = user1.id;

  const user2 = await prisma.user.upsert({
    where: { userAuthId: authUser2.id },
    update: {
      ...validUserInput2,
    },
    create: {
      ...validUserInput2,
      UserAuth: { connect: { id: authUser2.id } },
      MailingAddress: { create: { ...mailingAddressDB } },
    },
  });
  userId2 = user2.id;

  const venue1 = await prisma.venue.create({
    data: { name: "V1", address: "A1", state: "S1" },
  });

  venueId1 = venue1.id;

  const vq1 = await prisma.venueQuota.create({
    data: { venueId: venue1.id, ofmiId: ofmi.id, capacity: 10, occupied: 1 },
  });

  vq1id = vq1.id;

  const venue2 = await prisma.venue.create({
    data: { name: "V2", address: "A2", state: "S2" },
  });
  venueId2 = venue2.id;

  const vq2 = await prisma.venueQuota.create({
    data: {
      venueId: venue2.id,
      ofmiId: ofmi.id,
      capacity: 10,
    },
  });
  vq2id = vq2.id;

  const school = await prisma.school.upsert({
    where: {
      name_stage_state_country: {
        name: "S",
        stage: "HIGH",
        state: "S",
        country: "C",
      },
    },
    update: {},
    create: { name: "S", stage: "HIGH", state: "S", country: "C" },
  });

  schoolId = school.id;

  const cp1 = await prisma.contestantParticipation.create({
    data: {
      schoolId: school.id,
      schoolGrade: 1,
      disqualified: false,
      venueQuotaId: vq1.id,
    },
  });
  cpId1 = cp1.id;

  const cp2 = await prisma.contestantParticipation.create({
    data: {
      schoolId: school.id,
      schoolGrade: 1,
      disqualified: false,
      venueQuotaId: vq2.id,
    },
  });
  cpId2 = cp2.id;

  const p1 = await prisma.participation.create({
    data: {
      userId: user1.id,
      ofmiId: ofmi.id,
      role: ParticipationRole.CONTESTANT,
      contestantParticipationId: cp1.id,
    },
  });
  participationId1 = p1.id;

  const p2 = await prisma.participation.create({
    data: {
      userId: user2.id,
      ofmiId: ofmi.id,
      role: ParticipationRole.CONTESTANT,
      contestantParticipationId: cp2.id,
    },
  });
  participationId2 = p2.id;
});

afterAll(async () => {
  await prisma.participation.deleteMany({
    where: { id: { in: [participationId1, participationId2] } },
  });
  await prisma.contestantParticipation.deleteMany({
    where: { id: { in: [cpId1, cpId2] } },
  });

  await prisma.user.deleteMany({ where: { id: { in: [userId1, userId2] } } });
  await prisma.userAuth.deleteMany({
    where: { id: { in: [authUserId1, authUserId2] } },
  });
  await prisma.school.delete({ where: { id: schoolId } });
  await prisma.venueQuota.deleteMany({ where: { ofmiId } });
  await prisma.venue.deleteMany({
    where: { id: { in: [venueId1, venueId2] } },
  });
  await prisma.ofmi.delete({ where: { edition: testOfmiEdition } });
});
describe("venue lib", () => {
  it("findAllVenueQuotas ", async () => {
    const allVenues = await findAllVenueQuotas(ofmiId);

    expect(allVenues).not.toBeNull();
    expect(allVenues?.length).toBe(2);
  });

  it("findAllParticipantsInVenueQuotas ", async () => {
    const participantsInVenue = await findAllParticipantsInVenueQuotas([
      vq1id,
      vq2id,
    ]);

    const listOfVqId = [vq1id, vq2id];
    const listOfEmails = [dummyEmail1, dummyEmail2];

    expect(participantsInVenue).not.toBeNull();
    expect(participantsInVenue?.length).toBe(2);
    expect(listOfVqId).toContain(participantsInVenue[0].venueQuotaId);
    expect(listOfVqId).toContain(participantsInVenue[1].venueQuotaId);
    expect(listOfEmails).toContain(participantsInVenue[0].email);
    expect(listOfEmails).toContain(participantsInVenue[1].email);
  });
});
