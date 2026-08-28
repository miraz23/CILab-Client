import type { AcademicRole } from "@/lib/types/auth/register";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    scholarId: string;
    institution: string;
    role: AcademicRole;
    avatar?: string;
}

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    password?: string;
    scholarId?: string;
    institution?: string;
    role?: AcademicRole;
    avatar?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    user?: UserProfile;
}

export class ProfileApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ProfileApiError";
        this.status = status;
    }
}

async function getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

export async function fetchUserProfile(): Promise<UserProfile> {
    if (!API_BASE_URL) {
        console.warn("NEXT_PUBLIC_SERVER_URL not configured, returning mock profile");
        return getMockProfile();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: "GET",
            headers: await getAuthHeaders(),
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();
        return data.user || data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return getMockProfile();
    }
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    if (!API_BASE_URL) {
        console.warn("NEXT_PUBLIC_SERVER_URL not configured, simulating update");
        return { success: true, message: "Profile updated successfully (mock)" };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: "PUT",
            headers: await getAuthHeaders(),
            body: JSON.stringify(payload),
            credentials: "include",
        });

        let data: UpdateProfileResponse;

        try {
            data = (await response.json()) as UpdateProfileResponse;
        } catch {
            throw new ProfileApiError("Unexpected server response.", response.status);
        }

        if (!response.ok || !data.success) {
            throw new ProfileApiError(data.message ?? "Something went wrong. Please try again.", response.status);
        }

        return data;
    } catch (error) {
        if (error instanceof ProfileApiError) throw error;
        throw new ProfileApiError("Network error. Check your connection and try again.", 0);
    }
}

function getMockProfile(): UserProfile {
    return {
        id: "1",
        name: "Dr. Sarah Chen",
        email: "sarah.chen@university.edu",
        scholarId: "SCH-2024-001",
        institution: "Stanford University",
        role: "Professor",
        avatar: undefined,
    };
}