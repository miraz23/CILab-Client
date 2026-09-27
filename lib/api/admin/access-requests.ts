import type {
    OversightAccessRequest,
    OversightAccessRequestFilters,
    OversightAccessRequestsResponse,
    OversightDecisionPayload,
} from "@/lib/types/admin/access-request";

export async function fetchOversightAccessRequests(
    filters: OversightAccessRequestFilters = {}
): Promise<OversightAccessRequest[]> {
    return filterMockRequests(filters);
}

export async function submitOversightDecision(
    payload: OversightDecisionPayload
): Promise<OversightAccessRequestsResponse> {
    return {
        success: true,
        message: `Access request ${payload.requestId} ${payload.decision}.`,
    };
}

function filterMockRequests(
    filters: OversightAccessRequestFilters
): OversightAccessRequest[] {
    let requests = getMockRequests();

    if (filters.status && filters.status !== "all") {
        requests = requests.filter((request) => request.status === filters.status);
    }

    const search = filters.search?.trim().toLowerCase();

    if (search) {
        requests = requests.filter((request) =>
            [
                request.requester.name,
                request.requester.email,
                request.owner.name,
                request.owner.email,
            ].some((value) => value.toLowerCase().includes(search))
        );
    }

    return [...requests].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
}

function getMockRequests(): OversightAccessRequest[] {
    return [
        {
            id: "r-1",
            requester: {
                id: "u-3",
                name: "Alex Rivera",
                email: "alex.rivera@lab.org",
                academicRole: "PhD Student",
                institution: "MIT",
            },
            owner: {
                id: "u-1",
                name: "Dr. Sarah Chen",
                email: "sarah.chen@university.edu",
                academicRole: "Professor",
                institution: "Stanford University",
            },
            shareLink: "https://drive.google.com/file/d/1abc123/view",
            message: "Sharing the ablation tables for the GNN reproducibility study.",
            expiresAt: "2026-10-15",
            status: "pending",
            createdAt: "2026-09-25T09:30:00Z",
        },
        {
            id: "r-2",
            requester: {
                id: "u-6",
                name: "Mei Lin",
                email: "mei.lin@university.edu",
                academicRole: "Master's Student",
                institution: "Tsinghua University",
            },
            owner: {
                id: "u-7",
                name: "Lucas Moreau",
                email: "lucas.moreau@lab.org",
                academicRole: "Postdoctoral Researcher",
                institution: "ETH Zurich",
            },
            shareLink: "https://arxiv.org/abs/2026.12345",
            message: "Could I use the checkpoint files for my thesis benchmark?",
            status: "accepted",
            createdAt: "2026-09-18T14:20:00Z",
            decidedAt: "2026-09-19T08:15:00Z",
        },
        {
            id: "r-3",
            requester: {
                id: "u-4",
                name: "Priya Sharma",
                email: "priya.sharma@research.institute",
                academicRole: "Research Scientist",
                institution: "Google Research",
            },
            owner: {
                id: "u-8",
                name: "Dr. Hana Sato",
                email: "hana.sato@university.edu",
                academicRole: "Professor",
                institution: "University of Tokyo",
            },
            shareLink: "https://example.com/paper/ml-optimization",
            message: "Referencing the optimisation techniques we discussed.",
            expiresAt: "2026-08-25",
            status: "expired",
            createdAt: "2026-08-15T11:00:00Z",
            decidedAt: "2026-08-16T16:30:00Z",
        },
        {
            id: "r-4",
            requester: {
                id: "u-5",
                name: "Daniel Okafor",
                email: "daniel.okafor@company.com",
                academicRole: "Independent Researcher",
                institution: "Independent",
            },
            owner: {
                id: "u-2",
                name: "Dr. Marcus Reid",
                email: "marcus.reid@lab.org",
                academicRole: "Assistant Professor",
                institution: "MIT",
            },
            shareLink: "https://github.com/user/rl-paper",
            message: "Reinforcement Learning research paper with code.",
            status: "pending",
            createdAt: "2026-09-22T09:45:00Z",
        },
        {
            id: "r-5",
            requester: {
                id: "u-7",
                name: "Lucas Moreau",
                email: "lucas.moreau@lab.org",
                academicRole: "Postdoctoral Researcher",
                institution: "ETH Zurich",
            },
            owner: {
                id: "u-1",
                name: "Dr. Sarah Chen",
                email: "sarah.chen@university.edu",
                academicRole: "Professor",
                institution: "Stanford University",
            },
            shareLink: "https://drive.google.com/file/d/1xyz789/view",
            message: "Requesting access to the raw multimodal corpus.",
            status: "revoked",
            createdAt: "2026-09-02T12:00:00Z",
            decidedAt: "2026-09-11T10:40:00Z",
            adminNote: "Access revoked: data-sharing agreement expired.",
        },
    ];
}
