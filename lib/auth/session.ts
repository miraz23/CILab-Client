import type { LoginApiResponse } from "@/lib/types/auth/login";
import { isAppRole, type AppRole } from "@/lib/types/admin/role";

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
export const AUTH_TOKEN_COOKIE = "auth_token";
export const AUTH_ROLE_COOKIE = "auth_role";
export const AUTH_CHANGED_EVENT = "auth-changed";

const SESSION_MAX_AGE = 60 * 60 * 24;

export type SessionUser = NonNullable<LoginApiResponse["user"]> | { userId?: string };

interface JwtClaims {
    exp?: number;
    appRole?: unknown;
    role?: unknown;
}

/** Decodes a JWT payload without verifying it. Only for optimistic checks; the backend is the authority. */
export function decodeJwtClaims(token: string): JwtClaims | null {
    const payload = token.split(".")[1];
    if (!payload) return null;
    try {
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="))) as JwtClaims;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const exp = decodeJwtClaims(token)?.exp;
    return typeof exp === "number" && exp * 1000 <= Date.now();
}

/** Role claim from the token if it carries one, otherwise the role cookie set at login. */
export function resolveAppRole(token: string, roleCookie: string | undefined): AppRole | null {
    const claims = decodeJwtClaims(token);
    const fromToken = claims?.appRole ?? claims?.role;
    if (isAppRole(fromToken)) return fromToken;
    return isAppRole(roleCookie) ? roleCookie : null;
}

/** Only allow same-origin relative paths as post-login redirect targets. */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard"): string {
    if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
    if (value.startsWith("/auth")) return fallback;
    return value;
}

function setCookie(name: string, value: string, maxAge: number) {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function saveSession(token: string, user: SessionUser) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    setCookie(AUTH_TOKEN_COOKIE, token, SESSION_MAX_AGE);
    const appRole = "appRole" in user ? user.appRole : undefined;
    setCookie(AUTH_ROLE_COOKIE, appRole ?? "USER", SESSION_MAX_AGE);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setCookie(AUTH_TOKEN_COOKIE, "", 0);
    setCookie(AUTH_ROLE_COOKIE, "", 0);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getStoredUser(): SessionUser | null {
    try {
        return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null") as SessionUser | null;
    } catch {
        return null;
    }
}

/** Merges fresh profile fields into the stored user without dropping appRole/status. */
export function updateStoredUser(patch: Record<string, unknown>) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...(getStoredUser() ?? {}), ...patch }));
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** The cookie is what the proxy checks, so it is the source of truth for "logged in". */
export function hasSessionCookie(): boolean {
    return document.cookie.split("; ").some((c) => c.startsWith(`${AUTH_TOKEN_COOKIE}=`) && c.length > AUTH_TOKEN_COOKIE.length + 1);
}
