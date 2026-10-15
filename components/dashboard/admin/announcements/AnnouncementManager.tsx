"use client";

import { useCallback, useMemo, useState } from "react";
import {
    Archive,
    BellRing,
    FileEdit,
    Megaphone,
    Pencil,
    Pin,
    Plus,
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
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import { ANNOUNCEMENT_AUDIENCES, ANNOUNCEMENT_PRIORITIES } from "@/lib/types/admin/announcement";
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

const EMPTY_FORMS: Record<AnnouncementKind, AnnouncementFormData> = {
    announcement: {
        kind: "announcement",
        title: "",
        body: "",
        audience: "all",
        priority: "normal",
        pinned: false,
        publishAt: "",
    },
    notice: {
        kind: "notice",
        title: "",
        body: "",
        audience: "all",
        priority: "normal",
        pinned: false,
        publishAt: "",
    },
};

interface KindCopy {
    label: string;
    noun: string;
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
    emptyTitle: string;
    emptyDescription: string;
}

const KIND_COPY: Record<AnnouncementKind, KindCopy> = {
    announcement: {
        label: "Announcement",
        noun: "announcement",
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
        emptyTitle: "No announcements yet",
        emptyDescription: "Compose an announcement above. Drafts stay private until you publish them.",
    },
    notice: {
        label: "Notice",
        noun: "notice",
        composeTitle: "Post a notice",
        editTitle: "Edit notice",
        composeHint: "Keep it short — notices are for quick, at-a-glance updates.",
        titleLabel: "Notice title",
        titlePlaceholder: "e.g. Lab door code changed to 4821",
        bodyLabel: "Notice details",
        bodyPlaceholder: "One or two lines is plenty — e.g. The lab closes at 6 PM today.",
        pinLabel: "Pin this notice to the top of the board",
        publishLabel: "Post notice",
        updatePublishLabel: "Update notice",
        emptyTitle: "No notices yet",
        emptyDescription: "Post a notice above. It appears here as soon as you publish it.",
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

function toFormData(item: Announcement): AnnouncementFormData {
    return {
        kind: item.kind,
        title: item.title,
        body: item.body,
        audience: item.audience,
        priority: item.priority,
        pinned: item.pinned,
        publishAt: item.publishAt?.slice(0, 16) ?? "",
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

    if (!formData.audience) {
        errors.audience = "Choose who should see this.";
    }

    if (!formData.priority) {
        errors.priority = "Choose a priority.";
    }

    if (formData.publishAt && new Date(formData.publishAt) < new Date()) {
        errors.publishAt = "Scheduled posts must be in the future.";
    }

    return errors;
}

interface ComposerCardProps {
    kind: AnnouncementKind;
    editing: Announcement | null;
    onCancelEdit: () => void;
    onSaved: (
        saved: Announcement,
        intent: AnnouncementSubmitIntent,
        previousId: string | null
    ) => void;
}

function ComposerCard({ kind, editing, onCancelEdit, onSaved }: ComposerCardProps) {
    const copy = KIND_COPY[kind];
    const isAnnouncement = kind === "announcement";

    const [formData, setFormData] = useState<AnnouncementFormData>(() =>
        editing ? toFormData(editing) : EMPTY_FORMS[kind]
    );
    const [errors, setErrors] = useState<AnnouncementFormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = <K extends keyof AnnouncementFormData>(
        key: K,
        value: AnnouncementFormData[K]
    ) => {
        setFormData((current) => ({ ...current, [key]: value }));
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
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: { id: "current-admin", name: "You" },
            };

            setFormData(EMPTY_FORMS[kind]);
            setErrors({});

            onSaved({ ...saved, kind: saved.kind ?? kind }, intent, editing?.id ?? null);

            toast.success(
                editing
                    ? `${copy.label} updated.`
                    : intent === "published"
                        ? isAnnouncement
                            ? "Announcement published to the lab."
                            : "Notice posted to the board."
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
                        rows={isAnnouncement ? 6 : 4}
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

                {isAnnouncement && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="announcement-audience" className={FIELD_LABEL_CLASS}>
                                    Audience
                                </Label>

                                <Select
                                    value={formData.audience}
                                    onValueChange={(value) =>
                                        handleChange("audience", value as AnnouncementAudience)
                                    }
                                >
                                    <SelectTrigger
                                        id="announcement-audience"
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
                                <Label htmlFor="announcement-priority" className={FIELD_LABEL_CLASS}>
                                    Priority
                                </Label>

                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) =>
                                        handleChange("priority", value as AnnouncementPriority)
                                    }
                                >
                                    <SelectTrigger
                                        id="announcement-priority"
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

                        <div>
                            <Label htmlFor="announcement-publish-at" className={FIELD_LABEL_CLASS}>
                                Schedule for
                            </Label>

                            <Input
                                id="announcement-publish-at"
                                type="datetime-local"
                                value={formData.publishAt}
                                onChange={(event) =>
                                    handleChange("publishAt", event.target.value)
                                }
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
                    </>
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

interface ListPanelProps {
    kind: AnnouncementKind;
    items: Announcement[];
    counts: { all: number; published: number; draft: number; archived: number };
    status: AnnouncementStatus | "all";
    onFilterChange: (status: AnnouncementStatus | "all") => void;
    search: string;
    onSearchChange: (value: string) => void;
    busyId: string | null;
    onEditItem: (item: Announcement) => void;
    onItemStatusChange: (item: Announcement, next: "published" | "archived") => void;
    onDeleteItem: (item: Announcement) => void;
}

function ListPanel({
    kind,
    items,
    counts,
    status,
    onFilterChange,
    search,
    onSearchChange,
    busyId,
    onEditItem,
    onItemStatusChange,
    onDeleteItem,
}: ListPanelProps) {
    const copy = KIND_COPY[kind];
    const isAnnouncement = kind === "announcement";

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:items-end lg:justify-between">
                <AdminFilterChips
                    label={`Filter ${copy.noun}s by status`}
                    value={status}
                    onValueChange={onFilterChange}
                    options={[
                        { value: "all", label: "All", count: counts.all },
                        { value: "published", label: "Published", count: counts.published },
                        { value: "draft", label: "Drafts", count: counts.draft },
                        { value: "archived", label: "Archived", count: counts.archived },
                    ]}
                />

                <div className="relative lg:w-80">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"
                        aria-hidden
                    />

                    <Input
                        type="search"
                        placeholder={`Search ${copy.noun}s…`}
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        aria-label={`Search ${copy.noun}s`}
                        className={cn(FIELD_CLASS, "pl-10")}
                    />
                </div>
            </div>

            {items.length === 0 ? (
                <AdminEmptyState
                    icon={Plus}
                    title={copy.emptyTitle}
                    description={copy.emptyDescription}
                />
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const statusConfig = STATUS_CONFIG[item.status];
                        const isBusy = busyId === item.id;

                        return (
                            <Card
                                key={item.id}
                                className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap items-center gap-2">
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
    const [announcementEditing, setAnnouncementEditing] = useState<Announcement | null>(null);
    const [noticeEditing, setNoticeEditing] = useState<Announcement | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [announcementStatus, setAnnouncementStatus] = useState<AnnouncementStatus | "all">("all");
    const [announcementSearch, setAnnouncementSearch] = useState("");
    const [noticeStatus, setNoticeStatus] = useState<AnnouncementStatus | "all">("all");
    const [noticeSearch, setNoticeSearch] = useState("");

    const loadItems = useCallback(async () => {
        const fetched = await fetchAnnouncements();

        setItems(
            fetched.map((item) => ({ ...item, kind: item.kind ?? "announcement" }))
        );
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadItems);

    const announcements = useMemo(
        () => items.filter((item) => item.kind === "announcement"),
        [items]
    );

    const notices = useMemo(
        () => items.filter((item) => item.kind === "notice"),
        [items]
    );

    const announcementCounts = useMemo(() => countByStatus(announcements), [announcements]);
    const noticeCounts = useMemo(() => countByStatus(notices), [notices]);

    const stats: AdminStat[] = [
        {
            id: "published",
            label: "Published",
            value: items.filter((item) => item.status === "published").length,
            hint: "Live announcements and notices",
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
            id: "urgent",
            label: "Urgent",
            value: items.filter(
                (item) => item.status === "published" && item.priority === "urgent"
            ).length,
            hint: "Published and flagged urgent",
            accent: "#B85C55",
            icon: BellRing,
        },
        {
            id: "archived",
            label: "Archived",
            value: items.filter((item) => item.status === "archived").length,
            hint: "Kept for the record",
            accent: "#5579A6",
            icon: Archive,
        },
    ];

    const filteredAnnouncements = useMemo(
        () => filterItems(announcements, announcementStatus, announcementSearch),
        [announcements, announcementStatus, announcementSearch]
    );

    const filteredNotices = useMemo(
        () => filterItems(notices, noticeStatus, noticeSearch),
        [notices, noticeStatus, noticeSearch]
    );

    const handleSaved = (
        kind: AnnouncementKind,
        saved: Announcement,
        intent: AnnouncementSubmitIntent,
        previousId: string | null
    ) => {
        setItems((current) => {
            const next: Announcement = { ...saved, kind: saved.kind ?? kind, status: intent };

            if (previousId) {
                return current.map((item) => (item.id === previousId ? next : item));
            }

            return [next, ...current];
        });

        if (kind === "announcement") {
            setAnnouncementEditing(null);
        } else {
            setNoticeEditing(null);
        }
    };

    const handleEdit = (item: Announcement) => {
        if (item.kind === "notice") {
            setNoticeEditing(item);
        } else {
            setAnnouncementEditing(item);
        }
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
                intent: nextStatus,
            });

            setItems((current) =>
                current.map((entry) =>
                    entry.id === item.id
                        ? { ...entry, status: nextStatus, updatedAt: new Date().toISOString() }
                        : entry
                )
            );

            const noun = item.kind === "notice" ? "Notice" : "Announcement";

            toast.success(
                nextStatus === "published" ? `${noun} published.` : `${noun} archived.`
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
        if (!window.confirm(`Delete "${item.title}"?`)) return;

        setBusyId(item.id);

        try {
            await deleteAnnouncement(item.id);

            setItems((current) => current.filter((entry) => entry.id !== item.id));

            if (announcementEditing?.id === item.id) setAnnouncementEditing(null);
            if (noticeEditing?.id === item.id) setNoticeEditing(null);

            toast.success(`${item.kind === "notice" ? "Notice" : "Announcement"} deleted.`);
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
                title="Announcements & Notices"
                description="Publish announcements for a specific audience and post quick notices to the lab board."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="announcements" rows={3} />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <div className="space-y-6">
                            <ComposerCard
                                key={announcementEditing?.id ?? "new-announcement"}
                                kind="announcement"
                                editing={announcementEditing}
                                onCancelEdit={() => setAnnouncementEditing(null)}
                                onSaved={(saved, intent, previousId) =>
                                    handleSaved("announcement", saved, intent, previousId)
                                }
                            />

                            <ListPanel
                                kind="announcement"
                                items={filteredAnnouncements}
                                counts={announcementCounts}
                                status={announcementStatus}
                                onFilterChange={setAnnouncementStatus}
                                search={announcementSearch}
                                onSearchChange={setAnnouncementSearch}
                                busyId={busyId}
                                onEditItem={handleEdit}
                                onItemStatusChange={handleStatusChange}
                                onDeleteItem={handleDelete}
                            />
                        </div>

                        <div className="space-y-6">
                            <ComposerCard
                                key={noticeEditing?.id ?? "new-notice"}
                                kind="notice"
                                editing={noticeEditing}
                                onCancelEdit={() => setNoticeEditing(null)}
                                onSaved={(saved, intent, previousId) =>
                                    handleSaved("notice", saved, intent, previousId)
                                }
                            />

                            <ListPanel
                                kind="notice"
                                items={filteredNotices}
                                counts={noticeCounts}
                                status={noticeStatus}
                                onFilterChange={setNoticeStatus}
                                search={noticeSearch}
                                onSearchChange={setNoticeSearch}
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
