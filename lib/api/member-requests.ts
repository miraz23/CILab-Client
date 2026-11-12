import { adminRequest } from "@/lib/api/admin/client";

export type MemberRequestStatus = "pending" | "approved" | "declined";

export interface MemberRequest {
    id: string;
    status: MemberRequestStatus;
    createdAt: string;
    decidedAt?: string;
}

interface MemberRequestResponse {
    success: boolean;
    message: string;
    request: MemberRequest | null;
    appRole?: string;
}

export async function submitMemberRequest(): Promise<MemberRequestResponse> {
    return adminRequest<MemberRequestResponse>("/api/member-requests", { method: "POST" });
}
