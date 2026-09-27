import type {
    ModerationDecisionPayload,
    ModerationFilters,
    ModerationQueueResponse,
    ModerationSubmission,
} from "@/lib/types/admin/moderation";

export async function fetchModerationQueue(
    filters: ModerationFilters = {}
): Promise<ModerationSubmission[]> {
    return filterMockSubmissions(filters);
}

export async function submitModerationDecision(
    payload: ModerationDecisionPayload
): Promise<ModerationQueueResponse> {
    return {
        success: true,
        message: `Submission ${payload.submissionId} ${payload.decision}.`,
    };
}

function filterMockSubmissions(filters: ModerationFilters): ModerationSubmission[] {
    let submissions = getMockSubmissions();

    if (filters.contentType && filters.contentType !== "all") {
        submissions = submissions.filter(
            (submission) => submission.contentType === filters.contentType
        );
    }

    if (filters.status && filters.status !== "all") {
        submissions = submissions.filter(
            (submission) => submission.status === filters.status
        );
    }

    const search = filters.search?.trim().toLowerCase();

    if (search) {
        submissions = submissions.filter((submission) =>
            [submission.title, submission.category, submission.author.name].some(
                (value) => value.toLowerCase().includes(search)
            )
        );
    }

    return [...submissions].sort(
        (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt)
    );
}

function getMockSubmissions(): ModerationSubmission[] {
    return [
        {
            id: "m-1",
            contentType: "paper",
            title: "Sparse Attention Routing for Long-Context Transformers",
            category: "Natural Language Processing",
            author: {
                id: "u-3",
                name: "Alex Rivera",
                academicRole: "PhD Student",
                institution: "MIT",
            },
            fileUrl: "https://arxiv.org/abs/2026.12345",
            fileSizeMb: 3.2,
            submittedAt: "2026-09-24T10:12:00Z",
            status: "pending",
        },
        {
            id: "m-2",
            contentType: "presentation",
            title: "Weekly Lab Seminar: Diffusion Models for Tabular Data",
            category: "Lab Seminar",
            author: {
                id: "u-7",
                name: "Lucas Moreau",
                academicRole: "Postdoctoral Researcher",
                institution: "ETH Zurich",
            },
            fileUrl: "https://example.com/slides/diffusion-tabular",
            fileSizeMb: 12.8,
            submittedAt: "2026-09-23T15:40:00Z",
            status: "pending",
        },
        {
            id: "m-3",
            contentType: "paper",
            title: "Certified Robustness for Graph Neural Networks",
            category: "Graph Neural Networks",
            author: {
                id: "u-1",
                name: "Dr. Sarah Chen",
                academicRole: "Professor",
                institution: "Stanford University",
            },
            fileUrl: "https://arxiv.org/abs/2026.09911",
            fileSizeMb: 5.6,
            submittedAt: "2026-09-20T08:05:00Z",
            status: "approved",
            reviewNote: "Methodology is sound. Approved for the lab archive.",
            reviewedAt: "2026-09-21T09:12:00Z",
        },
        {
            id: "m-4",
            contentType: "presentation",
            title: "Guest Lecture: Scaling Deep Learning Research",
            category: "Guest Lecture",
            author: {
                id: "u-2",
                name: "Dr. Marcus Reid",
                academicRole: "Assistant Professor",
                institution: "MIT",
            },
            fileUrl: "https://example.com/slides/scaling-dl",
            fileSizeMb: 9.1,
            submittedAt: "2026-09-18T13:22:00Z",
            status: "rejected",
            reviewNote: "Missing ethics disclosure section. Please resubmit.",
            reviewedAt: "2026-09-19T10:00:00Z",
        },
        {
            id: "m-5",
            contentType: "paper",
            title: "Federated Learning Under Heterogeneous Consent",
            category: "Responsible AI",
            author: {
                id: "u-4",
                name: "Priya Sharma",
                academicRole: "Research Scientist",
                institution: "Google Research",
            },
            fileUrl: "https://example.com/paper/federated-consent",
            fileSizeMb: 4.4,
            submittedAt: "2026-09-16T07:58:00Z",
            status: "pending",
        },
    ];
}
