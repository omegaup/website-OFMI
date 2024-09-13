import type { NextMiddlewareResult } from "next/dist/server/web/types";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import {
  X_USER_AUTH_EMAIL_HEADER,
  X_USER_AUTH_ID_HEADER,
  X_USER_AUTH_ROLE_HEADER,
  getUser,
  isImpersonatingOfmiUser,
} from "@/lib/auth";

// Prefix routes that requires only to be log in
const withAuthPaths = ["/mentorias", "/registro", "/oauth"];

export type CustomMiddleware = (
  request: NextRequest,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

function withAuthRoles(roles?: Array<Role>): CustomMiddleware {
  return async (request) => {
    const user = await getUser(request);
    if (!user) {
      const callbackUrl = request.nextUrl.pathname;
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `callbackUrl=${callbackUrl}`;
      return NextResponse.redirect(url);
    }
    if (roles && !roles.find((v) => v === user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    request.headers.set(X_USER_AUTH_ID_HEADER, user.id);
    request.headers.set(X_USER_AUTH_ROLE_HEADER, user.role);
    request.headers.set(X_USER_AUTH_EMAIL_HEADER, user.email);
    return NextResponse.next({ request });
  };
}

const withAuth = withAuthRoles();
const asAdmin = withAuthRoles([Role.ADMIN]);

const asAdminOrImpersonatingOfmiUser: CustomMiddleware = (request) => {
  if (isImpersonatingOfmiUser(request)) {
    return NextResponse.next({ request });
  }
  return asAdmin(request);
};

export const middleware: CustomMiddleware = async (
  request,
): Promise<NextMiddlewareResult> => {
  // API paths
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return asAdminOrImpersonatingOfmiUser(request);
  }
  if (request.nextUrl.pathname.startsWith("/api/ofmi/upsertParticipation")) {
    return withAuth(request);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return asAdmin(request);
  }

  // Pages that requires just to be login
  if (withAuthPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return withAuth(request);
  }

  // Allow
  return NextResponse.next({ request });
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
