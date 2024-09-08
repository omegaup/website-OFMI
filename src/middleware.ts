import type { NextMiddlewareResult } from "next/dist/server/web/types";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { getUser } from "@/lib/auth";

export type CustomMiddleware = (
  request: NextRequest,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

function withAuthRoles(roles?: Array<Role>): CustomMiddleware {
  return async (request) => {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (roles && !roles.find((v) => v === user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  };
}

const withAuth = withAuthRoles();
const asAdmin = withAuthRoles([Role.ADMIN]);

export const middleware: CustomMiddleware = async (
  request,
): Promise<NextMiddlewareResult> => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return asAdmin(request);
  }

  if (request.nextUrl.pathname.startsWith("/mentorias")) {
    return withAuth(request);
  }

  // Allow
  return NextResponse.next();
};
