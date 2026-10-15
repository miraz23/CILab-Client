"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type {
    AvailabilitySlot,
    AvailabilitySlotFormData,
    AvailabilitySlotFormErrors,
    DayOfWeek,
} from "@/lib/types/admin/schedule";

export const FIELD_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-[#5E5D50]";

export const FIELD_CLASS =
    "h-11 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] px-3 text-sm text-[#2D2D27] shadow-none " +
    "placeholder:text-[#A5A297] transition-colors focus-visible:border-[#716F49] focus-visible:ring-1 " +
    "focus-visible:ring-[#716F49]";

export const TRIGGER_CLASS =
    "h-11 w-full justify-between border-[#D7D4C9] bg-[#FBFAF7] px-3 text-[#2D2D27]";

export const SELECT_ITEM_CLASS = "text-[#2D2D27] focus:bg-[#716F49] focus:text-white";

export const DAY_OPTIONS = (Object.keys(
    DAY_OF_WEEK_LABELS
) as unknown as DayOfWeek[]).map((day) => ({
    value: String(day),
    label: DAY_OF_WEEK_LABELS[day],
}));

export function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;

    return (
        <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-[#A45B4B]">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />

            {message}
        </p>
    );
}

export function SectionCard({
    title,
    subtitle,
    actions,
    children,
}: {
    title: string;
    subtitle: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDCD3] px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-[#25251F]">{title}</h2>

                        <p className="mt-0.5 text-xs text-[#777568]">{subtitle}</p>
                    </div>
                </div>

                {actions}
            </div>

            <div className="p-5">{children}</div>
        </div>
    );
}

export function formatTime(value: string) {
    const [hours, minutes] = value.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatDateTime(value: string) {
    return new Date(value).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function nextSlotDate(slot: AvailabilitySlot) {
    const now = new Date();
    const date = new Date(now);
    const offset = (slot.dayOfWeek - now.getDay() + 7) % 7;
    const [hours, minutes] = slot.startTime.split(":").map(Number);

    date.setDate(now.getDate() + offset);
    date.setHours(hours, minutes, 0, 0);

    if (date.getTime() <= now.getTime()) {
        date.setDate(date.getDate() + 7);
    }

    return date.toISOString();
}

export function validateSlotForm(
    formData: AvailabilitySlotFormData
): AvailabilitySlotFormErrors {
    const errors: AvailabilitySlotFormErrors = {};

    if (!formData.startTime) {
        errors.startTime = "Start time is required.";
    }

    if (!formData.endTime) {
        errors.endTime = "End time is required.";
    }

    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
        errors.endTime = "End time must be later than the start time.";
    }

    if (!formData.mode) {
        errors.mode = "Choose in-person or online.";
    }

    if (!formData.place.trim()) {
        errors.place = "Add a room or a meeting link.";
    }

    return errors;
}
