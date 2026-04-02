import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMocks } from "node-mocks-http";
import mentorshipHandler, {
  MentorResponse,
} from "@/pages/api/admin/volunteers/mentorship";
import { prisma } from "@/lib/prisma";
import { X_USER_AUTH_ID_HEADER, X_USER_AUTH_ROLE_HEADER } from "@/lib/auth";
import { Role } from "@prisma/client";
import { findMostRecentOfmi } from "@/lib/ofmi";

describe("/api/admin/volunteers/mentorship API Endpoint", () => {
  const testEmail = "admin_mentorship_test@test.com";
  const testVolunteerEmail = "volunteer_mentorship_test@test.com";
  let adminAuthId: string;
  let volunteerAuthId: string;
  let volunteerParticipationId: string;

  beforeAll(async () => {
    // 1. Safe cleanup
    const existingAuths = await prisma.userAuth.findMany({
      where: { email: { in: [testEmail, testVolunteerEmail] } },
      include: { User: true },
    });

    for (const auth of existingAuths) {
      if (auth.User) {
        const participations = await prisma.participation.findMany({
          where: { userId: auth.User.id },
        });
        const vpIds = participations
          .map((p) => p.volunteerParticipationId)
          .filter(Boolean) as string[];

        await prisma.participation.deleteMany({
          where: { userId: auth.User.id },
        });
        await prisma.volunteerParticipation.deleteMany({
          where: { id: { in: vpIds } },
        });
        await prisma.user.delete({ where: { id: auth.User.id } });
        if (auth.User.mailingAddressId) {
          await prisma.mailingAddress.delete({
            where: { id: auth.User.mailingAddressId },
          });
        }
      }
      await prisma.userAuth.delete({ where: { id: auth.id } });
    }

    // 2. Sync with current OFMI
    let ofmi;
    try {
      ofmi = await findMostRecentOfmi();
    } catch (e) {
      ofmi = await prisma.ofmi.create({
        data: {
          edition: 99,
          year: 2099,
          registrationOpenTime: new Date(),
          registrationCloseTime: new Date(),
        },
      });
    }

    // 3. Create Admin
    const adminAuth = await prisma.userAuth.create({
      data: {
        email: testEmail,
        password: "hashed_password",
        role: Role.ADMIN,
      },
    });
    adminAuthId = adminAuth.id;

    // 4. Create Volunteer
    const volunteerAuth = await prisma.userAuth.create({
      data: {
        email: testVolunteerEmail,
        password: "hashed_password",
        role: Role.USER,
      },
    });
    volunteerAuthId = volunteerAuth.id;

    const address = await prisma.mailingAddress.create({
      data: {
        street: "Calle Falsa",
        externalNumber: "123",
        zipcode: "12345",
        state: "CDMX",
        country: "Mexico",
        neighborhood: "Test",
        county: "Test",
        name: "Test",
        phone: "1234567890",
      },
    });

    const user = await prisma.user.create({
      data: {
        userAuthId: volunteerAuthId,
        firstName: "Test",
        lastName: "Volunteer",
        birthDate: new Date("2000-01-01"),
        governmentId: "ABCD123456",
        preferredName: "Testy",
        pronouns: "they/them",
        shirtSize: "M",
        shirtStyle: "STRAIGHT",
        mailingAddressId: address.id,
      },
    });

    const vPart = await prisma.volunteerParticipation.create({
      data: {
        educationalLinkageOptIn: false,
        fundraisingOptIn: false,
        communityOptIn: false,
        trainerOptIn: false,
        problemSetterOptIn: false,
        mentorOptIn: true,
        mentorshipEnabled: false,
      },
    });
    volunteerParticipationId = vPart.id;

    await prisma.participation.create({
      data: {
        userId: user.id,
        ofmiId: ofmi.id,
        role: "VOLUNTEER",
        volunteerParticipationId: vPart.id,
      },
    });
  });

  afterAll(async () => {
    if (!adminAuthId && !volunteerAuthId) return;

    const authIds = [adminAuthId, volunteerAuthId].filter(Boolean);
    const users = await prisma.user.findMany({
      where: { userAuthId: { in: authIds } },
    });
    const userIds = users.map((u) => u.id);
    const addressIds = users.map((u) => u.mailingAddressId).filter(Boolean);

    const participations = await prisma.participation.findMany({
      where: { userId: { in: userIds } },
    });
    const vpIds = participations
      .map((p) => p.volunteerParticipationId)
      .filter(Boolean) as string[];

    await prisma.participation.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.volunteerParticipation.deleteMany({
      where: { id: { in: vpIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.mailingAddress.deleteMany({
      where: { id: { in: addressIds } },
    });
    await prisma.userAuth.deleteMany({ where: { id: { in: authIds } } });
  });

  it("GET: should return the test mentor in the list", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        [X_USER_AUTH_ID_HEADER]: adminAuthId,
        [X_USER_AUTH_ROLE_HEADER]: Role.ADMIN,
      },
    });

    await mentorshipHandler(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData() as MentorResponse[];
    expect(Array.isArray(data)).toBe(true);
    const mentor = data.find(
      (m: MentorResponse) =>
        m.volunteerParticipationId === volunteerParticipationId,
    );
    expect(mentor).toBeDefined();
    expect(mentor?.firstName).toBe("Test");
  });

  it("POST: should update mentor status and persist in DB", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        [X_USER_AUTH_ID_HEADER]: adminAuthId,
        [X_USER_AUTH_ROLE_HEADER]: Role.ADMIN,
      },
      body: {
        updates: [
          {
            volunteerParticipationId: volunteerParticipationId,
            mentorshipEnabled: true,
          },
        ],
      },
    });

    await mentorshipHandler(req, res);

    expect(res.statusCode).toBe(200);
    const updated = await prisma.volunteerParticipation.findUnique({
      where: { id: volunteerParticipationId },
    });
    expect(updated?.mentorshipEnabled).toBe(true);
  });

  it("POST: should handle multiple updates in one call", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        [X_USER_AUTH_ID_HEADER]: adminAuthId,
        [X_USER_AUTH_ROLE_HEADER]: Role.ADMIN,
      },
      body: {
        updates: [
          {
            volunteerParticipationId: volunteerParticipationId,
            mentorshipEnabled: false,
          },
        ],
      },
    });

    await mentorshipHandler(req, res);
    expect(res.statusCode).toBe(200);

    const updated = await prisma.volunteerParticipation.findUnique({
      where: { id: volunteerParticipationId },
    });
    expect(updated?.mentorshipEnabled).toBe(false);
  });

  it("Error Handling: should return 405 for PUT method", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        [X_USER_AUTH_ID_HEADER]: adminAuthId,
        [X_USER_AUTH_ROLE_HEADER]: Role.ADMIN,
      },
    });

    await mentorshipHandler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it("Error Handling: should return 400 for invalid body on POST", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        [X_USER_AUTH_ID_HEADER]: adminAuthId,
        [X_USER_AUTH_ROLE_HEADER]: Role.ADMIN,
      },
      body: { not: "an array" },
    });

    await mentorshipHandler(req, res);
    expect(res.statusCode).toBe(400);
  });
});
