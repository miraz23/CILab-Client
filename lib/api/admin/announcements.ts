import type {
    Announcement,
    AnnouncementFilters,
    AnnouncementMutationPayload,
    AnnouncementsResponse,
} from "@/lib/types/admin/announcement";
import { adminRequest } from "@/lib/api/admin/client";

export async function fetchAnnouncements(
    filters: AnnouncementFilters = {}
): Promise<Announcement[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.audience && filters.audience !== "all") params.set("audience", filters.audience);
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    const query = params.toString();
    const response = await adminRequest<{ announcements?: Announcement[] }>(
        `/api/admin/announcements${query ? `?${query}` : ""}`
    );
    return response.announcements ?? [];
}

export function upsertAnnouncement(
    payload: AnnouncementMutationPayload
): Promise<AnnouncementsResponse> {
    const path = payload.announcementId
        ? `/api/admin/announcements/${payload.announcementId}`
        : "/api/admin/announcements";
    return adminRequest<AnnouncementsResponse>(path, {
        method: payload.announcementId ? "PATCH" : "POST",
        body: payload,
    });
}

export function deleteAnnouncement(
    announcementId: string
): Promise<AnnouncementsResponse> {
    return adminRequest<AnnouncementsResponse>(`/api/admin/announcements/${announcementId}`, {
        method: "DELETE",
    });
}
