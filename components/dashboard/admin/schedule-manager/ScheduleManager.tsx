"use client";

import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import AdminSectionHeader from "@/components/dashboard/admin/AdminSectionHeader";
import { AdminSkeleton } from "@/components/dashboard/admin/AdminSkeleton";
import AvailabilityPanel from "@/components/dashboard/admin/schedule-manager/AvailabilityPanel";
import { validateSlotForm } from "@/components/dashboard/admin/schedule-manager/schedule-shared";
import {
    createAvailabilitySlot,
    deleteAvailabilitySlot,
    fetchScheduleBoard,
    updateAvailabilitySlot,
} from "@/lib/api/admin/schedule";
import { confirmAction } from "@/lib/confirm";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type {
    AvailabilitySlot,
    AvailabilitySlotFormData,
    AvailabilitySlotFormErrors,
    MeetingMode,
} from "@/lib/types/admin/schedule";

const EMPTY_FORM: AvailabilitySlotFormData = {
    dayOfWeek: 6,
    startTime: "",
    endTime: "",
    mode: "",
    place: "",
};

export default function ScheduleManager() {
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [formData, setFormData] = useState<AvailabilitySlotFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<AvailabilitySlotFormErrors>({});
    const [isSavingSlot, setIsSavingSlot] = useState(false);
    const [busySlotId, setBusySlotId] = useState<string | null>(null);

    const loadBoard = useCallback(async () => {
        const board = await fetchScheduleBoard();
        setSlots(board.slots);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadBoard);

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
            const dayOfWeek = formData.dayOfWeek;
            const startTime = formData.startTime;
            const endTime = formData.endTime;
            const mode = formData.mode as MeetingMode;
            const place = formData.place.trim();

            const response = await createAvailabilitySlot({ dayOfWeek, startTime, endTime, mode, place });

            const createdSlot = response.slot;
            if (createdSlot) {
                setSlots((current) => [...current, createdSlot]);
            } else {
                await refresh();
            }

            toast.success(`${DAY_OF_WEEK_LABELS[dayOfWeek]} availability added.`);
            setFormData(EMPTY_FORM);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to add this slot.");
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
            toast.success(slot.active ? "Availability hidden." : "Availability reopened.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update availability.");
        } finally {
            setBusySlotId(null);
        }
    };

    const handleDeleteSlot = async (slot: AvailabilitySlot) => {
        const confirmed = await confirmAction({
            title: "Remove availability?",
            text: `Remove the ${DAY_OF_WEEK_LABELS[slot.dayOfWeek]} availability?`,
            icon: "warning",
            confirmText: "Remove",
            tone: "danger",
        });

        if (!confirmed) return;

        setBusySlotId(slot.id);

        try {
            await deleteAvailabilitySlot(slot.id);
            setSlots((current) => current.filter((item) => item.id !== slot.id));
            toast.success("Availability removed.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to remove availability.");
        } finally {
            setBusySlotId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Schedule Manager"
                description="Publish the times and locations when the lab is available."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="schedule" showStats={false} />
            ) : (
                <AvailabilityPanel
                    slots={slots}
                    formData={formData}
                    errors={errors}
                    isSavingSlot={isSavingSlot}
                    busySlotId={busySlotId}
                    onFieldChange={handleSlotFieldChange}
                    onSubmit={handleAddSlot}
                    onToggleSlot={handleToggleSlot}
                    onDeleteSlot={handleDeleteSlot}
                />
            )}
        </div>
    );
}
