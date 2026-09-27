export const ANNOUNCEMENT_AUDIENCES = ["all", "students", "faculty", "admins"] as const;

export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export const ANNOUNCEMENT_PRIORITIES = ["normal", "important", "urgent"] as const;

export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const ANNOUNCEMENT_STATUSES = ["draft", "published", "archived"] as const;

export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export type AnnouncementSubmitIntent = Extract<
    AnnouncementStatus,
    "draft" | "published" | "archived"
>;

export interface AnnouncementAuthor {
    id: string;
    name: string;
}

export interface Announcement {
    id: string;
    title: string;
    body: string;
    audience: AnnouncementAudience;
    priority: AnnouncementPriority;
    status: AnnouncementStatus;
    pinned: boolean;
    publishAt?: string;
    createdAt: string;
    updatedAt: string;
    author: AnnouncementAuthor;
}

export interface AnnouncementFormData {
    title: string;
    body: string;
    audience: AnnouncementAudience;
    priority: AnnouncementPriority;
    pinned: boolean;
    publishAt: string;
}

export interface AnnouncementFormErrors {
    title?: string;
    body?: string;
    audience?: string;
    priority?: string;
    publishAt?: string;
}

export interface AnnouncementFilters {
    status?: AnnouncementStatus | "all";
    audience?: AnnouncementAudience | "all";
    search?: string;
}

export interface AnnouncementsResponse {
    success: boolean;
    message: string;
    announcements?: Announcement[];
    total?: number;
}

export interface AnnouncementMutationPayload extends AnnouncementFormData {
    announcementId?: string;
    intent: AnnouncementSubmitIntent;
}
