"use client";

// components/lectures/SeminarScheduleSection.tsx
// Reference seminar series board, mirroring components/news/NewsNotices.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { Check, ChevronLeft, ChevronRight, Copy, Mic, Share2, X } from "lucide-react";

export interface Seminar {
    id: string;
    /** Position in the running seminar series, e.g. 24. */
    series: number;
    title: string;
    speaker: string;
    affiliation?: string;
    /** ISO date string, e.g. "2026-10-24" */
    date: string;
    /** 24-hour time string, e.g. "15:00" */
    time: string;
    venue: string;
    summary?: string;
}

/** Maximum cards per page. */
const PAGE_SIZE = 12;

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171" }, // olive
    { from: "#EAF0E5", to: "#8FA382" }, // dark green
    { from: "#F1EFE1", to: "#88864F" }, // deep olive
];

/** Shareable URL for a seminar - opens /lectures/reference-seminar-schedule with the detail modal showing it. */
export const seminarHref = (id: string) =>
    `/lectures/reference-seminar-schedule?seminar=${encodeURIComponent(id)}`;

/** Builds a local-time Date from an "YYYY-MM-DD" string (no timezone parsing). */
const toDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export function formatTime(value: string) {
    const [hours, minutes] = value.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatSeminarTime(sem: Seminar) {
    return `${format(toDate(sem.date), "MMM d, yyyy")} · ${formatTime(sem.time)}`;
}

/** Chronological, oldest → newest (a reference schedule reads top-down in time). */
export function sortSeminars(seminars: Seminar[]): Seminar[] {
    return [...seminars].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

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

/* ------------------------------- card ------------------------------- */

function SeminarCard({ seminar, index }: { seminar: Seminar; index: number }) {
    const tint = TINTS[index % TINTS.length];

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
                duration: 0.6,
                delay: Math.min((index % 4) * 0.08, 0.24),
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8 }}
            className="group w-full rounded-[28px] bg-neutral-100 p-2.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]"
        >
            {/* gradient panel */}
            <div
                className="relative h-52.5 overflow-hidden rounded-[22px] ring-1 ring-black/5"
                style={{ background: `linear-gradient(135deg, ${tint.from} 0%, ${tint.to} 100%)` }}
            >
                <span className="absolute left-3.5 top-5.5 flex max-w-[60%] items-center gap-1.5 truncate rounded-full bg-white/60 px-3 py-1 text-[11px] font-medium text-neutral-800 backdrop-blur-md">
                    <span className="truncate">Seminar #{seminar.series}</span>
                </span>

                <button
                    aria-label="Copy seminar link"
                    onClick={() =>
                        navigator.clipboard?.writeText(`${location.origin}${seminarHref(seminar.id)}`)
                    }
                    className="absolute right-3.5 top-3.5 grid size-10 place-items-center rounded-xl border border-white/60 bg-white/40 text-neutral-900 backdrop-blur-md transition hover:bg-white/70"
                >
                    <Share2 className="size-4.5" />
                </button>

                <span className="absolute -bottom-4 left-3 select-none text-[68px] font-bold leading-none tracking-tighter text-white/40">
                    {format(toDate(seminar.date), "dd MMM")}
                </span>

                <p className="absolute inset-x-4 top-1/2 line-clamp-3 -translate-y-1/2 text-[15px] font-semibold leading-snug text-neutral-900/80">
                    {seminar.title}
                </p>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
                <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-neutral-900">
                        {format(toDate(seminar.date), "MMM d, yyyy")}
                    </h3>
                </div>
                <Link
                    href={seminarHref(seminar.id)}
                    scroll={false}
                    aria-label={`View seminar details: ${seminar.title}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                >
                    <Mic className="size-3.5" />
                    {/* View details */}
                </Link>
            </div>
        </motion.article>
    );
}

/* ----------------------------- detail modal ---------------------------- */

function SeminarModal({ seminar, onClose }: { seminar: Seminar | null; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!seminar) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [seminar, onClose]);

    const copyLink = () => {
        if (!seminar) return;
        navigator.clipboard?.writeText(`${location.origin}${seminarHref(seminar.id)}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {seminar && (
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
                        aria-label={seminar.title}
                        className="relative w-full max-w-xl rounded-[28px] bg-white p-7 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                        >
                            <X className="size-4" />
                        </button>

                        <p className="flex flex-wrap items-center gap-2 pr-10 text-xs font-medium uppercase tracking-wider text-neutral-500">
                            <span className="rounded-full bg-[#F3F2E8] px-2.5 py-1 text-[#716f49]">
                                Seminar #{seminar.series}
                            </span>
                            <span>{formatSeminarTime(seminar)}</span>
                        </p>

                        <h3 className="mt-3 pr-8 text-xl font-semibold leading-snug text-neutral-900">
                            {seminar.title}
                        </h3>

                        <p className="mt-3 text-sm text-sky-800">
                            {seminar.speaker}
                            {seminar.affiliation ? ` - ${seminar.affiliation}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-neutral-600">{seminar.venue}</p>

                        <p className="mt-5 text-sm leading-relaxed text-neutral-700">
                            {seminar.summary ?? "No abstract has been published for this seminar."}
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={copyLink}
                                className="flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
                            >
                                {copied ? (
                                    <>
                                        <Check className="size-4" /> Link copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-4" /> Copy link
                                    </>
                                )}
                            </button>
                            {/* <button
                                onClick={onClose}
                                className="rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                            >
                                Close
                            </button> */}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ----------------------------- pagination ----------------------------- */

function Pagination({
    page,
    pages,
    onChange,
}: {
    page: number;
    pages: number;
    onChange: (p: number) => void;
}) {
    const arrow =
        "grid size-10 place-items-center rounded-full text-neutral-600 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-35";

    return (
        <nav aria-label="Seminar pagination" className="mt-14 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/80 p-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <button
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
                            onClick={() => onChange(item)}
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? "page" : undefined}
                            className="relative grid size-10 place-items-center rounded-full text-sm font-medium"
                        >
                            {item === page && (
                                <motion.span
                                    layoutId="seminar-page-pill"
                                    className="absolute inset-0 rounded-full bg-neutral-900"
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

/* ------------------------------ section ----------------------------- */

export default function SeminarScheduleSection({
    seminars,
    activeSeminarId,
}: {
    seminars: Seminar[];
    activeSeminarId?: string;
}) {
    const sorted = useMemo(() => sortSeminars(seminars), [seminars]);
    const router = useRouter();
    const gridTop = useRef<HTMLDivElement>(null);

    // If a shared link points at a seminar, open the page that contains it.
    const [page, setPage] = useState(() => {
        const idx = activeSeminarId ? sorted.findIndex((s) => s.id === activeSeminarId) : -1;
        return idx >= 0 ? Math.floor(idx / PAGE_SIZE) + 1 : 1;
    });

    const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = sorted.slice(start, start + PAGE_SIZE);

    // Series range, e.g. "#24–#31" (static, so no server/client date mismatch)
    const seriesNumbers = sorted.map((s) => s.series);
    const seriesFrom = seriesNumbers.length ? Math.min(...seriesNumbers) : 0;
    const seriesTo = seriesNumbers.length ? Math.max(...seriesNumbers) : 0;

    const active = activeSeminarId ? (sorted.find((s) => s.id === activeSeminarId) ?? null) : null;
    const closeModal = () =>
        router.push("/lectures/reference-seminar-schedule", { scroll: false });

    const goTo = (p: number) => {
        setPage(p);
        gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const ease = [0.22, 1, 0.36, 1] as const;

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-28 sm:py-32">
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
                {/* heading */}
                <div className="mx-auto max-w-xl px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Our Reference <span className="text-[#716f49]">Seminar Series</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        A running plan of upcoming research seminars - speakers, topics, dates and venues -
                        so you can block your calendar ahead of time.
                    </motion.p>
                </div>

                {/* results bar */}
                <div ref={gridTop} className="mx-auto mt-14 max-w-7xl scroll-mt-24 px-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
                        <p className="text-sm text-neutral-600">
                            {sorted.length > 0 ? (
                                <>
                                    Showing{" "}
                                    <span className="font-semibold text-neutral-900">
                                        {start + 1}–{start + visible.length}
                                    </span>{" "}
                                    of <span className="font-semibold text-neutral-900">{sorted.length}</span>{" "}
                                    {sorted.length === 1 ? "seminar" : "seminars"}
                                </>
                            ) : (
                                "No seminars"
                            )}
                        </p>
                        {sorted.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F2E8] px-3 py-1 text-xs font-medium text-[#716f49]">
                                <Mic className="size-3" />
                                {seriesFrom === seriesTo
                                    ? `Series #${seriesFrom}`
                                    : `Series #${seriesFrom}–#${seriesTo}`}
                            </span>
                        )}
                    </div>

                    {/* grid: 1 col mobile, 2 tablet, 4 desktop */}
                    {sorted.length > 0 ? (
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease }}
                            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                        >
                            {visible.map((seminar, i) => (
                                <SeminarCard key={seminar.id} seminar={seminar} index={start + i} />
                            ))}
                        </motion.div>
                    ) : (
                        <p className="py-20 text-center text-sm text-neutral-500">
                            No seminars have been scheduled yet. Please check back soon.
                        </p>
                    )}

                    {pages > 1 && <Pagination page={current} pages={pages} onChange={goTo} />}
                </div>
            </div>

            <SeminarModal seminar={active} onClose={closeModal} />
        </section>
    );
}