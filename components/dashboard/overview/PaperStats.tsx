"use client";

import React, { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type PaperTopic =
    | "Machine Learning"
    | "Computer Vision"
    | "NLP"
    | "Graph Neural Networks"
    | "Optimization";

const PaperStats = () => {
    const [activeTab, setActiveTab] =
        useState<PaperTopic>("Machine Learning");

    const paperTopicsData: Record<
        PaperTopic,
        {
            count: number;
            total: number;
            percentage: number;
        }
    > = {
        "Machine Learning": {
            count: 45,
            total: 90,
            percentage: 50,
        },
        "Computer Vision": {
            count: 32,
            total: 80,
            percentage: 40,
        },
        NLP: {
            count: 28,
            total: 40,
            percentage: 70,
        },
        "Graph Neural Networks": {
            count: 15,
            total: 30,
            percentage: 50,
        },
        Optimization: {
            count: 12,
            total: 20,
            percentage: 60,
        },
    };

    const currentData = paperTopicsData[activeTab];

    const chartData = [
        {
            name: "Completed",
            value: currentData.percentage,
        },
        {
            name: "Remaining",
            value: 100 - currentData.percentage,
        },
    ];

    const topics = Object.keys(paperTopicsData) as PaperTopic[];

    return (
        <div className="w-full py-4">
            <Card
                className="
                    group
                    w-full
                    overflow-hidden
                    rounded-[20px]
                    border border-white/60
                    bg-[#F4F3EE]/95
                    backdrop-blur-xl
                    transition-all duration-300
                "
            >
                <div className="p-5">

                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2
                                    className="
                                        text-[15px]
                                        font-semibold
                                        tracking-[-0.01em]
                                        text-[#27302A]
                                    "
                                >
                                    Statistics by Paper Topic
                                </h2>

                                <p className="mt-0.5 text-[11px] text-[#8A8E84]">
                                    Research distribution and progress
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Topic selector */}
                    <div className="mt-6">
                        <div
                            className="
                                flex flex-wrap gap-2
                            "
                        >
                            {topics.map((topic) => {
                                const isActive = activeTab === topic;

                                return (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => setActiveTab(topic)}
                                        className={`
                                            rounded-[10px]
                                            border
                                            px-3.5 py-2
                                            text-[11px]
                                            font-medium
                                            transition-all duration-200

                                            ${isActive
                                                ? `
                                                        border-[#41482D]
                                                        bg-[#41482D]
                                                        text-[#F4F3EE]
                                                        shadow-[0_3px_10px_rgba(65,72,45,0.15)]
                                                    `
                                                : `
                                                        border-[#D9DAD3]
                                                        bg-[#ECEBE4]/70
                                                        text-[#697064]
                                                        hover:border-[#C9CAC1]
                                                        hover:bg-[#E8E7DF]
                                                        hover:text-[#41482D]
                                                    `
                                            }
                                        `}
                                    >
                                        {topic}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-6 h-px bg-[#D8D9D2]" />

                    {/* Chart */}
                    <div className="flex flex-col items-center">
                        <div className="relative h-55 w-55">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={78}
                                        outerRadius={100}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                        paddingAngle={0}
                                    >
                                        <Cell
                                            fill="#8A6A9C"
                                        />
                                        <Cell
                                            fill="#DFE0DA"
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center value */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span
                                    className="
                                        text-[36px]
                                        font-semibold
                                        leading-none
                                        tracking-tighter
                                        text-[#1E2630]
                                    "
                                >
                                    {currentData.percentage}%
                                </span>

                                <span className="mt-2 text-[10px] uppercase tracking-widest text-[#85897F]">
                                    Progress
                                </span>
                            </div>
                        </div>

                        {/* Current topic */}
                        <div className="mt-4 text-center">
                            <p className="text-[13px] font-medium text-[#59605A]">
                                {activeTab}
                            </p>

                            <p className="mt-1 text-[11px] text-[#8A8E84]">
                                {currentData.count} of{" "}
                                {currentData.total} papers
                            </p>
                        </div>
                    </div>

                    {/* Bottom summary */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div
                            className="
                                rounded-[12px]
                                border border-[#D9DAD3]
                                bg-[#ECEBE4]/70
                                px-4 py-3
                            "
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#85897F]">
                                Completed
                            </p>

                            <p className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#27302A]">
                                {currentData.count}
                            </p>
                        </div>

                        <div
                            className="
                                rounded-[12px]
                                border border-[#D9DAD3]
                                bg-[#ECEBE4]/70
                                px-4 py-3
                            "
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#85897F]">
                                Total Papers
                            </p>

                            <p className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#27302A]">
                                {currentData.total}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PaperStats;