"use client";

import React from 'react';
import { FileText, Presentation, Clock, CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: { value: number; label: string };
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend }: StatCardProps) {
  return (
    <Card className="p-5 rounded-2xl flex flex-col gap-4 hover:shadow-md transition-shadow">
      <CardContent className="p-0 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden />
            </div>
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" aria-hidden />
              <span>+{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="font-semibold text-2xl text-gray-900">{value}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UploadStats() {
  const stats = [
    {
      title: 'Total Papers',
      value: '24',
      subtitle: '8 this month',
      icon: FileText,
      iconColor: 'text-[#716f49]',
      iconBg: 'bg-[#716f49]/10',
      trend: { value: 12, label: 'vs last month' },
    },
    {
      title: 'Total Presentations',
      value: '18',
      subtitle: '5 this month',
      icon: Presentation,
      iconColor: 'text-[#FFB200]',
      iconBg: 'bg-[#FFB200]/10',
      trend: { value: 8, label: 'vs last month' },
    },
    {
      title: 'Pending Review',
      value: '7',
      subtitle: '3 papers, 4 presentations',
      icon: Clock,
      iconColor: 'text-[#FFA761]',
      iconBg: 'bg-[#FFA761]/10',
    },
    {
      title: 'Approved',
      value: '31',
      subtitle: '22 papers, 9 presentations',
      icon: CheckCircle,
      iconColor: 'text-[#0AA90F]',
      iconBg: 'bg-[#0AA90F]/10',
      trend: { value: 15, label: 'this quarter' },
    },
    {
      title: 'Rejected',
      value: '4',
      subtitle: '2 papers, 2 presentations',
      icon: XCircle,
      iconColor: 'text-[#E63946]',
      iconBg: 'bg-[#E63946]/10',
    },
    {
      title: 'Total Downloads',
      value: '1,247',
      subtitle: '342 this week',
      icon: Award,
      iconColor: 'text-[#4A90E2]',
      iconBg: 'bg-[#4A90E2]/10',
      trend: { value: 23, label: 'vs last week' },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}