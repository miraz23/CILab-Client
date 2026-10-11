"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Presentation,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  trend?: {
    value: number;
    label: string;
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  trend,
}: StatCardProps) {
  return (
    <Card className="group rounded-[18px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col p-5">

        {/* Top */}
        <div className="flex items-start justify-between gap-4">
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#85897F]">
                {title}
              </p>
            </div>
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex shrink-0 items-center gap-1 rounded-[8px] border border-[#D8E2D9] bg-[#EAF0EA] px-2 py-1 text-[10px] font-medium text-[#4F8A63]"
            >
              <TrendingUp
                className="h-3 w-3"
                strokeWidth={2}
                aria-hidden
              />

              <span>
                +{trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Metric */}
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-[#1E2630]">
              {value}
            </h3>
          </div>

          {subtitle && (
            <p className="mt-2 text-[11px] leading-relaxed text-[#85897F]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Bottom accent */}
        <div className="mt-auto pt-6">
          <div className="h-0.75 w-full overflow-hidden rounded-full bg-[#DFE0DA]">
            <div
              className="h-full rounded-full transition-all duration-500 group-hover:w-[85%]"
              style={{
                width: trend ? "70%" : "45%",
                backgroundColor: accent,
              }}
            />
          </div>

          {trend && (
            <p className="mt-2 text-[10px] text-[#92968D]">
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UploadStats() {
  const [counts, setCounts] = useState({
    papers: 0,
    presentations: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDownloads: 0,
  });

  const loadStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploads/stats`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) return;
    const data = await response.json();
    if (data.stats) setCounts(data.stats);
  }, []);

  useEffect(() => {
    loadStats();
    window.addEventListener("uploads:changed", loadStats);
    return () => window.removeEventListener("uploads:changed", loadStats);
  }, [loadStats]);

  const stats = [
    {
      title: "Total Papers",
      value: counts.papers,
      subtitle: "Uploaded research papers",
      icon: FileText,
      accent: "#5579A6",
    },
    {
      title: "Total Presentations",
      value: counts.presentations,
      subtitle: "Uploaded presentations",
      icon: Presentation,
      accent: "#C58A3A",
    },
    {
      title: "Pending Review",
      value: counts.pending,
      subtitle: "Awaiting review",
      icon: Clock,
      accent: "#C58A3A",
    },
    {
      title: "Approved",
      value: counts.approved,
      subtitle: "Approved uploads",
      icon: CheckCircle,
      accent: "#4F8A63",
    },
    {
      title: "Rejected",
      value: counts.rejected,
      subtitle: "Rejected uploads",
      icon: XCircle,
      accent: "#B85C55",
    },
    {
      title: "Total Downloads",
      value: counts.totalDownloads,
      subtitle: "Downloads of your uploads",
      icon: Download,
      accent: "#5579A6",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
}