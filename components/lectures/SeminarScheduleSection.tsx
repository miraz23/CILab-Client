"use client";

// components/lectures/SeminarScheduleSection.tsx
// Reference seminar series board, mirroring components/news/NewsSection.tsx

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { Check, Copy, Mic, Share2, X } from "lucide-react";

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
                delay: Math.min((index % 3) * 0.08, 0.24),
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
                    <p className="mt-0.5 text-xs">Seminar #{seminar.series}</p>
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
                            {seminar.affiliation ? ` — ${seminar.affiliation}` : ""}
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

export default function SeminarScheduleSection({
    seminars,
    activeSeminarId,
}: {
    seminars: Seminar[];
    activeSeminarId?: string;
}) {
    const sorted = useMemo(() => sortSeminars(seminars), [seminars]);
    const router = useRouter();
    const active = activeSeminarId ? (sorted.find((s) => s.id === activeSeminarId) ?? null) : null;
    const closeModal = () =>
        router.push("/lectures/reference-seminar-schedule", { scroll: false });

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
                    Our Reference <span className="text-[#716f49]">Seminar Series</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
                    A running plan of upcoming research seminars — speakers, topics, dates and venues —
                    so you can block your calendar ahead of time.
                </p>
            </motion.div>

            {/* grid: 1 col mobile, 2 tablet, 3 desktop */}
            <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                {sorted.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {sorted.map((seminar, i) => (
                            <SeminarCard key={seminar.id} seminar={seminar} index={i} />
                        ))}
                    </div>
                ) : (
                    <p className="py-20 text-center text-sm text-neutral-500">
                        No seminars have been scheduled yet. Please check back soon.
                    </p>
                )}
            </div>

            <SeminarModal seminar={active} onClose={closeModal} />
        </section>
    );
}
