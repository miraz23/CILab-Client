import type { Paper, Presentation, ResearchData } from "@/lib/types/research";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

type MetadataValue = string | string[] | boolean | undefined;

/** One record exactly as the server returns it (same shape as /api/uploads). */
export interface ResearchUpload {
    id: string;
    upload_type: "paper" | "presentation";
    title: string;
    metadata: Record<string, MetadataValue>;
    original_filename: string;
    mime_type: string;
    file_size: string | number;
    cloudinary_url: string;
    status: string;
    created_at: string;
    author_name?: string;
}

interface ResearchResponse {
    success: boolean;
    papers: ResearchUpload[];
    presentations: ResearchUpload[];
}

const text = (value: MetadataValue) => (typeof value === "string" ? value.trim() : "");

const list = (value: MetadataValue) =>
    Array.isArray(value)
        ? value.map((item) => String(item).trim()).filter(Boolean)
        : text(value).split(",").map((item) => item.trim()).filter(Boolean);

const sizeMb = (upload: ResearchUpload) => Number((Number(upload.file_size) / 1024 / 1024).toFixed(2));

function toPaper(upload: ResearchUpload): Paper {
    const m = upload.metadata ?? {};
    const authors = list(m.authors_name);
    const category = text(m.paper_category);
    const tags = list(m.paper_tags);
    const publicationDate = text(m.publication_date);
    return {
        id: upload.id,
        title: upload.title,
        featured: m.is_featured === true,
        authors: authors.length ? authors : [upload.author_name ?? "Unknown author"],
        venue: text(m.publication_venue),
        year: new Date(publicationDate || upload.created_at).getFullYear(),
        publicationDate: publicationDate || undefined,
        type: text(m.publication_type) || "Journal",
        publisher: text(m.publisher),
        indexedIn: list(m.indexed_in),
        category,
        tags,
        topic: category || tags.join(", "),
        citedBy: 0,
        access: "open",
        abstract: text(m.paper_abstract) || undefined,
        htmlUrl: text(m.paper_url) || undefined,
        pdfUrl: `${API_BASE_URL}${upload.cloudinary_url}`,
        fileName: upload.original_filename,
        publishedAt: upload.created_at,
        fileSizeMb: sizeMb(upload),
    };
}

function toPresentation(upload: ResearchUpload): Presentation {
    const m = upload.metadata ?? {};
    const speakers = list(m.presenter_name);
    const category = text(m.presentation_category);
    const tags = list(m.presentation_tags);
    return {
        id: upload.id,
        title: upload.title,
        speakers: speakers.length ? speakers : [upload.author_name ?? "Unknown speaker"],
        event: text(m.event_name) || text(m.presentation_event),
        type: text(m.presentation_event) || "Other",
        date: text(m.presentation_date) || new Date(upload.created_at).toISOString().slice(0, 10),
        category,
        tags,
        topic: category || tags.join(", "),
        description: text(m.presentation_description) || undefined,
        slidesUrl: `${API_BASE_URL}${upload.cloudinary_url}`,
        videoUrl: text(m.paper_url) || undefined,
        fileName: upload.original_filename,
        publishedAt: upload.created_at,
        fileSizeMb: sizeMb(upload),
    };
}

/** Shared in-flight request so papers + presentations sections reuse one fetch. */
let inFlight: { query: string; promise: Promise<ResearchData> } | null = null;

async function requestResearch(query: string): Promise<ResearchData> {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");
    }

    const endpoint = query
        ? `${API_BASE_URL}/api/research/search?q=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/research`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Unable to load research (HTTP ${response.status}).`);
    }

    const data = (await response.json()) as ResearchResponse;
    if (!data.success || !Array.isArray(data.papers) || !Array.isArray(data.presentations)) {
        throw new Error("The research response was invalid.");
    }

    return { papers: data.papers.map(toPaper), presentations: data.presentations.map(toPresentation) };
}

export function fetchResearch(query = ""): Promise<ResearchData> {
    if (!inFlight || inFlight.query !== query) {
        const promise = requestResearch(query).finally(() => {
            if (inFlight?.promise === promise) inFlight = null;
        });
        inFlight = { query, promise };
    }

    return inFlight.promise;
}
