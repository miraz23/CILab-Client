"use client";

import { useMemo, useState } from "react";

export interface TopicSlice {
    topic: string;
    papers: number;
    presentations: number;
    total: number;
}

// Brand olives/greens first, then distinguishable earth + cool accents.
const PALETTE = ["#1F321C", "#716f49", "#A3A171", "#4F6B52", "#C9A24B", "#8C5E3C", "#5B7F95", "#B0654F"];
const OTHER_COLOR = "#B8B6AA";
const MAX_SLICES = PALETTE.length;

const SIZE = 200;
const C = SIZE / 2;
const R = 92;

const point = (angle: number, radius = R) => [C + radius * Math.cos(angle), C + radius * Math.sin(angle)];

function slicePath(start: number, end: number) {
    const [x1, y1] = point(start);
    const [x2, y2] = point(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
}

/** Collapse the long tail into one "Other" slice so the pie stays legible. */
function group(rows: TopicSlice[]): (TopicSlice & { color: string })[] {
    const head = rows.slice(0, rows.length > MAX_SLICES ? MAX_SLICES - 1 : rows.length);
    const tail = rows.slice(head.length);
    const out = head.map((row, i) => ({ ...row, color: PALETTE[i] }));
    if (tail.length) {
        out.push({
            topic: `Other (${tail.length} topics)`,
            papers: tail.reduce((n, r) => n + r.papers, 0),
            presentations: tail.reduce((n, r) => n + r.presentations, 0),
            total: tail.reduce((n, r) => n + r.total, 0),
            color: OTHER_COLOR,
        });
    }
    return out;
}

export default function TopicPieChart({ rows }: { rows: TopicSlice[] }) {
    const slices = useMemo(() => group(rows), [rows]);
    const total = slices.reduce((n, s) => n + s.total, 0);
    const [active, setActive] = useState<number | null>(null);

    const arcs = useMemo(
        () =>
            slices.map((slice, i) => {
                const before = slices.slice(0, i).reduce((n, s) => n + s.total, 0);
                const start = -Math.PI / 2 + (before / total) * Math.PI * 2;
                const sweep = (slice.total / total) * Math.PI * 2;
                return { start, end: start + sweep, mid: start + sweep / 2 };
            }),
        [slices, total]
    );

    const shown = active !== null ? slices[active] : null;
    const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

    return (
        <div className="mt-5 grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-10">
            <div className="mx-auto w-full max-w-72 md:max-w-none">
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    role="img"
                    aria-label={`Pie chart of ${total} contributions across ${slices.length} topics`}
                    className="h-auto w-full overflow-visible"
                >
                    {slices.length === 1 ? (
                        <circle
                            cx={C}
                            cy={C}
                            r={R}
                            fill={slices[0].color}
                            stroke="#fff"
                            strokeWidth={2}
                            onMouseEnter={() => setActive(0)}
                            onMouseLeave={() => setActive(null)}
                        />
                    ) : (
                        slices.map((slice, i) => {
                            const isActive = active === i;
                            const [dx, dy] = isActive ? point(arcs[i].mid, 6) : [C, C];
                            return (
                                <path
                                    key={slice.topic}
                                    d={slicePath(arcs[i].start, arcs[i].end)}
                                    fill={slice.color}
                                    stroke="#fff"
                                    strokeWidth={2}
                                    strokeLinejoin="round"
                                    opacity={active === null || isActive ? 1 : 0.55}
                                    style={{
                                        transform: `translate(${dx - C}px, ${dy - C}px)`,
                                        transition: "transform 150ms, opacity 150ms",
                                    }}
                                    onMouseEnter={() => setActive(i)}
                                    onMouseLeave={() => setActive(null)}
                                />
                            );
                        })
                    )}
                </svg>

                <p className="mt-3 min-h-10 text-center text-sm text-neutral-600" aria-live="polite">
                    {shown ? (
                        <>
                            <span className="font-semibold text-neutral-900">{shown.topic}</span>
                            <br />
                            {shown.total} of {total} ({pct(shown.total)})
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-neutral-900">{total}</span> contributions in{" "}
                            {slices.length} topic{slices.length === 1 ? "" : "s"}
                        </>
                    )}
                </p>
            </div>

            <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 md:grid-cols-1">
                {slices.map((slice, i) => (
                    <li key={slice.topic}>
                        <button
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(i)}
                            onBlur={() => setActive(null)}
                            className={`flex w-full cursor-default items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                active === i ? "bg-[#F3F2E8]" : ""
                            }`}
                        >
                            <span
                                aria-hidden
                                className="mt-1 size-3 shrink-0 rounded-sm"
                                style={{ background: slice.color }}
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-neutral-800" title={slice.topic}>
                                    {slice.topic}
                                </span>
                                <span className="block text-xs tabular-nums text-neutral-500">
                                    {slice.papers} paper{slice.papers === 1 ? "" : "s"} · {slice.presentations} presentation
                                    {slice.presentations === 1 ? "" : "s"}
                                </span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-700">
                                {pct(slice.total)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
