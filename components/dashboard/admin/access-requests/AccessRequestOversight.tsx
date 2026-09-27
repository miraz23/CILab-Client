"use client";

import { useCallback, useMemo, useState } from "react";
import {
    ArrowRight,
    Ban,
    CheckCircle,
    Clock,
    Eye,
    Inbox,
    Search,
    ShieldAlert,
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

import {
    fetchOversightAccessRequests,
    submitOversightDecision,
} from "@/lib/api/admin/access-requests";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import type {
    OversightAccessRequest,
    OversightDecision,
    OversightRequestStatus,
} from "@/lib/types/admin/access-request";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
    OversightRequestStatus,
    { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
    pending: {
        label: "Pending",
        icon: Clock,
        badgeClass: "bg-[#FBF3E4] text-[#8A6420] border border-[#EBD9AE]",
    },
    accepted: {
        label: "Accepted",
        icon: CheckCircle,
        badgeClass: "bg-[#EAF0EA] text-[#4F8A63] border border-[#D8E2D9]",
    },
    declined: {
        label: "Declined",
        icon: XCircle,
        badgeClass: "bg-[#FBF0EE] text-[#A45B4B] border border-[#E4C2BC]",
    },
    expired: {
        label: "Expired",
        icon: Clock,
        badgeClass: "bg-[#F1F0EA] text-[#85897F] border border-[#DEDCD3]",
    },
    revoked: {
        label: "Revoked",
        icon: Ban,
        badgeClass: "bg-[#F1F0EA] text-[#5E5D50] border border-[#DEDCD3]",
    },
};

const SEARCH_FIELD =
    "h-11 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] pl-10 pr-4 text-sm text-[#2D2D27] shadow-none " +
    "placeholder:text-[#A5A297] transition-colors focus-visible:border-[#716F49] focus-visible:ring-1 " +
    "focus-visible:ring-[#716F49]";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function isExpired(expiresAt?: string) {
    if (!expiresAt) return false;

    return new Date(expiresAt) < new Date();
}

function PartyColumn({
    label,
    name,
    detail,
}: {
    label: string;
    name: string;
    detail: string;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#85897F]">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-[#25251F]">{name}</p>

            <p className="truncate text-xs text-[#777568]">{detail}</p>
        </div>
    );
}

export default function AccessRequestOversight() {
    const [requests, setRequests] = useState<OversightAccessRequest[]>([]);
    const [status, setStatus] = useState<OversightRequestStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadRequests = useCallback(async () => {
        const fetched = await fetchOversightAccessRequests();

        setRequests(fetched);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadRequests);

    const counts = useMemo(
        () => ({
            all: requests.length,
            pending: requests.filter((item) => item.status === "pending").length,
            accepted: requests.filter((item) => item.status === "accepted").length,
            declined: requests.filter((item) => item.status === "declined").length,
            expired: requests.filter((item) => item.status === "expired").length,
            revoked: requests.filter((item) => item.status === "revoked").length,
        }),
        [requests]
    );

    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase();

        return requests.filter((request) => {
            if (status !== "all" && request.status !== status) return false;

            if (!query) return true;

            return [
                request.requester.name,
                request.requester.email,
                request.owner.name,
                request.owner.email,
            ].some((value) => value.toLowerCase().includes(query));
        });
    }, [requests, status, search]);

    const stats: AdminStat[] = [
        {
            id: "pending",
            label: "Awaiting Owner",
            value: counts.pending,
            hint: "No admin action required",
            accent: "#C58A3A",
            icon: Clock,
        },
        {
            id: "accepted",
            label: "Granted Access",
            value: counts.accepted,
            hint: "Links are live for recipients",
            accent: "#4F8A63",
            icon: CheckCircle,
        },
        {
            id: "revoked",
            label: "Revoked by Admin",
            value: counts.revoked,
            hint: "Access withdrawn by the lab",
            accent: "#8E625D",
            icon: ShieldAlert,
        },
        {
            id: "total",
            label: "Total Requests",
            value: counts.all,
            hint: `${counts.expired} expired · ${counts.declined} declined`,
            accent: "#5579A6",
            icon: Inbox,
        },
    ];

    const decide = async (
        request: OversightAccessRequest,
        decision: OversightDecision
    ) => {
        const confirmMessage =
            decision === "revoked"
                ? `Revoke ${request.requester.name}'s access to ${request.owner.name}'s material?`
                : `Mark this request as ${decision} on behalf of ${request.owner.name}?`;

        if (!window.confirm(confirmMessage)) return;

        setBusyId(request.id);

        try {
            await submitOversightDecision({ requestId: request.id, decision });

            setRequests((current) =>
                current.map((item) =>
                    item.id === request.id
                        ? {
                              ...item,
                              status: decision,
                              decidedAt: new Date().toISOString(),
                          }
                        : item
                )
            );

            toast.success(
                decision === "revoked"
                    ? "Access revoked."
                    : `Request marked as ${decision}.`
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to update this request."
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="Access Request Oversight"
                description="Monitor every paper access request across the lab and step in when a grant has to be withdrawn."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="access-requests" />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <AdminFilterChips
                            label="Filter requests by status"
                            value={status}
                            onValueChange={setStatus}
                            options={[
                                { value: "all", label: "All", count: counts.all },
                                { value: "pending", label: "Pending", count: counts.pending },
                                { value: "accepted", label: "Accepted", count: counts.accepted },
                                { value: "declined", label: "Declined", count: counts.declined },
                                { value: "expired", label: "Expired", count: counts.expired },
                                { value: "revoked", label: "Revoked", count: counts.revoked },
                            ]}
                        />

                        <div className="relative lg:w-80">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"
                                aria-hidden
                            />

                            <Input
                                type="search"
                                placeholder="Search requester or owner…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Search access requests"
                                className={SEARCH_FIELD}
                            />
                        </div>
                    </div>

                    {filteredRequests.length === 0 ? (
                        <AdminEmptyState
                            icon={Inbox}
                            title="No access requests"
                            description="Nothing matches the current filter. Requests created by lab members will surface here."
                        />
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((request) => {
                                const statusConfig = STATUS_CONFIG[request.status];
                                const StatusIcon = statusConfig.icon;
                                const expired = isExpired(request.expiresAt);
                                const isBusy = busyId === request.id;

                                return (
                                    <Card
                                        key={request.id}
                                        className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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

                                                        <span className="text-xs text-[#85897F]">
                                                            Requested {formatDate(request.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                                        <PartyColumn
                                                            label="Requester"
                                                            name={request.requester.name}
                                                            detail={`${request.requester.academicRole} · ${request.requester.institution}`}
                                                        />

                                                        <ArrowRight
                                                            className="hidden h-4 w-4 shrink-0 text-[#B3B0A4] sm:block"
                                                            aria-hidden
                                                        />

                                                        <PartyColumn
                                                            label="Material owner"
                                                            name={request.owner.name}
                                                            detail={`${request.owner.academicRole} · ${request.owner.institution}`}
                                                        />
                                                    </div>

                                                    {request.message && (
                                                        <p className="mt-4 rounded-lg border border-[#DEDCD3] bg-[#FBFAF7] p-3 text-sm text-[#5E5D50]">
                                                            &ldquo;{request.message}&rdquo;
                                                        </p>
                                                    )}

                                                    {request.adminNote && (
                                                        <p className="mt-3 rounded-lg border border-[#E4C2BC] bg-[#FBF0EE] p-3 text-sm text-[#873F34]">
                                                            <span className="font-medium">Admin note: </span>
                                                            {request.adminNote}
                                                        </p>
                                                    )}

                                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#89877B]">
                                                        <a
                                                            href={request.shareLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[#716F49] hover:underline"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" aria-hidden />

                                                            Open shared link
                                                        </a>

                                                        {request.expiresAt && (
                                                            <span
                                                                className={cn(
                                                                    "flex items-center gap-1",
                                                                    expired && "text-[#A45B4B]"
                                                                )}
                                                            >
                                                                <Clock className="h-3.5 w-3.5" aria-hidden />

                                                                Expires {formatDate(request.expiresAt)}
                                                                {expired && " (expired)"}
                                                            </span>
                                                        )}

                                                        {request.decidedAt && (
                                                            <span>
                                                                Decided {formatDate(request.decidedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 lg:flex-col gap-2 lg:items-end">
                                                    {request.status === "pending" && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() => decide(request, "accepted")}
                                                                className="rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                                            >
                                                                <CheckCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                Grant access
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() => decide(request, "declined")}
                                                                className="rounded-lg border-[#E4C2BC] text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                            >
                                                                <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                                Decline
                                                            </Button>
                                                        </>
                                                    )}

                                                    {request.status === "accepted" && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isBusy}
                                                            onClick={() => decide(request, "revoked")}
                                                            className="rounded-lg border-[#E4C2BC] text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                        >
                                                            <Ban className="mr-1 h-3.5 w-3.5" aria-hidden />

                                                            Revoke access
                                                        </Button>
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
