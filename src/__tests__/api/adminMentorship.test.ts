import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMocks } from "node-mocks-http";
import mentorshipHandler, {
  MentorResponse,
} from "@/pages/api/admin/volunteers/mentorship";
import { X_USER_AUTH_ID_HEADER, X_USER_AUTH_ROLE_HEADER } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  TestCleanup,
  createOfmi,
  createUserAuth,
  createUser,
  createVolunteerParticipation,
  createParticipation,
} from "../factories";
import { ParticipationRole } from "@prisma/client";

describe("/api/admin/volunteers/mentorship API Endpoint", () => {
  const cleanup = new TestCleanup();
  let adminAuthId: string;
  let volunteerParticipationId: string;

  beforeAll(async () => {
    const ofmi = await createOfmi(cleanup, { edition: 88801 });

    const adminAuth = await createUserAuth(cleanup, {
      email: "admin_mentorship_test@test.com",
      role: Role.ADMIN,
    });
    adminAuthId = adminAuth.id;

    const volunteerAuth = await createUserAuth(cleanup, {
      email: "volunteer_mentorship_test@test.com",
    });
    const volunteerUser = await createUser(cleanup, {
      userAuthId: volunteerAuth.id,
      overrides: { firstName: "Test", lastName: "Volunteer" },
    });

    const vPart = await createVolunteerParticipation(cleanup, {
      mentorOptIn: true,
      mentorshipEnabled: false,
    });
    volunteerParticipationId = vPart.id;

    await createParticipation(cleanup, {
      userId: volunteerUser.id,
      ofmiId: ofmi.id,
      role: ParticipationRole.VOLUNTEER,
      volunteerParticipationId: vPart.id,
    });
  });

  afterAll(() => cleanup.run());

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
