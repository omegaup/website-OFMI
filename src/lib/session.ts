"use server";

import { cookies } from "next/headers";
import { decrypt, encrypt } from "./jwt";
import config from "@/config/default";
import ms from "ms";
import { SessionToken, SessionTokenSchema } from "@/types/session.schema";
import { cache } from "react";

const sessionKey = "session";

const expiresIn = config.SESSION_TOKEN_EXPIRATION
  ? ms(config.SESSION_TOKEN_EXPIRATION)
  : undefined;

export async function createSession(
  payload: SessionToken,
): Promise<true | null> {
  const session = await encrypt(payload, config.SESSION_TOKEN_SECRET, {
    expiresIn,
  });

  cookies().set(sessionKey, session, {
    httpOnly: true,
    secure: true,
    expires: expiresIn,
    sameSite: "lax",
    path: "/",
  });

  return true;
}

export async function updateSession(): Promise<true | null> {
  const session = cookies().get(sessionKey)?.value;

  if (!session) {
    return null;
  }

  const payload = await decrypt(
    SessionTokenSchema,
    session,
    config.SESSION_TOKEN_SECRET,
  );

  return createSession(payload);
}

export function deleteSession(): void {
  cookies().delete(sessionKey);
}

export const verifySession: () => Promise<SessionToken | null> = cache(
  async () => {
    const cookie = cookies().get(sessionKey)?.value;

    if (!cookie) {
      return null;
    }

    const session: SessionToken = await decrypt(
      SessionTokenSchema,
      cookie,
      config.SESSION_TOKEN_SECRET,
    );

    return session;
  },
);
