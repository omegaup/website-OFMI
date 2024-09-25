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
import { mockEmailer } from "./mocks/emailer";
import { verifyEmail } from "@/lib/emailVerificationToken";

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
  password: string = "password",
): Promise<void> {
  const { req, res } = mockRequestResponse({
    body: {
      email: email,
      password,
    },
  });
  await createUserHandler(req, res);

  expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
  const resJson = res._getJSONData();
  expect(resJson).toMatchObject({
    user: {
      email: email,
    },
  });
  expect(res.statusCode).toBe(201);

  // Check it was created in DB
  const userAuth = await prisma.userAuth.findUnique({
    where: { email: email },
  });

  expect(userAuth).not.toBeNull();
}

export async function insertAndCheckSuccessfullyDummyInsertionVerified(
  email: string,
  password: string = "password",
): Promise<void> {
  await insertAndCheckSuccessfullyDummyInsertion(email, password);
  const emails = mockEmailer.getSentEmails();
  expect(emails).length(1);
  const html = emails[0].mailOptions.html?.toString();
  if (!html) {
    return expect(html).not.toBeUndefined();
  }
  const matches = Array.from(
    html.matchAll(/<a href=".*\/login\?verifyToken=(.*)">/g),
  );
  expect(matches).length(1);
  const token = matches[0][1];
  // Clear the emailer
  const response = await verifyEmail({ token });
  expect(response).toMatchObject({
    success: true,
    email,
  });
}
