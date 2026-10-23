import type { Paper, Presentation } from "@/components/research/ResearchSection";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

interface ResearchResponse {
    success: boolean;
    papers: Paper[];
    presentations: Presentation[];
}

export async function fetchResearch(): Promise<Pick<ResearchResponse, "papers" | "presentations">> {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}/api/research`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Unable to load research (HTTP ${response.status}).`);
    }

    const data = (await response.json()) as ResearchResponse;
    if (!data.success || !Array.isArray(data.papers) || !Array.isArray(data.presentations)) {
        throw new Error("The research response was invalid.");
    }

    return { papers: data.papers, presentations: data.presentations };
}
