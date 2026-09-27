"use client";

import { CalendarClock, CalendarDays, MapPin, Plus, Trash2, Video } from "lucide-react";

import AdminEmptyState from "@/components/dashboard/admin/AdminEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DAY_OPTIONS,
    FIELD_CLASS,
    FIELD_LABEL_CLASS,
    FieldError,
    SectionCard,
    SELECT_ITEM_CLASS,
    TRIGGER_CLASS,
    formatTime,
} from "@/components/dashboard/admin/schedule-manager/schedule-shared";

import { DAY_OF_WEEK_LABELS } from "@/lib/types/admin/schedule";
import type {
    AvailabilitySlot,
    AvailabilitySlotFormData,
    AvailabilitySlotFormErrors,
    DayOfWeek,
    MeetingMode,
    Supervisor,
} from "@/lib/types/admin/schedule";
import { cn } from "@/lib/utils";

interface AvailabilityPanelProps {
    supervisors: Supervisor[];
    slots: AvailabilitySlot[];
    formData: AvailabilitySlotFormData;
    errors: AvailabilitySlotFormErrors;
    isSavingSlot: boolean;
    busySlotId: string | null;
    supervisorById: Map<string, Supervisor>;
    onFieldChange: <K extends keyof AvailabilitySlotFormData>(
        key: K,
        value: AvailabilitySlotFormData[K]
    ) => void;
    onSubmit: () => void;
    onToggleSlot: (slot: AvailabilitySlot) => void;
    onDeleteSlot: (slot: AvailabilitySlot) => void;
}

