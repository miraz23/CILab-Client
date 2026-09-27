"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    FileText,
    Presentation,
    Users,
    Lightbulb,
    ArrowUpRight,
} from "lucide-react";

const mockStats = [
    {
        id: 1,
        title: "Papers Shared",
        value: 128,
        total: 200,
        unit: "papers",
        accent: "#5579A6",
        icon: FileText,
    },
    {
        id: 2,
        title: "Weekly Presentations",
        value: 32,
        total: 40,
        unit: "presentations",
        accent: "#C58A3A",
        icon: Presentation,
    },
    {
        id: 3,
        title: "Active Collaborations",
        value: 24,
        total: 30,
        unit: "collaborations",
        accent: "#4F8A63",
        icon: Users,
    },
    {
        id: 4,
        title: "Innovations In Progress",
        value: 15,
        total: 20,
        unit: "innovations",
        accent: "#B85C55",
        icon: Lightbulb,
    },
];

export default function StateCards() {
    return (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {mockStats.map((item) => {
                const percentage = (item.value / item.total) * 100;
                const remaining = item.total - item.value;
                const Icon = item.icon;

                return (
                    <Card
                        key={item.id}
                        className="group border border-white/60 bg-[#F4F3EE] rounded-[18px] transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <CardContent className="flex flex-col p-5">
                            {/* Metric */}
                            <div className="">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#85897F]">
                                    {item.title}
                                </p>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-[#1E2630]">
                                        {item.value}
                                    </span>

                                    <span className="text-sm text-[#8A8E84]">
                                        / {item.total}
                                    </span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-6">
                                <div className="h-1.25 w-full overflow-hidden rounded-full bg-[#DFE0DB]">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: item.accent,
                                        }}
                                    />
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[11px] text-[#85897F]">
                                        {Math.round(percentage)}% complete
                                    </span>

                                    <span className="text-[11px] text-[#85897F]">
                                        {remaining} remaining
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}