"use client";

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

type TabType = 'this-week' | 'upcoming';

interface Event {
    id: number;
    date: string;
    host: string;
    hostImage: string;
    title: string;
    description: string;
}

const EventsComponent = () => {
    const [activeTab, setActiveTab] = useState<TabType>('this-week');

    const eventsData: Record<TabType, Event[]> = {
        'this-week': [
            {
                id: 1,
                date: '2025-03-08 20:00:06',
                host: 'Dr. Savannah Nguyen',
                hostImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                title: 'Weekly Lab Seminar: Graph Neural Networks in Practice',
                description: 'A hands-on walkthrough of GNN architectures, benchmark results, and open problems in relational learning.'
            },
            {
                id: 2,
                date: '2025-03-08 20:00:06',
                host: 'Brooklyn Simmons',
                hostImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
                title: 'Paper Presentation: Attention Mechanisms in Transformers',
                description: 'Deep dive into the attention paradigm, recent extensions, and how it powers modern large-scale models.'
            }
        ],
        'upcoming': [
            {
                id: 3,
                date: '2025-03-15 18:00:00',
                host: 'Jane Cooper',
                hostImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
                title: 'Innovation Showcase: Prototyping Session',
                description: 'Teams demo early prototypes of ongoing research collaborations and gather community feedback for iteration.'
            },
            {
                id: 4,
                date: '2025-03-22 19:30:00',
                host: 'Robert Fox',
                hostImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
                title: 'Guest Lecture: Scaling Deep Learning Research',
                description: 'Insights on reproducible research, efficient training at scale, and lessons from real-world deployments.'
            }
        ]
    };

    const currentEvents = eventsData[activeTab];

    return (
        <div className='pb-4'>
            <Card className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('this-week')}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all text-xs md:text-base ${activeTab === 'this-week'
                            ? 'bg-[#777777] text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#E6E6E6]'
                            }`}
                    >
                        This Week Events
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2.5 rounded-full text-xs md:text-base font-medium transition-all ${activeTab === 'upcoming'
                            ? 'bg-[#777777] text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#E6E6E6]'
                            }`}
                    >
                        Upcoming Events
                    </button>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                    {currentEvents.map((event: Event) => (
                        <div
                            key={event.id}
                            className=""
                        >
                            <div className="flex gap-4">
                                {/* Host Image */}
                                <div className="shrink-0">
                                    <Image
                                        src={event.hostImage}
                                        alt={event.host}
                                        width={56}
                                        height={56}
                                        className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
                                    />
                                </div>

                                {/* Event Details */}
                                <div className="flex-1 min-w-0">
                                    {/* Date with Calendar Icon */}
                                    <div className="flex items-center gap-2 mb-2 border border-[#E6E6E6] w-42 p-1 rounded-[10px]">
                                        <div className="w-5 h-5 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-gray-600" aria-hidden />
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium">
                                            {event.date}
                                        </span>
                                    </div>

                                    {/* Host */}
                                    <div className="mb-2">
                                        <span className="text-sm text-black font-medium">Host: </span>
                                        <span className="text-sm text-[#777777]">
                                            {event.host}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-semibold text-black mb-2">
                                        {event.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default EventsComponent;