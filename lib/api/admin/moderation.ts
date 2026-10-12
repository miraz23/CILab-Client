import type {
    ModerationDecisionPayload,
    ModerationFilters,
    ModerationQueueResponse,
    ModerationSubmission,
} from "@/lib/types/admin/moderation";
import { adminRequest } from "@/lib/api/admin/client";

export async function fetchModerationQueue(
    filters: ModerationFilters = {}
): Promise<ModerationSubmission[]> {
    const params = new URLSearchParams();
    if (filters.contentType && filters.contentType !== "all") {
        params.set("contentType", filters.contentType);
    }
    if (filters.status && filters.status !== "all") {
        params.set("status", filters.status);
    }
    if (filters.search?.trim()) params.set("search", filters.search.trim());

    const query = params.toString();
    const response = await adminRequest<ModerationQueueResponse>(
        `/api/admin/moderation${query ? `?${query}` : ""}`
    );
    return response.submissions ?? [];
}

export async function submitModerationDecision(
    payload: ModerationDecisionPayload
): Promise<ModerationQueueResponse> {
    return adminRequest<ModerationQueueResponse>(
        `/api/admin/moderation/${payload.submissionId}`,
        {
            method: "PATCH",
            body: {
                decision: payload.decision,
                note: payload.note,
            },
        }
    );
}
