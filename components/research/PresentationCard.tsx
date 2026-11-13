"use client";

import { useState, type MouseEvent } from "react";
import { motion } from "motion/react";
import { CalendarDays, Check, MapPin, Mic2, Presentation as PresentationIcon, Share2 } from "lucide-react";
import { Highlight, ease } from "./research-shared";

// Deep tones so the white slide text always reads clearly.
const SLIDE_TINTS = [
    { from: "#5F5D3C", to: "#1F321C" },
    { from: "#4F6B52", to: "#1F321C" },
    { from: "#716f49", to: "#2A3A26" },
];

/** Landscape, slide-shaped card for presentations. */
export default function PresentationCard({
    index,
    tokens,
    topic,
    type,
    year,
    date,
    title,
    speakers,
    event,
    description,
    shareText,
    openLabel,
    onOpen,
}: {
    index: number;
    tokens: string[];
    topic: string;
    type: string;
    year: number;
    date: string;
    title: string;
    speakers: string;
    event?: string;
    description?: string;
    shareText: string;
    openLabel: string;
    onOpen: () => void;
}) {
    const tint = SLIDE_TINTS[index % SLIDE_TINTS.length];
    const [copied, setCopied] = useState(false);

    const share = (clickEvent: MouseEvent) => {
        clickEvent.stopPropagation();
        navigator.clipboard?.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: Math.min((index % 3) * 0.08, 0.24), ease }}
            whileHover={{ y: -6 }}
            onClick={onOpen}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-[#D8D5C9] bg-white shadow-[0_14px_30px_-16px_rgba(31,50,28,0.45)] transition-shadow duration-300 hover:shadow-[0_24px_44px_-18px_rgba(31,50,28,0.55)]"
        >
            {/* slide face */}
            <div
                className="relative flex aspect-video flex-col justify-between overflow-hidden p-5 text-white"
                style={{ background: `linear-gradient(135deg, ${tint.from} 0%, ${tint.to} 100%)` }}
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                        backgroundSize: "18px 18px",
                    }}
                />
                <PresentationIcon
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-4 size-36 -rotate-6 text-white/[0.07]"
                />

                <div className="relative flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="inline-flex max-w-[70%] items-center gap-1.5 truncate rounded-lg bg-white/15 px-2.5 py-1 backdrop-blur-sm">
                        <Mic2 className="size-3 shrink-0" aria-hidden />
                        <span className="truncate">
                            <Highlight text={type} tokens={tokens} />
                        </span>
                    </span>
                    <span className="text-white/70">{year}</span>
                </div>

                <h3 className="relative line-clamp-3 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                    <Highlight text={title} tokens={tokens} />
                </h3>

                <div className="relative flex items-end justify-between gap-3">
                    <p className="line-clamp-1 text-xs font-medium text-white/85">
                        <Highlight text={speakers} tokens={tokens} />
                    </p>
                </div>

                <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-white/40 via-white/10 to-transparent"
                />
            </div>

            {/* details strip */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-[#716f49]" aria-hidden />
                        {date}
                    </span>
                    {event && (
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0 text-[#716f49]" aria-hidden />
                            <span className="truncate">
                                <Highlight text={event} tokens={tokens} />
                            </span>
                        </span>
                    )}
                </div>

                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-neutral-600">
                    {description ?? "No description available."}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                    {topic ? (
                        <span className="max-w-[65%] truncate rounded-lg border border-[#D8D5C9] bg-[#F3F2E8] px-2.5 py-1 text-[11px] font-medium text-[#5E5D50]">
                            <Highlight text={topic} tokens={tokens} />
                        </span>
                    ) : (
                        <span />
                    )}

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
                            onClick={(clickEvent) => {
                                clickEvent.stopPropagation();
                                onOpen();
                            }}
                            className="grid h-8 place-items-center rounded-lg bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-700"
                        >
                            View
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
