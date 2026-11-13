"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { fetchResearch } from "@/lib/api/research";
import { loadPdfThumb } from "@/lib/pdf-thumb";
import type { Paper, Presentation } from "@/lib/types/research";
import { DetailModal, paperModal } from "@/components/research/research-shared";
import { motion } from "motion/react";
import {
    BookOpen,
    Check,
    FileText,
    Share2,
} from "lucide-react";

/* ----------------------------- helpers ----------------------------- */

/** Up to this many featured papers are shown as static cards; more scroll as a marquee. */
const MARQUEE_THRESHOLD = 4;

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171" }, // olive
    { from: "#EAF0E5", to: "#8FA382" }, // dark green
    { from: "#F1EFE1", to: "#88864F" }, // deep olive
];

// Widths (%) used to draw the faux body text of the paper sheet.
const LINE_WIDTHS = [100, 94, 98, 88, 100, 92, 96, 84, 100, 90, 97, 62];

function TextLines({ seed, count }: { seed: number; count: number }) {
    return (
        <div className="space-y-1.5">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="h-0.75 rounded-lg bg-neutral-300/80"
                    style={{ width: `${LINE_WIDTHS[(i + seed) % LINE_WIDTHS.length]}%` }}
                />
            ))}
        </div>
    );
}

/* ------------------------ stacked paper card ------------------------ */

