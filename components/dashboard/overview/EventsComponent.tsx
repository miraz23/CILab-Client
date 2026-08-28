"use client";

import React, { useState } from "react";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

type TabType = "this-week" | "upcoming";

interface Event {
    id: number;
    date: string;
    host: string;
    hostImage: string;
    title: string;
    description: string;
}

const EventsComponent = () => {
    const [activeTab, setActiveTab] =
        useState<TabType>("this-week");

    const eventsData: Record<TabType, Event[]> = {
        "this-week": [
            {
                id: 1,
                date: "2025-03-08 20:00:06",
                host: "Dr. Savannah Nguyen",
                hostImage:
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                title:
                    "Weekly Lab Seminar: Graph Neural Networks in Practice",
                description:
                    "A hands-on walkthrough of GNN architectures, benchmark results, and open problems in relational learning.",
            },
            {
                id: 2,
                date: "2025-03-08 20:00:06",
                host: "Brooklyn Simmons",
                hostImage:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                title:
                    "Paper Presentation: Attention Mechanisms in Transformers",
                description:
                    "Deep dive into the attention paradigm, recent extensions, and how it powers modern large-scale models.",
            },
        ],
        upcoming: [
            {
                id: 3,
                date: "2025-03-15 18:00:00",
                host: "Jane Cooper",
                hostImage:
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
                title:
                    "Innovation Showcase: Prototyping Session",
                description:
                    "Teams demo early prototypes of ongoing research collaborations and gather community feedback for iteration.",
            },
            {
                id: 4,
                date: "2025-03-22 19:30:00",
                host: "Robert Fox",
                hostImage:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
                title:
                    "Guest Lecture: Scaling Deep Learning Research",
                description:
                    "Insights on reproducible research, efficient training at scale, and lessons from real-world deployments.",
            },
        ],
    };

    const currentEvents = eventsData[activeTab];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div className="w-full pb-4">
            <Card
                className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl transition-all duration-300"
            >
                <div className="p-5">

                    {/* =========================
                        Header
                    ========================= */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85897F]">
                                Research Schedule
                            </p>

                            <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#27302A]">
                                Lab Events
                            </h2>
                        </div>
                    </div>

                    {/* =========================
                        Tabs
                    ========================= */}
                    <div className="mt-6 inline-flex rounded-[11px] border border-[#D9DAD3] bg-[#E8E7DF] p-1">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("this-week")
                            }
                            className={`
                                rounded-[8px]
                                px-4 py-2
                                text-[11px]
                                font-medium
                                transition-all duration-200
                                ${activeTab === "this-week"
                                    ? `
                                            bg-[#41482D]
                                            text-[#F4F3EE]
                                            shadow-[0_2px_8px_rgba(65,72,45,0.15)]
                                        `
                                    : `
                                            text-[#697064]
                                            hover:text-[#41482D]
                                        `
                                }
                            `}
                        >
                            This Week
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("upcoming")
                            }
                            className={`
                                rounded-[8px]
                                px-4 py-2
                                text-[11px]
                                font-medium
                                transition-all duration-200
                                ${activeTab === "upcoming"
                                    ? `
                                            bg-[#41482D]
                                            text-[#F4F3EE]
                                            shadow-[0_2px_8px_rgba(65,72,45,0.15)]
                                        `
                                    : `
                                            text-[#697064]
                                            hover:text-[#41482D]
                                        `
                                }
                            `}
                        >
                            Upcoming
                        </button>
                    </div>

                    {/* =========================
                        Events
                    ========================= */}
                    <div className="mt-7">
                        {currentEvents.map((event, index) => (
                            <div
                                key={event.id}
                                className={`
                                    group
                                    relative
                                    py-5
                                    ${index !==
                                        currentEvents.length - 1
                                        ? "border-b border-[#D8D9D2]"
                                        : ""
                                    }
                                `}
                            >
                                <div className="flex gap-4 md:gap-5">

                                    {/* Host */}
                                    <div className="relative shrink-0">
                                        <div
                                            className="
                                                overflow-hidden
                                                rounded-[12px]
                                                border
                                                border-white/70
                                                bg-[#E8E7DF]
                                                p-0.5
                                            "
                                        >
                                            <Image
                                                src={event.hostImage}
                                                alt={event.host}
                                                width={56}
                                                height={56}
                                                className="
                                                    h-12 w-12
                                                    rounded-[10px]
                                                    object-cover
                                                    md:h-14 md:w-14
                                                "
                                            />
                                        </div>

                                        {/* Timeline dot */}
                                        {index !==
                                            currentEvents.length -
                                            1 && (
                                                <div
                                                    className="
                                                    absolute
                                                    left-1/2
                                                    top-17
                                                    hidden
                                                    h-[calc(100%+10px)]
                                                    w-px
                                                    -translate-x-1/2
                                                    bg-[#D8D9D2]
                                                    md:block
                                                "
                                                />
                                            )}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">

                                        {/* Date / Time */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-[8px]
                                                    border
                                                    border-[#D9DAD3]
                                                    bg-[#ECEBE4]
                                                    px-2.5 py-1.5
                                                    text-[10px]
                                                    font-medium
                                                    text-[#697064]
                                                "
                                            >
                                                <Calendar
                                                    className="h-3.5 w-3.5 text-[#5579A6]"
                                                    strokeWidth={1.8}
                                                />

                                                {formatDate(
                                                    event.date
                                                )}
                                            </span>

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1
                                                    text-[10px]
                                                    text-[#85897F]
                                                "
                                            >
                                                <Clock
                                                    className="h-3 w-3"
                                                    strokeWidth={1.8}
                                                />

                                                {formatTime(
                                                    event.date
                                                )}
                                            </span>
                                        </div>

                                        {/* Host */}
                                        <p className="mt-3 text-[11px] text-[#85897F]">
                                            Hosted by{" "}
                                            <span className="font-medium text-[#59605A]">
                                                {event.host}
                                            </span>
                                        </p>

                                        {/* Title */}
                                        <h3
                                            className="
                                                mt-1.5
                                                text-[15px]
                                                font-semibold
                                                leading-snug
                                                tracking-[-0.015em]
                                                text-[#27302A]
                                                transition-colors
                                                group-hover:text-[#41482D]
                                            "
                                        >
                                            {event.title}
                                        </h3>

                                        {/* Description */}
                                        <p
                                            className="
                                                mt-2
                                                max-w-3xl
                                                text-[12px]
                                                leading-[1.7]
                                                text-[#747A71]
                                            "
                                        >
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EventsComponent;