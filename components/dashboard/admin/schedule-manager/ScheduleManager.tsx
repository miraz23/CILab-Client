"use client";

import { useCallback, useMemo, useState } from "react";
import {
    CalendarClock,
    CalendarDays,
    UserCheck,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSectionHeader from "@/components/dashboard/admin/AdminSectionHeader";
import AdminStatCards from "@/components/dashboard/admin/AdminStatCards";
import type { AdminStat } from "@/components/dashboard/admin/AdminStatCards";
import { AdminSkeleton } from "@/components/dashboard/admin/AdminSkeleton";
import AvailabilityPanel from "@/components/dashboard/admin/schedule-manager/AvailabilityPanel";
import ConfirmedSessions from "@/components/dashboard/admin/schedule-manager/ConfirmedSessions";
import MeetingRequestList from "@/components/dashboard/admin/schedule-manager/MeetingRequestList";
import { nextSlotDate, validateSlotForm } from "@/components/dashboard/admin/schedule-manager/schedule-shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    createAvailabilitySlot,
    deleteAvailabilitySlot,
    fetchScheduleBoard,
    submitMeetingUpdate,
    updateAvailabilitySlot,
} from "@/lib/api/admin/schedule";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type {
    AvailabilitySlot,
    AvailabilitySlotFormData,
    AvailabilitySlotFormErrors,
    MeetingMode,
    MeetingStatus,
    StudentMeetingRequest,
    Supervisor,
} from "@/lib/types/admin/schedule";

const EMPTY_FORM: AvailabilitySlotFormData = {
    supervisorId: "",
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
    mode: "",
    place: "",
    capacity: "1",
};

const TAB_LIST_CLASS =
    "flex h-auto w-full flex-wrap gap-1 rounded-lg border border-[#D9D8CD] bg-[#E8E7DD] p-1 sm:w-fit";

const TAB_TRIGGER_CLASS =
    "rounded-md px-3 py-1.5 text-sm font-medium text-[#737568] transition-colors hover:text-[#41482D] " +
    "data-[state=active]:bg-[#656748] data-[state=active]:text-white data-[state=active]:shadow-sm";

type MeetingUpdateStatus = "confirmed" | "declined" | "completed" | "cancelled";

