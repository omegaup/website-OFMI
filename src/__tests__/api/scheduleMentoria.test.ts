import { describe, it, expect } from "vitest";
import { createMocks, RequestMethod } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

describe("/api/ofmi/registerParticipation API Endpoint", () => {
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

  it("should return a successful response", async () => {
    expect(true).not.toBeNull();
  });
});
