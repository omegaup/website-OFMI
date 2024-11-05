import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { mockEmailer } from "./mocks/emailer";
import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import scheduleMentoriaHandler from "@/pages/api/mentoria/schedule";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hashPassword";
import {
  cleanParticipation,
  insertAndCheckSuccessfullyDummyParticipation,
  validOfmi,
} from "./upsertParticipationUtils";
import { ParticipationRole } from "@prisma/client";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const dummyContestantEmail = "scheduleMentoria-contestant@test.com";
const dummyVolunteerEmail = "scheduleMentoria-volunteer@test.com";

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
    where: { email: dummyContestantEmail },
    update: {},
    create: { email: dummyContestantEmail, password: hashPassword("pass") },
  });
  await prisma.userAuth.upsert({
    where: { email: dummyVolunteerEmail },
    update: {},
    create: { email: dummyVolunteerEmail, password: hashPassword("pass") },
  });
});

beforeEach(async () => {
  // Clean mentoría
  await prisma.mentoria.deleteMany({
    where: {
      contestantParticipant: {
        Participation: {
          every: { user: { UserAuth: { email: dummyContestantEmail } } },
        },
      },
    },
  });
  await cleanParticipation(dummyContestantEmail);
  await cleanParticipation(dummyVolunteerEmail);

  // Remover contestant participation
  mockEmailer.resetMock();
});

describe("/api/mentoria/schedule API Endpoint", () => {
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

  async function createParticipations(): Promise<{
    contestantParticipationId: string;
    volunteerParticipationId: string;
  }> {
    const contestant = (
      await insertAndCheckSuccessfullyDummyParticipation(
        dummyContestantEmail,
        ParticipationRole.CONTESTANT,
      )
    )._getJSONData()["participation"];
    const contestantParticipationId = contestant.contestantParticipationId;
    expect(contestantParticipationId.length).greaterThanOrEqual(1);
    const volunteer = (
      await insertAndCheckSuccessfullyDummyParticipation(
        dummyContestantEmail,
        ParticipationRole.VOLUNTEER,
      )
    )._getJSONData()["participation"];
    const volunteerParticipationId = volunteer.volunteerParticipationId;
    expect(volunteerParticipationId.length).greaterThanOrEqual(1);
    return { contestantParticipationId, volunteerParticipationId };
  }

  it("should return a successful response", async () => {
    // Create contestant and volunteer participation
    const { contestantParticipationId, volunteerParticipationId } =
      await createParticipations();

    const meetingTime = new Date("2024-11-24").toISOString();
    const { req, res } = mockRequestResponse({
      body: {
        contestantParticipantId: contestantParticipationId,
        volunteerAuthId: "3232",
        volunteerParticipationId,
        meetingTimeOpt: meetingTime,
        calendlyPayload: {
          event: { uri: "event_uri" },
          invitee: { uri: "invitee_uri" },
        },
      },
    });
    await scheduleMentoriaHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    // Check update in DB
    const participationModel = await prisma.mentoria.findUnique({
      where: {
        volunteerParticipationId_contestantParticipantId_meetingTime: {
          contestantParticipantId: contestantParticipationId,
          volunteerParticipationId: volunteerParticipationId,
          meetingTime: meetingTime,
        },
      },
    });

    expect(participationModel).not.toBeNull();
  });
});
