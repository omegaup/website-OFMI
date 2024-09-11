import { UserAuth } from "@prisma/client";
import type { GetServerSidePropsContext, NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { getSecretOrError } from "./secret";

export const X_USER_AUTH_ID_HEADER = "x-user-auth-id";
export const X_USER_AUTH_EMAIL_HEADER = "x-user-auth-email";
export const X_USER_AUTH_ROLE_HEADER = "x-user-auth-role";

const OFMI_USER_TOKEN_KEY = "OFMI_USER_TOKEN";

export type Request =
  | NextRequest
  | NextApiRequest
  | GetServerSidePropsContext["req"];

function getAuthorizationHeader(request: Request): string | null {
  if (!("headers" in request)) {
    return null;
  }

  const headers = request.headers;

  if (typeof headers.get === "function") {
    return headers.get("authorization");
  }

  if ("authorization" in headers) {
    return headers.authorization || null;
  }

  return null;
}

export const isImpersonatingOfmiUser = (request: Request): boolean => {
  // Check if auth is via Bearer
  const authorizationHeader = getAuthorizationHeader(request);
  if (!authorizationHeader) return false;
  if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return false;
  }
  const bearerToken = authorizationHeader.split(" ")[1];
  // Currently we only have the token set for admin
  if (bearerToken !== getSecretOrError(OFMI_USER_TOKEN_KEY)) {
    return false;
  }
  return true;
};

export const getUser = async (request: Request): Promise<UserAuth | null> => {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const user = token?.user;
  if (!user) {
    return null;
  }
  return user as UserAuth;
};
