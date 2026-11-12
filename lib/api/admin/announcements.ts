import type {
    Announcement,
    AnnouncementFilters,
    AnnouncementMutationPayload,
    AnnouncementsResponse,
} from "@/lib/types/admin/announcement";
import { adminRequest, getAuthToken } from "@/lib/api/admin/client";

export async function fetchAnnouncements(
    filters: AnnouncementFilters = {}
): Promise<Announcement[]> {
    const params = new URLSearchParams();
    if (filters.kind && filters.kind !== "all") params.set("kind", filters.kind);
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

export async function uploadAnnouncementPoster(
    announcementId: string,
    dataUrl: string
): Promise<AnnouncementsResponse> {
    const [header, encoded] = dataUrl.split(",", 2);
    if (!header || !encoded) {
        throw new Error("The PDF upload data is invalid.");
    }

    const mimeType = header.match(/^data:([^;]+)/i)?.[1] ?? "application/pdf";
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const formData = new FormData();
    formData.append("poster", new Blob([bytes], { type: mimeType }), "poster.pdf");

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const token = getAuthToken();
    const response = await fetch(`${baseUrl}/api/admin/announcements/${announcementId}/poster`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    const data = (await response.json()) as AnnouncementsResponse;
    if (!response.ok || data.success === false) {
        throw new Error(data.message ?? "Unable to upload the PDF.");
    }
    return data;
}
