"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Presentation, Lightbulb } from "lucide-react";

const mockData = [
    {
        id: 1,
        title: "Papers Overview",
        icon: FileText,
        color: "text-[#407BFF]",
        stats: [
            { label: "Published", value: 64, percent: 50, bar: "bg-[#0AA90F]", textColor: "text-[#0AA90F]" },
            { label: "Under Review", value: 24, percent: 18.75, bar: "bg-[#FFA761]", textColor: "text-[#FFA761]" },
            { label: "Drafts", value: 18, percent: 14.06, bar: "bg-[#7DB4EB]", textColor: "text-[#7DB4EB]" },
            { label: "Access Requests Pending", value: 12, percent: 9.38, bar: "bg-[#FFC107]", textColor: "text-[#FFC107]" },
            { label: "Rejected", value: 6, percent: 4.69, bar: "bg-[#E63946]", textColor: "text-[#E63946]" },
            { label: "Archived", value: 4, percent: 3.12, bar: "bg-[#C62828]", textColor: "text-[#C62828]" },
        ],
    },
    {
        id: 2,
        title: "Weekly Presentations",
        icon: Presentation,
        color: "text-[#FFB200]",
        stats: [
            { label: "Archived", value: 32, percent: 80, bar: "bg-[#0AA90F]", textColor: "text-[#0AA90F]" },
            { label: "Scheduled", value: 3, percent: 7.5, bar: "bg-[#7DB4EB]", textColor: "text-[#7DB4EB]" },
            { label: "In Review", value: 2, percent: 5, bar: "bg-[#FFA761]", textColor: "text-[#FFA761]" },
            { label: "Uploaded Pending Review", value: 1, percent: 2.5, bar: "bg-[#4A90E2]", textColor: "text-[#4A90E2]" },
            { label: "Rescheduled", value: 1, percent: 2.5, bar: "bg-[#4CAF50]", textColor: "text-[#4CAF50]" },
            { label: "Missed", value: 1, percent: 2.5, bar: "bg-[#FF0000]", textColor: "text-[#FF0000]" },
        ]
    },
    {
        id: 3,
        title: "Collaborations & Innovations",
        icon: Lightbulb,
        color: "text-[#8E24AA]",
        stats: [
            { label: "Active", value: 15, percent: 37.5, bar: "bg-[#0AA90F]", textColor: "text-[#0AA90F]" },
            { label: "Prototyping", value: 6, percent: 15, bar: "bg-[#4A90E2]", textColor: "text-[#4A90E2]" },
            { label: "In Review", value: 5, percent: 12.5, bar: "bg-[#FFA761]", textColor: "text-[#FFA761]" },
            { label: "On Hold", value: 4, percent: 10, bar: "bg-[#FFC107]", textColor: "text-[#FFC107]" },
            { label: "Completed", value: 8, percent: 20, bar: "bg-[#28A745]", textColor: "text-[#28A745]" },
            { label: "Idea Stage", value: 2, percent: 5, bar: "bg-[#FF0000]", textColor: "text-[#FF0000]" },
        ]
    },
];

const summaryData = [
    { title: "Papers Shared This Month", value: "18", color: "text-[#FFB200]" },
    { title: "Presentations Archived", value: "32", color: "text-[#E53935]" },
    { title: "Active Collaborations", value: "24", color: "text-[#4CAF50]" },
];

export default function OverviewComponent() {
    return (
        <div className="w-full py-4">
            <Card className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {mockData.map((group) => (
                        <div key={group.id}>
                            <CardContent className="p-2 space-y-6">
                                {/* Header */}
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center">
                                        <group.icon className={`w-5 h-5 ${group.color}`} aria-hidden />
                                    </div>
                                    <h2 className={`font-medium ${group.color}`}>{group.title}</h2>
                                </div>

                                {/* Stats */}
                                <div className="space-y-4">
                                    {group.stats.map((stat, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm font-medium ${stat.textColor}`}>
                                                    {stat.value} {stat.label}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {stat.percent.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${stat.bar} rounded-full transition-all duration-300`}
                                                    style={{ width: `${stat.percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </div>
                    ))}
                </div>

                {/* Summary boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 px-2 border-t border-[#C8CBD9]">
                    {summaryData.map((summary, index) => (
                        <div key={index} className="p-4 rounded-lg border border-[#C8CBD9]">
                            <p className={`text-xs font-medium ${summary.color} mb-2`}>{summary.title}</p>
                            <h3 className={`font-semibold text-lg text-[#5A5A5A]`}>{summary.value}</h3>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}