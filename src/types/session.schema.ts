import { emailReg } from "@/lib/validators";
import { Role } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";

export type SessionToken = Static<typeof SessionTokenSchema>;
export const SessionTokenSchema = Type.Object({
  userAuthId: Type.String(),
  email: Type.String({ pattern: emailReg }),
  role: Type.Enum(Role),
});
