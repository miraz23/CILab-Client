"use client";

import { useCallback, useMemo, useState } from "react";
import {
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Loader2,
    MessageSquare,
    Presentation,
    Search,
    XCircle,
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

import { fetchModerationQueue, submitModerationDecision } from "@/lib/api/admin/moderation";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import type {
    ModerationContentType,
    ModerationDecision,
    ModerationStatus,
    ModerationSubmission,
} from "@/lib/types/admin/moderation";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
    ModerationStatus,
    { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
    pending: {
        label: "Pending",
        icon: Clock,
        badgeClass: "bg-[#FBF3E4] text-[#8A6420] border border-[#EBD9AE]",
    },
    approved: {
        label: "Approved",
        icon: CheckCircle,
        badgeClass: "bg-[#EAF0EA] text-[#4F8A63] border border-[#D8E2D9]",
    },
    rejected: {
        label: "Rejected",
        icon: XCircle,
        badgeClass: "bg-[#FBF0EE] text-[#A45B4B] border border-[#E4C2BC]",
    },
};

const CONTENT_TYPE_LABELS: Record<ModerationContentType, string> = {
    paper: "Paper",
    presentation: "Presentation",
};

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

const SEARCH_FIELD =
    "h-11 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] pl-10 pr-4 text-sm text-[#2D2D27] shadow-none " +
    "placeholder:text-[#A5A297] transition-colors focus-visible:border-[#716F49] focus-visible:ring-1 " +
    "focus-visible:ring-[#716F49]";

export default function ContentModeration() {
    const [submissions, setSubmissions] = useState<ModerationSubmission[]>([]);
    const [contentType, setContentType] = useState<ModerationContentType | "all">("all");
    const [status, setStatus] = useState<ModerationStatus | "all">("pending");
    const [search, setSearch] = useState("");
    const [openNoteId, setOpenNoteId] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadQueue = useCallback(async () => {
        const fetched = await fetchModerationQueue();

        setSubmissions(fetched);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadQueue);

    const counts = useMemo(
        () => ({
            all: submissions.length,
            papers: submissions.filter((item) => item.contentType === "paper").length,
            presentations: submissions.filter((item) => item.contentType === "presentation").length,
            pending: submissions.filter((item) => item.status === "pending").length,
            approved: submissions.filter((item) => item.status === "approved").length,
            rejected: submissions.filter((item) => item.status === "rejected").length,
        }),
        [submissions]
    );

    const filteredSubmissions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return submissions.filter((submission) => {
            if (contentType !== "all" && submission.contentType !== contentType) return false;
            if (status !== "all" && submission.status !== status) return false;

            if (!query) return true;

            return [submission.title, submission.category, submission.author.name].some(
                (value) => value.toLowerCase().includes(query)
            );
        });
    }, [submissions, contentType, status, search]);

    const stats: AdminStat[] = [
        {
            id: "pending",
            label: "Awaiting Review",
            value: counts.pending,
            hint: "Oldest submission is 2 days old",
            accent: "#C58A3A",
            icon: Clock,
        },
        {
            id: "approved",
            label: "Approved",
            value: counts.approved,
            hint: "Published to the lab archive",
            accent: "#4F8A63",
            icon: CheckCircle,
        },
        {
            id: "rejected",
            label: "Rejected",
            value: counts.rejected,
            hint: "Author has been notified",
            accent: "#B85C55",
            icon: XCircle,
        },
        {
            id: "total",
            label: "Queue Size",
            value: counts.all,
            hint: `${counts.papers} papers · ${counts.presentations} presentations`,
            accent: "#5579A6",
            icon: FileText,
        },
    ];

    const decide = async (submission: ModerationSubmission, decision: ModerationDecision) => {
        if (decision === "rejected" && !window.confirm(`Reject "${submission.title}"?`)) {
            return;
        }

        setBusyId(submission.id);

        try {
            await submitModerationDecision({
                submissionId: submission.id,
                decision,
                note: note.trim() || undefined,
            });

            setSubmissions((current) =>
                current.map((item) =>
                    item.id === submission.id
                        ? {
                              ...item,
                              status: decision,
                              reviewNote: note.trim() || undefined,
                              reviewedAt: new Date().toISOString(),
                          }
                        : item
                )
            );

            toast.success(
                decision === "approved"
                    ? "Submission approved and archived."
                    : "Submission rejected and the author has been notified."
            );

            setOpenNoteId(null);
            setNote("");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to record this decision."
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Content Moderation"
                description="Review papers and presentations before they are published to the lab archive."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="moderation" />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl flex flex-wrap items-center gap-3">
                            <AdminFilterChips
                                label="Filter submissions by content type"
                                value={contentType}
                                onValueChange={setContentType}
                                options={[
                                    { value: "all", label: "All", count: counts.all },
                                    { value: "paper", label: "Papers", count: counts.papers },
                                    {
                                        value: "presentation",
                                        label: "Presentations",
                                        count: counts.presentations,
                                    },
                                ]}
                            />

                            <AdminFilterChips
                                label="Filter submissions by status"
                                value={status}
                                onValueChange={setStatus}
                                options={[
                                    { value: "pending", label: "Pending", count: counts.pending },
                                    { value: "approved", label: "Approved", count: counts.approved },
                                    { value: "rejected", label: "Rejected", count: counts.rejected },
                                    { value: "all", label: "Any status" },
                                ]}
                            />
                        </div>

                        <div className="relative lg:w-80">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"
                                aria-hidden
                            />

                            <Input
                                type="search"
                                placeholder="Search title, category, author…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Search submissions"
                                className={SEARCH_FIELD}
                            />
                        </div>
                    </div>

                    {filteredSubmissions.length === 0 ? (
                        <AdminEmptyState
                            icon={FileText}
                            title="Nothing in the queue"
                            description="No submissions match the current filters. New uploads will appear here automatically."
                        />
                    ) : (
                        <div className="space-y-4">
                            {filteredSubmissions.map((submission) => {
                                const statusConfig = STATUS_CONFIG[submission.status];
                                const StatusIcon = statusConfig.icon;
                                const ContentIcon =
                                    submission.contentType === "paper" ? FileText : Presentation;
                                const isBusy = busyId === submission.id;
                                const isNoteOpen = openNoteId === submission.id;

                                return (
                                    <Card
                                        key={submission.id}
                                        className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#716F49]/10">
                                                    <ContentIcon
                                                        className="h-5 w-5 text-[#716F49]"
                                                        strokeWidth={1.8}
                                                        aria-hidden
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-base font-semibold text-[#25251F]">
                                                        {submission.title}
                                                    </h4>

                                                    <p className="mt-3 text-sm text-[#777568]">
                                                        {submission.author.name} ·{" "}
                                                        {submission.author.academicRole} ·{" "}
                                                        {submission.author.institution}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <Badge className="border border-[#DEDCD3] bg-[#ECEBE4] text-[#5E5D50]">
                                                            {CONTENT_TYPE_LABELS[submission.contentType]}
                                                        </Badge>

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
                                                            {submission.category}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#89877B]">
                                                        <span>Submitted {formatDate(submission.submittedAt)}</span>

                                                        <span>{submission.fileSizeMb} MB</span>

                                                        <a
                                                            href={submission.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[#716F49] hover:underline"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" aria-hidden />

                                                            Preview file
                                                        </a>
                                                    </div>

                                                    {submission.reviewNote && (
                                                        <p className="mt-3 rounded-lg border border-[#DEDCD3] bg-[#FBFAF7] p-3 text-sm text-[#5E5D50]">
                                                            <span className="font-medium text-[#25251F]">
                                                                Review note:{" "}
                                                            </span>
                                                            {submission.reviewNote}
                                                        </p>
                                                    )}

                                                    {isNoteOpen && (
                                                        <div className="mt-4 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-4 animate-in fade-in slide-in-from-top-2">
                                                            <label
                                                                htmlFor={`moderation-note-${submission.id}`}
                                                                className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                                            >
                                                                Review note
                                                            </label>

                                                            <textarea
                                                                id={`moderation-note-${submission.id}`}
                                                                rows={3}
                                                                value={note}
                                                                onChange={(event) => setNote(event.target.value)}
                                                                placeholder="Explain what the author should fix, or why the submission was approved…"
                                                                className="mt-2 w-full resize-none rounded-lg border border-[#D7D4C9] bg-white px-3 py-2.5 text-sm text-[#2D2D27] outline-none placeholder:text-[#A5A297] focus:border-[#716F49] focus:ring-1 focus:ring-[#716F49]"
                                                            />

                                                            <div className="mt-3 flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    disabled={isBusy}
                                                                    onClick={() => decide(submission, "approved")}
                                                                    className="rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                                                >
                                                                    <CheckCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                    Approve
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={isBusy}
                                                                    onClick={() => decide(submission, "rejected")}
                                                                    className="rounded-lg border-[#E4C2BC] text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                                >
                                                                    <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                    Reject
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setOpenNoteId(null);
                                                                        setNote("");
                                                                    }}
                                                                    className="rounded-lg text-[#89877B] hover:bg-[#ECEBE4]"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 lg:flex-col gap-2 lg:items-end">
                                                    {isBusy && (
                                                        <span className="flex items-center gap-2 text-xs text-[#969386]">
                                                            <Loader2
                                                                className="h-3.5 w-3.5 animate-spin"
                                                                aria-hidden
                                                            />

                                                            Saving…
                                                        </span>
                                                    )}

                                                    {submission.status === "pending" && !isNoteOpen && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() => {
                                                                    setOpenNoteId(submission.id);
                                                                    setNote(submission.reviewNote ?? "");
                                                                }}
                                                                className="rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                                            >
                                                                <MessageSquare className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                Review
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() => {
                                                                    setOpenNoteId(submission.id);
                                                                    setNote("");
                                                                }}
                                                                className="rounded-lg text-[#89877B] hover:bg-[#ECEBE4]"
                                                            >
                                                                Add note
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
                </>
            )}
        </div>
    );
}
