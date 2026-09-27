"use client";

import { CalendarClock, CheckCircle, MapPin, Video, XCircle } from "lucide-react";

import AdminEmptyState from "@/components/dashboard/admin/AdminEmptyState";
import AdminFilterChips from "@/components/dashboard/admin/AdminFilterChips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FIELD_LABEL_CLASS,
    MEETING_STATUS_CONFIG,
    SELECT_ITEM_CLASS,
    TRIGGER_CLASS,
    formatDateTime,
    formatTime,
} from "@/components/dashboard/admin/schedule-manager/schedule-shared";

import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type {
    AvailabilitySlot,
    MeetingStatus,
    StudentMeetingRequest,
    Supervisor,
} from "@/lib/types/admin/schedule";
import { cn } from "@/lib/utils";

interface MeetingRequestListProps {
    requests: StudentMeetingRequest[];
    slots: AvailabilitySlot[];
    supervisorById: Map<string, Supervisor>;
    filter: MeetingStatus | "all";
    pendingCount: number;
    confirmedCount: number;
    busyRequestId: string | null;
    slotAssignments: Record<string, string>;
    onFilterChange: (filter: MeetingStatus | "all") => void;
    onAssignSlot: (requestId: string, slotId: string) => void;
    onUpdate: (
        request: StudentMeetingRequest,
        status: "confirmed" | "declined" | "completed" | "cancelled"
    ) => void;
}

export default function MeetingRequestList({
    requests,
    slots,
    supervisorById,
    filter,
    pendingCount,
    confirmedCount,
    busyRequestId,
    slotAssignments,
    onFilterChange,
    onAssignSlot,
    onUpdate,
}: MeetingRequestListProps) {
    const availableSlotsFor = (supervisorId: string) =>
        slots.filter(
            (slot) =>
                slot.supervisorId === supervisorId &&
                slot.active &&
                slot.bookedCount < slot.capacity
        );

    return (
        <div className="space-y-5">
            <AdminFilterChips
                label="Filter meeting requests by status"
                value={filter}
                onValueChange={onFilterChange}
                options={[
                    { value: "pending", label: "Pending", count: pendingCount },
                    { value: "confirmed", label: "Confirmed", count: confirmedCount },
                    { value: "declined", label: "Declined" },
                    { value: "completed", label: "Completed" },
                    { value: "all", label: "All" },
                ]}
            />

            {requests.length === 0 ? (
                <AdminEmptyState
                    icon={CalendarClock}
                    title="No meeting requests"
                    description="When a student requests a supervisor session it will appear here for scheduling."
                />
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const supervisor = supervisorById.get(request.supervisorId);
                        const statusConfig = MEETING_STATUS_CONFIG[request.status];
                        const StatusIcon = statusConfig.icon;
                        const options = availableSlotsFor(request.supervisorId);
                        const selectedSlotId = slotAssignments[request.id] ?? "";
                        const isBusy = busyRequestId === request.id;

                        return (
                            <Card
                                key={request.id}
                                className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    className={cn(
                                                        "text-xs font-medium",
                                                        statusConfig.badgeClass
                                                    )}
                                                >
                                                    <StatusIcon className="mr-1 h-3 w-3" aria-hidden />

                                                    {statusConfig.label}
                                                </Badge>

                                                <Badge className="border border-[#DEDCD3] bg-[#ECEBE4] text-[#5E5D50]">
                                                    {request.preferredMode === "online" ? (
                                                        <Video className="mr-1 h-3 w-3" aria-hidden />
                                                    ) : (
                                                        <MapPin className="mr-1 h-3 w-3" aria-hidden />
                                                    )}

                                                    Prefers {request.preferredMode}
                                                </Badge>

                                                <span className="text-xs text-[#85897F]">
                                                    Requested {formatDateTime(request.requestedAt)}
                                                </span>
                                            </div>

                                            <h4 className="mt-3 text-base font-semibold text-[#25251F]">
                                                {request.topic}
                                            </h4>

                                            <p className="mt-1 text-sm text-[#777568]">
                                                {request.student.name} ·{" "}
                                                {request.student.academicRole} · with{" "}
                                                {supervisor?.name ?? "unassigned supervisor"}
                                            </p>

                                            {request.preferredNote && (
                                                <p className="mt-3 rounded-lg border border-[#DEDCD3] bg-[#FBFAF7] p-3 text-sm text-[#5E5D50]">
                                                    &ldquo;{request.preferredNote}&rdquo;
                                                </p>
                                            )}

                                            {request.status === "confirmed" && request.scheduledAt && (
                                                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#4F8A63]">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <CalendarClock className="h-3.5 w-3.5" aria-hidden />

                                                        {formatDateTime(request.scheduledAt)}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" aria-hidden />

                                                        {request.place || "Place to be confirmed"}
                                                    </span>
                                                </div>
                                            )}

                                            {request.status === "pending" && (
                                                <div className="mt-4 max-w-md space-y-2">
                                                    <Label
                                                        htmlFor={`slot-picker-${request.id}`}
                                                        className={FIELD_LABEL_CLASS}
                                                    >
                                                        Fix the time and place
                                                    </Label>

                                                    <Select
                                                        value={selectedSlotId}
                                                        onValueChange={(value) =>
                                                            onAssignSlot(request.id, value ?? "")
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`slot-picker-${request.id}`}
                                                            className={TRIGGER_CLASS}
                                                        >
                                                            <SelectValue placeholder="Choose an open slot" />
                                                        </SelectTrigger>

                                                        <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                                            <SelectGroup>
                                                                {options.length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-[#89877B]">
                                                                        No open slots for this
                                                                        supervisor.
                                                                    </div>
                                                                ) : (
                                                                    options.map((slot) => (
                                                                        <SelectItem
                                                                            key={slot.id}
                                                                            value={slot.id}
                                                                            className={SELECT_ITEM_CLASS}
                                                                        >
                                                                            {DAY_OF_WEEK_LABELS[slot.dayOfWeek]}{" "}
                                                                            · {formatTime(slot.startTime)} –{" "}
                                                                            {formatTime(slot.endTime)} ·{" "}
                                                                            {slot.place}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                                            {request.status === "pending" && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() => onUpdate(request, "confirmed")}
                                                        className="rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                                    >
                                                        <CheckCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                        Confirm session
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() => onUpdate(request, "declined")}
                                                        className="rounded-lg border-[#E4C2BC] text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                    >
                                                        <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                        Decline
                                                    </Button>
                                                </>
                                            )}

                                            {request.status === "confirmed" && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() => onUpdate(request, "completed")}
                                                        className="rounded-lg border-[#D7D4C9] bg-[#FBFAF7] text-[#4F8A63] hover:bg-[#EEF4EE]"
                                                    >
                                                        <CheckCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                        Mark completed
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() => onUpdate(request, "cancelled")}
                                                        className="rounded-lg text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                    >
                                                        <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
