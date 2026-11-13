"use client";

import { useRef, useState } from "react";
import type { Member } from "@/lib/api/members";
import { motion, useReducedMotion } from "motion/react";
import { Building2, ChevronLeft, ChevronRight, IdCard, Mail, Users } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const PAGE_SIZE = 12;

const AVATAR_TINTS = [
    { from: "#716f49", to: "#1f321c" }, // olive → dark green
    { from: "#8FA382", to: "#1f321c" }, // sage → dark green
    { from: "#A3A171", to: "#716f49" }, // light olive → olive
];

// Page numbers with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12].
function pageList(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
        out.push(p);
    });
    return out;
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

// Adjust this if your Member type uses a different field name (e.g. photo, avatar, imageUrl).
function getImage(member: Member): string | null {
    const m = member as Member & { image?: string | null; photo?: string | null; avatar?: string | null };
    return m.image || m.photo || m.avatar || null;
}

function MemberCard({ member, index }: { member: Member; index: number }) {
    const tint = AVATAR_TINTS[index % AVATAR_TINTS.length];
    const image = getImage(member);
    const [imgFailed, setImgFailed] = useState(false);
    const showImage = !!image && !imgFailed;

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: Math.min((index % 3) * 0.08, 0.24), ease }}
            whileHover={{ y: -6 }}
            className="group relative aspect-3/4 w-full overflow-hidden rounded-lg p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-24px_rgba(31,50,28,0.45)]"
            style={{ background: `linear-gradient(135deg, ${tint.from} 0%, ${tint.to} 100%)` }}
        >
            {/* media area */}
            <div
                className="relative h-full w-full overflow-hidden rounded-lg"
                style={{ background: `linear-gradient(315deg, ${tint.from} 0%, ${tint.to} 100%)` }}
            >
                {showImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image as string}
                        alt={member.name}
                        loading="lazy"
                        onError={() => setImgFailed(true)}
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div
                        aria-hidden
                        className="absolute inset-0 grid place-items-center pb-28 text-7xl font-bold tracking-tight text-black/90 drop-shadow-sm"
                    >
                        {initials(member.name)}
                    </div>
                )}

                {/* bottom fade for legibility */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-white/85 via-white/45 to-transparent"
                />

                {/* content */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-semibold leading-snug">{member.name}</h2>
                        <span className="mt-1.5 inline-flex max-w-full truncate rounded-lg bg-black/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                            {member.academicRole}
                        </span>
                    </div>

                    <p className="flex items-start gap-2 text-sm leading-5 text-black/80">
                        <Building2 className="mt-0.5 size-4 shrink-0 text-black/60" aria-hidden />
                        <span className="line-clamp-2 min-w-0">{member.institution}</span>
                    </p>

                    <div className="flex flex-col justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-1.5 text-xs text-black/75">
                            <Mail className="size-4 shrink-0" aria-hidden />
                            <span className="truncate">{member.email}</span>
                        </span>

                        <span className="flex min-w-0 items-center gap-1.5 text-xs text-black/75">
                            <IdCard className="size-4 shrink-0" aria-hidden />
                            <span className="truncate">{member.scholarId}</span>
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

export default function MembersSection({ members }: { members: Member[] }) {
    const reduceMotion = useReducedMotion();
    const gridRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = members.slice(start, start + PAGE_SIZE);

    const goToPage = (next: number) => {
        const target = Math.min(totalPages, Math.max(1, next));
        if (target === current) return;
        setPage(target);
        gridRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
        });
    };

    return (
        <section className="relative overflow-hidden py-28 sm:py-32">
            {/* ambient background: soft olive glow + fading dot grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-105 w-205 -translate-x-1/2 rounded-lg bg-[#A3A171]/25 blur-3xl" />
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
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Meet Our <span className="text-[#716f49]">Members</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-3xl text-base text-neutral-600 sm:text-lg"
                    >
                        The researchers, students and collaborators who make Computational Intelligence Lab a community for computational
                        intelligence research.
                    </motion.p>
                </div>

                <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                    {members.length === 0 ? (
                        <div className="mx-auto max-w-xl rounded-lg border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
                            <span className="mx-auto grid size-12 place-items-center rounded-lg bg-[#F3F2E8] text-[#716f49]">
                                <Users className="size-5" aria-hidden />
                            </span>
                            <p className="mt-4 text-sm font-semibold text-neutral-900">No members to display yet</p>
                            <p className="mt-1 text-xs text-neutral-500">
                                The Computational Intelligence Lab member directory will appear here soon.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div
                                ref={gridRef}
                                key={current}
                                className="grid scroll-mt-28 grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4"
                            >
                                {visible.map((member, index) => (
                                    <MemberCard key={member.id} member={member} index={start + index} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <nav
                                    aria-label="Members pagination"
                                    className="mt-12 flex flex-col items-center gap-3"
                                >
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => goToPage(current - 1)}
                                            disabled={current === 1}
                                            aria-label="Previous page"
                                            className="grid size-10 cursor-pointer place-items-center rounded-lg border border-[#dddbd8] bg-[#F3F2E8] text-[#716f49] transition-colors hover:border-[#716f49] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dddbd8]"
                                        >
                                            <ChevronLeft className="size-4" aria-hidden />
                                        </button>

                                        {pageList(current, totalPages).map((p, i) =>
                                            p === "…" ? (
                                                <span key={`gap-${i}`} className="px-1 text-neutral-400" aria-hidden>
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => goToPage(p)}
                                                    aria-label={`Page ${p}`}
                                                    aria-current={p === current ? "page" : undefined}
                                                    className={`size-10 cursor-pointer rounded-lg text-sm font-semibold transition-colors ${p === current
                                                            ? "bg-linear-to-br from-[#1F321C] to-[#716f49] text-white shadow-[0_8px_20px_-8px_rgba(113,111,73,0.7)]"
                                                            : "border border-[#dddbd8] bg-[#F3F2E8] text-[#716f49] hover:border-[#716f49]"
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ),
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => goToPage(current + 1)}
                                            disabled={current === totalPages}
                                            aria-label="Next page"
                                            className="grid size-10 cursor-pointer place-items-center rounded-lg border border-[#dddbd8] bg-[#F3F2E8] text-[#716f49] transition-colors hover:border-[#716f49] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dddbd8]"
                                        >
                                            <ChevronRight className="size-4" aria-hidden />
                                        </button>
                                    </div>
                                    <p className="text-xs text-neutral-500">
                                        Showing {start + 1}-{start + visible.length} of {members.length} members
                                    </p>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}