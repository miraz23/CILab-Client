export type PaperType = "Conference" | "Journal" | "Magazine" | "Early Access";

export interface Paper {
    id: string;
    title: string;
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
    abstract?: string;
    slidesUrl?: string;
    videoUrl?: string;
}

export interface ResearchData {
    papers: Paper[];
    presentations: Presentation[];
}
