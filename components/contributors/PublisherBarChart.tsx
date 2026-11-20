"use client";

import { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { Paper } from "@/lib/types/research";

const PALETTE = ["#1F321C", "#716f49", "#A3A171", "#C9A24B", "#5B7F95"];
const OTHER_COLOR = "#B8B6AA";
const OTHER_LABEL = "Other types";
const MAX_TYPES = PALETTE.length;
const MAX_PUBLISHERS = 12;
const GROUP_MIN_WIDTH = 96; // px reserved per publisher before the chart scrolls sideways

type Row = { publisher: string } & Record<string, number | string>;

function build(papers: Paper[]) {
    const typeTotals = new Map<string, number>();
    const publishers = new Map<string, Record<string, number>>();

    for (const paper of papers) {
        const type = paper.type?.trim() || "Other";
        const publisher = paper.publisher?.trim() || "Unknown";
        typeTotals.set(type, (typeTotals.get(type) ?? 0) + 1);

        const counts = publishers.get(publisher) ?? {};
        counts[type] = (counts[type] ?? 0) + 1;
        publishers.set(publisher, counts);
    }

    // Most common types keep their own colour; the rest share "Other types".
    const ranked = [...typeTotals.entries()].sort((a, b) => b[1] - a[1]).map(([type]) => type);
    const kept = ranked.length > MAX_TYPES ? ranked.slice(0, MAX_TYPES - 1) : ranked;
    const types = ranked.length > kept.length ? [...kept, OTHER_LABEL] : kept;
    const color = (type: string) => (type === OTHER_LABEL ? OTHER_COLOR : PALETTE[kept.indexOf(type)]);

    const rows = [...publishers.entries()]
        .map(([publisher, counts]) => {
            const row: Row = { publisher };
            let total = 0;
            for (const [type, count] of Object.entries(counts)) {
                const key = kept.includes(type) ? type : OTHER_LABEL;
                row[key] = ((row[key] as number | undefined) ?? 0) + count;
                total += count;
            }
            return { row, total };
        })
        .sort((a, b) => b.total - a.total || a.row.publisher.localeCompare(b.row.publisher));

    return {
        rows: rows.slice(0, MAX_PUBLISHERS).map((r) => r.row),
        types,
        color,
        hidden: Math.max(0, rows.length - MAX_PUBLISHERS),
    };
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Grouped bars: one bar per publication type under each publisher. */
export default function PublisherBarChart({ papers }: { papers: Paper[] }) {
    const { rows, types, color, hidden } = useMemo(() => build(papers), [papers]);

    return (
        <div className="mt-5">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-600">
                {types.map((type) => (
                    <li key={type} className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm" style={{ background: color(type) }} aria-hidden />
                        {type}
                    </li>
                ))}
            </ul>

            <div className="mt-3 overflow-x-auto pb-1">
                <div
                    role="img"
                    aria-label={`Grouped bar chart of papers by publisher and publication type, ${papers.length} papers across ${rows.length} publishers`}
                    className="h-80 w-full"
                    style={{ minWidth: Math.min(rows.length * GROUP_MIN_WIDTH, 960) }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rows} margin={{ top: 20, right: 8, left: -12, bottom: 0 }} barGap={3}>
                            <CartesianGrid vertical={false} stroke="#E7E5DA" />
                            <XAxis
                                dataKey="publisher"
                                interval={0}
                                angle={-35}
                                textAnchor="end"
                                height={78}
                                tickMargin={6}
                                tickFormatter={(value: string) => clip(value, 16)}
                                tick={{ fontSize: 11, fill: "#4A4A40" }}
                                stroke="#B8B6AA"
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 11, fill: "#777568" }}
                                stroke="#B8B6AA"
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(113,111,73,0.08)" }}
                                contentStyle={{ borderRadius: 8, border: "1px solid #D8D5C9", fontSize: 12 }}
                                formatter={(value, name) => [`${value} paper${value === 1 ? "" : "s"}`, name]}
                            />
                            {types.map((type) => (
                                <Bar
                                    key={type}
                                    dataKey={type}
                                    fill={color(type)}
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={32}
                                >
                                    <LabelList
                                        dataKey={type}
                                        position="top"
                                        fontSize={11}
                                        fontWeight={600}
                                        fill="#25251F"
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <p className="mt-2 text-center text-sm text-neutral-600">
                {papers.length} paper{papers.length === 1 ? "" : "s"} across {rows.length + hidden} publisher
                {rows.length + hidden === 1 ? "" : "s"}
                {hidden > 0 && <span className="text-neutral-400"> · showing the top {rows.length}</span>}
            </p>
            <p className="mt-0.5 text-center text-[11px] text-neutral-400">
                X: publisher · Y: number of papers · bar colour: publication type
            </p>
        </div>
    );
}
