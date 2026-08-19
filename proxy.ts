import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/dashboard")) {
        const token = request.cookies.get("auth_token")?.value;
        if (!token) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/dashboard/:path*",
};