"use client";

import { useCallback, useState } from "react";
import {
    Activity,
    CheckCircle,
    Clock,
    FileText,
    Gauge,
    Presentation,
    Users,
    XCircle,
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import AdminEmptyState from "@/components/dashboard/admin/AdminEmptyState";
import AdminSectionHeader from "@/components/dashboard/admin/AdminSectionHeader";
import AdminStatCards from "@/components/dashboard/admin/AdminStatCards";
import type { AdminStat } from "@/components/dashboard/admin/AdminStatCards";
import { AdminSkeleton } from "@/components/dashboard/admin/AdminSkeleton";
import { Card, CardContent } from "@/components/ui/card";

import { fetchPlatformStats } from "@/lib/api/admin/analytics";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import type { PlatformStats } from "@/lib/types/admin/analytics";

type IconComponent = React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    style?: React.CSSProperties;
}>;

const METRIC_ICONS: Record<string, IconComponent> = {
    papers: FileText,
    presentations: Presentation,
    "access-requests": Users,
    meetings: Clock,
};

const SERIES = [
    { key: "uploads", label: "Uploads", color: "#5579A6" },
    { key: "approvals", label: "Approvals", color: "#4F8A63" },
    { key: "accessRequests", label: "Access requests", color: "#C58A3A" },
    { key: "meetings", label: "Supervisor sessions", color: "#8A6A9C" },
] as const;

const ROLE_COLORS = ["#716F49", "#5579A6", "#C58A3A", "#4F8A63", "#8A6A9C", "#B85C55", "#8E625D", "#85897F"];

