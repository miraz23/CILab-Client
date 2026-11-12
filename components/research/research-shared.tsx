"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import {
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    Link,
    Lock,
    Presentation as PresentationIcon,
    Search,
    Share2,
    X,
    type LucideIcon,
} from "lucide-react";
import { loadPdfThumb } from "@/lib/pdf-thumb";
import type { Paper, Presentation } from "@/lib/types/research";
import { ResearchGridSkeleton, ResearchResultsSkeleton } from "./ResearchSkeleton";

/** Maximum cards per page, per section. */
export const PAGE_SIZE = 12;

export const ease = [0.22, 1, 0.36, 1] as const;

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

export const presentationYear = (p: Presentation) => Number.parseInt(p.date.slice(0, 4), 10);

const formatDate = (iso: string) => {
    const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
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
                    <mark key={i} className="rounded-lg bg-[#A3A171]/35 px-0.5 text-inherit">
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

// Widths (%) used to draw the faux body text of the page.
const LINE_WIDTHS = [100, 94, 98, 88, 100, 92, 96, 84, 100, 90, 97, 62];

function TextLines({ seed, count }: { seed: number; count: number }) {
    return (
        <div className="space-y-1.5">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="h-0.75 rounded-lg bg-neutral-300/80"
                    style={{ width: `${LINE_WIDTHS[(i + seed) % LINE_WIDTHS.length]}%` }}
                />
            ))}
        </div>
    );
}

