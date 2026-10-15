"use client";

import { useCallback, useMemo, useState } from "react";
import {
    Archive,
    CalendarClock,
    FileEdit,
    Inbox,
    MapPin,
    Megaphone,
    Mic,
    Pencil,
    Pin,
    Plus,
    Presentation,
    Save,
    Search,
    Send,
    StickyNote,
    Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminEmptyState from "@/components/dashboard/admin/AdminEmptyState";
import AdminFilterChips from "@/components/dashboard/admin/AdminFilterChips";
import AdminSectionHeader from "@/components/dashboard/admin/AdminSectionHeader";
import AdminStatCards from "@/components/dashboard/admin/AdminStatCards";
import type { AdminStat } from "@/components/dashboard/admin/AdminStatCards";
import { AdminSkeleton } from "@/components/dashboard/admin/AdminSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    deleteAnnouncement,
    fetchAnnouncements,
    upsertAnnouncement,
} from "@/lib/api/admin/announcements";
import { confirmAction } from "@/lib/confirm";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import {
    ANNOUNCEMENT_AUDIENCES,
    ANNOUNCEMENT_KINDS,
    ANNOUNCEMENT_PRIORITIES,
} from "@/lib/types/admin/announcement";
import type {
    Announcement,
    AnnouncementAudience,
    AnnouncementFormData,
    AnnouncementFormErrors,
    AnnouncementKind,
    AnnouncementPriority,
    AnnouncementStatus,
    AnnouncementSubmitIntent,
} from "@/lib/types/admin/announcement";
import { cn } from "@/lib/utils";

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
    all: "Everyone",
    students: "Students",
    faculty: "Faculty",
    admins: "Administrators",
};

const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
    normal: "Normal",
    important: "Important",
    urgent: "Urgent",
};

const STATUS_CONFIG: Record<
    AnnouncementStatus,
    { label: string; badgeClass: string }
> = {
    draft: {
        label: "Draft",
        badgeClass: "bg-[#ECEBE4] text-[#5E5D50] border border-[#DEDCD3]",
    },
    published: {
        label: "Published",
        badgeClass: "bg-[#EAF0EA] text-[#4F8A63] border border-[#D8E2D9]",
    },
    archived: {
        label: "Archived",
        badgeClass: "bg-[#F1F0EA] text-[#85897F] border border-[#DEDCD3]",
    },
};

const PRIORITY_BADGE_CLASS: Record<AnnouncementPriority, string> = {
    normal: "bg-[#ECEBE4] text-[#5E5D50] border border-[#DEDCD3]",
    important: "bg-[#FBF3E4] text-[#8A6420] border border-[#EBD9AE]",
    urgent: "bg-[#FBF0EE] text-[#A45B4B] border border-[#E4C2BC]",
};

interface KindCopy {
    label: string;
    plural: string;
    noun: string;
    icon: typeof Megaphone;
    badgeClass: string;
    iconClass: string;
    composeTitle: string;
    editTitle: string;
    composeHint: string;
    titleLabel: string;
    titlePlaceholder: string;
    bodyLabel: string;
    bodyPlaceholder: string;
    pinLabel: string;
    publishLabel: string;
    updatePublishLabel: string;
    publishedToast: string;
}

