export type PaperType = "Conference" | "Journal" | "Magazine" | "Early Access";

export interface Paper {
    id: string;
    title: string;
    featured: boolean;
    authors: string[];
    venue: string;
    year: number;
    type: PaperType;
    publisher: string;
    citedBy: number;
    topic: string;
    access: "open" | "locked";
    abstract?: string;
    htmlUrl?: string;
    pdfUrl?: string;
    /** ISO timestamp the paper was published on the site */
    publishedAt?: string;
    fileSizeMb?: number;
}

export type PresentationType =
    | "Conference Talk"
    | "Seminar"
    | "Workshop"
    | "Keynote"
    | "Poster"
    | "Other";

export interface Presentation {
    id: string;
    title: string;
    speakers: string[];
    event: string;
    location?: string;
    /** ISO date, e.g. "2025-06-14" */
    date: string;
    type: PresentationType;
    topic: string;
    description?: string;
    slidesUrl?: string;
    videoUrl?: string;
    featured?: boolean;
    publishedAt?: string;
    fileSizeMb?: number;
}

export interface ResearchData {
    papers: Paper[];
    presentations: Presentation[];
}
