export interface LoginFormData {
    email: string;
    password: string;
}

export type LoginTextField = keyof LoginFormData;

export interface LoginFormErrors {
    email?: string;
    password?: string;
}

export interface LoginApiPayload {
    email: string;
    password: string;
}

export interface LoginApiResponse {
    success: boolean;
    message: string;
    userId?: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        scholarId: string;
        institution: string;
        role: string;
        appRole: "USER" | "ADMIN";
        status: "active" | "pending" | "suspended";
    };
}