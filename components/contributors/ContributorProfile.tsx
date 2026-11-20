"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
    Building2,
    ExternalLink,
    GraduationCap,
    IdCard,
    Mail,
} from "lucide-react";
import type { ContributorData } from "@/lib/api/contributors";
import { ease } from "@/components/research/research-shared";
import { scholarUrl } from "@/lib/scholar";
import ContributionLists from "./ContributionLists";
import PublisherBarChart from "./PublisherBarChart";
import TopicPieChart from "./TopicPieChart";

interface TopicRow {
    topic: string;
    papers: number;
    presentations: number;
    total: number;
}

const topicOf = (item: { category?: string; tags?: string[] }) =>
    item.category?.trim() || item.tags?.[0]?.trim() || "Uncategorized";

function buildTopicStats(data: ContributorData): TopicRow[] {
    const map = new Map<string, TopicRow>();
    const bump = (topic: string, key: "papers" | "presentations") => {
        const row = map.get(topic) ?? { topic, papers: 0, presentations: 0, total: 0 };
        row[key] += 1;
        row.total += 1;
        map.set(topic, row);
    };
    data.papers.forEach((p) => bump(topicOf(p), "papers"));
    data.presentations.forEach((p) => bump(topicOf(p), "presentations"));
    return [...map.values()].sort((a, b) => b.total - a.total || a.topic.localeCompare(b.topic));
}

const initialsOf = (name: string) =>
    name
        .replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, "")
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay, ease }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function ContributorProfile({ data }: { data: ContributorData }) {
    const { profile, papers, presentations } = data;
    const [tab, setTab] = useState<"papers" | "presentations">("papers");
    const topics = useMemo(() => buildTopicStats(data), [data]);

    const stats = [
        { label: "Papers", value: papers.length },
        { label: "Presentations", value: presentations.length },
        { label: "Topics", value: topics.length },
    ];

    const details = [
        { icon: GraduationCap, label: "Role", value: profile.role, href: undefined as string | undefined },
        { icon: Building2, label: "Institution", value: profile.institution, href: undefined },
        { icon: IdCard, label: "Scholar ID", value: profile.scholarId, href: scholarUrl(profile.scholarId) },
        { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    ].filter((d) => d.value);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6">
            {/* ---------------- personal information ---------------- */}
            <Reveal>
                <section className="overflow-hidden rounded-lg border border-[#D8D5C9] bg-[#F3F2E8] shadow-[0_14px_30px_-20px_rgba(31,50,28,0.45)]">
                    <div className="h-20 bg-linear-to-br from-[#1F321C] to-[#716f49] sm:h-28" />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.12]"
                        style={{
                            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                            backgroundSize: "18px 18px",
                        }}
                    />
                    <div className="px-5 pb-6 sm:px-8">
                        <div className="-mt-10 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
                            <div
                                className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-[#F3F2E8] bg-[#716f49] text-2xl font-semibold tracking-wide text-white sm:size-40 sm:text-3xl"
                            >
                                {profile.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={profile.avatarUrl}
                                        alt={`${profile.name} profile photo`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initialsOf(profile.name)
                                )}
                            </div>
                            <div className="min-w-0 sm:pb-1">
                                <h1 className="wrap-break-word text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                                    {profile.name}
                                </h1>
                                <p className="mt-1 text-sm text-neutral-600 sm:text-base">
                                    {[profile.role, profile.institution].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {details.map(({ icon: Icon, label, value, href }) => (
                                <div
                                    key={label}
                                    className="min-w-0 rounded-lg border border-[#D8D5C9] bg-white/60 px-3.5 py-3"
                                >
                                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#716f49]">
                                        <Icon className="size-3.5" aria-hidden />
                                        {label}
                                    </dt>
                                    <dd className="mt-1 truncate text-sm font-medium text-neutral-800" title={value}>
                                        {href ? (
                                            <a
                                                href={href}
                                                {...(href.startsWith("http")
                                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                                    : {})}
                                                className="inline-flex max-w-full items-center gap-1 hover:text-[#716f49] hover:underline"
                                            >
                                                <span className="truncate">{value}</span>
                                                {href.startsWith("http") && (
                                                    <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                                                )}
                                            </a>
                                        ) : (
                                            value
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>
            </Reveal>

            <div className="space-y-4">
                {/* ---------------- headline numbers ---------------- */}
                <Reveal delay={0.05} className="grid grid-cols-3 gap-3 sm:gap-4">
                    {stats.map(({ label, value }) => (
                        <div
                            key={label}
                            className="flex flex-col items-center justify-center rounded-lg border border-[#D8D5C9] bg-white px-3 py-4 text-center shadow-[0_8px_20px_-16px_rgba(31,50,28,0.5)] sm:py-6"
                        >
                            <p className="text-3xl font-bold leading-none text-neutral-900 sm:text-4xl">{value}</p>
                            <p className="mt-2 text-xs font-medium text-neutral-500 sm:text-sm">{label}</p>
                        </div>
                    ))}
                </Reveal>

                {/* ---------------- charts: equal-height cards side by side ---------------- */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
                    <div>
                        <Reveal delay={0.05} className="min-w-0 lg:h-full">
                            <section
                                aria-labelledby="topic-stats"
                                className="@container flex h-full flex-col rounded-lg border border-[#D8D5C9] bg-white p-5 shadow-[0_8px_20px_-16px_rgba(31,50,28,0.5)] sm:p-7"
                            >
                                <h2 id="topic-stats" className="text-lg font-semibold text-neutral-900 sm:text-xl">
                                    Contributions by topic
                                </h2>

                                <div className="flex flex-1 flex-col justify-center">
                                    {topics.length === 0 ? (
                                        <p className="mt-5 text-sm text-neutral-500">No published contributions yet.</p>
                                    ) : (
                                        <TopicPieChart rows={topics} />
                                    )}
                                </div>
                            </section>
                        </Reveal>
                    </div>

                    <div>
                        <Reveal delay={0.1} className="min-w-0 lg:h-full">
                            <section
                                aria-labelledby="publisher-stats"
                                className="flex h-full flex-col rounded-lg border border-[#D8D5C9] bg-white p-5 shadow-[0_8px_20px_-16px_rgba(31,50,28,0.5)] sm:p-7"
                            >
                                <h2 id="publisher-stats" className="text-lg font-semibold text-neutral-900 sm:text-xl">
                                    Papers by publisher
                                </h2>

                                <div className="flex flex-1 flex-col justify-center">
                                    {papers.length === 0 ? (
                                        <p className="mt-5 text-sm text-neutral-500">No published papers yet.</p>
                                    ) : (
                                        <PublisherBarChart papers={papers} />
                                    )}
                                </div>
                            </section>
                        </Reveal>
                    </div>
                </div>
            </div>

            {/* ---------------- papers & presentations ---------------- */}
            <section aria-labelledby="contributions">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
                    <h2 id="contributions" className="text-lg font-semibold text-neutral-900 sm:text-xl">
                        Contributions
                    </h2>
                    <div
                        role="tablist"
                        aria-label="Contribution type"
                        className="inline-flex rounded-lg border border-[#D8D5C9] bg-[#F3F2E8] p-1"
                    >
                        {(
                            [
                                ["papers", `Papers (${papers.length})`],
                                ["presentations", `Presentations (${presentations.length})`],
                            ] as const
                        ).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${tab === key ? "bg-[#716f49] text-white" : "text-[#716f49] hover:bg-white/70"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5">
                    <ContributionLists tab={tab} papers={papers} presentations={presentations} />
                </div>
            </section>
        </div>
    );
}
