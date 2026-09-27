const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";

export class AdminApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "AdminApiError";
        this.status = status;
    }
}

export function isAdminApiConfigured(): boolean {
    return Boolean(API_BASE_URL);
}

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

interface AdminRequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
}

export async function adminRequest<T>(
    path: string,
    options: AdminRequestOptions = {}
): Promise<T> {
    if (!API_BASE_URL) {
        throw new AdminApiError("NEXT_PUBLIC_SERVER_URL is not configured.", 0);
    }

    const { body, headers, ...rest } = options;
    const token = getAuthToken();

    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            credentials: "include",
            ...rest,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
    } catch {
        throw new AdminApiError(
            "Network error. Check your connection and try again.",
            0
        );
    }

    let data: T & { success?: boolean; message?: string };

    try {
        data = (await response.json()) as T & {
            success?: boolean;
            message?: string;
        };
    } catch {
        throw new AdminApiError("Unexpected server response.", response.status);
    }

    if (!response.ok || data?.success === false) {
        throw new AdminApiError(
            data?.message ?? "Something went wrong. Please try again.",
            response.status
        );
    }

    return data;
}
