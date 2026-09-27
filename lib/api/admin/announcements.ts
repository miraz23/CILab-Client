import type {
    Announcement,
    AnnouncementFilters,
    AnnouncementMutationPayload,
    AnnouncementsResponse,
} from "@/lib/types/admin/announcement";

export async function fetchAnnouncements(
    filters: AnnouncementFilters = {}
): Promise<Announcement[]> {
    return filterMockAnnouncements(filters);
}

export async function upsertAnnouncement(
    payload: AnnouncementMutationPayload
): Promise<AnnouncementsResponse> {
    return {
        success: true,
        message: payload.announcementId
            ? `Announcement ${payload.announcementId} ${payload.intent}.`
            : `Announcement "${payload.title}" ${payload.intent}.`,
    };
}

export async function deleteAnnouncement(
    announcementId: string
): Promise<AnnouncementsResponse> {
    return {
        success: true,
        message: `Announcement ${announcementId} removed.`,
    };
}

function filterMockAnnouncements(filters: AnnouncementFilters): Announcement[] {
    let announcements = getMockAnnouncements();

    if (filters.status && filters.status !== "all") {
        announcements = announcements.filter(
            (announcement) => announcement.status === filters.status
        );
    }

    if (filters.audience && filters.audience !== "all") {
        announcements = announcements.filter(
            (announcement) => announcement.audience === filters.audience
        );
    }

    const search = filters.search?.trim().toLowerCase();

    if (search) {
        announcements = announcements.filter((announcement) =>
            [announcement.title, announcement.body].some((value) =>
                value.toLowerCase().includes(search)
            )
        );
    }

    return [...announcements].sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    );
}

function getMockAnnouncements(): Announcement[] {
    return [
        {
            id: "an-1",
            title: "Seminar room booking opens Monday",
            body: "Weekly lab seminars resume next Monday. Submit your preferred slot through the schedule board before Friday 18:00 so we can reserve Seminar Room B.",
            audience: "all",
            priority: "important",
            status: "published",
            pinned: true,
            createdAt: "2026-09-24T08:00:00Z",
            updatedAt: "2026-09-24T08:00:00Z",
            author: { id: "u-1", name: "Dr. Sarah Chen" },
        },
        {
            id: "an-2",
            title: "GPU cluster maintenance window",
            body: "The shared GPU cluster will be offline on Saturday between 06:00 and 14:00 for driver upgrades. Please terminate long-running jobs before Friday evening.",
            audience: "students",
            priority: "urgent",
            status: "published",
            pinned: false,
            createdAt: "2026-09-22T12:30:00Z",
            updatedAt: "2026-09-22T12:30:00Z",
            author: { id: "u-2", name: "Dr. Marcus Reid" },
        },
        {
            id: "an-3",
            title: "Ethics disclosure checklist for submissions",
            body: "All uploads must now include an ethics and data-usage disclosure section. Draft guidance is attached to the moderation checklist.",
            audience: "faculty",
            priority: "normal",
            status: "draft",
            pinned: false,
            createdAt: "2026-09-20T09:45:00Z",
            updatedAt: "2026-09-21T15:10:00Z",
            author: { id: "u-8", name: "Dr. Hana Sato" },
        },
        {
            id: "an-4",
            title: "Guest lecture archive is live",
            body: "Recordings and slides from the Spring guest lecture series are now available in the lab archive.",
            audience: "all",
            priority: "normal",
            status: "archived",
            pinned: false,
            publishAt: "2026-04-02T09:00:00Z",
            createdAt: "2026-04-01T16:20:00Z",
            updatedAt: "2026-06-30T11:00:00Z",
            author: { id: "u-1", name: "Dr. Sarah Chen" },
        },
    ];
}