export default function ScheduleManager() {
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [requests, setRequests] = useState<StudentMeetingRequest[]>([]);
    const [formData, setFormData] = useState<AvailabilitySlotFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<AvailabilitySlotFormErrors>({});
    const [isSavingSlot, setIsSavingSlot] = useState(false);
    const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
    const [busySlotId, setBusySlotId] = useState<string | null>(null);
    const [requestFilter, setRequestFilter] = useState<MeetingStatus | "all">("pending");
    const [slotAssignments, setSlotAssignments] = useState<Record<string, string>>({});

    const loadBoard = useCallback(async () => {
        const board = await fetchScheduleBoard();

        setSupervisors(board.supervisors);
        setSlots(board.slots);
        setRequests(board.requests);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadBoard);

    const supervisorById = useMemo(() => {
        const map = new Map<string, Supervisor>();

        supervisors.forEach((supervisor) => map.set(supervisor.id, supervisor));

        return map;
    }, [supervisors]);

    const counts = useMemo(
        () => ({
            supervisors: supervisors.length,
            openSlots: slots.filter((slot) => slot.active).length,
            pendingRequests: requests.filter((item) => item.status === "pending").length,
            confirmed: requests.filter((item) => item.status === "confirmed").length,
        }),
        [supervisors, slots, requests]
    );

    const filteredRequests = useMemo(
        () =>
            requestFilter === "all"
                ? requests
                : requests.filter((request) => request.status === requestFilter),
        [requests, requestFilter]
    );

    const confirmedRequests = useMemo(
        () => requests.filter((request) => request.status === "confirmed"),
        [requests]
    );

    const stats: AdminStat[] = [
        {
            id: "supervisors",
            label: "Supervisors",
            value: counts.supervisors,
            hint: "Professors and assistant professors",
            accent: "#716F49",
            icon: Users,
        },
        {
            id: "slots",
            label: "Open Slots",
            value: counts.openSlots,
            hint: "Published availability windows",
            accent: "#5579A6",
            icon: CalendarDays,
        },
        {
            id: "pending",
            label: "Meeting Requests",
            value: counts.pendingRequests,
            hint: "Waiting to be scheduled",
            accent: "#C58A3A",
            icon: CalendarClock,
        },
        {
            id: "confirmed",
            label: "Confirmed Sessions",
            value: counts.confirmed,
            hint: "Students have time and place",
            accent: "#4F8A63",
            icon: UserCheck,
        },
    ];

    const handleSlotFieldChange = <K extends keyof AvailabilitySlotFormData>(
        key: K,
        value: AvailabilitySlotFormData[K]
    ) => {
        setFormData((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const handleAddSlot = async () => {
        const validationErrors = validateSlotForm(formData);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsSavingSlot(true);

        try {
            const supervisorId = formData.supervisorId;
            const dayOfWeek = formData.dayOfWeek;
            const startTime = formData.startTime;
            const endTime = formData.endTime;
            const mode = formData.mode as MeetingMode;
            const place = formData.place.trim();
            const capacity = Number(formData.capacity);

            await createAvailabilitySlot({
                supervisorId,
                dayOfWeek,
                startTime,
                endTime,
                mode,
                place,
                capacity,
            });

            setSlots((current) => [
                ...current,
                {
                    id: `local-slot-${Date.now()}`,
                    supervisorId,
                    dayOfWeek,
                    startTime,
                    endTime,
                    mode,
                    place,
                    capacity,
                    bookedCount: 0,
                    active: true,
                },
            ]);

            toast.success(
                `${DAY_OF_WEEK_LABELS[dayOfWeek]} availability added for ${supervisorById.get(supervisorId)?.name ?? "the supervisor"
                }.`
            );

            setFormData((current) => ({ ...EMPTY_FORM, supervisorId: current.supervisorId }));
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to add this slot."
            );
        } finally {
            setIsSavingSlot(false);
        }
    };

    const handleToggleSlot = async (slot: AvailabilitySlot) => {
        setBusySlotId(slot.id);

        try {
            await updateAvailabilitySlot(slot.id, { active: !slot.active });

            setSlots((current) =>
                current.map((item) =>
                    item.id === slot.id ? { ...item, active: !item.active } : item
                )
            );

            toast.success(slot.active ? "Slot hidden from students." : "Slot reopened.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to update this slot."
            );
        } finally {
            setBusySlotId(null);
        }
    };

    const handleDeleteSlot = async (slot: AvailabilitySlot) => {
        if (
            !window.confirm(
                `Remove the ${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} slot?`
            )
        ) {
            return;
        }

        setBusySlotId(slot.id);

        try {
            await deleteAvailabilitySlot(slot.id);

            setSlots((current) => current.filter((item) => item.id !== slot.id));

            toast.success("Slot removed.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to remove this slot."
            );
        } finally {
            setBusySlotId(null);
        }
    };

    const handleMeetingUpdate = async (
        request: StudentMeetingRequest,
        status: MeetingUpdateStatus
    ) => {
        const slotId = slotAssignments[request.id];
        const slot = slotId ? slots.find((item) => item.id === slotId) : undefined;

        if (status === "confirmed") {
            if (!slot) {
                toast.error("Pick an availability slot before confirming.");

                return;
            }

            if (slot.bookedCount >= slot.capacity) {
                toast.error("That slot is already fully booked.");

                return;
            }
        }

        if (
            status === "cancelled" &&
            !window.confirm(`Cancel this session with ${request.student.name}?`)
        ) {
            return;
        }

        setBusyRequestId(request.id);

        try {
            await submitMeetingUpdate({
                requestId: request.id,
                status,
                slotId: slot?.id,
                place: slot?.place,
                scheduledAt: slot ? nextSlotDate(slot) : undefined,
            });

            setRequests((current) =>
                current.map((item) =>
                    item.id === request.id
                        ? {
                            ...item,
                            status,
                            slotId: slot?.id ?? item.slotId,
                            place: slot?.place ?? item.place,
                            scheduledAt: slot ? nextSlotDate(slot) : item.scheduledAt,
                        }
                        : item
                )
            );

            if (status === "confirmed" && slot) {
                setSlots((current) =>
                    current.map((item) =>
                        item.id === slot.id
                            ? { ...item, bookedCount: item.bookedCount + 1 }
                            : item
                    )
                );
            }

            toast.success(
                status === "confirmed"
                    ? `Session confirmed for ${request.student.name}.`
                    : status === "completed"
                        ? "Session marked as completed."
                        : status === "cancelled"
                            ? "Session cancelled."
                            : "Request declined."
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to update this meeting request."
            );
        } finally {
            setBusyRequestId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Schedule Manager"
                description="Publish when professors and assistant professors are available, then fix a time and place for every student."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="schedule" />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <Tabs defaultValue="availability" className="w-full">
                        <TabsList className={TAB_LIST_CLASS}>
                            <TabsTrigger value="availability" className={TAB_TRIGGER_CLASS}>
                                Availability

                                <span className="ml-1.5 tabular-nums opacity-70">
                                    {counts.openSlots}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="requests" className={TAB_TRIGGER_CLASS}>
                                Meeting Requests

                                <span className="ml-1.5 tabular-nums opacity-70">
                                    {counts.pendingRequests}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="sessions" className={TAB_TRIGGER_CLASS}>
                                Confirmed Sessions

                                <span className="ml-1.5 tabular-nums opacity-70">
                                    {counts.confirmed}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="availability" className="mt-6">
                            <AvailabilityPanel
                                supervisors={supervisors}
                                slots={slots}
                                formData={formData}
                                errors={errors}
                                isSavingSlot={isSavingSlot}
                                busySlotId={busySlotId}
                                supervisorById={supervisorById}
                                onFieldChange={handleSlotFieldChange}
                                onSubmit={handleAddSlot}
                                onToggleSlot={handleToggleSlot}
                                onDeleteSlot={handleDeleteSlot}
                            />
                        </TabsContent>

                        <TabsContent value="requests" className="mt-6">
                            <MeetingRequestList
                                requests={filteredRequests}
                                slots={slots}
                                supervisorById={supervisorById}
                                filter={requestFilter}
                                pendingCount={counts.pendingRequests}
                                confirmedCount={counts.confirmed}
                                busyRequestId={busyRequestId}
                                slotAssignments={slotAssignments}
                                onFilterChange={setRequestFilter}
                                onAssignSlot={(requestId, slotId) =>
                                    setSlotAssignments((current) => ({
                                        ...current,
                                        [requestId]: slotId,
                                    }))
                                }
                                onUpdate={handleMeetingUpdate}
                            />
                        </TabsContent>

                        <TabsContent value="sessions" className="mt-6">
                            <ConfirmedSessions
                                requests={confirmedRequests}
                                supervisorById={supervisorById}
                            />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
