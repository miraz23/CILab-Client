"use client";

// components/news/NewsNotices.tsx
// deps (already installed): motion, lucide-react, date-fns, next

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { BellRing, Check, ChevronLeft, ChevronRight, Copy, Pin, Share2, X } from "lucide-react";

export interface Notice {
    id: string;
    title: string;
    summary?: string;
    category: string; // e.g. "Seminar", "Deadline", "General"
    /** ISO date string, e.g. "2026-10-12" */
    date: string;
    pinned: boolean;
    status: "published" | "draft";
}

/** Maximum cards per page. */
const PAGE_SIZE = 12;

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171" }, // olive
    { from: "#EAF0E5", to: "#8FA382" }, // dark green
    { from: "#F1EFE1", to: "#88864F" }, // deep olive
];

const time = (n: Notice) => new Date(n.date).getTime();

/** Shareable URL for a notice - opens /news with the detail modal showing it. */
export const noticeHref = (id: string) => `/news?notice=${encodeURIComponent(id)}`;

/**
 * Pinned notices come first, oldest → newest (ascending by date, as requested).
 * Everything else follows newest → oldest. Flip the last sort if you want the rest ascending too.
 */
export function sortNotices(notices: Notice[]): Notice[] {
    const live = notices.filter((n) => n.status === "published");
    const pinned = live.filter((n) => n.pinned).sort((a, b) => time(a) - time(b));
    const rest = live.filter((n) => !n.pinned).sort((a, b) => time(b) - time(a));
    return [...pinned, ...rest];
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

function NoticeCard({ notice, index }: { notice: Notice; index: number }) {
    const tint = TINTS[index % TINTS.length];
    const date = new Date(notice.date);

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
                    {notice.pinned && <Pin className="size-3 shrink-0 fill-neutral-800" />}
                    <span className="truncate">{notice.pinned ? "Pinned" : "Notice"}</span>
                </span>

                <button
                    aria-label="Copy notice link"
                    onClick={() => navigator.clipboard?.writeText(`${location.origin}${noticeHref(notice.id)}`)}
                    className="absolute right-3.5 top-3.5 grid size-10 place-items-center rounded-xl border border-white/60 bg-white/40 text-neutral-900 backdrop-blur-md transition hover:bg-white/70"
                >
                    <Share2 className="size-4.5" />
                </button>

                <span className="absolute -bottom-4 left-3 select-none text-[76px] font-bold leading-none tracking-tighter text-white/40">
                    {format(date, "dd MMM")}
                </span>

                <p className="absolute inset-x-4 top-1/2 line-clamp-3 -translate-y-1/2 text-[15px] font-semibold leading-snug text-neutral-900/80">
                    {notice.title}
                </p>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
                <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-neutral-900">
                        {format(date, "MMM d, yyyy")}
                    </h3>
                </div>
                <Link
                    href={noticeHref(notice.id)}
                    scroll={false}
                    aria-label={`Read notice: ${notice.title}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                >
                    <BellRing className="size-3.5" />
                    {/* Read notice */}
                </Link>
            </div>
        </motion.article>
    );
}

/* ----------------------------- detail modal ---------------------------- */

function NoticeModal({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!notice) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [notice, onClose]);

    const copyLink = () => {
        if (!notice) return;
        navigator.clipboard?.writeText(`${location.origin}${noticeHref(notice.id)}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {notice && (
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
                        aria-label={notice.title}
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
                                {notice.category}
                            </span>
                            <span>{format(new Date(notice.date), "MMM d, yyyy")}</span>
                            {notice.pinned && (
                                <span className="flex items-center gap-1 text-neutral-700">
                                    <Pin className="size-3 fill-neutral-700" /> Pinned
                                </span>
                            )}
                        </p>

                        <h3 className="mt-3 pr-8 text-xl font-semibold leading-snug text-neutral-900">
                            {notice.title}
                        </h3>

                        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                            {notice.summary ?? "No additional details have been published for this notice."}
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
        <nav aria-label="Notices pagination" className="mt-14 flex flex-col items-center gap-3">
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
                                    layoutId="notice-page-pill"
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

export default function NewsNotices({
    notices,
    activeNoticeId,
}: {
    notices: Notice[];
    activeNoticeId?: string;
}) {
    const sorted = useMemo(() => sortNotices(notices), [notices]);
    const router = useRouter();
    const gridTop = useRef<HTMLDivElement>(null);

    // If a shared link points at a notice, open the page that contains it.
    const [page, setPage] = useState(() => {
        const idx = activeNoticeId ? sorted.findIndex((n) => n.id === activeNoticeId) : -1;
        return idx >= 0 ? Math.floor(idx / PAGE_SIZE) + 1 : 1;
    });

    const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = sorted.slice(start, start + PAGE_SIZE);
    const pinnedCount = sorted.filter((n) => n.pinned).length;

    const active = activeNoticeId ? (sorted.find((n) => n.id === activeNoticeId) ?? null) : null;
    const closeModal = () => router.push("/news", { scroll: false });

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
                <div className="mx-auto max-w-2xl px-4 text-center">
                    {/* <motion.span
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="inline-flex items-center gap-2 rounded-full border border-[#716f49]/20 bg-white/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#716f49] shadow-sm backdrop-blur"
                    >
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#716f49] opacity-50" />
                            <span className="relative inline-flex size-2 rounded-full bg-[#716f49]" />
                        </span>
                        Notice Board
                    </motion.span> */}

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="mt-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Stay Informed with Our <span className="text-[#716f49]">Latest Notices</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        Announcements, seminar schedules, submission deadlines and lab updates, all published
                        in one place so you never miss what matters.
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
                                    {sorted.length === 1 ? "notice" : "notices"}
                                </>
                            ) : (
                                "No notices"
                            )}
                        </p>
                        {pinnedCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F2E8] px-3 py-1 text-xs font-medium text-[#716f49]">
                                <Pin className="size-3 fill-[#716f49]" />
                                {pinnedCount} pinned
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
                            {visible.map((n, i) => (
                                <NoticeCard key={n.id} notice={n} index={start + i} />
                            ))}
                        </motion.div>
                    ) : (
                        <p className="py-20 text-center text-sm text-neutral-500">
                            No notices have been published yet. Please check back soon.
                        </p>
                    )}

                    {pages > 1 && <Pagination page={current} pages={pages} onChange={goTo} />}
                </div>
            </div>

            <NoticeModal notice={active} onClose={closeModal} />
        </section>
    );
}