// app/news/page.tsx

import NewsNotices from "@/components/news/NewsSection";
import type { Announcement } from "@/lib/types/admin/announcement";

// TODO: replace with your real admin-managed data, e.g. the same source
// that `fetchAnnouncements()` in AnnouncementManager uses:
//
// async function getAnnouncements(): Promise<Announcement[]> {
//   const res = await fetch(`${process.env.API_URL}/announcements?status=published`, {
//     next: { revalidate: 60 },
//   });
//   if (!res.ok) return [];
//   return res.json();
// }

const author = { id: "admin-1", name: "Lab Admin" };

/**
 * SAMPLE DATA - mirrors exactly what AnnouncementManager's composer saves:
 *
 *  - "announcement" (Conference): title, body, venue, poster, extraFields, pinned,
 *                                 optional publishAt (schedule). NO eventAt.
 *  - "notice":                    title, body, poster, extraFields, pinned only.
 *                                 NO publishAt / eventAt / venue.
 *  - "seminar":                   title, body, eventAt (required), venue, poster,
 *                                 extraFields, pinned. NO publishAt.
 *
 * Empty optional inputs are saved as "" in the form, so they are "" here too
 * (the API may return undefined instead - the UI handles both).
 */
const sample: Announcement[] = [
    /* ------------------------------ conferences ------------------------------ */
    {
        id: "c1",
        kind: "announcement",
        title: "International Conference on Machine Learning 2026",
        body: "Submissions are open for the International Conference on Machine Learning 2026. The conference covers deep learning, optimisation, and applied machine learning.\n\nAbstracts are due 28 September; full papers one week later. Accepted works will be presented in the main track.",
        status: "published",
        pinned: true,
        publishAt: "",
        eventAt: "",
        venue: "CILab Auditorium, Block B",
        poster: "",
        extraFields: [
            { key: "Registration", value: "Opens 1 November 2026" },
            { key: "Contact", value: "conference@cilab.example" },
        ],
        createdAt: "2026-09-01T09:00:00.000Z",
        updatedAt: "2026-10-02T10:00:00.000Z",
        author,
    },
    {
        id: "c2",
        kind: "announcement",
        title: "Lab Symposium on Intelligent Systems 2027 - Call for Papers",
        body: "The Lab Symposium on Intelligent Systems 2027 invites original research on robotics, computer vision and autonomous systems. Selected papers will be invited to a special journal issue.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "",
        poster: "",
        extraFields: [{ key: "Submission deadline", value: "15 January 2027" }],
        createdAt: "2026-10-05T09:00:00.000Z",
        updatedAt: "2026-10-05T09:00:00.000Z",
        author,
    },
    {
        id: "c3",
        kind: "announcement",
        title: "Workshop on Responsible AI and Data Privacy",
        body: "A one-day workshop on federated learning, differential privacy and fairness in deployed models, featuring invited talks and a poster session.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "CILab Seminar Room, Block B",
        poster: "",
        extraFields: [],
        createdAt: "2026-10-10T09:00:00.000Z",
        updatedAt: "2026-10-10T09:00:00.000Z",
        author,
    },
    {
        id: "c4",
        kind: "announcement",
        title: "Draft: Joint Conference with Partner University",
        body: "This draft should not appear on the public page because it has not been published yet.",
        status: "draft",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "",
        poster: "",
        extraFields: [],
        createdAt: "2026-10-11T09:00:00.000Z",
        updatedAt: "2026-10-11T09:00:00.000Z",
        author,
    },
    {
        id: "c5",
        kind: "announcement",
        title: "Archived: Data Science Summit 2025",
        body: "This conference has been archived and should not appear on the public page.",
        status: "archived",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "CILab Auditorium, Block B",
        poster: "",
        extraFields: [],
        createdAt: "2025-08-01T09:00:00.000Z",
        updatedAt: "2025-12-20T09:00:00.000Z",
        author,
    },

    /* -------------------------------- notices -------------------------------- */
    {
        id: "n1",
        kind: "notice",
        title: "New GPU Cluster Access Policy for Researchers",
        body: "The updated policy introduces tiered quotas, a booking window for long-running jobs and priority scheduling for externally funded projects. Existing allocations will be migrated automatically.",
        status: "published",
        pinned: true,
        publishAt: "",
        eventAt: "",
        venue: "",
        poster: "",
        extraFields: [{ key: "Effective from", value: "1 November 2026" }],
        createdAt: "2026-10-05T08:00:00.000Z",
        updatedAt: "2026-10-05T08:00:00.000Z",
        author,
    },
    {
        id: "n2",
        kind: "notice",
        title: "Lab Meeting Moved to Thursday 3 PM",
        body: "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "",
        poster: "",
        extraFields: [],
        createdAt: "2026-10-15T08:00:00.000Z",
        updatedAt: "2026-10-15T08:00:00.000Z",
        author,
    },
    {
        id: "n3",
        kind: "notice",
        title: "Thesis Defense Schedule for the Autumn Semester",
        body: "Defense slots are now open. PhD candidates should confirm their preferred date with the graduate office before the end of the week.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "",
        poster: "",
        extraFields: [{ key: "Confirm with", value: "Graduate office" }],
        createdAt: "2026-10-12T08:00:00.000Z",
        updatedAt: "2026-10-12T08:00:00.000Z",
        author,
    },
    {
        id: "n4",
        kind: "notice",
        title: "Lab closes at 6 PM on Friday",
        body: "The lab will close at 6 PM this Friday for building maintenance. Please save your work and log out of shared machines.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "",
        venue: "",
        poster: "",
        extraFields: [],
        createdAt: "2026-10-16T08:00:00.000Z",
        updatedAt: "2026-10-16T08:00:00.000Z",
        author,
    },

    /* -------------------------------- seminars -------------------------------- */
    {
        id: "s1",
        kind: "seminar",
        title: "Weekly Research Seminar: Graph Neural Networks in Practice",
        body: "This session explores how graph neural networks are applied to molecular and social network datasets, with practical guidance on training, evaluation and common pitfalls. Open to all lab members and visiting researchers.",
        status: "published",
        pinned: true,
        publishAt: "",
        eventAt: "2026-10-24T15:00",
        venue: "CILab Seminar Room, Block B",
        poster: "",
        extraFields: [
            { key: "Speaker", value: "Dr. A. Rahman" },
            { key: "Registration", value: "Not required" },
        ],
        createdAt: "2026-10-10T08:00:00.000Z",
        updatedAt: "2026-10-10T08:00:00.000Z",
        author,
    },
    {
        id: "s2",
        kind: "seminar",
        title: "Guest Lecture on Federated Learning and Privacy",
        body: "The guest lecture covers privacy-preserving federated learning, secure aggregation and differential privacy in cross-silo settings, followed by an open Q&A.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "2026-10-29T11:00",
        venue: "",
        poster: "",
        extraFields: [{ key: "Join link", value: "Shared by email on the day" }],
        createdAt: "2026-10-12T08:00:00.000Z",
        updatedAt: "2026-10-12T08:00:00.000Z",
        author,
    },
    {
        id: "s3",
        kind: "seminar",
        title: "Reading Group: Diffusion Models for Scientific Data",
        body: "An informal reading group discussing recent papers on diffusion models applied to scientific datasets. Bring one question you would like to discuss.",
        status: "published",
        pinned: false,
        publishAt: "",
        eventAt: "2026-11-05T16:00",
        venue: "CILab Room 204",
        poster: "",
        extraFields: [],
        createdAt: "2026-10-14T08:00:00.000Z",
        updatedAt: "2026-10-14T08:00:00.000Z",
        author,
    },
];

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string | string[] | undefined }>;
}) {
    const { notice } = await searchParams;
    const activeNoticeId = typeof notice === "string" ? notice : undefined;
    const notices = sample; // await getAnnouncements();

    return (
        <main>
            <NewsNotices notices={notices} activeNoticeId={activeNoticeId} />
        </main>
    );
}