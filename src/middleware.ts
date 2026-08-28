import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
	const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
	const { pathname } = request.nextUrl;

	if (pathname === "/") {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	if (protectedRoutes.some((route) => pathname.startsWith(route)) && !sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	if (authRoutes.some((route) => pathname.startsWith(route)) && sessionCookie) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard/:path*", "/sign-in", "/sign-up"],
};
