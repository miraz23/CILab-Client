import type { PlatformStats } from "@/lib/types/admin/analytics";

export async function fetchPlatformStats(): Promise<PlatformStats> {
    return getMockStats();
}

function getMockStats(): PlatformStats {
    return {
        totalUsers: 1284,
        activeUsers: 1102,
        pendingUsers: 47,
        suspendedUsers: 21,
        metrics: [
            { id: "papers", label: "Papers Archived", value: 864, delta: 8.4 },
            { id: "presentations", label: "Presentations Archived", value: 512, delta: 12.1 },
            { id: "access-requests", label: "Access Requests", value: 1386, delta: -3.2 },
            { id: "meetings", label: "Supervisor Sessions", value: 274, delta: 5.7 },
        ],
        activity: [
            { label: "Mar", uploads: 62, approvals: 48, accessRequests: 74, meetings: 18 },
            { label: "Apr", uploads: 71, approvals: 55, accessRequests: 82, meetings: 21 },
            { label: "May", uploads: 68, approvals: 61, accessRequests: 79, meetings: 24 },
            { label: "Jun", uploads: 84, approvals: 66, accessRequests: 96, meetings: 26 },
            { label: "Jul", uploads: 77, approvals: 70, accessRequests: 88, meetings: 23 },
            { label: "Aug", uploads: 93, approvals: 74, accessRequests: 101, meetings: 29 },
            { label: "Sep", uploads: 88, approvals: 79, accessRequests: 94, meetings: 31 },
        ],
        roleBreakdown: [
            { academicRole: "PhD Student", users: 386 },
            { academicRole: "Master's Student", users: 241 },
            { academicRole: "Undergraduate Student", users: 198 },
            { academicRole: "Postdoctoral Researcher", users: 122 },
            { academicRole: "Professor", users: 96 },
            { academicRole: "Assistant Professor", users: 74 },
            { academicRole: "Research Assistant", users: 63 },
            { academicRole: "Other", users: 104 },
        ],
        moderation: {
            pending: 14,
            approvedThisWeek: 37,
            rejectedThisWeek: 6,
            averageReviewHours: 19.4,
        },
        generatedAt: "2026-09-26T09:00:00Z",
    };
}
