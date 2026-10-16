"use client";

// components/lectures/ScheduleSection.tsx
// Public weekly availability board, mirroring components/news/NewsSection.tsx

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Check, Copy, MapPin, Share2, Video, X } from "lucide-react";

import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type { AvailabilitySlot } from "@/lib/types/admin/schedule";

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171" }, // olive
    { from: "#EAF0E5", to: "#8FA382" }, // dark green
    { from: "#F1EFE1", to: "#88864F" }, // deep olive
];

/** Shareable URL for a slot - opens /lectures/schedule with the detail modal showing it. */
export const slotHref = (id: string) => `/lectures/schedule?slot=${encodeURIComponent(id)}`;

export function formatTime(value: string) {
    const [hours, minutes] = value.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatSlotTime(slot: AvailabilitySlot) {
    return `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;
}

/** Active slots only, ordered Sunday → Saturday and by start time (matches the server query). */
export function sortSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
    return slots
        .filter((slot) => slot.active)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
}

const modeLabel = (mode: AvailabilitySlot["mode"]) => (mode === "online" ? "Online" : "In person");

function ModeIcon({ mode, className }: { mode: AvailabilitySlot["mode"]; className?: string }) {
    return mode === "online" ? (
        <Video className={className ?? "size-3"} />
    ) : (
        <MapPin className={className ?? "size-3"} />
    );
}

/* ------------------------------- card ------------------------------- */

function SlotCard({ slot, index }: { slot: AvailabilitySlot; index: number }) {
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
                    <ModeIcon mode={slot.mode} className="size-3 shrink-0" />
                    <p className="mt-0.5 text-xs">{modeLabel(slot.mode)}</p>
                </span>

                <button
                    aria-label="Copy schedule link"
                    onClick={() => navigator.clipboard?.writeText(`${location.origin}${slotHref(slot.id)}`)}
                    className="absolute right-3.5 top-3.5 grid size-10 place-items-center rounded-xl border border-white/60 bg-white/40 text-neutral-900 backdrop-blur-md transition hover:bg-white/70"
                >
                    <Share2 className="size-4.5" />
                </button>

                <span className="absolute -bottom-3.5 left-3 select-none text-[62px] font-bold leading-none tracking-tighter text-white/40">
                    {DAY_OF_WEEK_LABELS[slot.dayOfWeek].slice(0, 3).toUpperCase()}
                </span>

                <p className="absolute inset-x-4 top-1/2 line-clamp-3 -translate-y-1/2 text-[15px] font-semibold leading-snug text-neutral-900/80">
                    {slot.place}
                </p>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
                <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-neutral-900">
                        {formatSlotTime(slot)}
                    </h3>
                </div>
                <Link
                    href={slotHref(slot.id)}
                    scroll={false}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                >
                    <CalendarClock className="size-3.5" />
                    {/* View slot */}
                </Link>
            </div>
        </motion.article>
    );
}

/* ----------------------------- detail modal ---------------------------- */

function SlotModal({ slot, onClose }: { slot: AvailabilitySlot | null; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!slot) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [slot, onClose]);

    const copyLink = () => {
        if (!slot) return;
        navigator.clipboard?.writeText(`${location.origin}${slotHref(slot.id)}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {slot && (
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
                        aria-label={slot.place}
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
                                {DAY_OF_WEEK_LABELS[slot.dayOfWeek]}
                            </span>
                            <span>{formatSlotTime(slot)}</span>
                            <span className="flex items-center gap-1 text-neutral-700">
                                <ModeIcon mode={slot.mode} className="size-3" /> {modeLabel(slot.mode)}
                            </span>
                        </p>

                        <h3 className="mt-3 pr-8 text-xl font-semibold leading-snug text-neutral-900">
                            {slot.place}
                        </h3>

                        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                            A recurring {modeLabel(slot.mode).toLowerCase()} slot every{" "}
                            {DAY_OF_WEEK_LABELS[slot.dayOfWeek]} from {formatTime(slot.startTime)} to{" "}
                            {formatTime(slot.endTime)}
                            {slot.mode === "online"
                                ? ". Join with the meeting link shared by the lab."
                                : "."}
                        </p>

                        {slot.name && (
                            <p className="mt-3 text-sm text-neutral-500">Hosted by {slot.name}</p>
                        )}

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

export default function ScheduleSection({
    slots,
    activeSlotId,
}: {
    slots: AvailabilitySlot[];
    activeSlotId?: string;
}) {
    const sorted = useMemo(() => sortSlots(slots), [slots]);
    const router = useRouter();
    const active = activeSlotId ? (sorted.find((s) => s.id === activeSlotId) ?? null) : null;
    const closeModal = () => router.push("/lectures/schedule", { scroll: false });

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
                    Plan Ahead with Our <span className="text-[#716f49]">Weekly Schedule</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
                    Lecture and consultation availability, with times, locations and online meeting links
                    published in one place so you never miss a session.
                </p>
            </motion.div>

            {/* grid: 1 col mobile, 2 tablet, 3 desktop */}
            <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                {sorted.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {sorted.map((slot, i) => (
                            <SlotCard key={slot.id} slot={slot} index={i} />
                        ))}
                    </div>
                ) : (
                    <p className="py-20 text-center text-sm text-neutral-500">
                        No schedule has been published yet. Please check back soon.
                    </p>
                )}
            </div>

            <SlotModal slot={active} onClose={closeModal} />
        </section>
    );
}