export default function AvailabilityPanel({
    supervisors,
    slots,
    formData,
    errors,
    isSavingSlot,
    busySlotId,
    supervisorById,
    onFieldChange,
    onSubmit,
    onToggleSlot,
    onDeleteSlot,
}: AvailabilityPanelProps) {
    const openSlotCount = slots.filter((slot) => slot.active).length;

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
            <div>
                <SectionCard
                    icon={Plus}
                    title="Add availability"
                    subtitle="Students only see slots you publish here."
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="slot-supervisor" className={FIELD_LABEL_CLASS}>
                                Supervisor
                            </Label>

                            <Select
                                value={formData.supervisorId}
                                onValueChange={(value) => onFieldChange("supervisorId", value ?? "")}
                            >
                                <SelectTrigger
                                    id="slot-supervisor"
                                    className={TRIGGER_CLASS}
                                    aria-invalid={Boolean(errors.supervisorId)}
                                >
                                    <SelectValue placeholder="Select a supervisor" />
                                </SelectTrigger>

                                <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                    <SelectGroup>
                                        {supervisors.map((supervisor) => (
                                            <SelectItem
                                                key={supervisor.id}
                                                value={supervisor.id}
                                                className={SELECT_ITEM_CLASS}
                                            >
                                                {supervisor.name} · {supervisor.academicRole}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <FieldError id="slot-supervisor-error" message={errors.supervisorId} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slot-day" className={FIELD_LABEL_CLASS}>
                                Day of the week
                            </Label>

                            <Select
                                value={String(formData.dayOfWeek)}
                                onValueChange={(value) =>
                                    onFieldChange("dayOfWeek", Number(value) as DayOfWeek)
                                }
                            >
                                <SelectTrigger id="slot-day" className={TRIGGER_CLASS}>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                    <SelectGroup>
                                        {DAY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className={SELECT_ITEM_CLASS}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="slot-start" className={FIELD_LABEL_CLASS}>
                                    Start
                                </Label>

                                <Input
                                    id="slot-start"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(event) => onFieldChange("startTime", event.target.value)}
                                    className={FIELD_CLASS}
                                    aria-invalid={Boolean(errors.startTime)}
                                />

                                <FieldError id="slot-start-error" message={errors.startTime} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slot-end" className={FIELD_LABEL_CLASS}>
                                    End
                                </Label>

                                <Input
                                    id="slot-end"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(event) => onFieldChange("endTime", event.target.value)}
                                    className={FIELD_CLASS}
                                    aria-invalid={Boolean(errors.endTime)}
                                />

                                <FieldError id="slot-end-error" message={errors.endTime} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="slot-mode" className={FIELD_LABEL_CLASS}>
                                    Mode
                                </Label>

                                <Select
                                    value={formData.mode}
                                    onValueChange={(value) => onFieldChange("mode", value as MeetingMode)}
                                >
                                    <SelectTrigger
                                        id="slot-mode"
                                        className={TRIGGER_CLASS}
                                        aria-invalid={Boolean(errors.mode)}
                                    >
                                        <SelectValue placeholder="Choose" />
                                    </SelectTrigger>

                                    <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                        <SelectGroup>
                                            <SelectItem value="in-person" className={SELECT_ITEM_CLASS}>
                                                In person
                                            </SelectItem>

                                            <SelectItem value="online" className={SELECT_ITEM_CLASS}>
                                                Online
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <FieldError id="slot-mode-error" message={errors.mode} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slot-capacity" className={FIELD_LABEL_CLASS}>
                                    Capacity
                                </Label>

                                <Input
                                    id="slot-capacity"
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={formData.capacity}
                                    onChange={(event) => onFieldChange("capacity", event.target.value)}
                                    className={FIELD_CLASS}
                                    aria-invalid={Boolean(errors.capacity)}
                                />

                                <FieldError id="slot-capacity-error" message={errors.capacity} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slot-place" className={FIELD_LABEL_CLASS}>
                                Place or meeting link
                            </Label>

                            <Input
                                id="slot-place"
                                type="text"
                                placeholder="Lab Office 4.12"
                                value={formData.place}
                                onChange={(event) => onFieldChange("place", event.target.value)}
                                className={FIELD_CLASS}
                                aria-invalid={Boolean(errors.place)}
                            />

                            <FieldError id="slot-place-error" message={errors.place} />
                        </div>

                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={isSavingSlot}
                            className="w-full rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                        >
                            <Plus className="mr-1.5 h-4 w-4" aria-hidden />

                            Publish availability
                        </Button>
                    </div>
                </SectionCard>
            </div>

            <div>
                <SectionCard
                    icon={CalendarDays}
                    title="Published availability"
                    subtitle={`${openSlotCount} open · ${slots.length - openSlotCount} hidden`}
                >
                    {slots.length === 0 ? (
                        <AdminEmptyState
                            icon={CalendarDays}
                            title="No availability yet"
                            description="Add a slot on the left so students know when they can meet a supervisor."
                        />
                    ) : (
                        <div className="space-y-3">
                            {slots.map((slot) => {
                                const supervisor = supervisorById.get(slot.supervisorId);
                                const isBusy = busySlotId === slot.id;
                                const isFull = slot.bookedCount >= slot.capacity;

                                return (
                                    <div
                                        key={slot.id}
                                        className="rounded-xl border border-[#D9D8CD] bg-[#FBFAF7] px-4 py-4 transition-all hover:border-[#C7C6B8]"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-[#25251F]">
                                                        {supervisor?.name ?? "Unknown supervisor"}
                                                    </p>

                                                    <Badge className="border border-[#DEDCD3] bg-[#ECEBE4] text-[#5E5D50]">
                                                        {supervisor?.academicRole ?? "Supervisor"}
                                                    </Badge>

                                                    <Badge
                                                        className={cn(
                                                            "text-xs font-medium",
                                                            slot.active
                                                                ? "border border-[#D8E2D9] bg-[#EAF0EA] text-[#4F8A63]"
                                                                : "border border-[#DEDCD3] bg-[#ECEBE4] text-[#85897F]"
                                                        )}
                                                    >
                                                        {slot.active ? "Open" : "Hidden"}
                                                    </Badge>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7B7D72]">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarClock className="h-3.5 w-3.5" aria-hidden />

                                                        {DAY_OF_WEEK_LABELS[slot.dayOfWeek]} ·{" "}
                                                        {formatTime(slot.startTime)} –{" "}
                                                        {formatTime(slot.endTime)}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        {slot.mode === "online" ? (
                                                            <Video className="h-3.5 w-3.5" aria-hidden />
                                                        ) : (
                                                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                                                        )}

                                                        {slot.mode === "online" ? "Online" : "In person"} ·{" "}
                                                        {slot.place}
                                                    </span>

                                                    <span className={cn(isFull && "font-medium text-[#A45B4B]")}>
                                                        {slot.bookedCount}/{slot.capacity} booked
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isBusy}
                                                    onClick={() => onToggleSlot(slot)}
                                                    className="rounded-lg text-[#5E5D50] hover:bg-[#ECEBE4]"
                                                >
                                                    {slot.active ? "Hide" : "Reopen"}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isBusy}
                                                    onClick={() => onDeleteSlot(slot)}
                                                    aria-label={`Remove slot for ${supervisor?.name ?? "supervisor"}`}
                                                    className="rounded-lg text-[#9A6B6B] hover:bg-[#F3E4E4] hover:text-[#A64A4A]"
                                                >
                                                    <Trash2 className="h-4 w-4" aria-hidden />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
