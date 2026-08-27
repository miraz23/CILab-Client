export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    institution: string;
    avatar?: string;
}

export interface AccessRequestFormData {
    shareLink: string;
    userIds: string[];
    message?: string;
    expiresAt?: string;
}

export interface AccessRequestFormErrors {
    shareLink?: string;
    userIds?: string;
    message?: string;
    expiresAt?: string;
}

export interface AccessRequestApiPayload {
    shareLink: string;
    userIds: string[];
    message?: string;
    expiresAt?: string;
}

export interface AccessRequestApiResponse {
    success: boolean;
    message: string;
    requestId?: string;
}