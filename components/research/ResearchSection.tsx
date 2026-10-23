"use client";

// components/resources/Resources.tsx
// Research papers + presentations, shown as two separate paginated card grids with search.
// deps (already installed): motion, lucide-react, date-fns

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchResearch } from "@/lib/api/research";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import {
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    Lock,
    Presentation as PresentationIcon,
    Search,
    Share2,
    Unlock,
    Video,
    X,
    type LucideIcon,
} from "lucide-react";

/** Maximum cards per page, per section. */
const PAGE_SIZE = 12;

const ease = [0.22, 1, 0.36, 1] as const;

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

/* -------------------------------------------------------------------------- */
/*                                   helpers                                  */
/* -------------------------------------------------------------------------- */

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171" }, // olive
    { from: "#EAF0E5", to: "#8FA382" }, // dark green
    { from: "#F1EFE1", to: "#88864F" }, // deep olive
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tokenize = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);

const presentationYear = (p: Presentation) => Number.parseInt(p.date.slice(0, 4), 10);

const formatDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? iso : format(d, "MMM d, yyyy");
};

/** 1 … 4 5 6 … 12 style page list. */
function pageItems(page: number, pages: number): (number | "…")[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const set = new Set<number>([1, pages, page - 1, page, page + 1]);
    if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
    if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach((n) => set.add(n));
    const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    nums.forEach((n, i) => {
        if (i > 0 && n - nums[i - 1] > 1) out.push("…");
        out.push(n);
    });
    return out;
}

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
    if (tokens.length === 0) return <>{text}</>;
    const re = new RegExp(`(${tokens.map(escapeRe).join("|")})`, "ig");
    return (
        <>
            {text.split(re).map((part, i) =>
                i % 2 === 1 ? (
                    <mark key={i} className="rounded-sm bg-[#A3A171]/35 px-0.5 text-inherit">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    card                                    */
/* -------------------------------------------------------------------------- */

function ResearchCard({
    index,
    tokens,
    topic,
    year,
    title,
    byline,
    meta,
    badge,
    shareText,
    openLabel,
    onOpen,
}: {
    index: number;
    tokens: string[];
    topic: string;
    year: number;
    title: string;
    byline: string;
    meta: string;
    badge?: ReactNode;
    shareText: string;
    openLabel: string;
    onOpen: () => void;
}) {
    const tint = TINTS[index % TINTS.length];
    const [copied, setCopied] = useState(false);

    const share = () => {
        navigator.clipboard?.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: Math.min((index % 4) * 0.08, 0.24), ease }}
            whileHover={{ y: -8 }}
            className="group w-full rounded-[28px] bg-neutral-100 p-2.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]"
        >
            {/* gradient panel */}
            <div
                className="relative h-52.5 overflow-hidden rounded-[22px] ring-1 ring-black/5"
                style={{ background: `linear-gradient(135deg, ${tint.from} 0%, ${tint.to} 100%)` }}
            >
                <span className="absolute left-3.5 top-5.5 max-w-[60%] truncate rounded-full bg-white/60 px-3 py-1 text-[11px] font-medium text-neutral-800 backdrop-blur-md">
                    <Highlight text={topic} tokens={tokens} />
                </span>

                <button
                    type="button"
                    aria-label="Copy title"
                    onClick={share}
                    className="absolute right-3.5 top-3.5 grid size-10 place-items-center rounded-xl border border-white/60 bg-white/40 text-neutral-900 backdrop-blur-md transition hover:bg-white/70"
                >
                    {copied ? <Check className="size-4.5 text-emerald-700" /> : <Share2 className="size-4.5" />}
                </button>

                <span className="absolute -bottom-4 left-3 select-none text-[76px] font-bold leading-none tracking-tighter text-white/40">
                    <Highlight text={String(year)} tokens={tokens} />
                </span>

                <p className="absolute inset-x-4 top-1/2 line-clamp-3 -translate-y-1/2 text-[15px] font-semibold leading-snug text-neutral-900/80">
                    <Highlight text={title} tokens={tokens} />
                </p>

                {badge && <div className="absolute bottom-3.5 right-3.5">{badge}</div>}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
                <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-neutral-900">
                        <Highlight text={byline} tokens={tokens} />
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                        <Highlight text={meta} tokens={tokens} />
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onOpen}
                    aria-label={openLabel}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                >
                    <BookOpen className="size-3.5" />
                </button>
            </div>
        </motion.article>
    );
}

const pill =
    "inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-800 backdrop-blur-md";

/* -------------------------------------------------------------------------- */
/*                                pagination UI                               */
/* -------------------------------------------------------------------------- */

function Pagination({
    id,
    label,
    page,
    pages,
    onChange,
}: {
    id: string;
    label: string;
    page: number;
    pages: number;
    onChange: (p: number) => void;
}) {
    const arrow =
        "grid size-10 place-items-center rounded-full text-neutral-600 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-35";

    return (
        <nav aria-label={`${label} pagination`} className="mt-12 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/80 p-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className={arrow}
                >
                    <ChevronLeft className="size-4" />
                </button>

                {pageItems(page, pages).map((item, i) =>
                    item === "…" ? (
                        <span key={`gap-${i}`} className="grid size-10 place-items-center text-sm text-neutral-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onChange(item)}
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? "page" : undefined}
                            className="relative grid size-10 place-items-center rounded-full text-sm font-medium"
                        >
                            {item === page && (
                                <motion.span
                                    layoutId={`${id}-page-pill`}
                                    className="absolute inset-0 rounded-full bg-neutral-900"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span
                                className={`relative transition-colors ${item === page ? "text-white" : "text-neutral-600 hover:text-neutral-900"
                                    }`}
                            >
                                {item}
                            </span>
                        </button>
                    )
                )}

                <button
                    type="button"
                    aria-label="Next page"
                    disabled={page === pages}
                    onClick={() => onChange(page + 1)}
                    className={arrow}
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
            <p className="text-xs text-neutral-500">
                Page {page} of {pages}
            </p>
        </nav>
    );
}

/* -------------------------------------------------------------------------- */
/*                         generic searchable / paged grid                    */
/* -------------------------------------------------------------------------- */

function ResearchSection<T extends { id: string }>({
    id,
    title,
    description,
    noun,
    items,
    searchText,
    searchPlaceholder,
    renderCard,
}: {
    id: string;
    title: string;
    description: string;
    /** singular noun, e.g. "paper" */
    noun: string;
    items: T[];
    searchText: (item: T) => string;
    searchPlaceholder: string;
    renderCard: (item: T, index: number, tokens: string[]) => ReactNode;
}) {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const top = useRef<HTMLDivElement>(null);

    const tokens = useMemo(() => tokenize(query), [query]);

    // every word typed must match somewhere in the item
    const filtered = useMemo(() => {
        if (tokens.length === 0) return items;
        return items.filter((item) => {
            const hay = searchText(item).toLowerCase();
            return tokens.every((t) => hay.includes(t));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, tokens]);

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);
    const plural = (n: number) => (n === 1 ? noun : `${noun}s`);

    const goTo = (p: number) => {
        setPage(p);
        top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div id={id} ref={top} className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6">
            {/* header */}
            <div className="flex flex-col gap-6 border-b border-neutral-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{title}</h2>
                    <p className="mt-2 text-sm text-neutral-600 sm:text-base">{description}</p>
                </div>

                {/* search */}
                <div className="relative w-full lg:w-96">
                    <Search
                        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                        aria-hidden
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        placeholder={searchPlaceholder}
                        aria-label={`Search ${noun}s`}
                        className="h-12 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-11 text-sm text-neutral-900 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-neutral-400 focus:border-[#716f49] focus:ring-2 focus:ring-[#716f49]/20 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => {
                                setQuery("");
                                setPage(1);
                            }}
                            className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* results bar */}
            <p className="mt-5 text-sm text-neutral-600" aria-live="polite">
                {filtered.length > 0 ? (
                    <>
                        Showing{" "}
                        <span className="font-semibold text-neutral-900">
                            {start + 1}–{start + visible.length}
                        </span>{" "}
                        of <span className="font-semibold text-neutral-900">{filtered.length}</span>{" "}
                        {plural(filtered.length)}
                        {tokens.length > 0 && (
                            <>
                                {" "}
                                for <span className="font-semibold text-neutral-900">&ldquo;{query.trim()}&rdquo;</span>
                            </>
                        )}
                    </>
                ) : (
                    `No ${noun}s found`
                )}
            </p>

            {/* grid */}
            {filtered.length > 0 ? (
                <motion.div
                    key={`${current}-${query}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {visible.map((item, i) => (
                        <div key={item.id}>{renderCard(item, start + i, tokens)}</div>
                    ))}
                </motion.div>
            ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#F3F2E8] text-[#716f49]">
                        <Search className="size-5" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-neutral-900">
                        {items.length === 0 ? `No ${noun}s have been published yet.` : `No ${noun}s match your search.`}
                    </p>
                    {items.length > 0 && (
                        <>
                            <p className="mt-1 text-xs text-neutral-500">Try a different keyword, author, topic or year.</p>
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="mt-5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-700"
                            >
                                Clear search
                            </button>
                        </>
                    )}
                </div>
            )}

            {pages > 1 && <Pagination id={id} label={title} page={current} pages={pages} onChange={goTo} />}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                detail modal                                */
/* -------------------------------------------------------------------------- */

interface ModalData {
    eyebrow: string;
    title: string;
    byline: string;
    sub?: string;
    body: string;
    note?: string;
    actions: { label: string; href?: string; icon: LucideIcon; primary?: boolean }[];
}

function DetailModal({ data, onClose }: { data: ModalData | null; onClose: () => void }) {
    useEffect(() => {
        if (!data) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [data, onClose]);

    return (
        <AnimatePresence>
            {data && (
                <motion.div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={data.title}
                        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                        >
                            <X className="size-4" />
                        </button>

                        <p className="pr-10 text-xs font-medium uppercase tracking-wider text-neutral-500">{data.eyebrow}</p>
                        <h3 className="mt-2 pr-8 text-xl font-semibold leading-snug text-neutral-900">{data.title}</h3>
                        <p className="mt-3 text-sm text-sky-800">{data.byline}</p>
                        {data.sub && <p className="mt-1 text-sm text-neutral-600">{data.sub}</p>}
                        <p className="mt-5 text-sm leading-relaxed text-neutral-700">{data.body}</p>

                        {data.note && (
                            <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#F3F2E8] px-3.5 py-2.5 text-xs text-[#716f49]">
                                <Lock className="size-3.5 shrink-0" />
                                {data.note}
                            </p>
                        )}

                        {data.actions.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {data.actions.map((a) => {
                                    const AIcon = a.icon;
                                    const external = a.href?.startsWith("http");
                                    return (
                                        <a
                                            key={a.label}
                                            href={a.href ?? "#"}
                                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                            className={
                                                a.primary
                                                    ? "flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
                                                    : "flex items-center gap-2 rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                                            }
                                        >
                                            <AIcon className="size-4" /> {a.label}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const paperModal = (p: Paper): ModalData => ({
    eyebrow: `${p.type} · ${p.year} · ${p.publisher}`,
    title: p.title,
    byline: p.authors.join("; "),
    sub: p.venue,
    body: p.abstract ?? "No abstract available.",
    note: p.access === "locked" ? "Full text requires a publisher subscription or institutional access." : undefined,
    actions: [
        ...(p.pdfUrl ? [{ label: "PDF", href: p.pdfUrl, icon: FileText, primary: true }] : []),
        ...(p.htmlUrl ? [{ label: "HTML", href: p.htmlUrl, icon: BookOpen }] : []),
    ],
});

const presentationModal = (p: Presentation): ModalData => ({
    eyebrow: `${p.type} · ${formatDate(p.date)}`,
    title: p.title,
    byline: p.speakers.join("; "),
    sub: [p.event, p.location].filter(Boolean).join(" · "),
    body: p.abstract ?? "No abstract available.",
    actions: [
        ...(p.slidesUrl ? [{ label: "Slides", href: p.slidesUrl, icon: PresentationIcon, primary: true }] : []),
        ...(p.videoUrl ? [{ label: "Recording", href: p.videoUrl, icon: Video }] : []),
    ],
});

/* -------------------------------------------------------------------------- */
/*                                   section                                  */
/* -------------------------------------------------------------------------- */

export default function Researchs() {
    const [modal, setModal] = useState<ModalData | null>(null);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [presentations, setPresentations] = useState<Presentation[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const closeModal = () => setModal(null);

    useEffect(() => {
        let active = true;

        fetchResearch()
            .then(({ papers: fetchedPapers, presentations: fetchedPresentations }) => {
                if (!active) return;
                setPapers(fetchedPapers);
                setPresentations(fetchedPresentations);
            })
            .catch((error: unknown) => {
                if (!active) return;
                setLoadError(error instanceof Error ? error.message : "Unable to load research.");
            });

        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-32">
            {/* ambient background: soft olive glow + fading dot grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-105 w-205 -translate-x-1/2 rounded-full bg-[#A3A171]/25 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.14]"
                    style={{
                        backgroundImage: "radial-gradient(#716f49 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        maskImage: "radial-gradient(ellipse 70% 45% at 50% 0%, #000, transparent)",
                        WebkitMaskImage: "radial-gradient(ellipse 70% 45% at 50% 0%, #000, transparent)",
                    }}
                />
            </div>

            <div className="relative">
                {loadError && (
                    <p className="mx-auto max-w-7xl px-4 text-sm text-red-700 sm:px-6" role="alert">
                        {loadError}
                    </p>
                )}
                {/* page heading */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease }}
                    className="mx-auto max-w-3xl px-4 text-center"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                        Explore Research That Shapes <span className="text-[#716f49]">Intelligent Systems</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
                        Browse our peer-reviewed papers and presentations across machine learning, computer vision,
                        cybersecurity and blockchain. Search by title, author, topic or year.
                    </p>
                </motion.div>

                {/* research papers */}
                <div className="mt-16">
                    <ResearchSection<Paper>
                        id="research-papers"
                        title="Research Papers"
                        description="Journal articles, conference papers and early-access publications from our lab."
                        noun="paper"
                        items={papers}
                        searchPlaceholder="Search title, author, venue, topic or year…"
                        searchText={(p) =>
                            [p.title, p.authors.join(" "), p.venue, p.topic, p.type, p.publisher, p.year].join(" ")
                        }
                        renderCard={(p, i, tokens) => (
                            <ResearchCard
                                index={i}
                                tokens={tokens}
                                topic={p.topic}
                                year={p.year}
                                title={p.title}
                                byline={`${p.authors[0]}${p.authors.length > 1 ? " et al." : ""}`}
                                meta={`${p.type} · Cited by ${p.citedBy}`}
                                shareText={p.title}
                                openLabel={`View details: ${p.title}`}
                                onOpen={() => setModal(paperModal(p))}
                            />
                        )}
                    />
                </div>

                {/* divider */}
                <div className="mx-auto my-20 h-px max-w-7xl bg-linear-to-r from-transparent via-neutral-300 to-transparent" />

                {/* presentations */}
                <ResearchSection<Presentation>
                    id="presentations"
                    title="Presentations"
                    description="Conference talks, seminars, workshops and keynotes, with slides and recordings."
                    noun="presentation"
                    items={presentations}
                    searchPlaceholder="Search title, speaker, event, topic or year…"
                    searchText={(p) =>
                        [p.title, p.speakers.join(" "), p.event, p.location ?? "", p.topic, p.type, presentationYear(p)].join(
                            " "
                        )
                    }
                    renderCard={(p, i, tokens) => (
                        <ResearchCard
                            index={i}
                            tokens={tokens}
                            topic={p.topic}
                            year={presentationYear(p)}
                            title={p.title}
                            byline={`${p.speakers[0]}${p.speakers.length > 1 ? " et al." : ""}`}
                            meta={`${p.type} · ${p.event}`}
                            shareText={p.title}
                            openLabel={`View details: ${p.title}`}
                            onOpen={() => setModal(presentationModal(p))}
                            badge={
                                p.videoUrl ? (
                                    <span className={pill}>
                                        <Video className="size-3" /> Recording
                                    </span>
                                ) : undefined
                            }
                        />
                    )}
                />
            </div>

            <DetailModal data={modal} onClose={closeModal} />
        </section>
    );
}