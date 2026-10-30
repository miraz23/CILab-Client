"use client";

// components/lectures/ScheduleSection.tsx
// Public weekly availability board - calendar-style week grid (with a single-day view).

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Copy, MapPin, Video, X } from "lucide-react";

import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type { AvailabilitySlot, DayOfWeek } from "@/lib/types/admin/schedule";

type Tab = "all" | "in-person" | "online";
type View = "week" | "day";

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
    { id: "all", label: "All Slots", icon: CalendarDays },
    { id: "in-person", label: "In Person", icon: MapPin },
    { id: "online", label: "Online", icon: Video },
];

/** Height of one hour on the grid, and width of the time gutter. */
const HOUR_H = 76;
const GUTTER = 64;
const DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
/** Shortest rendered block - lane layout must reserve this much vertical space too. */
const MIN_BLOCK_H = 44;
const MIN_BLOCK_MIN = Math.ceil(((MIN_BLOCK_H + 4) / HOUR_H) * 60);

/** Event colours per mode, muted to the lab palette. */
const EVENT_STYLES = {
    online: {
        box: "bg-[#E7EEF8] text-[#33506F] border-[#CFDDEF]",
        head: "bg-[#D6E3F3] text-[#4C6E93]",
        dot: "bg-[#7FA3CC]",
    },
    "in-person": {
        box: "bg-[#EAF0E5] text-[#33472B] border-[#D7E3CF]",
        head: "bg-[#DCE8D4] text-[#5C7A4C]",
        dot: "bg-[#8FA382]",
    },
} as const;

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

const modeLabel = (mode: AvailabilitySlot["mode"]) => (mode === "online" ? "Online" : "In person");

function ModeIcon({ mode, className }: { mode: AvailabilitySlot["mode"]; className?: string }) {
    return mode === "online" ? (
        <Video className={className ?? "size-3"} />
    ) : (
        <MapPin className={className ?? "size-3"} />
    );
}

const slotDescription = (slot: AvailabilitySlot) =>
    `A recurring ${modeLabel(slot.mode).toLowerCase()} slot on ${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} from ${formatTime(
        slot.startTime
    )} to ${formatTime(slot.endTime)}${slot.mode === "online" ? ". Join with the meeting link shared by the lab." : "."}`;

/* ------------------------------ helpers ------------------------------ */

const toMin = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
};

/** Effective end used for both layout and rendering so short blocks never collide. */
const blockEnd = (slot: AvailabilitySlot) =>
    Math.max(toMin(slot.endTime), toMin(slot.startTime) + MIN_BLOCK_MIN);

