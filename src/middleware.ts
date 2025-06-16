import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/const";

export function middleware(request: NextRequest) {
  // Vérification du token d'authentification
  const token = request.cookies.get(API_CONFIG.COOKIE_CONFIG.TOKEN_NAME);
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  // Si pas de token et n'est pas sur une page auth, rediriger vers onboarding
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Si token et sur une page auth, rediriger vers dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configuration des chemins à protéger
export const config = {
  matcher: [
    /*
     * Match tous les chemins sauf:
     * 1. /api (routes API)
     * 2. /_next (fichiers Next.js)
     * 3. /fonts, /icons, /images (ressources statiques)
     */
    "/((?!api|_next|fonts|icons|images|favicon.ico).*)",
  ],
};
