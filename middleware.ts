import { NextRequest, NextResponse } from "next/server";

const TOKEN_NAME = "token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_NAME);
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|fonts|icons|images|favicon.ico).*)"],
};
