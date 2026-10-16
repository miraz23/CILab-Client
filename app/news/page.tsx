// app/news/page.tsx

import NewsNotices, { Notice } from "@/components/news/NewsSection";


// TODO: replace with your real admin-managed data, e.g.
//
// async function getNotices(): Promise<Notice[]> {
//   const res = await fetch(`${process.env.API_URL}/notices?status=published`, {
//     next: { revalidate: 60 }, // refresh at most once a minute
//   });
//   if (!res.ok) return [];
//   return res.json();
// }

// SAMPLE DATA
const sample: Notice[] = [
    {
        id: "n1",
        title: "Weekly Research Seminar: Graph Neural Networks in Practice",
        summary:
            "This week's seminar explores how graph neural networks are applied to real-world molecular and social network datasets, including practical guidance on training, evaluation and common pitfalls. Open to all lab members and visiting researchers.",
        category: "Seminar",
        date: "2026-10-20",
        pinned: false,
        status: "published",
    },
    {
        id: "n2",
        title: "Call for Papers: Lab Symposium on Intelligent Systems 2027",
        summary:
            "Submissions are now open for the Lab Symposium on Intelligent Systems 2027. Send abstracts by 28 September 2026 and full papers one week later; accepted works will be presented in the symposium track.",
        category: "Deadline",
        date: "2026-09-28",
        pinned: true,
        status: "published",
    },
    {
        id: "n3",
        title: "New GPU Cluster Access Policy for Researchers",
        summary:
            "The updated access policy introduces tiered quotas, a new booking window for long-running jobs and priority scheduling for externally funded projects. Existing allocations will be migrated automatically.",
        category: "General",
        date: "2026-10-05",
        pinned: true,
        status: "published",
    },
    {
        id: "n4",
        title: "Thesis Defense Schedule for the Autumn Semester",
        summary:
            "Defense slots for the autumn semester are now open. PhD candidates should confirm their preferred date with the graduate office before the end of the week.",
        category: "Academic",
        date: "2026-10-12",
        pinned: false,
        status: "published",
    },
    {
        id: "n5",
        title: "Guest Lecture on Federated Learning and Privacy",
        summary:
            "The guest lecture covers privacy-preserving federated learning, secure aggregation and differential privacy in cross-silo settings, followed by an open Q&A session.",
        category: "Lecture",
        date: "2026-10-14",
        pinned: false,
        status: "published",
    },
    {
        id: "n6",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n7",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n8",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n9",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n10",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n11",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n12",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n13",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n14",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n15",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n16",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
    {
        id: "n17",
        title: "Lab Meeting Moved to Thursday 3 PM",
        summary:
            "This week's lab meeting moves to Thursday at 3 PM in the main seminar room. The agenda is unchanged and the remote attendance link stays the same.",
        category: "General",
        date: "2026-10-15",
        pinned: false,
        status: "published",
    },
];

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string | string[] | undefined }>;
}) {
    const { notice } = await searchParams;
    const activeNoticeId = typeof notice === "string" ? notice : undefined;
    const notices = sample; // await getNotices();
    return (
        <main>
            <NewsNotices notices={notices} activeNoticeId={activeNoticeId} />
        </main>
    );
}