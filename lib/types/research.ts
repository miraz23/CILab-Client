export type PaperType = "Conference" | "Journal" | "Magazine" | "Early Access" | (string & {});

export interface Paper {
    id: string;
    title: string;
    featured: boolean;
    authors: string[];
    venue: string;
    year: number;
    type: PaperType;
    /** ISO date (YYYY-MM-DD) entered on upload */
    publicationDate?: string;
    publisher: string;
    indexedIn?: string[];
    category?: string;
    tags?: string[];
    citedBy: number;
    topic: string;
    access: "open" | "locked";
    abstract?: string;
    htmlUrl?: string;
    pdfUrl?: string;
    fileName?: string;
    /** ISO timestamp the paper was published on the site */
    publishedAt?: string;
    fileSizeMb?: number;
}

export type PresentationType = string;

export interface Presentation {
    id: string;
    title: string;
    speakers: string[];
    event: string;
    location?: string;
    /** ISO date, e.g. "2025-06-14" */
    date: string;
    /** Kind of presentation, e.g. "Seminar" or "Thesis Proposal" */
    type: PresentationType;
    category?: string;
    tags?: string[];
    topic: string;
    description?: string;
    slidesUrl?: string;
    videoUrl?: string;
    fileName?: string;
    featured?: boolean;
    publishedAt?: string;
    fileSizeMb?: number;
}

export interface ResearchData {
    papers: Paper[];
    presentations: Presentation[];
}
