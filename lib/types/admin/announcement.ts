export const ANNOUNCEMENT_KINDS = ["announcement", "notice", "seminar"] as const;

export type AnnouncementKind = (typeof ANNOUNCEMENT_KINDS)[number];

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

export interface AnnouncementSpeaker {
    name: string;
    affiliation?: string;
    bio?: string;
    image?: string; // base64 data URL or URL
}

export interface AnnouncementExtraField {
    key: string;
    value: string;
}

export interface Announcement {
    id: string;
    kind: AnnouncementKind;
    title: string;
    body: string;
    status: AnnouncementStatus;
    pinned: boolean;
    publishAt?: string;
    eventAt?: string;
    venue?: string;
    poster?: string; // poster image
    extraFields?: AnnouncementExtraField[];
    createdAt: string;
    updatedAt: string;
    author: AnnouncementAuthor;
}

export interface AnnouncementFormData {
    kind: AnnouncementKind;
    title: string;
    body: string;
    pinned: boolean;
    publishAt: string;
    eventAt: string;
    venue: string;
    poster: string;
    extraFields: AnnouncementExtraField[];
}

export interface AnnouncementFormErrors {
    title?: string;
    body?: string;
    publishAt?: string;
    eventAt?: string;
    venue?: string;
}

export interface AnnouncementFilters {
    kind?: AnnouncementKind | "all";
    status?: AnnouncementStatus | "all";
    audience?: AnnouncementAudience | "all";
    search?: string;
}

export interface AnnouncementsResponse {
    success: boolean;
    message: string;
    announcements?: Announcement[];
    total?: number;
    announcement?: Announcement;
}

export interface AnnouncementMutationPayload extends AnnouncementFormData {
    announcementId?: string;
    intent: AnnouncementSubmitIntent;
}
