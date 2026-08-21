"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Presentation, Users, Lightbulb } from "lucide-react";

const mockStats = [
    {
        id: 1,
        title: "Papers Shared",
        value: 128,
        total: 200,
        color: "bg-[#407BFF]",
        iconBg: "bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]",
        icon: FileText,
    },
    {
        id: 2,
        title: "Weekly Presentations Archived",
        value: 32,
        total: 40,
        color: "bg-[#FFB200]",
        iconBg: "bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]",
        icon: Presentation,
    },
    {
        id: 3,
        title: "Active Collaborations",
        value: 24,
        total: 30,
        color: "bg-[#28A745]",
        iconBg: "bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]",
        icon: Users,
    },
    {
        id: 4,
        title: "Innovations In Progress",
        value: 15,
        total: 20,
        color: "bg-[#FF7043]",
        iconBg: "bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]",
        icon: Lightbulb,
    },
];

export default function StateCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {mockStats.map((item) => {
                const percentage = (item.value / item.total) * 100;
                const Icon = item.icon;

                return (
                    <Card
                        key={item.id}
                        className="p-4 rounded-2xl flex flex-col gap-4"
                    >
                        <CardContent className="p-0 flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}
                                >
                                    <Icon size={24} className="w-6 h-6 text-gray-700" aria-hidden />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {item.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-full h-2.75 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    {item.value}/{item.total}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
