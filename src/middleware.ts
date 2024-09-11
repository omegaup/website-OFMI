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
    request.headers.set("X-USER-AUTH-ID", user.id);
    request.headers.set("X-USER-AUTH-ROLE", user.role);
    return NextResponse.next();
  };
}

const withAuth = withAuthRoles();
const asAdmin = withAuthRoles([Role.ADMIN]);

export const middleware: CustomMiddleware = async (
  request,
): Promise<NextMiddlewareResult> => {
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    return asAdmin(request);
  }

  if (request.nextUrl.pathname.startsWith("/mentorias")) {
    return withAuth(request);
  }

  // Allow
  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!api/_next/static|_next/image).*)",
  ],
};
