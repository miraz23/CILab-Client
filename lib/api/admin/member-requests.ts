import { adminRequest } from "@/lib/api/admin/client";
import type { AdminMemberRequest } from "@/lib/types/admin/user";

interface MemberRequestsResponse {
    success: boolean;
    requests?: AdminMemberRequest[];
}

export async function fetchMemberRequests(): Promise<AdminMemberRequest[]> {
    const response = await adminRequest<MemberRequestsResponse>("/api/member-requests/admin");
    return response.requests ?? [];
}

export function decideMemberRequest(
    requestId: string,
    status: "approved" | "declined"
) {
    return adminRequest<{ success: boolean; message: string }>(
        `/api/member-requests/admin/${requestId}`,
        { method: "PATCH", body: { status } }
    );
}
