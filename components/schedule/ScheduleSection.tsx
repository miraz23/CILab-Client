"use client";

// components/lectures/ScheduleSection.tsx
// Public weekly availability board - tabbed event-list layout.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
    CalendarCheck,
    Check,
    ChevronLeft,
    ChevronRight,
    Copy,
    MapPin,
    Share2,
    Video,
    X,
} from "lucide-react";

import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type { AvailabilitySlot } from "@/lib/types/admin/schedule";

/** Maximum rows per page. */
const PAGE_SIZE = 6;

type Tab = "all" | "in-person" | "online";

const TABS: { id: Tab; label: string }[] = [
    { id: "all", label: "All Slots" },
    { id: "in-person", label: "In Person" },
    { id: "online", label: "Online" },
];

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171" }, // olive
    { from: "#EAF0E5", to: "#8FA382" }, // dark green
    { from: "#F1EFE1", to: "#88864F" }, // deep olive
];

/**
 * Shareable URL for a slot - opens the schedule page with the detail modal showing it.
 * `basePath` is the path of the page that renders this section (taken from usePathname),
 * so links always stay on the current page instead of jumping to a hardcoded route.
 */
export const slotHref = (id: string, basePath = "/lectures/schedule") =>
    `${basePath}?slot=${encodeURIComponent(id)}`;

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

const modeLabel = (mode: AvailabilitySlot["mode"]) => (mode === "online" ? "Online" : "In person");

function ModeIcon({ mode, className }: { mode: AvailabilitySlot["mode"]; className?: string }) {
    return mode === "online" ? (
        <Video className={className ?? "size-3"} />
    ) : (
        <MapPin className={className ?? "size-3"} />
    );
}

const initialsOf = (name?: string | null) => {
    const parts = (name ?? "").replace(/\./g, " ").split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
};

const slotDescription = (slot: AvailabilitySlot) =>
    `A recurring ${modeLabel(slot.mode).toLowerCase()} slot on ${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} from ${formatTime(
        slot.startTime
    )} to ${formatTime(slot.endTime)}${slot.mode === "online" ? ". Join with the meeting link shared by the lab." : "."}`;

/* ------------------------------- row ------------------------------- */

