import { DEFAULT_APP_ROLE } from "@/lib/types/admin/role";
import type {
    ManagedUser,
    ManagedUserFilters,
    ManagedUsersResponse,
    UpdateUserAccessPayload,
} from "@/lib/types/admin/user";

export async function fetchManagedUsers(
    filters: ManagedUserFilters = {}
): Promise<ManagedUser[]> {
    return filterMockUsers(filters);
}

export async function updateUserAccess(
    payload: UpdateUserAccessPayload
): Promise<ManagedUsersResponse> {
    return {
        success: true,
        message: `Access updated for ${payload.userId}.`,
    };
}

export async function fetchManagedUserById(
    userId: string
): Promise<ManagedUser | null> {
    return getMockUsers().find((user) => user.id === userId) ?? null;
}

function filterMockUsers(filters: ManagedUserFilters): ManagedUser[] {
    let users = getMockUsers();

    const search = filters.search?.trim().toLowerCase();

    if (search) {
        users = users.filter((user) =>
            [user.name, user.email, user.institution, user.scholarId].some(
                (value) => value.toLowerCase().includes(search)
            )
        );
    }

    if (filters.status && filters.status !== "all") {
        users = users.filter((user) => user.status === filters.status);
    }

    if (filters.appRole && filters.appRole !== "all") {
        users = users.filter((user) => user.appRole === filters.appRole);
    }

    if (filters.academicRole && filters.academicRole !== "all") {
        users = users.filter((user) => user.academicRole === filters.academicRole);
    }

    switch (filters.sort) {
        case "name":
            return [...users].sort((a, b) => a.name.localeCompare(b.name));
        case "active":
            return [...users].sort((a, b) => {
                const left = a.lastActiveAt ? Date.parse(a.lastActiveAt) : 0;
                const right = b.lastActiveAt ? Date.parse(b.lastActiveAt) : 0;

                return right - left;
            });
        default:
            return [...users].sort(
                (a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt)
            );
    }
}

function getMockUsers(): ManagedUser[] {
    return [
        {
            id: "u-1",
            name: "Dr. Sarah Chen",
            email: "sarah.chen@university.edu",
            scholarId: "SCH-2024-001",
            institution: "Stanford University",
            academicRole: "Professor",
            appRole: "ADMIN",
            status: "active",
            joinedAt: "2024-01-15T09:00:00Z",
            lastActiveAt: "2026-09-25T16:40:00Z",
            papersCount: 42,
            presentationsCount: 18,
        },
        {
            id: "u-2",
            name: "Dr. Marcus Reid",
            email: "marcus.reid@lab.org",
            scholarId: "SCH-2024-014",
            institution: "MIT",
            academicRole: "Assistant Professor",
            appRole: DEFAULT_APP_ROLE,
            status: "active",
            joinedAt: "2024-03-02T09:00:00Z",
            lastActiveAt: "2026-09-24T11:05:00Z",
            papersCount: 17,
            presentationsCount: 9,
        },
        {
            id: "u-3",
            name: "Alex Rivera",
            email: "alex.rivera@lab.org",
            scholarId: "SCH-2025-102",
            institution: "MIT",
            academicRole: "PhD Student",
            appRole: DEFAULT_APP_ROLE,
            status: "active",
            joinedAt: "2025-09-01T09:00:00Z",
            lastActiveAt: "2026-09-25T08:20:00Z",
            papersCount: 6,
            presentationsCount: 11,
        },
        {
            id: "u-4",
            name: "Priya Sharma",
            email: "priya.sharma@research.institute",
            scholarId: "SCH-2025-118",
            institution: "Google Research",
            academicRole: "Research Scientist",
            appRole: DEFAULT_APP_ROLE,
            status: "pending",
            joinedAt: "2026-09-18T13:30:00Z",
            papersCount: 3,
            presentationsCount: 1,
        },
        {
            id: "u-5",
            name: "Daniel Okafor",
            email: "daniel.okafor@company.com",
            scholarId: "SCH-2025-131",
            institution: "Independent",
            academicRole: "Independent Researcher",
            appRole: DEFAULT_APP_ROLE,
            status: "pending",
            joinedAt: "2026-09-21T10:15:00Z",
            papersCount: 1,
            presentationsCount: 0,
        },
        {
            id: "u-6",
            name: "Mei Lin",
            email: "mei.lin@university.edu",
            scholarId: "SCH-2024-045",
            institution: "Tsinghua University",
            academicRole: "Master's Student",
            appRole: DEFAULT_APP_ROLE,
            status: "suspended",
            joinedAt: "2024-11-11T09:00:00Z",
            lastActiveAt: "2026-07-02T14:00:00Z",
            papersCount: 2,
            presentationsCount: 4,
        },
        {
            id: "u-7",
            name: "Lucas Moreau",
            email: "lucas.moreau@lab.org",
            scholarId: "SCH-2025-147",
            institution: "ETH Zurich",
            academicRole: "Postdoctoral Researcher",
            appRole: DEFAULT_APP_ROLE,
            status: "active",
            joinedAt: "2025-12-04T09:00:00Z",
            lastActiveAt: "2026-09-19T09:45:00Z",
            papersCount: 9,
            presentationsCount: 5,
        },
        {
            id: "u-8",
            name: "Dr. Hana Sato",
            email: "hana.sato@university.edu",
            scholarId: "SCH-2023-007",
            institution: "University of Tokyo",
            academicRole: "Professor",
            appRole: "ADMIN",
            status: "active",
            joinedAt: "2023-08-22T09:00:00Z",
            lastActiveAt: "2026-09-22T06:30:00Z",
            papersCount: 58,
            presentationsCount: 22,
        },
    ];
}
