"use client";

// components/research/ResearchPapers.tsx
// deps: npm i motion lucide-react

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
    BookOpen,
    ChevronDown,
    FileText,
    Lock,
    Quote,
    Search,
    Share2,
    Unlock,
    X,
} from "lucide-react";

// SAMPLE DATA: replace with your real papers (or fetch from your API / Prisma).

export type PaperType = "Conference" | "Journal" | "Magazine" | "Early Access";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: PaperType;
  publisher: string;
  citedBy: number;
  topic: string;
  access: "open" | "locked";
  abstract?: string;
  htmlUrl?: string;
  pdfUrl?: string;
}

export const papers: Paper[] = [
  {
    id: "p1",
    title:
      "E-STGCN: Enhanced Spatial-Temporal Graph Convolutional Network for Road Traffic Forecasting",
    authors: ["Oleg Golovnin", "Nikita Perevozchikov"],
    venue: "2021 International Conference on Information Technology and Nanotechnology (ITNT)",
    year: 2021,
    type: "Conference",
    publisher: "IEEE",
    citedBy: 2,
    topic: "Graph Neural Networks",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p2",
    title: "Integrating YOLO and DG-STGCN Systems for Enhanced Human Action Recognition",
    authors: [
      "Tzu-Shan Hsiao",
      "Hsun-Yuan Hou",
      "Po Ting Lin",
      "Ching-Yuan Chang",
      "Yung-Yao Chen",
      "Chao-Lung Yang",
    ],
    venue: "2024 International Conference on Advanced Robotics and Intelligent Systems (ARIS)",
    year: 2024,
    type: "Conference",
    publisher: "IEEE",
    citedBy: 3,
    topic: "Computer Vision",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p3",
    title: "STGCN-Based Spatio-Temporal Evolution Modeling of Distribution System Disaster Chains",
    authors: ["Zongchao Yu", "Ming Wen", "Xintao Xie", "Bo Wen", "Jiaxi Li", "Haipeng Xie", "Jingqi Fan"],
    venue: "2025 IEEE 9th Conference on Energy Internet and Energy System Integration (EI2)",
    year: 2025,
    type: "Conference",
    publisher: "IEEE",
    citedBy: 0,
    topic: "Smart Grid",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p4",
    title: "Sample Paper: Transformer Architectures for Low-Resource Language Understanding",
    authors: ["Author One", "Author Two"],
    venue: "IEEE Transactions on Neural Networks and Learning Systems",
    year: 2023,
    type: "Journal",
    publisher: "IEEE",
    citedBy: 14,
    topic: "Natural Language Processing",
    access: "open",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p5",
    title: "Sample Paper: Federated Learning for Privacy-Preserving Intrusion Detection",
    authors: ["Author Three", "Author Four", "Author Five"],
    venue: "IEEE Access",
    year: 2024,
    type: "Journal",
    publisher: "IEEE",
    citedBy: 9,
    topic: "Cybersecurity",
    access: "open",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p6",
    title: "Sample Paper: Consensus Mechanisms for Scalable Blockchain Networks",
    authors: ["Author Six", "Author Seven"],
    venue: "2022 IEEE International Conference on Blockchain (Blockchain)",
    year: 2022,
    type: "Conference",
    publisher: "IEEE",
    citedBy: 6,
    topic: "Blockchain",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p7",
    title: "Sample Paper: Self-Supervised Representation Learning for Medical Imaging",
    authors: ["Author Eight", "Author Nine"],
    venue: "IEEE Journal of Biomedical and Health Informatics",
    year: 2025,
    type: "Early Access",
    publisher: "IEEE",
    citedBy: 1,
    topic: "Computer Vision",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p8",
    title: "Sample Paper: A Survey of Explainable AI in Safety-Critical Systems",
    authors: ["Author Ten", "Author Eleven", "Author Twelve"],
    venue: "IEEE Computational Intelligence Magazine",
    year: 2023,
    type: "Magazine",
    publisher: "IEEE",
    citedBy: 21,
    topic: "Machine Learning",
    access: "open",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p9",
    title: "Sample Paper: Evolutionary Neural Architecture Search with Multi-Objective Optimization",
    authors: ["Author Thirteen", "Author Fourteen"],
    venue: "2024 IEEE Congress on Evolutionary Computation (CEC)",
    year: 2024,
    type: "Conference",
    publisher: "IEEE",
    citedBy: 5,
    topic: "Neural Networks",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
  {
    id: "p10",
    title: "Sample Paper: Reinforcement Learning for Adaptive Network Resource Allocation",
    authors: ["Author Fifteen", "Author Sixteen"],
    venue: "IEEE Transactions on Network and Service Management",
    year: 2022,
    type: "Journal",
    publisher: "IEEE",
    citedBy: 11,
    topic: "Machine Learning",
    access: "locked",
    abstract: "Abstract text goes here.",
    htmlUrl: "#",
    pdfUrl: "#",
  },
];

/* ----------------------------- helpers ----------------------------- */

const TINTS = [
    { from: "#F3F2E8", to: "#A3A171", dot: "#716F49" }, // olive
    { from: "#EAF0E5", to: "#8FA382", dot: "#1F321C" }, // dark green
    { from: "#F1EFE1", to: "#88864F", dot: "#716F49" }, // deep olive
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* --------------------------- marquee card --------------------------- */

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
    return (
        <motion.article
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onPointerEnter={() => onHoverChange(true)}
            onPointerLeave={() => onHoverChange(false)}
            className="w-75 shrink-0 rounded-[28px] bg-neutral-100 p-2.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]"
        >
            {/* gradient panel */}
            <div
                className="relative h-52.5 overflow-hidden rounded-[22px] ring-1 ring-black/5 flex"
                style={{ background: `linear-gradient(135deg, ${tint.from} 0%, ${tint.to} 100%)` }}
            >
                <span className="absolute left-3.5 top-5.5 max-w-45 truncate rounded-full bg-white/50 px-3 py-1 text-[11px] font-medium text-neutral-800 backdrop-blur-md">
                    {paper.topic}
                </span>

                <button
                    aria-label="Share paper"
                    onClick={() => navigator.clipboard?.writeText(paper.title)}
                    className="absolute right-3.5 top-3.5 grid size-10 place-items-center rounded-xl border border-white/60 bg-white/40 text-neutral-900 backdrop-blur-md transition hover:bg-white/70"
                >
                    <Share2 className="size-4.5" />
                </button>

                <span className="absolute -bottom-4 left-3 select-none text-[92px] font-bold leading-none tracking-tighter text-white/40">
                    {paper.year}
                </span>

                <p className="absolute inset-x-4 top-1/2 line-clamp-3 -translate-y-1/2 text-[15px] font-semibold leading-snug text-neutral-900/80">
                    {paper.title.replace("Sample Paper: ", "")}
                </p>
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
                <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-neutral-900">
                        {paper.authors[0]}
                        {paper.authors.length > 1 && " et al."}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                        {paper.type} · {paper.year}
                    </p>
                </div>
                <button
                    onClick={() => onOpen(paper)}
                    className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                >
                    <BookOpen className="size-3.5" />
                    View paper
                </button>
            </div>
        </motion.article>
    );
}

function MarqueeRow({
    items,
    duration,
    offset = 0,
    reverse = false,
    onOpen,
}: {
    items: Paper[];
    duration: number;
    offset?: number;
    reverse?: boolean;
    onOpen: (p: Paper) => void;
}) {
    const [paused, setPaused] = useState(false);
    // Repeat enough times to fill wide screens, then duplicate once for a seamless -50% -> 0 loop.
    const base = [...items, ...items, ...items];
    return (
        <div
            className="relative overflow-hidden py-6"
            style={{
                maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
        >
            <div
                className={`rp-marquee flex w-max gap-5${reverse ? " rp-marquee-rtl" : ""}`}
                style={{
                    animationDuration: `${duration}s`,
                    animationDelay: `${offset}s`,
                    animationPlayState: paused ? "paused" : "running",
                }}
            >
                {[...base, ...base].map((p, i) => (
                    <PaperCard
                        key={`${p.id}-${i}`}
                        paper={p}
                        index={i}
                        onOpen={onOpen}
                        onHoverChange={setPaused}
                    />
                ))}
            </div>
        </div>
    );
}

/* ----------------------------- detail modal ---------------------------- */

function PaperModal({ paper, onClose }: { paper: Paper | null; onClose: () => void }) {
    return (
        <AnimatePresence>
            {paper && (
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
                        className="relative w-full max-w-xl rounded-[28px] bg-white p-7 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200"
                        >
                            <X className="size-4" />
                        </button>
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                            {paper.type} · {paper.year} · {paper.publisher}
                        </p>
                        <h3 className="mt-2 pr-8 text-xl font-semibold leading-snug text-neutral-900">
                            {paper.title}
                        </h3>
                        <p className="mt-3 text-sm text-sky-800">{paper.authors.join("; ")}</p>
                        <p className="mt-1 text-sm text-neutral-600">{paper.venue}</p>
                        <p className="mt-5 text-sm leading-relaxed text-neutral-700">
                            {paper.abstract ?? "No abstract available."}
                        </p>
                        <div className="mt-6 flex gap-3">
                            <a
                                href={paper.pdfUrl ?? "#"}
                                className="flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
                            >
                                <FileText className="size-4" /> PDF
                            </a>
                            <a
                                href={paper.htmlUrl ?? "#"}
                                className="rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                            >
                                HTML
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* -------------------------------- section ------------------------------- */

export default function Resources() {
    const [active, setActive] = useState<Paper | null>(null);
    const half = Math.ceil(papers.length / 2);
    const top = papers.slice(0, half);
    const bottom = papers.slice(half).concat(papers.slice(0, 2)); // keep rows from being too short

    return (
        <section id="research-papers" className="relative overflow-hidden bg-[#F8FAFC] py-24">
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

            {/* marquees (top moves left → right, bottom moves right → left) */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mt-12"
            >
                <MarqueeRow items={top} duration={70} onOpen={setActive} />
                <MarqueeRow items={bottom} duration={90} offset={-12} reverse onOpen={setActive} />
            </motion.div>

            <PaperModal paper={active} onClose={() => setActive(null)} />
        </section>
    );
}