/** Stacked-sheets card: the first page of a paper / talk with two sheets peeking out behind it. */
export function ResearchCard({
    index,
    tokens,
    topic,
    year,
    title,
    byline,
    meta,
    venue,
    abstract,
    summaryLabel = "Abstract",
    publisher,
    footnote,
    thumbId,
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
    /** authors / speakers line */
    byline: string;
    /** running-header text, e.g. "Conference · 2024" */
    meta: string;
    venue?: string;
    abstract?: string;
    summaryLabel?: string;
    /** publisher shown in the footer */
    publisher?: string;
    footnote?: string;
    /** paper id whose PDF first page is rendered as the card face */
    thumbId?: string;
    badge?: ReactNode;
    shareText: string;
    openLabel: string;
    onOpen: () => void;
}) {
    const tint = TINTS[index % TINTS.length];
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLElement>(null);
    const [thumb, setThumb] = useState<string | null>(null);

    // Only render the PDF once the card is (almost) on screen.
    useEffect(() => {
        const node = cardRef.current;
        if (!node || !thumbId) return;
        let cancelled = false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                loadPdfThumb(thumbId).then((url) => {
                    if (!cancelled) setThumb(url);
                });
            },
            { rootMargin: "200px" }
        );
        observer.observe(node);

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [thumbId]);

    const share = (event: MouseEvent) => {
        event.stopPropagation();
        navigator.clipboard?.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <motion.article
            ref={cardRef}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: Math.min((index % 4) * 0.08, 0.24), ease }}
            whileHover={{ y: -8 }}
            onClick={onOpen}
            className="group relative mx-auto aspect-3/4 w-full max-w-72 cursor-pointer"
        >
            {/* sheets stacked behind the first page */}
            <div className="absolute inset-0 origin-bottom-left -rotate-3 rounded-lg bg-[#ECEBDD] shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:-rotate-6" />
            <div className="absolute inset-0 origin-bottom-right rotate-2 rounded-lg bg-[#F3F2E8] shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:rotate-4" />

            {/* first page */}
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_14px_30px_-10px_rgba(31,50,28,0.45)] ring-1 ring-black/10">
                <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${tint.from}, ${tint.to})` }}
                />

                {thumb ? (
                    <div className="relative flex-1 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={thumb}
                            alt={`First page of ${title}`}
                            className="absolute inset-0 size-full object-cover object-top"
                            draggable={false}
                        />
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col px-4 pt-3">
                        {/* running header */}
                        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-1.5 text-[8px] font-medium uppercase tracking-wider text-neutral-400">
                            <span className="truncate">
                                <Highlight text={`${meta} · ${year}`} tokens={tokens} />
                            </span>
                            <span className="max-w-24 shrink-0 truncate text-[#716f49]">
                                <Highlight text={topic} tokens={tokens} />
                            </span>
                        </div>

                        {/* title */}
                        <h3 className="mt-3 line-clamp-4 text-center font-serif text-[15px] font-bold leading-snug text-neutral-900">
                            <Highlight text={title} tokens={tokens} />
                        </h3>

                        {/* authors + venue */}
                        <p className="mt-2 line-clamp-2 text-center text-[9px] font-medium leading-snug text-neutral-700">
                            <Highlight text={byline} tokens={tokens} />
                        </p>
                        {venue && (
                            <p className="mt-0.5 line-clamp-2 text-center text-[8px] italic leading-snug text-neutral-400">
                                <Highlight text={venue} tokens={tokens} />
                            </p>
                        )}

                        <p className="mt-3 line-clamp-3 text-justify font-serif text-[9px] leading-snug text-neutral-600">
                            <span className="font-bold italic text-neutral-800">{summaryLabel}-</span>
                            {abstract ??
                                (summaryLabel === "Description"
                                    ? "No description available."
                                    : "No abstract available.")}
                        </p>

                        {/* faux two-column body text */}
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <TextLines seed={index} count={8} />
                            <TextLines seed={index + 5} count={8} />
                        </div>
                    </div>
                )}

                {badge && <div className="absolute right-3 top-4">{badge}</div>}

                {/* footer fades over the text, like a page curling away */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-white via-white/95 to-transparent px-4 pb-3 pt-10">
                    <div className="min-w-0">
                        {publisher && (
                            <p className="truncate text-sm font-semibold text-neutral-700">{publisher}</p>
                        )}
                        {footnote && <p className="mt-0.5 truncate text-[10px] text-neutral-400">{footnote}</p>}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            aria-label="Copy link"
                            onClick={share}
                            className="grid size-8 place-items-center rounded-lg border border-[#dddbd8] bg-[#F8FAFC] text-neutral-800 transition hover:bg-[#F3F2E8]"
                        >
                            {copied ? <Check className="size-3.5 text-emerald-700" /> : <Share2 className="size-3.5" />}
                        </button>
                        <button
                            type="button"
                            aria-label={openLabel}
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpen();
                            }}
                            className="grid size-8 place-items-center rounded-lg bg-neutral-900 text-white transition hover:bg-neutral-700"
                        >
                            <BookOpen className="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

export const pill =
    "inline-flex items-center gap-1 rounded-lg bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-800 backdrop-blur-md";

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
        "grid size-10 place-items-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-35";

    return (
        <nav aria-label={`${label} pagination`} className="mt-12 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white/80 p-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md">
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
                            className="relative grid size-10 place-items-center rounded-lg text-sm font-medium"
                        >
                            {item === page && (
                                <motion.span
                                    layoutId={`${id}-page-pill`}
                                    className="absolute inset-0 rounded-lg bg-neutral-900"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span
                                className={`relative transition-colors ${
                                    item === page ? "text-white" : "text-neutral-600 hover:text-neutral-900"
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

export function ResearchGrid<T extends { id: string }>({
    id,
    title,
    description,
    noun,
    items,
    loading = false,
    error = null,
    showHeading = true,
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
    loading?: boolean;
    error?: string | null;
    /** Hide the inline title/description when the page already renders a hero. */
    showHeading?: boolean;
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
                {showHeading && (
                    <div className="max-w-2xl">
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{title}</h2>
                        <p className="mt-2 text-sm text-neutral-600 sm:text-base">{description}</p>
                    </div>
                )}

                {/* search */}
                <div className="relative w-full lg:ml-auto lg:w-96">
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
                        className="h-12 w-full rounded-lg border border-neutral-200 bg-white pl-11 pr-11 text-sm text-neutral-900 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-neutral-400 focus:border-[#716f49] focus:ring-2 focus:ring-[#716f49]/20 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => {
                                setQuery("");
                                setPage(1);
                            }}
                            className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p className="mt-5 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}

            {/* results bar */}
            {loading ? (
                <ResearchResultsSkeleton />
            ) : (
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
            )}

            {/* grid */}
            {loading ? (
                <ResearchGridSkeleton />
            ) : filtered.length > 0 ? (
                <motion.div
                    key={`${current}-${query}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="mt-8 grid grid-cols-1 gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {visible.map((item, i) => (
                        <div key={item.id}>{renderCard(item, start + i, tokens)}</div>
                    ))}
                </motion.div>
            ) : (
                <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-lg bg-[#F3F2E8] text-[#716f49]">
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
                                className="mt-5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-700"
                            >
                                Clear search
                            </button>
                        </>
                    )}
                </div>
            )}

            {!loading && pages > 1 && (
                <Pagination id={id} label={title} page={current} pages={pages} onChange={goTo} />
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                detail modal                                */
/* -------------------------------------------------------------------------- */

export interface ModalData {
    eyebrow: string;
    title: string;
    byline: string;
    sub?: string;
    body: string;
    note?: string;
    details?: { label: string; value: string }[];
    actions: { label: string; href?: string; icon: LucideIcon; primary?: boolean; download?: boolean }[];
}

export function DetailModal({ data, onClose }: { data: ModalData | null; onClose: () => void }) {
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
                        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-7 shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg bg-neutral-100 hover:bg-neutral-200"
                        >
                            <X className="size-4" />
                        </button>

                        <p className="pr-10 text-xs font-medium uppercase tracking-wider text-neutral-500">{data.eyebrow}</p>
                        <h3 className="mt-2 pr-8 text-xl font-semibold leading-snug text-neutral-900">{data.title}</h3>
                        <p className="mt-3 text-sm text-sky-800">{data.byline}</p>
                        {data.sub && <p className="mt-1 text-sm text-neutral-600">{data.sub}</p>}
                        <p className="mt-5 text-sm leading-relaxed text-neutral-700">{data.body}</p>

                        {data.details && data.details.length > 0 && (
                            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-neutral-200 bg-[#F8F8F3] p-4 text-sm sm:grid-cols-2">
                                {data.details.map((d) => (
                                    <div key={d.label} className="min-w-0">
                                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                            {d.label}
                                        </dt>
                                        <dd className="mt-0.5 wrap-break-word text-neutral-800">{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {data.note && (
                            <p className="mt-4 flex items-center gap-2 rounded-lg bg-[#F3F2E8] px-3.5 py-2.5 text-xs text-[#716f49]">
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
                                            {...(a.download ? { download: true } : {})}
                                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                            className={
                                                "flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
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

const capitalize = (value?: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : undefined);

const toDetails = (rows: [string, string | undefined][]) =>
    rows.flatMap(([label, value]) => (value ? [{ label, value }] : []));

const paperDetails = (p: Paper) =>
    toDetails([
        ["Type", capitalize(p.type)],
        ["Publisher", p.publisher],
        ["Published", p.publishedAt ? formatDate(p.publishedAt) : String(p.year)],
        ["Topic", p.topic],
        ["Access", p.access === "open" ? "Open access" : "Restricted"],
        ["File size", p.fileSizeMb ? `${p.fileSizeMb} MB` : undefined],
    ]);

const presentationDetails = (p: Presentation) =>
    toDetails([
        ["Type", capitalize(p.type)],
        ["Date", formatDate(p.date)],
        ["Topic", p.topic],
        ["File size", p.fileSizeMb ? `${p.fileSizeMb} MB` : undefined],
    ]);

export const paperModal = (
    p: Paper,
    pdfUrl = p.pdfUrl,
    previewUrl = p.pdfUrl,
    presentation?: Presentation,
    presentationPdfUrl?: string,
): ModalData => ({
    eyebrow: `${p.type} · ${p.year} · ${p.publisher}`,
    title: p.title,
    byline: p.authors.join("; "),
    sub: p.venue,
    body: p.abstract ?? "No abstract available.",
    details: paperDetails(p),
    note: p.access === "locked" ? "Full text requires a publisher subscription or institutional access." : undefined,
    actions: [
        ...(pdfUrl ? [{ label: "PDF", href: pdfUrl, icon: FileText, primary: true, download: true }] : []),
        ...(previewUrl ? [{ label: "Preview", href: previewUrl, icon: BookOpen }] : []),
        ...(presentation && presentationPdfUrl
            ? [{ label: "Presentation Slide", href: presentationPdfUrl, icon: PresentationIcon, download: true }]
            : []),
        ...(p.htmlUrl ? [{ label: "LINK", href: p.htmlUrl, icon: Link }] : []),
    ],
});

export const presentationModal = (p: Presentation, paperPreviewUrl?: string): ModalData => ({
    eyebrow: `${p.type} · ${formatDate(p.date)}`,
    title: p.title,
    byline: p.speakers.join("; "),
    sub: [p.event, p.location].filter(Boolean).join(" · "),
    body: p.description ?? "No description available.",
    details: presentationDetails(p),
    actions: [
        ...(p.slidesUrl ? [{ label: "Slides", href: p.slidesUrl, icon: PresentationIcon, primary: true }] : []),
        ...(paperPreviewUrl ? [{ label: "Paper", href: paperPreviewUrl, icon: FileText }] : []),
    ],
});
