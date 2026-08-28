"use client";

import React from "react";
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
  const stats = [
    {
      title: "Total Papers",
      value: "24",
      subtitle: "8 uploaded this month",
      icon: FileText,
      accent: "#5579A6",
      trend: {
        value: 12,
        label: "vs last month",
      },
    },
    {
      title: "Total Presentations",
      value: "18",
      subtitle: "5 uploaded this month",
      icon: Presentation,
      accent: "#C58A3A",
      trend: {
        value: 8,
        label: "vs last month",
      },
    },
    {
      title: "Pending Review",
      value: "7",
      subtitle: "3 papers · 4 presentations",
      icon: Clock,
      accent: "#C58A3A",
    },
    {
      title: "Approved",
      value: "31",
      subtitle: "22 papers · 9 presentations",
      icon: CheckCircle,
      accent: "#4F8A63",
      trend: {
        value: 15,
        label: "this quarter",
      },
    },
    {
      title: "Rejected",
      value: "4",
      subtitle: "2 papers · 2 presentations",
      icon: XCircle,
      accent: "#B85C55",
    },
    {
      title: "Total Downloads",
      value: "1,247",
      subtitle: "342 downloads this week",
      icon: Download,
      accent: "#5579A6",
      trend: {
        value: 23,
        label: "vs last week",
      },
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