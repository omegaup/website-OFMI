import { UserAuth } from "@prisma/client";
import type { GetServerSidePropsContext, NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { getSecretOrError } from "./secret";
import { ofmiUserAuth } from "./ofmiUserImpersonator";

const OFMI_USER_TOKEN_KEY = "OFMI_USER_TOKEN";

type Request = NextRequest | NextApiRequest | GetServerSidePropsContext["req"];

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

/* 
  TODO: Let's catch this (?). Also all individual requests
  (such /admin /registro) should use this
*/
export const getUser = async (request: Request): Promise<UserAuth | null> => {
  // Check if auth is via Bearer
  const authorizationHeader = getAuthorizationHeader(request);
  if (authorizationHeader) {
    if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
      return null;
    }
    const bearerToken = authorizationHeader.split(" ")[1];
    // Currently we only have the token set for admin
    if (bearerToken === getSecretOrError(OFMI_USER_TOKEN_KEY)) {
      return await ofmiUserAuth();
    }
  }

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
