export interface PlatformMetric {
    id: string;
    label: string;
    value: number;
    delta: number;
    suffix?: string;
}

export interface PlatformActivityPoint {
    label: string;
    uploads: number;
    approvals: number;
    accessRequests: number;
    meetings: number;
}

export interface RoleBreakdownEntry {
    academicRole: string;
    users: number;
}

export interface ModerationBacklog {
    pending: number;
    approvedThisWeek: number;
    rejectedThisWeek: number;
    averageReviewHours: number;
}

export interface PlatformStats {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    suspendedUsers: number;
    metrics: PlatformMetric[];
    activity: PlatformActivityPoint[];
    roleBreakdown: RoleBreakdownEntry[];
    moderation: ModerationBacklog;
    generatedAt: string;
}

export interface PlatformStatsResponse {
    success: boolean;
    message: string;
    stats?: PlatformStats;
}
