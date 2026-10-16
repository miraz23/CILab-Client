"use client";

// components/news/NewsNotices.tsx
// deps (already installed): motion, lucide-react, date-fns, next

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { BellRing, Check, Copy, Pin, Share2, X } from "lucide-react";

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
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                        {notice.pinned ? (
                            <>
                                Pinned
                            </>
                        ) : (
                                "Notice"
                        )}
                    </p>
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
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                >
                    <BellRing className="size-3.5" />
                    Read notice
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
                            <button
                                onClick={onClose}
                                className="rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
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
    const active = activeNoticeId ? (sorted.find((n) => n.id === activeNoticeId) ?? null) : null;
    const closeModal = () => router.push("/news", { scroll: false });

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-28 sm:py-32">
            {/* heading */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-2xl px-4 text-center"
            >
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                    Stay Informed with Our <span className="text-[#716f49]">Latest Notices</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
                    Announcements, seminar schedules, submission deadlines and lab updates, all published in
                    one place so you never miss what matters.
                </p>
            </motion.div>

            {/* grid: 1 col mobile, 2 tablet, 4 desktop */}
            <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                {sorted.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {sorted.map((n, i) => (
                            <NoticeCard key={n.id} notice={n} index={i} />
                        ))}
                    </div>
                ) : (
                    <p className="py-20 text-center text-sm text-neutral-500">
                        No notices have been published yet. Please check back soon.
                    </p>
                )}
            </div>

            <NoticeModal notice={active} onClose={closeModal} />
        </section>
    );
}