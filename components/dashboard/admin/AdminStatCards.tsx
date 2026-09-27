"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AdminStat {
    id: string;
    label: string;
    value: number | string;
    hint?: string;
    accent: string;
    delta?: number;
    icon: React.ComponentType<{
        className?: string;
        strokeWidth?: number;
        style?: React.CSSProperties;
    }>;
}

const COLUMN_CLASSES = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
} as const;

interface AdminStatCardsProps {
    stats: AdminStat[];
    columns?: keyof typeof COLUMN_CLASSES;
}

export default function AdminStatCards({
    stats,
    columns = 4,
}: AdminStatCardsProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4",
                COLUMN_CLASSES[columns]
            )}
        >
            {stats.map((stat) => {
                const Icon = stat.icon;
                const hasDelta = typeof stat.delta === "number";
                const isPositive = (stat.delta ?? 0) >= 0;
                const DeltaIcon = isPositive ? TrendingUp : TrendingDown;

                return (
                    <Card
                        key={stat.id}
                        className="group rounded-[18px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <CardContent className="flex flex-col p-5">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#85897F]">
                                    {stat.label}
                                </p>
                            </div>

                            <div className="mt-3 flex items-end gap-2">
                                <span className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-[#1E2630]">
                                    {stat.value}
                                </span>

                                {hasDelta && (
                                    <span
                                        className={cn(
                                            "mb-0.5 flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
                                            isPositive ? "text-[#4F8A63]" : "text-[#A45B4B]"
                                        )}
                                    >
                                        <DeltaIcon className="h-3 w-3" aria-hidden />

                                        {isPositive ? "+" : ""}
                                        {stat.delta}%
                                    </span>
                                )}
                            </div>

                            {stat.hint && (
                                <p className="mt-2 text-[11px] text-[#92968D]">
                                    {stat.hint}
                                </p>
                            )}

                            <div className="mt-auto pt-5">
                                <div className="h-0.75 w-full overflow-hidden rounded-full bg-[#DFE0DA]">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 group-hover:w-[85%]"
                                        style={{
                                            width: "45%",
                                            backgroundColor: stat.accent,
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
