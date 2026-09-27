"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    FileText,
    Presentation,
    Lightbulb,
} from "lucide-react";

const mockData = [
    {
        id: 1,
        title: "Papers Overview",
        icon: FileText,
        accent: "#5579A6",
        stats: [
            {
                label: "Published",
                value: 64,
                percent: 50,
                color: "#4F8A63",
            },
            {
                label: "Under Review",
                value: 24,
                percent: 18.75,
                color: "#C58A3A",
            },
            {
                label: "Drafts",
                value: 18,
                percent: 14.06,
                color: "#5579A6",
            },
            {
                label: "Access Requests Pending",
                value: 12,
                percent: 9.38,
                color: "#C58A3A",
            },
            {
                label: "Rejected",
                value: 6,
                percent: 4.69,
                color: "#B85C55",
            },
            {
                label: "Archived",
                value: 4,
                percent: 3.12,
                color: "#8E625D",
            },
        ],
    },
    {
        id: 2,
        title: "Weekly Presentations",
        icon: Presentation,
        accent: "#C58A3A",
        stats: [
            {
                label: "Archived",
                value: 32,
                percent: 80,
                color: "#4F8A63",
            },
            {
                label: "Scheduled",
                value: 3,
                percent: 7.5,
                color: "#5579A6",
            },
            {
                label: "In Review",
                value: 2,
                percent: 5,
                color: "#C58A3A",
            },
            {
                label: "Uploaded Pending Review",
                value: 1,
                percent: 2.5,
                color: "#5579A6",
            },
            {
                label: "Rescheduled",
                value: 1,
                percent: 2.5,
                color: "#4F8A63",
            },
            {
                label: "Missed",
                value: 1,
                percent: 2.5,
                color: "#B85C55",
            },
        ],
    },
    {
        id: 3,
        title: "Collaborations & Innovations",
        icon: Lightbulb,
        accent: "#8A6A9C",
        stats: [
            {
                label: "Active",
                value: 15,
                percent: 37.5,
                color: "#4F8A63",
            },
            {
                label: "Prototyping",
                value: 6,
                percent: 15,
                color: "#5579A6",
            },
            {
                label: "In Review",
                value: 5,
                percent: 12.5,
                color: "#C58A3A",
            },
            {
                label: "On Hold",
                value: 4,
                percent: 10,
                color: "#C58A3A",
            },
            {
                label: "Completed",
                value: 8,
                percent: 20,
                color: "#4F8A63",
            },
            {
                label: "Idea Stage",
                value: 2,
                percent: 5,
                color: "#B85C55",
            },
        ],
    },
];

const summaryData = [
    {
        title: "Papers Shared This Month",
        value: "18",
        color: "#C58A3A",
    },
    {
        title: "Presentations Archived",
        value: "32",
        color: "#5579A6",
    },
    {
        title: "Active Collaborations",
        value: "24",
        color: "#4F8A63",
    },
];

export default function OverviewComponent() {
    return (
        <div className="w-full py-4">
            <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl">
                <CardContent className="p-5">

                    {/* =========================
                        Statistics
                    ========================= */}
                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:gap-0">

                        {mockData.map((group, groupIndex) => {
                            const Icon = group.icon;

                            return (
                                <div
                                    key={group.id}
                                    className={`px-3
                                        ${groupIndex !== mockData.length - 1
                                            ? "xl:border-r xl:border-[#D9DAD3]"
                                            : ""
                                        }
                                    `}
                                >
                                    {/* Header */}
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#27302A]">
                                                {group.title}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-7 space-y-5">
                                        {group.stats.map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="group/stat"
                                            >
                                                {/* Label + Percentage */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        

                                                        <span className="truncate text-[13px] font-medium text-[#59605A]">
                                                            {stat.label}
                                                        </span>
                                                    </div>

                                                    <span className="shrink-0 text-[12px] tabular-nums text-[#85897F]">
                                                        {stat.percent.toFixed(2)}%
                                                    </span>
                                                </div>

                                                {/* Progress */}
                                                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#DFE0DA]">
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${stat.percent}%`,
                                                            backgroundColor:
                                                                stat.color,
                                                        }}
                                                    />
                                                </div>

                                                {/* Value */}
                                                <div className="mt-1.5 text-[11px] text-[#92968D]">
                                                    {stat.value}{" "}
                                                    {stat.label.toLowerCase()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* =========================
                        Divider
                    ========================= */}
                    <div className="my-7 h-px bg-[#D8D9D2]" />

                    {/* =========================
                        Summary
                    ========================= */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {summaryData.map((summary) => (
                            <div
                                key={summary.title}
                                className="group rounded-[14px] border border-[#D9DAD3] bg-[#ECEBE4]/70 px-4 py-4 transition-all duration-300 hover:border-[#C9CAC1]hover:bg-[#E8E7DF]"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#85897F]">
                                        {summary.title}
                                    </p>
                                </div>

                                <div className="mt-3 flex items-end gap-2">
                                    <span className="text-[26px] font-semibold leading-none tracking-[-0.04em] text-[#27302A]">
                                        {summary.value}
                                    </span>

                                    <span className="mb-0.5 text-[11px] text-[#8A8E84]">
                                        this period
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}