import { RegisterApiPayload, RegisterApiResponse } from "@/lib/types/auth/register";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export class RegisterApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "RegisterApiError";
        this.status = status;
    }
}

export async function submitRegisterApplication(
    payload: RegisterApiPayload
): Promise<RegisterApiResponse> {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new RegisterApiError("Network error. Check your connection and try again.", 0);
    }

    let data: RegisterApiResponse;

    try {
        data = (await response.json()) as RegisterApiResponse;
    } catch {
        throw new RegisterApiError("Unexpected server response.", response.status);
    }

    if (!response.ok || !data.success) {
        throw new RegisterApiError(data.message ?? "Something went wrong. Please try again.", response.status);
    }

    return data;
}