function formatGeneratedAt(value: string) {
    return new Date(value).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function PlatformAnalytics() {
    const [stats, setStats] = useState<PlatformStats | null>(null);

    const loadStats = useCallback(async () => {
        const fetched = await fetchPlatformStats();

        setStats(fetched);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadStats);

    const metrics: AdminStat[] = (stats?.metrics ?? []).map((metric) => ({
        id: metric.id,
        label: metric.label,
        value: metric.value,
        delta: metric.delta,
        hint: "Compared with the previous period",
        accent: "#5579A6",
        icon: METRIC_ICONS[metric.id] ?? Activity,
    }));

    const directoryStats: AdminStat[] = stats
        ? [
            {
                id: "total-users",
                label: "Total Users",
                value: stats.totalUsers,
                hint: "Registered on the platform",
                accent: "#716F49",
                icon: Users,
            },
            {
                id: "active-users",
                label: "Active Users",
                value: stats.activeUsers,
                hint: "Signed in during the last 30 days",
                accent: "#4F8A63",
                icon: CheckCircle,
            },
            {
                id: "pending-users",
                label: "Pending Approval",
                value: stats.pendingUsers,
                hint: "Waiting on an admin decision",
                accent: "#C58A3A",
                icon: Clock,
            },
            {
                id: "suspended-users",
                label: "Suspended",
                value: stats.suspendedUsers,
                hint: "Access temporarily withdrawn",
                accent: "#B85C55",
                icon: XCircle,
            },
        ]
        : [];

    const maxRoleCount = Math.max(
        1,
        ...(stats?.roleBreakdown ?? []).map((entry) => entry.users)
    );

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Platform Analytics"
                description="Lab-wide usage, moderation throughput, and where the review queue is heading."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="analytics" />
            ) : !stats ? (
                <AdminEmptyState
                    icon={Activity}
                    title="No analytics available"
                    description="Platform statistics could not be loaded. Try reloading the section."
                />
            ) : (
                <>
                    <AdminStatCards stats={directoryStats} />

                    <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl">
                        <CardContent className="p-5">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85897F]">
                                        Activity
                                    </p>

                                    <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#27302A]">
                                        Monthly Lab Throughput
                                    </h2>
                                </div>

                                <p className="text-xs text-[#85897F]">
                                    Updated {formatGeneratedAt(stats.generatedAt)}
                                </p>
                            </div>

                            <div className="mt-6 h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats.activity}
                                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                                    >
                                        <defs>
                                            {SERIES.map((series) => (
                                                <linearGradient
                                                    key={series.key}
                                                    id={`admin-gradient-${series.key}`}
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor={series.color}
                                                        stopOpacity={0.28}
                                                    />

                                                    <stop
                                                        offset="100%"
                                                        stopColor={series.color}
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            ))}
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#D8D9D2"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: "#85897F", fontSize: 11 }}
                                        />

                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: "#85897F", fontSize: 11 }}
                                        />

                                        <Tooltip
                                            cursor={{ stroke: "#C9CAC1" }}
                                            contentStyle={{
                                                borderRadius: 12,
                                                border: "1px solid #D8D9D2",
                                                background: "#FBFAF7",
                                                fontSize: 12,
                                                boxShadow: "0 12px 35px rgba(30,31,20,0.08)",
                                            }}
                                        />

                                        {SERIES.map((series) => (
                                            <Area
                                                key={series.key}
                                                type="monotone"
                                                dataKey={series.key}
                                                name={series.label}
                                                stroke={series.color}
                                                strokeWidth={2}
                                                fill={`url(#admin-gradient-${series.key})`}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#D8D9D2] pt-4">
                                {SERIES.map((series) => (
                                    <span
                                        key={series.key}
                                        className="flex items-center gap-2 text-[11px] text-[#59605A]"
                                    >
                                        <span
                                            className="size-2 rounded-full"
                                            style={{ backgroundColor: series.color }}
                                            aria-hidden
                                        />

                                        {series.label}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div>
                            <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl">
                                <CardContent className="p-5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85897F]">
                                        Moderation
                                    </p>

                                    <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#27302A]">
                                        Review Backlog
                                    </h2>

                                    <div className="mt-6 space-y-5">
                                        {[
                                            {
                                                label: "Pending review",
                                                value: stats.moderation.pending,
                                                percent: Math.min(
                                                    100,
                                                    (stats.moderation.pending /
                                                        Math.max(
                                                            1,
                                                            stats.moderation.pending +
                                                            stats.moderation.approvedThisWeek +
                                                            stats.moderation.rejectedThisWeek
                                                        )) *
                                                    100
                                                ),
                                                color: "#C58A3A",
                                            },
                                            {
                                                label: "Approved this week",
                                                value: stats.moderation.approvedThisWeek,
                                                percent: Math.min(
                                                    100,
                                                    (stats.moderation.approvedThisWeek / 60) * 100
                                                ),
                                                color: "#4F8A63",
                                            },
                                            {
                                                label: "Rejected this week",
                                                value: stats.moderation.rejectedThisWeek,
                                                percent: Math.min(
                                                    100,
                                                    (stats.moderation.rejectedThisWeek / 20) * 100
                                                ),
                                                color: "#B85C55",
                                            },
                                        ].map((item) => (
                                            <div key={item.label} className="group/stat">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[13px] font-medium text-[#59605A]">
                                                        {item.label}
                                                    </span>

                                                    <span className="text-[12px] font-semibold tabular-nums text-[#27302A]">
                                                        {item.value}
                                                    </span>
                                                </div>

                                                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#DFE0DA]">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${item.percent}%`,
                                                            backgroundColor: item.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-4">
                                        <span className="flex size-9 items-center justify-center rounded-lg bg-[#716F49]/10">
                                            <Gauge
                                                className="h-4 w-4 text-[#716F49]"
                                                strokeWidth={1.9}
                                                aria-hidden
                                            />
                                        </span>

                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#85897F]">
                                                Average review time
                                            </p>

                                            <p className="text-sm font-semibold text-[#25251F]">
                                                {stats.moderation.averageReviewHours} hours
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl">
                                <CardContent className="p-5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85897F]">
                                        Membership
                                    </p>

                                    <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#27302A]">
                                        Users by Academic Role
                                    </h2>

                                    <div className="mt-6 space-y-4">
                                        {stats.roleBreakdown.map((entry, index) => (
                                            <div key={entry.academicRole} className="group/stat">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate text-[13px] font-medium text-[#59605A]">
                                                        {entry.academicRole}
                                                    </span>

                                                    <span className="text-[12px] font-semibold tabular-nums text-[#27302A]">
                                                        {entry.users}
                                                    </span>
                                                </div>

                                                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#DFE0DA]">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${(entry.users / maxRoleCount) * 100
                                                                }%`,
                                                            backgroundColor:
                                                                ROLE_COLORS[index % ROLE_COLORS.length],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {metrics.length > 0 && (
                        <div>
                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                                Content Totals
                            </p>

                            <AdminStatCards stats={metrics} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
