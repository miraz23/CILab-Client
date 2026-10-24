const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export interface Member {
    id: string;
    name: string;
    email: string;
    scholarId: string;
    institution: string;
    academicRole: string;
    joinedAt: string;
}

interface MembersResponse {
    success: boolean;
    members: Member[];
}

export async function fetchMembers(): Promise<Member[]> {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}/api/members`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Unable to load members (HTTP ${response.status}).`);
    }

    const data = (await response.json()) as MembersResponse;
    if (!data.success || !Array.isArray(data.members)) {
        throw new Error("The members response was invalid.");
    }

    return data.members;
}
