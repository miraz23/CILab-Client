"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

type DayStatus = 'active-1' | 'active-2' | 'active-3' | 'active-4' | 'idle' | 'absent';

const DAY_COLORS: Record<DayStatus, string> = {
    'active-1': 'bg-green-200 text-gray-700',
    'active-2': 'bg-green-300 text-gray-700',
    'active-3': 'bg-green-500 text-white',
    'active-4': 'bg-green-700 text-white',
    'idle': 'bg-gray-200 text-gray-600',
    'absent': 'bg-red-500 text-white',
};

// Deterministic mock status per date
const statusForDay = (year: number, month: number, day: number): DayStatus => {
    const seed = year * 10000 + month * 100 + day;
    const roll = ((seed * 9301 + 49297) % 233280) / 233280;

    if (roll < 0.28) return 'absent';
    if (roll < 0.55) return 'idle';
    if (roll < 0.72) return 'active-1';
    if (roll < 0.85) return 'active-2';
    if (roll < 0.95) return 'active-3';
    return 'active-4';
};

const ActivityStats = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const previousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const isToday = (day: number) =>
        year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

    const isFutureDay = (day: number) => {
        const dayDate = new Date(year, month, day);
        return dayDate.getTime() > today.getTime();
    };

    const getStatus = (day: number): DayStatus | 'future' => {
        if (isFutureDay(day)) return 'future';
        return statusForDay(year, month, day);
    };

    const cells = [
        ...Array.from({ length: startingDayOfWeek }, (_, i) => ({ key: `blank-${i}`, status: 'blank' as const })),
        ...Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return { key: `day-${day}`, status: getStatus(day), day };
        }),
    ];

    const legend = [
        { label: 'Active', className: 'bg-green-500' },
        { label: 'Logged in · no activity', className: 'bg-gray-200' },
        { label: 'Not logged in', className: 'bg-red-500' },
    ];

    return (
        <div className="pb-4">
            <Card className="bg-white rounded-2xl shadow-sm p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]">
                        <Activity className="w-6 h-6 text-gray-700" aria-hidden />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">Activity Status</h2>
                        <p className="text-xs text-gray-500">Your research activity calendar</p>
                    </div>
                </div>

                {/* Month navigation */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                        {monthNames[month]} {year}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={previousMonth}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Next month"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {dayNames.map((day) => (
                        <div key={day} className="text-center text-[10px] font-semibold text-gray-500 py-1">
                            {day}
                        </div>
                    ))}

                    {cells.map((cell) => {
                        if (cell.status === 'blank') {
                            return <div key={cell.key} />;
                        }
                        if (cell.status === 'future') {
                            return (
                                <div key={cell.key} className="aspect-square rounded-md flex items-center justify-center text-xs text-gray-300">
                                    {cell.day}
                                </div>
                            );
                        }
                        return (
                            <div
                                key={cell.key}
                                title={cell.status}
                                className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${DAY_COLORS[cell.status]} ${
                                    isToday(cell.day!) ? 'ring-2 ring-[#716f49] ring-offset-1' : ''
                                }`}
                            >
                                {cell.day}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#E6E6E6]">
                    {legend.map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-sm ${item.className}`} />
                            <span className="text-[10px] text-gray-500">{item.label}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ActivityStats;