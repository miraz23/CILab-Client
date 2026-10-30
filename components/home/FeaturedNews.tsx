"use client";

// components/home/FeaturedNews.tsx
// Home page "featured news" - the same three-column accordion UI as the News page,
// limited to the pinned / latest few items per column with a link through to /news.
// deps (already installed): motion, lucide-react, date-fns

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarClock,
    ChevronDown,
    MapPin,
    Megaphone,
    Pin,
    Presentation,
    StickyNote,
} from "lucide-react";

import type { Announcement, AnnouncementKind } from "@/lib/types/admin/announcement";
// DUMMY-DATA: remove this import (and the fallback below) once the backend is integrated.
import { DUMMY_ANNOUNCEMENTS } from "@/lib/dummy/announcements";

const ease = [0.22, 1, 0.36, 1] as const;

/** Items shown per column on the home page. */
const DEFAULT_PER_COLUMN = 3;

const SECTIONS: {
    kind: AnnouncementKind;
    title: string;
    blurb: string;
    icon: typeof Megaphone;
    badgeClass: string;
}[] = [
        {
            kind: "announcement",
            title: "Conferences",
            blurb: "Calls for papers and conference updates",
            icon: Megaphone,
            badgeClass: "bg-[#E4E6DC] text-[#5C6446]",
        },
        {
            kind: "notice",
            title: "Notices",
            blurb: "Quick, at-a-glance lab updates",
            icon: StickyNote,
            badgeClass: "bg-[#ECE7DA] text-[#8A6420]",
        },
        {
            kind: "seminar",
            title: "Seminars",
            blurb: "Upcoming talks and sessions",
            icon: Presentation,
            badgeClass: "bg-[#E3E8F0] text-[#5579A6]",
        },
    ];

/* -------------------------------- helpers -------------------------------- */

// The manager saves empty optional dates as "", so use || (not ??) to fall through.
const primaryDate = (n: Announcement) => n.eventAt || n.publishAt || n.createdAt;

const time = (n: Announcement) => {
    const t = new Date(primaryDate(n)).getTime();
    return Number.isNaN(t) ? 0 : t;
};

function fmt(value: string | undefined, pattern: string) {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : format(d, pattern);
}

/** Published only; pinned first, then newest → oldest. */
function featuredSort(items: Announcement[]) {
    return items
        .filter((n) => n.status === "published")
        .slice()
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || time(b) - time(a));
}

const noticeHref = (id: string) => `/news?notice=${encodeURIComponent(id)}`;

function Detail({ icon: Icon, label, value }: { icon: typeof Megaphone; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="mt-0.5 size-3.5 shrink-0 text-[#969386]" aria-hidden />
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#969386]">{label}</p>
                <p className="wrap-break-word text-xs font-medium text-[#41423B]">{value}</p>
            </div>
        </div>
    );
}

/* ------------------------------ accordion card ----------------------------- */