const KIND_COPY: Record<AnnouncementKind, KindCopy> = {
    announcement: {
        label: "Announcement",
        plural: "Announcements",
        noun: "announcement",
        icon: Megaphone,
        badgeClass: "bg-[#E4E6DC] text-[#5C6446] border border-[#CFD3C0]",
        iconClass: "bg-[#E4E6DC] text-[#5C6446]",
        composeTitle: "Compose announcement",
        editTitle: "Edit announcement",
        composeHint: "Draft it, then publish to the selected audience when you are ready.",
        titleLabel: "Announcement title",
        titlePlaceholder: "e.g. Research symposium rescheduled to March 14",
        bodyLabel: "Announcement body",
        bodyPlaceholder:
            "Explain what changed, who it affects, and what people should do next…",
        pinLabel: "Pin to the top of the notice board",
        publishLabel: "Publish now",
        updatePublishLabel: "Update & publish",
        publishedToast: "Announcement published to the lab.",
    },
    notice: {
        label: "Notice",
        plural: "Notices",
        noun: "notice",
        icon: StickyNote,
        badgeClass: "bg-[#ECE7DA] text-[#8A6420] border border-[#E3D6B4]",
        iconClass: "bg-[#ECE7DA] text-[#8A6420]",
        composeTitle: "Post a notice",
        editTitle: "Edit notice",
        composeHint: "Keep it short - notices are for quick, at-a-glance updates.",
        titleLabel: "Notice title",
        titlePlaceholder: "e.g. Lab door code changed to 4821",
        bodyLabel: "Notice details",
        bodyPlaceholder: "One or two lines is plenty - e.g. The lab closes at 6 PM today.",
        pinLabel: "Pin this notice to the top of the board",
        publishLabel: "Post notice",
        updatePublishLabel: "Update notice",
        publishedToast: "Notice posted to the board.",
    },
    seminar: {
        label: "Seminar",
        plural: "Seminar Schedules",
        noun: "seminar",
        icon: Presentation,
        badgeClass: "bg-[#E3E8F0] text-[#5579A6] border border-[#CDD7E6]",
        iconClass: "bg-[#E3E8F0] text-[#5579A6]",
        composeTitle: "Schedule a seminar",
        editTitle: "Edit seminar",
        composeHint: "Add the session details so everyone knows when and where to attend.",
        titleLabel: "Seminar title",
        titlePlaceholder: "e.g. Graph Neural Networks for Materials Discovery",
        bodyLabel: "Abstract / details",
        bodyPlaceholder:
            "Summarize the talk, who it is for, and what attendees will take away…",
        pinLabel: "Pin this seminar to the top of the board",
        publishLabel: "Publish schedule",
        updatePublishLabel: "Update & publish",
        publishedToast: "Seminar scheduled.",
    },
};

const EMPTY_FORMS: Record<AnnouncementKind, AnnouncementFormData> = {
    announcement: {
        kind: "announcement",
        title: "",
        body: "",
        audience: "all",
        priority: "normal",
        pinned: false,
        publishAt: "",
        eventAt: "",
        speaker: "",
        venue: "",
    },
    notice: {
        kind: "notice",
        title: "",
        body: "",
        audience: "all",
        priority: "normal",
        pinned: false,
        publishAt: "",
        eventAt: "",
        speaker: "",
        venue: "",
    },
    seminar: {
        kind: "seminar",
        title: "",
        body: "",
        audience: "all",
        priority: "normal",
        pinned: false,
        publishAt: "",
        eventAt: "",
        speaker: "",
        venue: "",
    },
};

