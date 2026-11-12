import type { AcademicRole } from "@/lib/types/auth/register";

export const MODERATION_CONTENT_TYPES = ["paper", "presentation"] as const;

export type ModerationContentType = (typeof MODERATION_CONTENT_TYPES)[number];

export const MODERATION_STATUSES = ["pending", "approved", "rejected"] as const;

export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export type ModerationDecision = Extract<ModerationStatus, "approved" | "rejected">;

export interface ModerationAuthor {
    id: string;
    name: string;
    academicRole: AcademicRole;
    institution: string;
}

export type ModerationMetadataValue = string | string[] | boolean | null;

export interface ModerationSubmission {
    id: string;
    contentType: ModerationContentType;
    title: string;
    category: string;
    author: ModerationAuthor;
    fileUrl: string;
    fileDownloadUrl: string;
    originalFilename: string;
    mimeType: string;
    fileSizeMb: number;
    metadata: Record<string, ModerationMetadataValue>;
    submittedAt: string;
    status: ModerationStatus;
    reviewNote?: string;
    reviewedAt?: string;
}

export interface ModerationFilters {
    contentType?: ModerationContentType | "all";
    status?: ModerationStatus | "all";
    search?: string;
}

export interface ModerationQueueResponse {
    success: boolean;
    message: string;
    submissions?: ModerationSubmission[];
    total?: number;
}

export interface ModerationDecisionPayload {
    submissionId: string;
    decision: ModerationDecision;
    note?: string;
    featured?: boolean;
}
