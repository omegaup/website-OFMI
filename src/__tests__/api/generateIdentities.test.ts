import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  generateIdentities,
  generateIdentitiesHandler,
} from "@/pages/api/admin/generateIdentities";
import MockContestantParticipations from "./mocks/contestantParticipation";
import { prisma } from "@/lib/prisma";
import { Ofmi } from "@prisma/client";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const validOfmi = {
  edition: 1,
  birthDateRequirement: new Date("2005-07-01"),
  year: 2024,
  registrationOpenTime: new Date("2024-07-07"),
  registrationCloseTime: new Date("2050-08-08"),
};

let ofmi: Ofmi;
let identitiesMocker: MockContestantParticipations;

beforeAll(async () => {
  ofmi = await prisma.ofmi.upsert({
    where: { edition: validOfmi.edition },
    update: {
      ...validOfmi,
    },
    create: {
      ...validOfmi,
    },
  });
  identitiesMocker = new MockContestantParticipations("identities", ofmi);
});

beforeEach(async () => {
  await identitiesMocker.clearMockParticipations();
});

const parseCsv = (
  csv: string,
): {
  [key: string]: string;
}[] => {
  return csv.split("\n").map((identity) => {
    const fields = identity.split(",");
    return {
      username: fields[0],
      name: fields[1],
      country_id: fields[2],
      state_id: fields[3],
      gender: fields[4],
      school_name: fields[5],
    };
  });
};

describe("/api/admin/generateIdentities API Endpoint", () => {
  function mockRequestResponse({
    method = "GET",
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
        "Content-Type": "text/csv",
      },
      body: body,
    });
    return { req, res };
  }

  it("should generate identities for all contestants", async () => {
    const { req, res } = mockRequestResponse({
      body: { ofmiEdition: validOfmi.edition },
    });

    await identitiesMocker.createMockParticipations(10);
    await generateIdentitiesHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toMatchObject({ "content-type": "text/csv" });
  });

  it("should not generate identities for disqualified contestants", async () => {
    const { req, res } = mockRequestResponse({
      body: { ofmiEdition: validOfmi.edition },
    });

    await identitiesMocker.createMockParticipations(10);
    await generateIdentitiesHandler(req, res);

    const toDisqualify = await identitiesMocker.getRandomMockParticipations(5);

    for (const contestant of toDisqualify) {
      await prisma.contestantParticipation.update({
        where: {
          id: contestant.id,
        },
        data: {
          disqualified: true,
        },
      });
    }
    expect(parseCsv(res._getData())).not.toContain(
      generateIdentities(toDisqualify),
    );
  });
});
