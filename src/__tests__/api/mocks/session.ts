import { SessionToken } from "@/types/session.schema";
import { vi } from "vitest";

let cookieSession: SessionToken | null = null;

export const verifySession = async (): Promise<SessionToken | null> => {
  return await cookieSession;
};

async function createSession(payload: SessionToken): Promise<true | null> {
  cookieSession = payload;

  return true;
}

async function updateSession(): Promise<true | null> {
  if (!cookieSession) {
    return null;
  }

  return createSession(cookieSession);
}

function deleteSession(): void {
  cookieSession = null;
}

// Mock the module
vi.mock("@/lib/session", async () => {
  // const mod = await importOriginal<typeof import("@/lib/session")>();
  return {
    createSession,
    updateSession,
    verifySession,
    deleteSession,
  };
});