function FeaturedCard({
    item,
    index,
    open,
    onToggle,
}: {
    item: Announcement;
    index: number;
    open: boolean;
    onToggle: () => void;
}) {
    const panelId = `featured-panel-${item.id}`;
    const showWhen = item.kind === "seminar" && item.eventAt;
    const showVenue = (item.kind === "seminar" || item.kind === "announcement") && (item.venue || item.eventAt);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.2), ease }}
            className={`overflow-hidden rounded-2xl border bg-white transition-shadow ${open
                ? "border-[#A3A171]/60 shadow-[0_18px_40px_-18px_rgba(40,40,25,0.35)]"
                : "border-neutral-200/80 hover:shadow-[0_12px_30px_-16px_rgba(40,40,25,0.25)]"
                }`}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
                <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                        {item.pinned && <Pin className="size-3 shrink-0 fill-[#716f49] text-[#716f49]" aria-hidden />}
                        {item.kind !== "seminar" && "Posted "}
                        {fmt(primaryDate(item), "MMM d, yyyy")}
                    </span>
                    <span
                        className={`mt-0.5 block text-sm font-semibold leading-snug text-neutral-900 ${open ? "" : "line-clamp-2"
                            }`}
                    >
                        {item.title}
                    </span>
                </span>

                <ChevronDown
                    className={`size-4 shrink-0 text-neutral-500 transition-transform duration-300 ${open ? "rotate-180" : ""
                        }`}
                    aria-hidden
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={panelId}
                        role="region"
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-4 border-t border-neutral-100 px-4 pb-4 pt-4">
                            {item.poster && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.poster}
                                    alt={`${item.title} poster`}
                                    loading="lazy"
                                    className="max-h-56 w-full rounded-xl border border-neutral-200/80 object-cover"
                                />
                            )}

                            <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                                {item.body}
                            </p>

                            {(showWhen || showVenue) && (
                                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-3.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    {showWhen && (
                                        <Detail
                                            icon={CalendarClock}
                                            label="When"
                                            value={fmt(item.eventAt, "MMM d, yyyy · h:mm a")}
                                        />
                                    )}
                                    {showVenue && (
                                        <Detail icon={MapPin} label="Venue" value={item.venue || "Online / TBD"} />
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-[11px] text-neutral-500">
                                    {item.author?.name ? `${item.author.name} · ` : ""}
                                    updated {fmt(item.updatedAt, "MMM d, yyyy")}
                                </p>
                                <Link
                                    href={noticeHref(item.id)}
                                    className="group inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700"
                                >
                                    Read full post
                                    <ArrowUpRight
                                        className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        aria-hidden
                                    />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* --------------------------------- section --------------------------------- */

export default function FeaturedNews({
    notices = [],
    perColumn = DEFAULT_PER_COLUMN,
}: {
    /** Optional while the backend isn't integrated - dummy data is shown when empty. */
    notices?: Announcement[];
    /** How many items to feature in each column. */
    perColumn?: number;
}) {
    // DUMMY-DATA: fall back to sample items when the API returns nothing.
    // Once the backend is integrated, delete this line and use `notices` directly.
    const source = notices.length > 0 ? notices : DUMMY_ANNOUNCEMENTS;

    const columns = useMemo(() => {
        const sorted = featuredSort(source);
        return SECTIONS.map((section) => {
            const all = sorted.filter((n) => n.kind === section.kind);
            return { ...section, total: all.length, items: all.slice(0, perColumn) };
        }).filter((c) => c.items.length > 0);
    }, [source, perColumn]);

    // One open card per column; the first card of each column starts open.
    const [openIds, setOpenIds] = useState<Partial<Record<AnnouncementKind, string | null>>>(() =>
        Object.fromEntries(columns.map((c) => [c.kind, c.items[0]?.id ?? null]))
    );

    const toggle = (kind: AnnouncementKind, id: string) =>
        setOpenIds((cur) => ({ ...cur, [kind]: cur[kind] === id ? null : id }));

    // Nothing published - don't render an empty section on the home page.
    if (columns.length === 0) return null;

    const gridCols =
        columns.length === 1 ? "lg:grid-cols-1 lg:max-w-xl lg:mx-auto" : columns.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";

    return (
        <section id="news" className="relative overflow-hidden bg-[#F8FAFC]  pt-20">
            <div className="relative">
                {/* heading */}
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Stay Informed with Our <span className="text-[#716f49]">Latest News</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        Highlights from the lab - conferences, notices and seminars, pinned and fresh.
                    </motion.p>
                </div>

                {/* columns */}
                <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                    <div className={`grid grid-cols-1 items-start gap-8 ${gridCols}`}>
                        {columns.map((col) => (
                            <div key={col.kind} className="min-w-0">
                                <div className="mb-4 flex items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900">{col.title}</h3>
                                        <p className="text-xs text-neutral-500">{col.blurb}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${col.badgeClass}`}>
                                        {col.total}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {col.items.map((item, i) => (
                                        <FeaturedCard
                                            key={item.id}
                                            item={item}
                                            index={i}
                                            open={openIds[col.kind] === item.id}
                                            onToggle={() => toggle(col.kind, item.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* view all */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease }}
                        className="mt-12 flex justify-center"
                    >
                        <Link
                            href="/news"
                            className="group inline-flex items-center gap-2 rounded-full bg-[#716f49] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(113,111,73,0.8)] transition-colors hover:bg-[#1f321c]"
                        >
                            View all news
                            <ArrowRight
                                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                aria-hidden
                            />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}