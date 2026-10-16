"use client";

// components/news/NewsSection.tsx
// deps (already installed): motion, lucide-react, date-fns

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import {
    CalendarClock,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Copy,
    MapPin,
    Megaphone,
    Pin,
    Presentation,
    StickyNote,
} from "lucide-react";

import type { Announcement, AnnouncementKind } from "@/lib/types/admin/announcement";

/** Cards per page, per column. */
const PAGE_SIZE = 5;

const ease = [0.22, 1, 0.36, 1] as const;

const SECTIONS: {
    kind: AnnouncementKind;
    title: string;
    blurb: string;
    icon: typeof Megaphone;
    badgeClass: string;
    iconClass: string;
    empty: string;
}[] = [
        {
            kind: "announcement",
            title: "Conferences",
            blurb: "Calls for papers and conference updates",
            icon: Megaphone,
            badgeClass: "bg-[#E4E6DC] text-[#5C6446]",
            iconClass: "bg-[#E4E6DC] text-[#5C6446]",
            empty: "No conferences have been published yet.",
        },
        {
            kind: "notice",
            title: "Notices",
            blurb: "Quick, at-a-glance lab updates",
            icon: StickyNote,
            badgeClass: "bg-[#ECE7DA] text-[#8A6420]",
            iconClass: "bg-[#ECE7DA] text-[#8A6420]",
            empty: "No notices have been published yet.",
        },
        {
            kind: "seminar",
            title: "Seminars",
            blurb: "Upcoming talks and sessions",
            icon: Presentation,
            badgeClass: "bg-[#E3E8F0] text-[#5579A6]",
            iconClass: "bg-[#E3E8F0] text-[#5579A6]",
            empty: "No seminars have been scheduled yet.",
        },
    ];

/** Shareable URL for an item - opens /news with that card expanded. */
export const noticeHref = (id: string) => `/news?notice=${encodeURIComponent(id)}`;

// The manager saves empty optional dates as "", so use || (not ??) to fall through.
const primaryDate = (n: Announcement) => n.eventAt || n.publishAt || n.createdAt;

const time = (n: Announcement) => {
    const t = new Date(primaryDate(n)).getTime();
    return Number.isNaN(t) ? 0 : t;
};

/** Only published items; pinned first, then newest → oldest. */
export function sortAnnouncements(items: Announcement[]): Announcement[] {
    return items
        .filter((n) => n.status === "published")
        .slice()
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || time(b) - time(a));
}

function fmt(value: string | undefined, pattern: string) {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : format(d, pattern);
}

/** 1 … 4 5 6 … 12 style page list. */
function pageItems(page: number, pages: number): (number | "…")[] {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    const set = new Set<number>([1, pages, page - 1, page, page + 1]);
    if (page <= 2) [2, 3].forEach((n) => set.add(n));
    if (page >= pages - 1) [pages - 2, pages - 1].forEach((n) => set.add(n));
    const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    nums.forEach((n, i) => {
        if (i > 0 && n - nums[i - 1] > 1) out.push("…");
        out.push(n);
    });
    return out;
}