const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? "PM" : "AM"}`;

const shortDay = (d: DayOfWeek) => DAY_OF_WEEK_LABELS[d].slice(0, 3).toUpperCase();

/** Minute-aligned clock. `null` during SSR/hydration to avoid mismatches. */
const NOW_INTERVAL = 60_000;

const subscribeNow = (onChange: () => void) => {
    const id = window.setInterval(onChange, NOW_INTERVAL);
    return () => window.clearInterval(id);
};

const getNowSnapshot = (): number | null => Math.floor(Date.now() / NOW_INTERVAL);
const getServerNowSnapshot = (): number | null => null;

function useNow(): Date | null {
    const bucket = useSyncExternalStore(subscribeNow, getNowSnapshot, getServerNowSnapshot);
    return bucket === null ? null : new Date(bucket * NOW_INTERVAL);
}

type Placed = { slot: AvailabilitySlot; lane: number; lanes: number };

/** Side-by-side lanes for overlapping slots within one day. */
function layoutDay(daySlots: AvailabilitySlot[]): Placed[] {
    const items = [...daySlots].sort(
        (a, b) => toMin(a.startTime) - toMin(b.startTime) || toMin(a.endTime) - toMin(b.endTime)
    );
    const out: Placed[] = [];
    let cluster: { slot: AvailabilitySlot; lane: number }[] = [];
    let clusterEnd = -1;
    let laneEnds: number[] = [];

    const flush = () => {
        cluster.forEach((c) => out.push({ slot: c.slot, lane: c.lane, lanes: laneEnds.length }));
        cluster = [];
        laneEnds = [];
        clusterEnd = -1;
    };

    for (const slot of items) {
        const start = toMin(slot.startTime);
        const end = blockEnd(slot);
        if (cluster.length && start >= clusterEnd) flush();

        let lane = laneEnds.findIndex((e) => e <= start);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(end);
        } else {
            laneEnds[lane] = end;
        }
        cluster.push({ slot, lane });
        clusterEnd = Math.max(clusterEnd, end);
    }
    flush();
    return out;
}

/* ------------------------------ event ------------------------------ */

function EventBlock({
    placed,
    startHour,
    basePath,
    isActive,
}: {
    placed: Placed;
    startHour: number;
    basePath: string;
    isActive: boolean;
}) {
    const { slot, lane, lanes } = placed;
    const styles = EVENT_STYLES[slot.mode === "online" ? "online" : "in-person"];

    const start = toMin(slot.startTime);
    const end = blockEnd(slot);
    const top = ((start - startHour * 60) / 60) * HOUR_H + 2;
    const height = Math.max(((end - start) / 60) * HOUR_H - 4, MIN_BLOCK_H);
    const roomy = height >= 92;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
            style={{
                top,
                height,
                left: `calc(${(lane / lanes) * 100}% + 4px)`,
                width: `calc(${100 / lanes}% - 8px)`,
            }}
        >
            <Link
                href={slotHref(slot.id, basePath)}
                scroll={false}
                aria-label={`View slot: ${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} ${formatSlotTime(slot)}, ${slot.place}`}
                className={`flex h-full flex-col overflow-hidden rounded-md border text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#716f49] ${styles.box} ${isActive ? "ring-2 ring-[#716f49] ring-offset-1" : ""
                    }`}
            >
                <span
                    className={`block truncate border-b border-dashed border-black/10 px-2 py-1 text-[10px] font-medium ${styles.head}`}
                >
                    {formatSlotTime(slot)}
                </span>
                <span className="flex min-h-0 flex-1 flex-col gap-0.5 px-2 py-1.5">
                    <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{slot.name}</span>
                    {roomy && (
                        <span className="mt-auto flex items-center gap-1 truncate text-[10px] opacity-70">
                            <ModeIcon mode={slot.mode} className="size-3 shrink-0" />
                            <span className="truncate">{slot.place || "TBA"}</span>
                        </span>
                    )}
                </span>
            </Link>
        </motion.div>
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

    const active = activeSlotId ? (sorted.find((s) => s.id === activeSlotId) ?? null) : null;

    const [tab, setTab] = useState<Tab>("all");
    const [view, setView] = useState<View>("week");
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
        () => active?.dayOfWeek ?? sorted[0]?.dayOfWeek ?? 0
    );

    // "Now" is client-only to avoid hydration mismatches.
    const now = useNow();
    const todayDow: DayOfWeek | null = now ? (now.getDay() as DayOfWeek) : null;
    const nowMin = now ? now.getHours() * 60 + now.getMinutes() : -1;

    const filtered = useMemo(
        () => (tab === "all" ? sorted : sorted.filter((s) => s.mode === tab)),
        [sorted, tab]
    );

    const counts: Record<Tab, number> = {
        all: sorted.length,
        "in-person": sorted.filter((s) => s.mode === "in-person").length,
        online: sorted.filter((s) => s.mode === "online").length,
    };

    // Time range follows the data, with a sensible minimum span.
    const { startHour, endHour } = useMemo(() => {
        if (sorted.length === 0) return { startHour: 8, endHour: 14 };
        const min = Math.min(...sorted.map((s) => toMin(s.startTime)));
        const max = Math.max(...sorted.map((s) => toMin(s.endTime)));
        const s = Math.max(0, Math.floor(min / 60));
        let e = Math.min(24, Math.ceil(max / 60));
        if (e - s < 6) e = Math.min(24, s + 6);
        return { startHour: s, endHour: e };
    }, [sorted]);

    const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
    const bodyHeight = hours.length * HOUR_H;

    const placedByDay = useMemo(
        () => DAYS.map((d) => layoutDay(filtered.filter((s) => s.dayOfWeek === d))),
        [filtered]
    );
    const slotCountByDay = DAYS.map((d) => filtered.filter((s) => s.dayOfWeek === d).length);

    const visibleDays = view === "week" ? DAYS : [selectedDay];
    const activeDays = new Set(sorted.map((s) => s.dayOfWeek)).size;

    const closeModal = () => router.push(basePath, { scroll: false });
    const stepDay = (delta: number) => setSelectedDay((d) => (((d + delta + 7) % 7) as DayOfWeek));
    const goToday = () => {
        if (todayDow !== null) setSelectedDay(todayDow);
        setView("day");
    };

    const ease = [0.22, 1, 0.36, 1] as const;
    const gridCols = { gridTemplateColumns: `${GUTTER}px repeat(${visibleDays.length}, minmax(0, 1fr))` };
    const showNow = nowMin >= startHour * 60 && nowMin <= endHour * 60;

    return (
        <section className="relative overflow-hidden py-28 sm:py-32">
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

                {/* calendar card */}
                <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.55, ease }}
                        className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
                    >
                        {/* tabs row */}
                        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-neutral-200 px-4 pt-4 sm:px-6">
                            <div role="tablist" aria-label="Filter slots" className="flex flex-wrap gap-x-6 gap-y-1">
                                {TABS.map((t) => {
                                    const selected = tab === t.id;
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            role="tab"
                                            aria-selected={selected}
                                            onClick={() => setTab(t.id)}
                                            className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${selected ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
                                                }`}
                                        >
                                            <Icon className="size-4" aria-hidden />
                                            {t.label}
                                            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                                                {counts[t.id]}
                                            </span>
                                            {selected && (
                                                <motion.span
                                                    layoutId="schedule-tab-underline"
                                                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-neutral-900"
                                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* legend */}
                            <div className="hidden items-center gap-4 pb-3 text-xs text-neutral-500 sm:flex">
                                <span className="flex items-center gap-1.5">
                                    <span className={`size-2 rounded-full ${EVENT_STYLES.online.dot}`} /> Online
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className={`size-2 rounded-full ${EVENT_STYLES["in-person"].dot}`} /> In person
                                </span>
                            </div>
                        </div>

                        {/* toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                                    {view === "week" ? "Every Week" : DAY_OF_WEEK_LABELS[selectedDay]}
                                </h2>
                                <button
                                    onClick={goToday}
                                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                                >
                                    Today
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-sm">
                                    {(["day", "week"] as View[]).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setView(v)}
                                            aria-pressed={view === v}
                                            className={`rounded-md px-3.5 py-1.5 font-medium capitalize transition ${view === v
                                                ? "bg-white text-neutral-900 shadow-sm"
                                                : "text-neutral-500 hover:text-neutral-800"
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                                <span className="hidden items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 md:flex">
                                    <CalendarDays className="size-4 text-neutral-500" aria-hidden />
                                    {sorted.length} {sorted.length === 1 ? "slot" : "slots"} · {activeDays}{" "}
                                    {activeDays === 1 ? "day" : "days"}
                                </span>
                            </div>
                        </div>

                        {sorted.length === 0 ? (
                            <div className="border-t border-neutral-200 px-6 py-16">
                                <div className="mx-auto max-w-md rounded-[28px] border border-dashed border-neutral-300 bg-white/60 px-6 py-12 text-center">
                                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#F3F2E8] text-[#716f49]">
                                        <CalendarDays className="size-5" aria-hidden />
                                    </span>
                                    <p className="mt-4 text-sm font-semibold text-neutral-900">No schedule published yet</p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Weekly availability will appear here once the lab publishes it.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border-t border-neutral-200">
                                <div style={{ minWidth: view === "week" ? 900 : 0 }}>
                                    {/* day headers */}
                                    <div className="grid border-b border-neutral-200" style={gridCols}>
                                        <div className="sticky left-0 z-20 flex items-center justify-center gap-1 bg-white py-2">
                                            {view === "day" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        aria-label="Previous day"
                                                        onClick={() => stepDay(-1)}
                                                        className="grid size-7 place-items-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                                                    >
                                                        <ChevronLeft className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Next day"
                                                        onClick={() => stepDay(1)}
                                                        className="grid size-7 place-items-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                                                    >
                                                        <ChevronRight className="size-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {visibleDays.map((d) => {
                                            const isToday = d === todayDow;
                                            return (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDay(d);
                                                        setView("day");
                                                    }}
                                                    aria-label={`View ${DAY_OF_WEEK_LABELS[d]}`}
                                                    aria-current={isToday ? "date" : undefined}
                                                    className={`flex flex-col items-center gap-0.5 border-l border-neutral-200 py-2.5 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#716f49] ${isToday ? "bg-neutral-100" : ""
                                                        }`}
                                                >
                                                    <span
                                                        className={`text-xs tracking-wide ${isToday ? "font-bold text-neutral-900" : "font-medium text-neutral-500"
                                                            }`}
                                                    >
                                                        {shortDay(d)}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400">
                                                        {slotCountByDay[d]} {slotCountByDay[d] === 1 ? "slot" : "slots"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* grid body */}
                                    <div className="relative grid" style={{ ...gridCols, height: bodyHeight }}>
                                        {/* time gutter */}
                                        <div className="sticky left-0 z-20 bg-white">
                                            {hours.map((h, i) => (
                                                <span
                                                    key={h}
                                                    className="absolute right-2 text-[11px] font-medium text-neutral-500"
                                                    style={{ top: i * HOUR_H + 6 }}
                                                >
                                                    {hourLabel(h)}
                                                </span>
                                            ))}
                                            {todayDow !== null && showNow && visibleDays.includes(todayDow) && (
                                                <span
                                                    className="absolute right-1 z-10 -translate-y-1/2 rounded bg-white px-1 text-[10px] font-semibold text-[#5579A6] ring-1 ring-[#C9D8EA]"
                                                    style={{ top: ((nowMin - startHour * 60) / 60) * HOUR_H }}
                                                >
                                                    {formatTime(
                                                        `${Math.floor(nowMin / 60)}:${String(nowMin % 60).padStart(2, "0")}`
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {/* day columns */}
                                        {visibleDays.map((d) => {
                                            const empty = slotCountByDay[d] === 0;
                                            return (
                                                <div
                                                    key={d}
                                                    className="relative border-l border-neutral-200"
                                                    style={{
                                                        backgroundImage: [
                                                            `linear-gradient(to bottom, transparent ${HOUR_H - 1}px, #eef0f2 ${HOUR_H - 1}px)`,
                                                            empty
                                                                ? "repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 7px)"
                                                                : "none",
                                                        ].join(", "),
                                                        backgroundSize: `100% ${HOUR_H}px, auto`,
                                                    }}
                                                >
                                                    {placedByDay[d].map((p) => (
                                                        <EventBlock
                                                            key={p.slot.id}
                                                            placed={p}
                                                            startHour={startHour}
                                                            basePath={basePath}
                                                            isActive={p.slot.id === activeSlotId}
                                                        />
                                                    ))}

                                                    {/* current-time marker */}
                                                    {d === todayDow && showNow && (
                                                        <div
                                                            aria-hidden
                                                            className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                                                            style={{ top: ((nowMin - startHour * 60) / 60) * HOUR_H }}
                                                        >
                                                            <span className="-ml-1 size-2 rounded-full bg-[#5579A6]" />
                                                            <span className="h-px flex-1 bg-[#5579A6]" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {filtered.length === 0 ? (
                                            <div className="pointer-events-none absolute inset-y-0 left-16 right-0 z-10 grid place-items-center px-4">
                                                <p className="rounded-xl bg-white/90 px-4 py-2 text-sm text-neutral-500 shadow-sm ring-1 ring-neutral-200">
                                                    No slots in this category.
                                                </p>
                                            </div>
                                        ) : view === "day" && placedByDay[selectedDay].length === 0 ? (
                                            <div className="pointer-events-none absolute inset-y-0 left-16 right-0 z-10 grid place-items-center px-4">
                                                <p className="rounded-xl bg-white/90 px-4 py-2 text-sm text-neutral-500 shadow-sm ring-1 ring-neutral-200">
                                                    No slots on {DAY_OF_WEEK_LABELS[selectedDay]}.
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <SlotModal slot={active} basePath={basePath} onClose={closeModal} />
        </section>
    );
}