const FIELD_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-[#5E5D50]";

const FIELD_CLASS =
    "h-11 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] px-3 text-sm text-[#2D2D27] shadow-none " +
    "placeholder:text-[#A5A297] transition-colors focus-visible:border-[#716F49] focus-visible:ring-1 " +
    "focus-visible:ring-[#716F49]";

const TRIGGER_CLASS =
    "h-11 w-full justify-between border-[#D7D4C9] bg-[#FBFAF7] px-3 text-[#2D2D27]";

const SELECT_ITEM_CLASS = "text-[#2D2D27] focus:bg-[#716F49] focus:text-white";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function toFormData(item: Announcement): AnnouncementFormData {
    return {
        kind: item.kind,
        title: item.title,
        body: item.body,
        audience: item.audience,
        priority: item.priority,
        pinned: item.pinned,
        publishAt: item.publishAt?.slice(0, 16) ?? "",
        eventAt: item.eventAt?.slice(0, 16) ?? "",
        speaker: item.speaker ?? "",
        venue: item.venue ?? "",
    };
}

function validateForm(
    formData: AnnouncementFormData,
    kind: AnnouncementKind
): AnnouncementFormErrors {
    const errors: AnnouncementFormErrors = {};
    const noun = KIND_COPY[kind].noun;

    if (!formData.title.trim()) {
        errors.title = `Give the ${noun} a title.`;
    } else if (formData.title.trim().length < 6) {
        errors.title = "Use at least 6 characters so it is scannable.";
    }

    if (!formData.body.trim()) {
        errors.body = `Write the ${noun} details.`;
    } else if (formData.body.trim().length < 20) {
        errors.body = "Add a little more detail (at least 20 characters).";
    }

    if (kind !== "notice") {
        if (!formData.audience) {
            errors.audience = "Choose who should see this.";
        }

        if (!formData.priority) {
            errors.priority = "Choose a priority.";
        }
    }

    if (kind === "announcement" && formData.publishAt) {
        if (new Date(formData.publishAt) < new Date()) {
            errors.publishAt = "Scheduled posts must be in the future.";
        }
    }

    if (kind === "seminar") {
        if (!formData.eventAt) {
            errors.eventAt = "Pick the date and time for this seminar.";
        } else if (new Date(formData.eventAt) < new Date()) {
            errors.eventAt = "Pick a date and time in the future.";
        }

        if (!formData.speaker.trim()) {
            errors.speaker = "Add the speaker or host for this seminar.";
        }
    }

    return errors;
}

interface ComposerCardProps {
    kind: AnnouncementKind;
    onKindChange: (kind: AnnouncementKind) => void;
    editing: Announcement | null;
    onCancelEdit: () => void;
    onSaved: (
        saved: Announcement,
        intent: AnnouncementSubmitIntent,
        previousId: string | null
    ) => void;
}

function ComposerCard({
    kind,
    onKindChange,
    editing,
    onCancelEdit,
    onSaved,
}: ComposerCardProps) {
    const copy = KIND_COPY[kind];
    const isEditing = Boolean(editing);

    const [forms, setForms] = useState<Record<AnnouncementKind, AnnouncementFormData>>(() => {
        const initial = {
            announcement: { ...EMPTY_FORMS.announcement },
            notice: { ...EMPTY_FORMS.notice },
            seminar: { ...EMPTY_FORMS.seminar },
        };

        if (editing) {
            initial[editing.kind] = toFormData(editing);
        }

        return initial;
    });

    const [errors, setErrors] = useState<AnnouncementFormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    const formData = forms[kind];
    const showDistribution = kind !== "notice";

    const handleChange = <K extends keyof AnnouncementFormData>(
        key: K,
        value: AnnouncementFormData[K]
    ) => {
        setForms((current) => ({
            ...current,
            [kind]: { ...current[kind], [key]: value } as AnnouncementFormData,
        }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const handleSubmit = async (intent: AnnouncementSubmitIntent) => {
        const validationErrors = validateForm(formData, kind);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsSaving(true);

        try {
            const title = formData.title.trim();
            const body = formData.body.trim();

            const response = await upsertAnnouncement({
                ...formData,
                title,
                body,
                speaker: formData.speaker.trim(),
                venue: formData.venue.trim(),
                announcementId: editing?.id,
                intent,
            });

            const saved: Announcement = response.announcement ?? {
                id: `local-${kind}-${Date.now()}`,
                kind,
                title,
                body,
                audience: formData.audience,
                priority: formData.priority,
                status: intent,
                pinned: formData.pinned,
                publishAt: formData.publishAt || undefined,
                eventAt: formData.eventAt || undefined,
                speaker: formData.speaker || undefined,
                venue: formData.venue || undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: { id: "current-admin", name: "You" },
            };

            setForms((current) => ({
                ...current,
                [kind]: { ...EMPTY_FORMS[kind] },
            }));
            setErrors({});

            onSaved({ ...saved, kind: saved.kind ?? kind }, intent, editing?.id ?? null);

            toast.success(
                editing
                    ? `${copy.label} updated.`
                    : intent === "published"
                        ? copy.publishedToast
                        : `${copy.label} draft saved.`
            );
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : `Unable to save this ${copy.noun}.`
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <div className="flex items-center justify-between gap-3 border-b border-[#DEDCD3] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-[#25251F]">
                            {editing ? copy.editTitle : copy.composeTitle}
                        </h2>

                        <p className="mt-0.5 text-xs text-[#777568]">{copy.composeHint}</p>
                    </div>
                </div>

                {editing && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancelEdit}
                        className="rounded-lg text-[#89877B] hover:bg-[#ECEBE4]"
                    >
                        Cancel edit
                    </Button>
                )}
            </div>

            <CardContent className="space-y-4 p-5">
                <div>
                    <span className={FIELD_LABEL_CLASS}>Type</span>

                    <div
                        role="group"
                        aria-label="Choose what you are publishing"
                        className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-[#D9D8CD] bg-[#E8E7DD] p-1"
                    >
                        {ANNOUNCEMENT_KINDS.map((option) => {
                            const optionCopy = KIND_COPY[option];
                            const Icon = optionCopy.icon;
                            const isActive = option === kind;
                            const isLocked = isEditing && !isActive;

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    disabled={isLocked}
                                    aria-pressed={isActive}
                                    onClick={() => {
                                        if (option === kind) return;

                                        onKindChange(option);
                                        setErrors({});
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                                        isActive
                                            ? "bg-[#656748] text-white shadow-sm"
                                            : "text-[#737568] hover:text-[#41482D]",
                                        isLocked && "cursor-not-allowed opacity-40 hover:text-[#737568]"
                                    )}
                                >
                                    <Icon className="h-4 w-4" aria-hidden />

                                    {optionCopy.label}
                                </button>
                            );
                        })}
                    </div>

                    {isEditing && (
                        <p className="mt-2 text-xs text-[#89877B]">
                            Type is locked while editing this post.
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor={`${kind}-title`} className={FIELD_LABEL_CLASS}>
                        {copy.titleLabel}
                    </Label>

                    <Input
                        id={`${kind}-title`}
                        type="text"
                        placeholder={copy.titlePlaceholder}
                        value={formData.title}
                        onChange={(event) => handleChange("title", event.target.value)}
                        className={cn(FIELD_CLASS, "mt-2")}
                        aria-invalid={Boolean(errors.title)}
                    />

                    {errors.title && (
                        <p className="mt-2 text-xs text-[#A45B4B]">{errors.title}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={`${kind}-body`} className={FIELD_LABEL_CLASS}>
                        {copy.bodyLabel}
                    </Label>

                    <textarea
                        id={`${kind}-body`}
                        rows={kind === "notice" ? 4 : 6}
                        value={formData.body}
                        onChange={(event) => handleChange("body", event.target.value)}
                        placeholder={copy.bodyPlaceholder}
                        className="mt-2 w-full resize-none rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] px-3 py-2.5 text-sm text-[#2D2D27] outline-none placeholder:text-[#A5A297] focus:border-[#716F49] focus:ring-1 focus:ring-[#716F49] aria-invalid:border-[#A45B4B]"
                        aria-invalid={Boolean(errors.body)}
                    />

                    {errors.body && (
                        <p className="mt-2 text-xs text-[#A45B4B]">{errors.body}</p>
                    )}
                </div>

                {kind === "seminar" && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="seminar-event-at" className={FIELD_LABEL_CLASS}>
                                    Date &amp; time
                                </Label>

                                <Input
                                    id="seminar-event-at"
                                    type="datetime-local"
                                    value={formData.eventAt}
                                    onChange={(event) =>
                                        handleChange("eventAt", event.target.value)
                                    }
                                    className={cn(FIELD_CLASS, "mt-2")}
                                    aria-invalid={Boolean(errors.eventAt)}
                                />

                                {errors.eventAt && (
                                    <p className="mt-2 text-xs text-[#A45B4B]">
                                        {errors.eventAt}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="seminar-speaker" className={FIELD_LABEL_CLASS}>
                                    Speaker / host
                                </Label>

                                <Input
                                    id="seminar-speaker"
                                    type="text"
                                    placeholder="e.g. Dr. Ayesha Rahman"
                                    value={formData.speaker}
                                    onChange={(event) =>
                                        handleChange("speaker", event.target.value)
                                    }
                                    className={cn(FIELD_CLASS, "mt-2")}
                                    aria-invalid={Boolean(errors.speaker)}
                                />

                                {errors.speaker && (
                                    <p className="mt-2 text-xs text-[#A45B4B]">
                                        {errors.speaker}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="seminar-venue" className={FIELD_LABEL_CLASS}>
                                Venue / location
                            </Label>

                            <Input
                                id="seminar-venue"
                                type="text"
                                placeholder="e.g. CILab Seminar Room, Block B"
                                value={formData.venue}
                                onChange={(event) => handleChange("venue", event.target.value)}
                                className={cn(FIELD_CLASS, "mt-2")}
                            />

                            <p className="mt-2 text-xs text-[#89877B]">
                                Leave empty if the seminar is online.
                            </p>
                        </div>
                    </>
                )}

                {showDistribution && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`${kind}-audience`} className={FIELD_LABEL_CLASS}>
                                Audience
                            </Label>

                            <Select
                                value={formData.audience}
                                onValueChange={(value) =>
                                    handleChange("audience", value as AnnouncementAudience)
                                }
                            >
                                <SelectTrigger
                                    id={`${kind}-audience`}
                                    className={cn(TRIGGER_CLASS, "mt-2")}
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                    <SelectGroup>
                                        {ANNOUNCEMENT_AUDIENCES.map((audience) => (
                                            <SelectItem
                                                key={audience}
                                                value={audience}
                                                className={SELECT_ITEM_CLASS}
                                            >
                                                {AUDIENCE_LABELS[audience]}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor={`${kind}-priority`} className={FIELD_LABEL_CLASS}>
                                Priority
                            </Label>

                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    handleChange("priority", value as AnnouncementPriority)
                                }
                            >
                                <SelectTrigger
                                    id={`${kind}-priority`}
                                    className={cn(TRIGGER_CLASS, "mt-2")}
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                    <SelectGroup>
                                        {ANNOUNCEMENT_PRIORITIES.map((priority) => (
                                            <SelectItem
                                                key={priority}
                                                value={priority}
                                                className={SELECT_ITEM_CLASS}
                                            >
                                                {PRIORITY_LABELS[priority]}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {kind === "announcement" && (
                    <div>
                        <Label htmlFor="announcement-publish-at" className={FIELD_LABEL_CLASS}>
                            Schedule for
                        </Label>

                        <Input
                            id="announcement-publish-at"
                            type="datetime-local"
                            value={formData.publishAt}
                            onChange={(event) => handleChange("publishAt", event.target.value)}
                            className={cn(FIELD_CLASS, "mt-2")}
                            aria-invalid={Boolean(errors.publishAt)}
                        />

                        {errors.publishAt && (
                            <p className="mt-2 text-xs text-[#A45B4B]">{errors.publishAt}</p>
                        )}

                        <p className="mt-2 text-xs text-[#89877B]">
                            Leave empty to publish as soon as you save.
                        </p>
                    </div>
                )}

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#2D2D27]">
                    <input
                        type="checkbox"
                        checked={formData.pinned}
                        onChange={(event) => handleChange("pinned", event.target.checked)}
                        className="size-4 accent-[#716F49]"
                    />

                    {copy.pinLabel}
                </label>

                <div className="flex gap-2 sm:flex-row">
                    <Button
                        type="button"
                        onClick={() => handleSubmit("published")}
                        disabled={isSaving}
                        className="flex-1 rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                    >
                        <Send className="mr-1.5 h-4 w-4" aria-hidden />

                        {editing ? copy.updatePublishLabel : copy.publishLabel}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSubmit("draft")}
                        disabled={isSaving}
                        className="flex-1 rounded-lg border-[#D7D4C9] bg-[#FBFAF7] text-[#5E5D50] hover:bg-[#ECEBE4]"
                    >
                        <Save className="mr-1.5 h-4 w-4" aria-hidden />

                        Save draft
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ScheduleDetail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Megaphone;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#969386]" aria-hidden />

            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#969386]">
                    {label}
                </p>

                <p className="truncate text-xs font-medium text-[#41423B]">{value}</p>
            </div>
        </div>
    );
}

interface ListPanelProps {
    items: Announcement[];
    kindCounts: { all: number; announcement: number; notice: number; seminar: number };
    kindFilter: AnnouncementKind | "all";
    onKindFilterChange: (kind: AnnouncementKind | "all") => void;
    statusCounts: { all: number; published: number; draft: number; archived: number };
    statusFilter: AnnouncementStatus | "all";
    onStatusFilterChange: (status: AnnouncementStatus | "all") => void;
    search: string;
    onSearchChange: (value: string) => void;
    busyId: string | null;
    onEditItem: (item: Announcement) => void;
    onItemStatusChange: (item: Announcement, next: "published" | "archived") => void;
    onDeleteItem: (item: Announcement) => void;
}

function ListPanel({
    items,
    kindCounts,
    kindFilter,
    onKindFilterChange,
    statusCounts,
    statusFilter,
    onStatusFilterChange,
    search,
    onSearchChange,
    busyId,
    onEditItem,
    onItemStatusChange,
    onDeleteItem,
}: ListPanelProps) {
    const emptyCopy =
        kindFilter === "all"
            ? {
                title: "Nothing published yet",
                description:
                    "Use the form to publish an announcement, post a notice, or schedule a seminar.",
            }
            : {
                title: `No ${KIND_COPY[kindFilter].plural.toLowerCase()} here`,
                description: `Try a different filter or create a new ${KIND_COPY[kindFilter].noun}.`,
            };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <AdminFilterChips
                        label="Filter posts by type"
                        value={kindFilter}
                        onValueChange={onKindFilterChange}
                        options={[
                            { value: "all", label: "All", count: kindCounts.all },
                            {
                                value: "announcement",
                                label: "Announcements",
                                count: kindCounts.announcement,
                            },
                            { value: "notice", label: "Notices", count: kindCounts.notice },
                            { value: "seminar", label: "Seminars", count: kindCounts.seminar },
                        ]}
                    />

                    <div className="relative lg:w-80">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"
                            aria-hidden
                        />

                        <Input
                            type="search"
                            placeholder="Search posts…"
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            aria-label="Search posts"
                            className={cn(FIELD_CLASS, "pl-10")}
                        />
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <AdminEmptyState
                    icon={Plus}
                    title={emptyCopy.title}
                    description={emptyCopy.description}
                />
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const kindCopy = KIND_COPY[item.kind];
                        const KindIcon = kindCopy.icon;
                        const statusConfig = STATUS_CONFIG[item.status];
                        const isBusy = busyId === item.id;

                        return (
                            <Card
                                key={item.id}
                                className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            className={cn(
                                                "text-xs font-medium",
                                                kindCopy.badgeClass
                                            )}
                                        >
                                            <KindIcon className="mr-1 h-3 w-3" aria-hidden />

                                            {kindCopy.label}
                                        </Badge>

                                        {item.pinned && (
                                            <Badge className="border border-[#D9D8CD] bg-[#41482D] text-[#F4F3EE]">
                                                <Pin className="mr-1 h-3 w-3" aria-hidden />

                                                Pinned
                                            </Badge>
                                        )}

                                        <Badge
                                            className={cn(
                                                "text-xs font-medium",
                                                statusConfig.badgeClass
                                            )}
                                        >
                                            {statusConfig.label}
                                        </Badge>

                                        <Badge
                                            className={cn(
                                                "text-xs font-medium",
                                                PRIORITY_BADGE_CLASS[item.priority]
                                            )}
                                        >
                                            {PRIORITY_LABELS[item.priority]}
                                        </Badge>

                                        <Badge className="border border-[#DEDCD3] bg-[#ECEBE4] text-[#5E5D50]">
                                            {AUDIENCE_LABELS[item.audience]}
                                        </Badge>
                                    </div>

                                    <h4 className="mt-3 text-base font-semibold text-[#25251F]">
                                        {item.title}
                                    </h4>

                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#5E5D50]">
                                        {item.body}
                                    </p>

                                    {item.kind === "seminar" &&
                                        (item.eventAt || item.speaker || item.venue) && (
                                            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-4 sm:grid-cols-3">
                                                <ScheduleDetail
                                                    icon={CalendarClock}
                                                    label="When"
                                                    value={
                                                        item.eventAt
                                                            ? formatDateTime(item.eventAt)
                                                            : "Not set"
                                                    }
                                                />

                                                <ScheduleDetail
                                                    icon={Mic}
                                                    label="Speaker"
                                                    value={item.speaker || "Not set"}
                                                />

                                                <ScheduleDetail
                                                    icon={MapPin}
                                                    label="Venue"
                                                    value={item.venue || "Online / TBD"}
                                                />
                                            </div>
                                        )}

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#85897F]">
                                        <span>
                                            {item.author.name} · updated {formatDate(item.updatedAt)}

                                            {item.publishAt
                                                ? ` · goes live ${formatDate(item.publishAt)}`
                                                : ""}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={isBusy}
                                                onClick={() => onEditItem(item)}
                                                className="rounded-lg text-[#5E5D50] hover:bg-[#ECEBE4]"
                                            >
                                                <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                Edit
                                            </Button>

                                            {item.status !== "published" && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        onItemStatusChange(item, "published")
                                                    }
                                                    className="rounded-lg text-[#4F8A63] hover:bg-[#EAF0EA]"
                                                >
                                                    <Send className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                    Publish
                                                </Button>
                                            )}

                                            {item.status === "published" && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        onItemStatusChange(item, "archived")
                                                    }
                                                    className="rounded-lg text-[#5E5D50] hover:bg-[#ECEBE4]"
                                                >
                                                    <Archive className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                    Archive
                                                </Button>
                                            )}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={isBusy}
                                                onClick={() => onDeleteItem(item)}
                                                aria-label={`Delete ${item.title}`}
                                                className="rounded-lg text-[#9A6B6B] hover:bg-[#F3E4E4] hover:text-[#A64A4A]"
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </Button>
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

export default function AnnouncementManager() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const [formKind, setFormKind] = useState<AnnouncementKind>("announcement");
    const [kindFilter, setKindFilter] = useState<AnnouncementKind | "all">("all");
    const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        const fetched = await fetchAnnouncements();

        setItems(
            fetched.map((item) => ({ ...item, kind: item.kind ?? "announcement" }))
        );
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadItems);

    const kindCounts = useMemo(
        () => ({
            all: items.length,
            announcement: items.filter((item) => item.kind === "announcement").length,
            notice: items.filter((item) => item.kind === "notice").length,
            seminar: items.filter((item) => item.kind === "seminar").length,
        }),
        [items]
    );

    const scopedItems = useMemo(
        () => (kindFilter === "all" ? items : items.filter((item) => item.kind === kindFilter)),
        [items, kindFilter]
    );

    const statusCounts = useMemo(() => countByStatus(scopedItems), [scopedItems]);

    const visibleItems = useMemo(
        () => filterItems(scopedItems, statusFilter, search),
        [scopedItems, statusFilter, search]
    );

    const stats: AdminStat[] = useMemo(
        () => [
            {
                id: "published",
                label: "Published",
                value: items.filter((item) => item.status === "published").length,
                hint: "Live announcements, notices & seminars",
                accent: "#4F8A63",
                icon: Megaphone,
            },
            {
                id: "drafts",
                label: "Drafts",
                value: items.filter((item) => item.status === "draft").length,
                hint: "Not visible to anyone yet",
                accent: "#85897F",
                icon: FileEdit,
            },
            {
                id: "seminars",
                label: "Seminars",
                value: kindCounts.seminar,
                hint: "Scheduled talks and sessions",
                accent: "#5579A6",
                icon: Presentation,
            },
            {
                id: "archived",
                label: "Archived",
                value: items.filter((item) => item.status === "archived").length,
                hint: "Kept for the record",
                accent: "#B85C55",
                icon: Archive,
            },
        ],
        [items, kindCounts]
    );

    const handleSaved = (
        saved: Announcement,
        intent: AnnouncementSubmitIntent,
        previousId: string | null
    ) => {
        setItems((current) => {
            const next: Announcement = { ...saved, status: intent };

            if (previousId) {
                return current.map((item) => (item.id === previousId ? next : item));
            }

            return [next, ...current];
        });

        setEditing(null);
    };

    const handleEdit = (item: Announcement) => {
        setEditing(item);
        setFormKind(item.kind);
    };

    const handleStatusChange = async (
        item: Announcement,
        nextStatus: "published" | "archived"
    ) => {
        setBusyId(item.id);

        try {
            await upsertAnnouncement({
                announcementId: item.id,
                kind: item.kind,
                title: item.title,
                body: item.body,
                audience: item.audience,
                priority: item.priority,
                pinned: item.pinned,
                publishAt: item.publishAt ?? "",
                eventAt: item.eventAt ?? "",
                speaker: item.speaker ?? "",
                venue: item.venue ?? "",
                intent: nextStatus,
            });

            setItems((current) =>
                current.map((entry) =>
                    entry.id === item.id
                        ? { ...entry, status: nextStatus, updatedAt: new Date().toISOString() }
                        : entry
                )
            );

            toast.success(
                nextStatus === "published"
                    ? `${KIND_COPY[item.kind].label} published.`
                    : `${KIND_COPY[item.kind].label} archived.`
            );
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : `Unable to update this ${item.kind}.`
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (item: Announcement) => {
        const confirmed = await confirmAction({
            title: `Delete ${KIND_COPY[item.kind].noun}?`,
            text: `Delete "${item.title}"?`,
            icon: "warning",
            confirmText: "Delete",
            tone: "danger",
        });

        if (!confirmed) return;

        setBusyId(item.id);

        try {
            await deleteAnnouncement(item.id);

            setItems((current) => current.filter((entry) => entry.id !== item.id));

            if (editing?.id === item.id) setEditing(null);

            toast.success(`${KIND_COPY[item.kind].label} deleted.`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : `Unable to delete this ${item.kind}.`
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Announcements, Notices & Seminars"
                description="Pick a type, publish it to the right audience, and manage everything you have posted in one place."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="announcements" rows={3} />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <div>
                            <ComposerCard
                                key={editing?.id ?? "new"}
                                kind={formKind}
                                onKindChange={setFormKind}
                                editing={editing}
                                onCancelEdit={() => setEditing(null)}
                                onSaved={handleSaved}
                            />
                        </div>

                        <div>
                            <ListPanel
                                items={visibleItems}
                                kindCounts={kindCounts}
                                kindFilter={kindFilter}
                                onKindFilterChange={setKindFilter}
                                statusCounts={statusCounts}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                search={search}
                                onSearchChange={setSearch}
                                busyId={busyId}
                                onEditItem={handleEdit}
                                onItemStatusChange={handleStatusChange}
                                onDeleteItem={handleDelete}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function countByStatus(items: Announcement[]) {
    return {
        all: items.length,
        published: items.filter((item) => item.status === "published").length,
        draft: items.filter((item) => item.status === "draft").length,
        archived: items.filter((item) => item.status === "archived").length,
    };
}

function filterItems(
    items: Announcement[],
    status: AnnouncementStatus | "all",
    search: string
) {
    const query = search.trim().toLowerCase();

    return items
        .filter((item) => {
            if (status !== "all" && item.status !== status) return false;

            if (!query) return true;

            return [item.title, item.body].some((value) =>
                value.toLowerCase().includes(query)
            );
        })
        .slice()
        .sort((a, b) => Number(b.pinned) - Number(a.pinned));
}
