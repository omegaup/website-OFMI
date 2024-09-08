import { UserAuth } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

/* 
  TODO: Let's catch this (?). Also all individual requests
  (such /admin /registro) should use this
*/
export const getUser = async (
  request: NextRequest,
): Promise<UserAuth | null> => {
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
