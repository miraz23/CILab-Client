import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    AUTH_ROLE_COOKIE,
    AUTH_TOKEN_COOKIE,
    isTokenExpired,
    resolveAppRole,
} from "@/lib/auth/session";
import type { AppRole } from "@/lib/types/admin/role";

// Route prefixes that require a specific app role. Anything else under /dashboard only needs a session.
const ROLE_PROTECTED_ROUTES: { prefix: string; roles: AppRole[] }[] = [
    { prefix: "/dashboard/admin", roles: ["ADMIN"] },
];

function matchesPrefix(pathname: string, prefix: string) {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function clearAuthCookies(response: NextResponse) {
    response.cookies.delete(AUTH_TOKEN_COOKIE);
    response.cookies.delete(AUTH_ROLE_COOKIE);
    return response;
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const rawToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    const token = rawToken && !isTokenExpired(rawToken) ? rawToken : undefined;
    const isAuthRoute = matchesPrefix(pathname, "/auth");

    // Logged-in users have no business on the login/register pages.
    if (isAuthRoute) {
        if (token) return NextResponse.redirect(new URL("/dashboard", request.url));
        return rawToken ? clearAuthCookies(NextResponse.next()) : NextResponse.next();
    }

    if (!token) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("next", pathname + search);
        const response = NextResponse.redirect(loginUrl);
        return rawToken ? clearAuthCookies(response) : response;
    }

    const rule = ROLE_PROTECTED_ROUTES.find((r) => matchesPrefix(pathname, r.prefix));
    if (rule) {
        const role = resolveAppRole(token, request.cookies.get(AUTH_ROLE_COOKIE)?.value);
        if (!role || !rule.roles.includes(role)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*"],
};
