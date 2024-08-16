import { prisma } from "@/lib/prisma";
import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import createUserHandler from "@/pages/api/user/create";
import { expect } from "vitest";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

export async function removeIfExists(dummyEmail: string): Promise<void> {
  // Delete user if exist
  await prisma.userAuth.deleteMany({
    where: { email: dummyEmail },
  });
}

export function mockRequestResponse({
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

export async function insertAndCheckSuccessfullyDummyInsertion(
  email: string,
): Promise<void> {
  const { req, res } = mockRequestResponse({
    body: {
      email: email,
      password: "password",
    },
  });
  await createUserHandler(req, res);

  expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
  expect(res._getJSONData()).toMatchObject({
    user: {
      email: email,
    },
  });
  expect(res.statusCode).toBe(201);
}
