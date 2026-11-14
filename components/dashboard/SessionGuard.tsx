"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AUTH_TOKEN_KEY, clearSession, syncSessionRole } from "@/lib/auth/session";
import { isAppRole } from "@/lib/types/admin/role";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const CHECK_INTERVAL_MS = 30_000;

let isEnding = false;

function endSession(message: string) {
    if (isEnding) return;
    isEnding = true;
    clearSession();
    toast.error(message);
    window.setTimeout(() => {
        window.location.href = "/auth/login";
    }, 1200);
}

function hasAuthHeader(input: RequestInfo | URL, init?: RequestInit): boolean {
    const headers = init?.headers ?? (input instanceof Request ? input.headers : undefined);
    if (!headers) return false;
    if (headers instanceof Headers) return headers.has("Authorization");
    if (Array.isArray(headers)) return headers.some(([key]) => key.toLowerCase() === "authorization");
    return Object.keys(headers).some((key) => key.toLowerCase() === "authorization");
}

function requestUrl(input: RequestInfo | URL): string {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.href;
    return input.url;
}

/**
 * Signs the user out as soon as the backend reports their token as no longer valid
 * (e.g. the account was deleted by an admin). Covers every authenticated request via
 * a fetch wrapper, and idle tabs via a periodic check.
 */
export default function SessionGuard() {
    const router = useRouter();
    const routerRef = useRef(router);
    routerRef.current = router;

    useEffect(() => {
        if (!API_BASE_URL) return;

        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            const response = await originalFetch(input, init);
            if (
                response.status === 401 &&
                requestUrl(input).startsWith(API_BASE_URL) &&
                hasAuthHeader(input, init)
            ) {
                endSession("Your account is no longer available. You have been signed out.");
            }
            return response;
        };

        const check = () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token || document.visibilityState === "hidden") return;
            // Any authenticated endpoint will do; the fetch wrapper handles a 401.
            void fetch(`${API_BASE_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(async (response) => {
                    if (!response.ok) return;
                    const data = (await response.json()) as {
                        token?: string;
                        user?: { appRole?: unknown };
                    };
                    const appRole = data.user?.appRole;
                    if (!isAppRole(appRole)) return;
                    if (syncSessionRole(appRole, data.token)) {
                        toast.info("Your access level has changed.");
                        // Re-run the route guard with the new role (e.g. leave admin pages after a demotion).
                        routerRef.current.refresh();
                    }
                })
                .catch(() => undefined);
        };

        check();
        const interval = window.setInterval(check, CHECK_INTERVAL_MS);
        window.addEventListener("focus", check);
        document.addEventListener("visibilitychange", check);

        return () => {
            window.fetch = originalFetch;
            window.clearInterval(interval);
            window.removeEventListener("focus", check);
            document.removeEventListener("visibilitychange", check);
        };
    }, []);

    return null;
}
