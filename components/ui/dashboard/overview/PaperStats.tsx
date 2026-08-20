"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

type PaperTopic = 'Machine Learning' | 'Computer Vision' | 'NLP' | 'Graph Neural Networks' | 'Optimization';

const PaperStats = () => {
    const [activeTab, setActiveTab] = useState<PaperTopic>('Machine Learning');

    // Fake data for each tab
    const PaperTopicsData: Record<PaperTopic, { count: number; total: number; percentage: number }> = {
        'Machine Learning': { count: 45, total: 90, percentage: 50 },
        'Computer Vision': { count: 32, total: 80, percentage: 40 },
        'NLP': { count: 28, total: 40, percentage: 70 },
        'Graph Neural Networks': { count: 15, total: 30, percentage: 50 },
        'Optimization': { count: 12, total: 20, percentage: 60 },
    };

    const currentData = PaperTopicsData[activeTab];

    // Data for the pie chart
    const chartData = [
        { name: 'completed', value: currentData.percentage },
        { name: 'remaining', value: 100 - currentData.percentage }
    ];

    const COLORS = ['#8E24AA', '#E6E6E6'];

    const topics = Object.keys(PaperTopicsData) as PaperTopic[];

    return (
        <div className='pb-4'>
            <Card className="w-full bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]">
                        <BookOpen className="w-6 h-6 text-gray-700" aria-hidden />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Statistics by Paper Topic</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-2 my-5">
                    {topics.map((topic) => (
                        <button
                            key={topic}
                            onClick={() => setActiveTab(topic)}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                                activeTab === topic
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#E6E6E6]'
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                <div className="flex justify-center items-center">
                    <div className="relative w-56 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-900">
                                {currentData.percentage}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4 text-sm text-gray-500">
                    {currentData.count} of {currentData.total} papers
                </div>
            </Card>
        </div>
    );
};

export default PaperStats;