/* ------------------------------- detail row ------------------------------- */

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Megaphone;
    label: string;
    value: string;
}) {
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

/* ------------------------------- accordion card ------------------------------- */

function AccordionCard({
    item,
    open,
    onToggle,
}: {
    item: Announcement;
    open: boolean;
    onToggle: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const panelId = `panel-${item.id}`;

    const copyLink = () => {
        navigator.clipboard?.writeText(`${location.origin}${noticeHref(item.id)}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const extras = (item.extraFields ?? []).filter((f) => f.key.trim() || f.value.trim());
    const showWhen = item.kind === "seminar" && item.eventAt;
    const showVenue = (item.kind === "seminar" || item.kind === "announcement") && (item.venue || item.eventAt);

    return (
        <motion.div
            id={`notice-${item.id}`}
            layout="position"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease }}
            className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white transition-shadow ${open
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
                                    className="max-h-80 w-full rounded-xl border border-neutral-200/80 object-cover"
                                />
                            )}

                            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{item.body}</p>

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

                            {extras.length > 0 && (
                                <dl className="divide-y divide-neutral-100 rounded-xl border border-neutral-200/80 text-xs">
                                    {extras.map((f, i) => (
                                        <div key={`${f.key}-${i}`} className="flex gap-3 px-3.5 py-2.5">
                                            <dt className="w-2/5 shrink-0 font-semibold text-neutral-500">{f.key}</dt>
                                            <dd className="min-w-0 flex-1 wrap-break-word font-medium text-neutral-800">
                                                {f.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-[11px] text-neutral-500">
                                    {item.author?.name ? `${item.author.name} · ` : ""}
                                    updated {fmt(item.updatedAt, "MMM d, yyyy")}
                                    {item.publishAt ? ` · goes live ${fmt(item.publishAt, "MMM d, yyyy")}` : ""}
                                </p>
                                <button
                                    type="button"
                                    onClick={copyLink}
                                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="size-3.5" /> Link copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3.5" /> Copy link
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ----------------------------- pagination ----------------------------- */

function ColumnPagination({
    kind,
    page,
    pages,
    total,
    start,
    shown,
    onChange,
}: {
    kind: AnnouncementKind;
    page: number;
    pages: number;
    total: number;
    start: number;
    shown: number;
    onChange: (p: number) => void;
}) {
    const arrow =
        "grid size-8 place-items-center rounded-full text-neutral-600 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-35";

    return (
        <nav aria-label={`${kind} pagination`} className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full border border-neutral-200/80 bg-white/80 p-1 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md">
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
                        <span key={`gap-${i}`} className="grid size-8 place-items-center text-xs text-neutral-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onChange(item)}
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? "page" : undefined}
                            className="relative grid size-8 place-items-center rounded-full text-xs font-medium"
                        >
                            {item === page && (
                                <motion.span
                                    layoutId={`page-pill-${kind}`}
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

            <p className="text-[11px] text-neutral-500">
                Showing {start + 1}–{start + shown} of {total}
            </p>
        </nav>
    );
}

/* ------------------------------ section ----------------------------- */

export default function NewsNotices({
    notices,
    activeNoticeId,
}: {
    notices: Announcement[];
    activeNoticeId?: string;
}) {
    const grouped = useMemo(() => {
        const sorted = sortAnnouncements(notices);
        return {
            announcement: sorted.filter((n) => n.kind === "announcement"),
            notice: sorted.filter((n) => n.kind === "notice"),
            seminar: sorted.filter((n) => n.kind === "seminar"),
        } satisfies Record<AnnouncementKind, Announcement[]>;
    }, [notices]);

    // One open card per column (FAQ style). A shared link opens its card.
    const [openIds, setOpenIds] = useState<Record<AnnouncementKind, string | null>>(() => {
        const init: Record<AnnouncementKind, string | null> = { announcement: null, notice: null, seminar: null };
        if (activeNoticeId) {
            (Object.keys(grouped) as AnnouncementKind[]).forEach((k) => {
                if (grouped[k].some((n) => n.id === activeNoticeId)) init[k] = activeNoticeId;
            });
        }
        return init;
    });

    // Current page per column. A shared link jumps to the page containing its card.
    const [pageByKind, setPageByKind] = useState<Record<AnnouncementKind, number>>(() => {
        const init: Record<AnnouncementKind, number> = { announcement: 1, notice: 1, seminar: 1 };
        if (activeNoticeId) {
            (Object.keys(grouped) as AnnouncementKind[]).forEach((k) => {
                const idx = grouped[k].findIndex((n) => n.id === activeNoticeId);
                if (idx >= 0) init[k] = Math.floor(idx / PAGE_SIZE) + 1;
            });
        }
        return init;
    });

    const scrolled = useRef(false);
    useEffect(() => {
        if (!activeNoticeId || scrolled.current) return;
        scrolled.current = true;
        const t = window.setTimeout(() => {
            document.getElementById(`notice-${activeNoticeId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
        return () => window.clearTimeout(t);
    }, [activeNoticeId]);

    const toggle = (kind: AnnouncementKind, id: string) =>
        setOpenIds((cur) => ({ ...cur, [kind]: cur[kind] === id ? null : id }));

    const goTo = (kind: AnnouncementKind, p: number) => {
        setPageByKind((cur) => ({ ...cur, [kind]: p }));
        setOpenIds((cur) => ({ ...cur, [kind]: null }));
        document.getElementById(`news-col-${kind}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const total = grouped.announcement.length + grouped.notice.length + grouped.seminar.length;

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
                        className="mt-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Stay Informed with Our <span className="text-[#716f49]">Latest News</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        Conferences, notices and seminar schedules, all published in one place so you never miss what
                        matters.
                    </motion.p>
                </div>

                <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                    {total === 0 ? (
                        <p className="py-20 text-center text-sm text-neutral-500">
                            Nothing has been published yet. Please check back soon.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                            {SECTIONS.map((section) => {
                                const items = grouped[section.kind];
                                const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
                                const current = Math.min(pageByKind[section.kind], pages);
                                const start = (current - 1) * PAGE_SIZE;
                                const visible = items.slice(start, start + PAGE_SIZE);

                                return (
                                    <div key={section.kind} id={`news-col-${section.kind}`} className="min-w-0 scroll-mt-24">
                                        <div className="mb-4 flex items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
                                            <div>
                                                <h2 className="text-lg font-semibold text-neutral-900">{section.title}</h2>
                                                <p className="text-xs text-neutral-500">{section.blurb}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${section.badgeClass}`}
                                            >
                                                {items.length}
                                            </span>
                                        </div>

                                        {items.length === 0 ? (
                                            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-4 py-10 text-center text-sm text-neutral-500">
                                                {section.empty}
                                            </p>
                                        ) : (
                                            <>
                                                <motion.div
                                                    key={current}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.35, ease }}
                                                    className="space-y-3"
                                                >
                                                    {visible.map((item) => (
                                                        <AccordionCard
                                                            key={item.id}
                                                            item={item}
                                                            open={openIds[section.kind] === item.id}
                                                            onToggle={() => toggle(section.kind, item.id)}
                                                        />
                                                    ))}
                                                </motion.div>

                                                {pages > 1 && (
                                                    <ColumnPagination
                                                        kind={section.kind}
                                                        page={current}
                                                        pages={pages}
                                                        total={items.length}
                                                        start={start}
                                                        shown={visible.length}
                                                        onChange={(p) => goTo(section.kind, p)}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}