function PaperCard({
    paper,
    index,
    onOpen,
    onHoverChange,
}: {
    paper: Paper;
    index: number;
    onOpen: (p: Paper) => void;
    onHoverChange: (paused: boolean) => void;
}) {
    const tint = TINTS[index % TINTS.length];
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLElement>(null);
    const [thumb, setThumb] = useState<string | null>(null);

    // Only render the PDF once the card is (almost) on screen.
    useEffect(() => {
        const node = cardRef.current;
        if (!node) return;
        let cancelled = false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                loadPdfThumb(paper.id).then((url) => {
                    if (!cancelled) setThumb(url);
                });
            },
            { rootMargin: "200px" }
        );
        observer.observe(node);

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [paper.id]);

    const share = (event: MouseEvent) => {
        event.stopPropagation();
        navigator.clipboard?.writeText(paper.htmlUrl ?? "");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    const authors = paper.authors.slice(0, 4).join(" · ") + (paper.authors.length > 4 ? " · et al." : "");

    return (
        <motion.article
            ref={cardRef}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onPointerEnter={() => onHoverChange(true)}
            onPointerLeave={() => onHoverChange(false)}
            className="group relative h-85 w-64 shrink-0 cursor-pointer"
            onClick={() => onOpen(paper)}
        >
            {/* sheets stacked behind the first page */}
            <div className="absolute inset-0 origin-bottom-left -rotate-3 rounded-lg bg-[#ECEBDD] shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:-rotate-6" />
            <div className="absolute inset-0 origin-bottom-right rotate-2 rounded-lg bg-[#F3F2E8] shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:rotate-4" />

            {/* first page */}
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_14px_30px_-10px_rgba(31,50,28,0.45)] ring-1 ring-black/10">
                <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${tint.from}, ${tint.to})` }}
                />

                {thumb ? (
                    <div className="relative flex-1 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={thumb}
                            alt={`First page of ${paper.title}`}
                            className="absolute inset-0 size-full object-cover object-top"
                            draggable={false}
                        />
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col px-4 pt-3">
                        {/* running header */}
                        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-1.5 text-[8px] font-medium uppercase tracking-wider text-neutral-400">
                            <span className="truncate">
                                {paper.type} · {paper.year} · {paper.publisher}
                            </span>
                            <span className="max-w-24 shrink-0 truncate text-[#716f49]">{paper.topic}</span>
                        </div>

                        {/* title */}
                        <h3 className="mt-3 line-clamp-4 text-center font-serif text-[15px] font-bold leading-snug text-neutral-900">
                            {paper.title}
                        </h3>

                        {/* authors + venue */}
                        <p className="mt-2 line-clamp-2 text-center text-[9px] font-medium leading-snug text-neutral-700">
                            {authors}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-center text-[8px] italic leading-snug text-neutral-400">
                            {paper.venue}
                        </p>

                        {/* abstract */}
                        <p className="mt-3 line-clamp-3 text-justify font-serif text-[9px] leading-snug text-neutral-600">
                            <span className="font-bold italic text-neutral-800">Abstract-</span>
                            {paper.abstract ?? "No abstract available."}
                        </p>

                        {/* faux two-column body text */}
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <TextLines seed={index} count={8} />
                            <TextLines seed={index + 5} count={8} />
                        </div>
                    </div>
                )}

                {/* footer fades over the text, like a page curling away */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-white via-white/95 to-transparent px-4 pb-3 pt-10">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-700">{paper.publisher}</p>
                        <p className="mt-0.5 text-[10px] text-neutral-400">{paper.year}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            aria-label="Share paper"
                            onClick={share}
                            className="grid size-8 place-items-center rounded-lg border border-[#dddbd8] bg-[#F8FAFC] text-neutral-800 transition hover:bg-[#F3F2E8]"
                        >
                            {copied ? <Check className="size-3.5 text-emerald-700" /> : <Share2 className="size-3.5" />}
                        </button>
                        <button
                            aria-label="Open paper details"
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpen(paper);
                            }}
                            className="grid size-8 place-items-center rounded-lg bg-neutral-900 text-white transition hover:bg-neutral-700"
                        >
                            <BookOpen className="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

function MarqueeRow<T extends { id: string }>({
    items,
    duration,
    offset = 0,
    reverse = false,
    renderCard,
}: {
    items: T[];
    duration: number;
    offset?: number;
    reverse?: boolean;
    renderCard: (item: T, index: number, onHoverChange: (paused: boolean) => void) => ReactNode;
}) {
    const [paused, setPaused] = useState(false);
    // Repeat enough times to fill wide screens, then duplicate once for a seamless -50% -> 0 loop.
    // Spacing is a per-item padding (not flex gap / track padding) so the track is exactly
    // two identical halves; otherwise the -50% shift lands off by the gap and the loop jumps.
    const base = [...items, ...items, ...items];
    return (
        <div
            className="relative overflow-hidden py-8"
            style={{
                maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
        >
            <div
                className={`rp-marquee flex w-max${reverse ? " rp-marquee-rtl" : ""}`}
                style={{
                    animationDuration: `${duration}s`,
                    animationDelay: `${offset}s`,
                    animationPlayState: paused ? "paused" : "running",
                }}
            >
                {[...base, ...base].map((item, i) => (
                    <div key={`${item.id}-${i}`} className="shrink-0 pr-16">
                        {renderCard(item, i, setPaused)}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------- section ------------------------------- */

export default function Resources() {
    const [active, setActive] = useState<Paper | null>(null);
    const [researchPapers, setResearchPapers] = useState<Paper[]>([]);
    const [allPresentations, setAllPresentations] = useState<Presentation[]>([]);
    const modal = useMemo(() => {
        if (!active) return null;
        const apiBaseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
        const presentation = allPresentations.find((item) =>
            Boolean(active.htmlUrl && active.htmlUrl === item.videoUrl)
        );
        return paperModal(
            active,
            `${apiBaseUrl}/api/research/${active.id}/pdf`,
            `${apiBaseUrl}/api/research/${active.id}/preview`,
            presentation,
            presentation ? `${apiBaseUrl}/api/research/${presentation.id}/presentation` : undefined,
        );
    }, [active, allPresentations]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let activeRequest = true;

        fetchResearch()
            .then(({ papers: fetchedPapers, presentations: fetchedPresentations }) => {
                if (!activeRequest) return;
                setResearchPapers(fetchedPapers.filter((paper) => paper.featured));
                setAllPresentations(fetchedPresentations);
                setIsLoaded(true);
            })
            .catch((error: unknown) => {
                if (!activeRequest) return;
                setLoadError(error instanceof Error ? error.message : "Unable to load research.");
            });

        return () => {
            activeRequest = false;
        };
    }, []);

    return (
        <section id="research-papers" className="relative overflow-hidden bg-[#F8FAFC] pt-20">
            {/* marquee keyframes: top row left → right, bottom row right → left, seamless, respects reduced motion */}
            <style>{`
        @keyframes rp-ltr { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes rp-rtl { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .rp-marquee { animation-name: rp-ltr; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .rp-marquee-rtl { animation-name: rp-rtl; }
        @media (prefers-reduced-motion: reduce) { .rp-marquee { animation: none; } }
      `}</style>

            {/* heading */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-3xl px-4 text-center"
            >
                <h2 className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                    Explore Research That Shapes{" "}
                    <span className="text-[#716f49]">
                        Intelligent Systems
                    </span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
                    Browse peer-reviewed papers from our lab across machine learning, computer vision,
                    cybersecurity and blockchain. Search, filter and dive straight into the full text.
                </p>
            </motion.div>

            {loadError && (
                <p className="mx-auto mt-8 max-w-2xl px-4 text-center text-sm text-red-700" role="alert">
                    {loadError}
                </p>
            )}

            {isLoaded && !loadError && researchPapers.length === 0 && (
                <div className="mx-auto mt-10 max-w-xl rounded-lg border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-lg bg-[#F3F2E8] text-[#716f49]">
                        <FileText className="size-5" aria-hidden />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-neutral-900">No featured research yet</p>
                    <p className="mt-1 text-xs text-neutral-500">
                        Featured papers from the lab will appear here once they are published.
                    </p>
                </div>
            )}

            {/* featured papers marquee (moves left → right) */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mt-10"
            >
                {researchPapers.length > MARQUEE_THRESHOLD ? (
                    <MarqueeRow
                        items={researchPapers}
                        duration={70}
                        renderCard={(paper, i, onHoverChange) => (
                            <PaperCard paper={paper} index={i} onOpen={setActive} onHoverChange={onHoverChange} />
                        )}
                    />
                ) : (
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-12 px-4 py-8">
                        {researchPapers.map((paper, i) => (
                            <PaperCard
                                key={paper.id}
                                paper={paper}
                                index={i}
                                onOpen={setActive}
                                onHoverChange={() => {}}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            <DetailModal data={modal} onClose={() => setActive(null)} />
        </section>
    );
}