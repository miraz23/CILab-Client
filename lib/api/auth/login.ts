import { LoginApiPayload, LoginApiResponse } from "@/lib/types/auth/login";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export class LoginApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "LoginApiError";
        this.status = status;
    }
}

export async function submitLoginApplication(
    payload: LoginApiPayload
): Promise<LoginApiResponse> {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new LoginApiError("Network error. Check your connection and try again.", 0);
    }

    let data: LoginApiResponse;

    try {
        data = (await response.json()) as LoginApiResponse;
    } catch {
        throw new LoginApiError("Unexpected server response.", response.status);
    }

    if (!response.ok || !data.success) {
        throw new LoginApiError(data.message ?? "Something went wrong. Please try again.", response.status);
    }

    return data;
}