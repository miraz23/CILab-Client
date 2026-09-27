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

const EMPTY_FORM: AnnouncementFormData = {
    title: "",
    body: "",
    audience: "all",
    priority: "normal",
    pinned: false,
    publishAt: "",
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

function validateForm(formData: AnnouncementFormData): AnnouncementFormErrors {
    const errors: AnnouncementFormErrors = {};

    if (!formData.title.trim()) {
        errors.title = "Give the notice a title.";
    } else if (formData.title.trim().length < 6) {
        errors.title = "Use at least 6 characters so it is scannable.";
    }

    if (!formData.body.trim()) {
        errors.body = "Write the notice body.";
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
        errors.publishAt = "Scheduled notices must be in the future.";
    }

    return errors;
}

export default function AnnouncementManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [formData, setFormData] = useState<AnnouncementFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<AnnouncementFormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [status, setStatus] = useState<AnnouncementStatus | "all">("all");
    const [search, setSearch] = useState("");

    const loadAnnouncements = useCallback(async () => {
        const fetched = await fetchAnnouncements();

        setAnnouncements(fetched);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadAnnouncements);

    const counts = useMemo(
        () => ({
            all: announcements.length,
            published: announcements.filter((item) => item.status === "published").length,
            draft: announcements.filter((item) => item.status === "draft").length,
            archived: announcements.filter((item) => item.status === "archived").length,
            urgent: announcements.filter(
                (item) => item.status === "published" && item.priority === "urgent"
            ).length,
        }),
        [announcements]
    );

    const filteredAnnouncements = useMemo(() => {
        const query = search.trim().toLowerCase();

        return announcements.filter((announcement) => {
            if (status !== "all" && announcement.status !== status) return false;

            if (!query) return true;

            return [announcement.title, announcement.body].some((value) =>
                value.toLowerCase().includes(query)
            );
        });
    }, [announcements, status, search]);

    const stats: AdminStat[] = [
        {
            id: "published",
            label: "Published",
            value: counts.published,
            hint: "Visible to the selected audience",
            accent: "#4F8A63",
            icon: Megaphone,
        },
        {
            id: "drafts",
            label: "Drafts",
            value: counts.draft,
            hint: "Not visible to anyone yet",
            accent: "#85897F",
            icon: FileEdit,
        },
        {
            id: "urgent",
            label: "Urgent Notices",
            value: counts.urgent,
            hint: "Published and flagged urgent",
            accent: "#B85C55",
            icon: BellRing,
        },
        {
            id: "archived",
            label: "Archived",
            value: counts.archived,
            hint: "Kept for the record",
            accent: "#5579A6",
            icon: Archive,
        },
    ];

    const handleChange = <K extends keyof AnnouncementFormData>(
        key: K,
        value: AnnouncementFormData[K]
    ) => {
        setFormData((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setErrors({});
        setEditingId(null);
    };

    const handleSubmit = async (intent: AnnouncementSubmitIntent) => {
        const validationErrors = validateForm(formData);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsSaving(true);

        try {
            await upsertAnnouncement({
                ...formData,
                title: formData.title.trim(),
                body: formData.body.trim(),
                announcementId: editingId ?? undefined,
                intent,
            });

            setAnnouncements((current) => {
                const nextStatus: AnnouncementStatus = intent;

                if (editingId) {
                    return current.map((item) =>
                        item.id === editingId
                            ? {
                                ...item,
                                ...formData,
                                status: nextStatus,
                                updatedAt: new Date().toISOString(),
                            }
                            : item
                    );
                }

                return [
                    {
                        id: `local-announcement-${Date.now()}`,
                        ...formData,
                        status: nextStatus,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        author: { id: "current-admin", name: "You" },
                    },
                    ...current,
                ];
            });

            toast.success(
                editingId
                    ? "Notice updated."
                    : intent === "published"
                        ? "Notice published to the lab."
                        : "Draft saved."
            );

            resetForm();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to save this notice."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setFormData({
            title: announcement.title,
            body: announcement.body,
            audience: announcement.audience,
            priority: announcement.priority,
            pinned: announcement.pinned,
            publishAt: announcement.publishAt?.slice(0, 16) ?? "",
        });
        setErrors({});
    };

    const handleStatusChange = async (
        announcement: Announcement,
        nextStatus: "published" | "archived"
    ) => {
        setBusyId(announcement.id);

        try {
            await upsertAnnouncement({
                announcementId: announcement.id,
                title: announcement.title,
                body: announcement.body,
                audience: announcement.audience,
                priority: announcement.priority,
                pinned: announcement.pinned,
                publishAt: announcement.publishAt ?? "",
                intent: nextStatus,
            });

            setAnnouncements((current) =>
                current.map((item) =>
                    item.id === announcement.id
                        ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
                        : item
                )
            );

            toast.success(
                nextStatus === "published" ? "Notice published." : "Notice archived."
            );
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to update this notice."
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (announcement: Announcement) => {
        if (!window.confirm(`Delete "${announcement.title}"?`)) return;

        setBusyId(announcement.id);

        try {
            await deleteAnnouncement(announcement.id);

            setAnnouncements((current) =>
                current.filter((item) => item.id !== announcement.id)
            );

            if (editingId === announcement.id) resetForm();

            toast.success("Notice deleted.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to delete this notice."
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Announcements & Notices"
                description="Publish lab-wide notices, target a specific audience, and pin the ones that matter."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="announcements" rows={3} />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
                        <div>
                            <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
                                <div className="flex items-center justify-between gap-3 border-b border-[#DEDCD3] px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h2 className="text-base font-semibold text-[#25251F]">
                                                {editingId ? "Edit notice" : "Compose notice"}
                                            </h2>

                                            <p className="mt-0.5 text-xs text-[#777568]">
                                                Draft it, then publish when you are ready.
                                            </p>
                                        </div>
                                    </div>

                                    {editingId && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetForm}
                                            className="rounded-lg text-[#89877B] hover:bg-[#ECEBE4]"
                                        >
                                            Cancel edit
                                        </Button>
                                    )}
                                </div>

                                <CardContent className="space-y-4 p-5">
                                    <div>
                                        <Label htmlFor="announcement-title" className={FIELD_LABEL_CLASS}>
                                            Title
                                        </Label>

                                        <Input
                                            id="announcement-title"
                                            type="text"
                                            placeholder="Seminar room booking opens Monday"
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
                                        <Label htmlFor="announcement-body" className={FIELD_LABEL_CLASS}>
                                            Body
                                        </Label>

                                        <textarea
                                            id="announcement-body"
                                            rows={6}
                                            value={formData.body}
                                            onChange={(event) => handleChange("body", event.target.value)}
                                            placeholder="Explain what changed, who it affects, and what people should do next…"
                                            className="mt-2 w-full resize-none rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] px-3 py-2.5 text-sm text-[#2D2D27] outline-none placeholder:text-[#A5A297] focus:border-[#716F49] focus:ring-1 focus:ring-[#716F49] aria-invalid:border-[#A45B4B]"
                                            aria-invalid={Boolean(errors.body)}
                                        />

                                        {errors.body && (
                                            <p className="mt-2 text-xs text-[#A45B4B]">{errors.body}</p>
                                        )}
                                    </div>

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

                                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#2D2D27]">
                                        <input
                                            type="checkbox"
                                            checked={formData.pinned}
                                            onChange={(event) => handleChange("pinned", event.target.checked)}
                                            className="size-4 accent-[#716F49]"
                                        />

                                        Pin to the top of the notice board
                                    </label>

                                    <div className="flex gap-2 sm:flex-row">
                                        <Button
                                            type="button"
                                            onClick={() => handleSubmit("published")}
                                            disabled={isSaving}
                                            className="flex-1 rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                        >
                                            <Send className="mr-1.5 h-4 w-4" aria-hidden />

                                            {editingId ? "Update & publish" : "Publish now"}
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
                        </div>

                        <div>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-4 lg:items-end lg:justify-between">
                                    <AdminFilterChips
                                        label="Filter notices by status"
                                        value={status}
                                        onValueChange={setStatus}
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
                                            placeholder="Search notices…"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            aria-label="Search announcements"
                                            className={cn(FIELD_CLASS, "pl-10")}
                                        />
                                    </div>
                                </div>

                                {filteredAnnouncements.length === 0 ? (
                                    <AdminEmptyState
                                        icon={Plus}
                                        title="Nothing here yet"
                                        description="Compose a notice on the left. Drafts stay private until you publish them."
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {filteredAnnouncements
                                            .slice()
                                            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                                            .map((announcement) => {
                                                const statusConfig = STATUS_CONFIG[announcement.status];
                                                const isBusy = busyId === announcement.id;

                                                return (
                                                    <Card
                                                        key={announcement.id}
                                                        className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                                                    >
                                                        <CardContent className="p-6">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {announcement.pinned && (
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
                                                                        PRIORITY_BADGE_CLASS[
                                                                        announcement.priority
                                                                        ]
                                                                    )}
                                                                >
                                                                    {PRIORITY_LABELS[announcement.priority]}
                                                                </Badge>

                                                                <Badge className="border border-[#DEDCD3] bg-[#ECEBE4] text-[#5E5D50]">
                                                                    {AUDIENCE_LABELS[announcement.audience]}
                                                                </Badge>
                                                            </div>

                                                            <h4 className="mt-3 text-base font-semibold text-[#25251F]">
                                                                {announcement.title}
                                                            </h4>

                                                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#5E5D50]">
                                                                {announcement.body}
                                                            </p>

                                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#85897F]">
                                                                <span>
                                                                    {announcement.author.name} · updated{" "}
                                                                    {formatDate(announcement.updatedAt)}

                                                                    {announcement.publishAt
                                                                        ? ` · goes live ${formatDate(announcement.publishAt)}`
                                                                        : ""}
                                                                </span>

                                                                <div className="flex items-center gap-1.5">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        disabled={isBusy}
                                                                        onClick={() => handleEdit(announcement)}
                                                                        className="rounded-lg text-[#5E5D50] hover:bg-[#ECEBE4]"
                                                                    >
                                                                        <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                        Edit
                                                                    </Button>

                                                                    {announcement.status !== "published" && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={isBusy}
                                                                            onClick={() =>
                                                                                handleStatusChange(announcement, "published")
                                                                            }
                                                                            className="rounded-lg text-[#4F8A63] hover:bg-[#EAF0EA]"
                                                                        >
                                                                            <Send className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                            Publish
                                                                        </Button>
                                                                    )}

                                                                    {announcement.status === "published" && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            disabled={isBusy}
                                                                            onClick={() =>
                                                                                handleStatusChange(announcement, "archived")
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
                                                                        onClick={() => handleDelete(announcement)}
                                                                        aria-label={`Delete ${announcement.title}`}
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
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
