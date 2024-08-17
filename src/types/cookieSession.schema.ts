import { emailReg } from "@/lib/validators";
import { Static, Type } from "@sinclair/typebox";

export type CookieSession = Static<typeof CookieSessionSchema>;
export const CookieSessionSchema = Type.Object({
  email: Type.String({ pattern: emailReg }),
});
