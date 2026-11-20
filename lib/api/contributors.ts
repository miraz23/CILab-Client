import type { Paper, Presentation } from "@/lib/types/research";
import { toPaper, toPresentation, type ResearchUpload } from "@/lib/api/research";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export interface ContributorProfile {
    name: string;
    email: string;
    scholarId: string;
    institution: string;
    role: string;
    avatarUrl?: string | null;
}

export interface ContributorData {
    profile: ContributorProfile;
    papers: Paper[];
    presentations: Presentation[];
}

interface ContributorResponse {
    success: boolean;
    profile: ContributorProfile;
    papers: ResearchUpload[];
    presentations: ResearchUpload[];
}

/** Public, unauthenticated. Resolves to null when the link is invalid or sharing was turned off. */
export async function fetchContributor(token: string): Promise<ContributorData | null> {
    if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const response = await fetch(`${API_BASE_URL}/api/contributors/${encodeURIComponent(token)}`, {
        cache: "no-store",
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Unable to load contributions (HTTP ${response.status}).`);

    const data = (await response.json()) as ContributorResponse;
    return {
        profile: data.profile,
        papers: data.papers.map(toPaper),
        presentations: data.presentations.map(toPresentation),
    };
}

/* ------------------------- owner: manage the share link ------------------------- */

export class ShareApiError extends Error {}

async function shareRequest(method: "GET" | "POST" | "DELETE"): Promise<string | null> {
    if (!API_BASE_URL) throw new ShareApiError("NEXT_PUBLIC_SERVER_URL is not configured.");

    const token = localStorage.getItem("token");
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/api/profile/share`, {
            method,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: "include",
        });
    } catch {
        throw new ShareApiError("Network error. Check your connection and try again.");
    }

    const data = (await response.json().catch(() => null)) as { token?: string | null; message?: string } | null;
    if (!response.ok) throw new ShareApiError(data?.message ?? "Something went wrong. Please try again.");
    return data?.token ?? null;
}

export const getShareToken = () => shareRequest("GET");
export const createShareToken = () => shareRequest("POST");
export const revokeShareToken = () => shareRequest("DELETE");

export const contributorPath = (token: string) => `/contributors/${token}`;