function SlotRow({ slot, index, basePath }: { slot: AvailabilitySlot; index: number; basePath: string }) {
    const tint = TINTS[index % TINTS.length];
    const [copied, setCopied] = useState(false);

    const copyLink = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard?.writeText(`${location.origin}${slotHref(slot.id, basePath)}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: Math.min((index % 6) * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex gap-4 border-b border-neutral-200/80 py-6 first:pt-2 last:border-b-0 sm:gap-5"
        >
            {/* avatar */}
            <div
                aria-hidden
                className="grid size-14 shrink-0 place-items-center rounded-full text-base font-semibold text-neutral-800 ring-1 ring-black/5"
                style={{ background: `linear-gradient(135deg, ${tint.from} 0%, ${tint.to} 100%)` }}
            >
                {initialsOf(slot.name)}
            </div>

            <div className="min-w-0 flex-1">
                {/* date pill */}
                <div className="inline-flex max-w-full items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-900">
                    <CalendarCheck className="size-4 shrink-0 text-blue-500" />
                    <span className="truncate">
                        {DAY_OF_WEEK_LABELS[slot.dayOfWeek]} · {formatSlotTime(slot)}
                    </span>
                </div>

                {/* host */}
                <p className="mt-3 text-[15px] text-neutral-900">
                    Host: <span className="text-neutral-500">{slot.name || "TBA"}</span>
                </p>

                {/* title - stretched link makes the whole row open the modal */}
                <h3 className="mt-3 text-[15px] font-semibold leading-snug text-neutral-900">
                    <Link
                        href={slotHref(slot.id, basePath)}
                        scroll={false}
                        aria-label={`View slot: ${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} ${formatSlotTime(slot)}`}
                        className="after:absolute after:inset-0 after:content-['']"
                    >
                        {slot.place}
                    </Link>
                </h3>

                {/* description */}
                <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[13px] leading-relaxed text-neutral-500">
                    <span className="inline-flex items-center gap-1 text-neutral-600">
                        <ModeIcon mode={slot.mode} className="size-3" />
                        {modeLabel(slot.mode)}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{slotDescription(slot)}</span>
                </p>
            </div>

            {/* copy link */}
            <button
                aria-label="Copy schedule link"
                onClick={copyLink}
                className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
            </button>
        </motion.article>
    );
}

/* ----------------------------- detail modal ---------------------------- */

function SlotModal({
    slot,
    basePath,
    onClose,
}: {
    slot: AvailabilitySlot | null;
    basePath: string;
    onClose: () => void;
}) {
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
        navigator.clipboard?.writeText(`${location.origin}${slotHref(slot.id, basePath)}`);
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

                        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{slotDescription(slot)}</p>

                        {slot.name && <p className="mt-3 text-sm text-neutral-500">Hosted by {slot.name}</p>}

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
        <nav aria-label="Schedule pagination" className="mt-8 flex flex-col items-center gap-3">
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
                                    layoutId="slot-page-pill"
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

export default function ScheduleSection({
    slots,
    activeSlotId,
}: {
    slots: AvailabilitySlot[];
    activeSlotId?: string;
}) {
    const sorted = useMemo(() => sortSlots(slots), [slots]);
    const router = useRouter();
    // Whatever page this section is rendered on - links and "close" stay here.
    const basePath = usePathname() || "/lectures/schedule";
    const listTop = useRef<HTMLDivElement>(null);

    // A shared link may point at a slot hidden by the current tab - start on "all" and jump to its page.
    const [tab, setTab] = useState<Tab>("all");
    const [page, setPage] = useState(() => {
        const idx = activeSlotId ? sorted.findIndex((s) => s.id === activeSlotId) : -1;
        return idx >= 0 ? Math.floor(idx / PAGE_SIZE) + 1 : 1;
    });

    const filtered = useMemo(
        () => (tab === "all" ? sorted : sorted.filter((s) => s.mode === tab)),
        [sorted, tab]
    );

    const counts: Record<Tab, number> = {
        all: sorted.length,
        "in-person": sorted.filter((s) => s.mode === "in-person").length,
        online: sorted.filter((s) => s.mode === "online").length,
    };

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    const active = activeSlotId ? (sorted.find((s) => s.id === activeSlotId) ?? null) : null;
    const closeModal = () => router.push(basePath, { scroll: false });

    const goTo = (p: number) => {
        setPage(p);
        listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const changeTab = (t: Tab) => {
        setTab(t);
        setPage(1);
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
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Plan Ahead with Our <span className="text-[#716f49]">Weekly Schedule</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        Lecture and consultation availability, with times, locations and online meeting
                        links published in one place so you never miss a session.
                    </motion.p>
                </div>

                {/* list card */}
                <div ref={listTop} className="mx-auto mt-14 max-w-5xl scroll-mt-24 px-4 sm:px-6">
                    <div className="rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] sm:p-6">
                        {/* tabs */}
                        <div role="tablist" aria-label="Filter slots" className="flex flex-wrap gap-3">
                            {TABS.map((t) => {
                                const selected = tab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        role="tab"
                                        aria-selected={selected}
                                        onClick={() => changeTab(t.id)}
                                        className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${selected
                                                ? "border-neutral-600 bg-neutral-600 text-white"
                                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                                            }`}
                                    >
                                        {t.label}
                                        <span className={`ml-1.5 text-xs ${selected ? "text-white/70" : "text-neutral-400"}`}>
                                            {counts[t.id]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* rows */}
                        {filtered.length > 0 ? (
                            <motion.div
                                key={`${tab}-${current}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease }}
                                className="mt-6"
                            >
                                {visible.map((slot, i) => (
                                    <SlotRow key={slot.id} slot={slot} index={start + i} basePath={basePath} />
                                ))}
                            </motion.div>
                        ) : (
                            <p className="py-16 text-center text-sm text-neutral-500">
                                {sorted.length === 0
                                    ? "No schedule has been published yet. Please check back soon."
                                    : "No slots in this category."}
                            </p>
                        )}
                    </div>

                    {pages > 1 && <Pagination page={current} pages={pages} onChange={goTo} />}
                </div>
            </div>

            <SlotModal slot={active} basePath={basePath} onClose={closeModal} />
        </section>
    );
}