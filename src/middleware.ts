import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|api/debug|_next/static|_next/image|favicon.ico).*)"],
};
