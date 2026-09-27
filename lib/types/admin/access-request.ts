import type { AcademicRole } from "@/lib/types/auth/register";

export const OVERSIGHT_REQUEST_STATUSES = [
    "pending",
    "accepted",
    "declined",
    "expired",
    "revoked",
] as const;

export type OversightRequestStatus = (typeof OVERSIGHT_REQUEST_STATUSES)[number];

export type OversightDecision = Extract<
    OversightRequestStatus,
    "accepted" | "declined" | "revoked"
>;

export interface RequestParty {
    id: string;
    name: string;
    email: string;
    academicRole: AcademicRole;
    institution: string;
}

export interface OversightAccessRequest {
    id: string;
    requester: RequestParty;
    owner: RequestParty;
    shareLink: string;
    message?: string;
    expiresAt?: string;
    status: OversightRequestStatus;
    createdAt: string;
    decidedAt?: string;
    adminNote?: string;
}

export interface OversightAccessRequestFilters {
    status?: OversightRequestStatus | "all";
    search?: string;
}

export interface OversightAccessRequestsResponse {
    success: boolean;
    message: string;
    requests?: OversightAccessRequest[];
    total?: number;
}

export interface OversightDecisionPayload {
    requestId: string;
    decision: OversightDecision;
    note?: string;
}
