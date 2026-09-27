"use client";

import { CalendarClock, MapPin, Monitor } from "lucide-react";

import AdminEmptyState from "@/components/dashboard/admin/AdminEmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/components/dashboard/admin/schedule-manager/schedule-shared";

import type {
    StudentMeetingRequest,
    Supervisor,
} from "@/lib/types/admin/schedule";

interface ConfirmedSessionsProps {
    requests: StudentMeetingRequest[];
    supervisorById: Map<string, Supervisor>;
}

export default function ConfirmedSessions({
    requests,
    supervisorById,
}: ConfirmedSessionsProps) {
    if (requests.length === 0) {
        return (
            <AdminEmptyState
                icon={Monitor}
                title="No confirmed sessions"
                description="Confirm a meeting request and the student's time and place will appear here."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {requests.map((request) => {
                const supervisor = supervisorById.get(request.supervisorId);

                return (
                    <Card
                        key={request.id}
                        className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                    >
                        <CardContent className="p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85897F]">
                                {supervisor?.name ?? "Supervisor"}
                            </p>

                            <h4 className="mt-2 text-base font-semibold text-[#25251F]">
                                {request.topic}
                            </h4>

                            <p className="mt-1 text-sm text-[#777568]">
                                {request.student.name} · {request.student.academicRole}
                            </p>

                            <div className="mt-4 space-y-2 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-4 text-sm text-[#5E5D50]">
                                <p className="flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-[#716F49]" aria-hidden />

                                    {request.scheduledAt
                                        ? formatDateTime(request.scheduledAt)
                                        : "Time to be arranged"}
                                </p>

                                <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#716F49]" aria-hidden />

                                    {request.place || "Place to be confirmed"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
