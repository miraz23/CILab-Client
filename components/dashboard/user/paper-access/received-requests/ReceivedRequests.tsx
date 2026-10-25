"use client";

import React, { useCallback, useState } from "react";
import { Mail, CheckCircle, Clock, XCircle, Eye, QrCode, RefreshCw, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceivedRequestsSkeleton } from "@/components/dashboard/skeleton-loader/ReceivedRequestsSkeleton";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import { cn } from "@/lib/utils";
import { QRCodeSVG as QRCode } from "qrcode.react";
import {
    fetchReceivedRequests,
    uploadReceivedPaper,
    type ReceivedRequest,
} from "@/lib/api/paper-access/access-requests";

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        icon: Clock,
        badgeClass: "bg-[#FBF3E4] text-[#8A6420] border border-[#EBD9AE]",
        iconColor: "text-[#C58A3A]",
    },
    accepted: {
        label: "Accepted",
        icon: CheckCircle,
        badgeClass: "bg-[#EAF0EA] text-[#4F8A63] border border-[#D8E2D9]",
        iconColor: "text-[#4F8A63]",
    },
    declined: {
        label: "Declined",
        icon: XCircle,
        badgeClass: "bg-[#FBF0EE] text-[#A45B4B] border border-[#E4C2BC]",
        iconColor: "text-[#A45B4B]",
    },
    expired: {
        label: "Expired",
        icon: Clock,
        badgeClass: "bg-[#F1F0EA] text-[#85897F] border border-[#DEDCD3]",
        iconColor: "text-[#85897F]",
    },
    revoked: {
        label: "Revoked",
        icon: XCircle,
        badgeClass: "bg-[#F1F0EA] text-[#85897F] border border-[#DEDCD3]",
        iconColor: "text-[#85897F]",
    },
} as const;

interface SummaryStatProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    accent: string;
}

function SummaryStat({ title, value, icon: Icon, accent }: SummaryStatProps) {
    return (
        <Card className="group rounded-[18px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#85897F]">
                        {title}
                    </p>
                </div>

                <h3 className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.045em] text-[#1E2630]">
                    {value}
                </h3>

                <div className="mt-auto pt-6">
                    <div className="h-0.75 w-full overflow-hidden rounded-full bg-[#DFE0DA]">
                        <div
                            className="h-full rounded-full transition-all duration-500 group-hover:w-[85%]"
                            style={{ width: "45%", backgroundColor: accent }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ReceivedRequests() {
    const [requests, setRequests] = useState<ReceivedRequest[]>([]);
    const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");
    const [openQrId, setOpenQrId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);

    const loadRequests = useCallback(
        async () => {
            setErrorMessage("");
            try {
                setRequests(await fetchReceivedRequests());
            } catch (error) {
                setRequests([]);
                setErrorMessage(error instanceof Error ? error.message : "Unable to load requests.");
            }
        },
        []
    );

    const { isLoading, refresh } = useDashboardLoading(loadRequests);

    const filteredRequests = requests.filter((req) => {
        if (filter === "all") return true;
        return req.status === filter;
    });

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const acceptedCount = requests.filter((r) => r.status === "accepted").length;
    const declinedCount = requests.filter((r) => r.status === "declined").length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isExpired = (expiresAt?: string) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const handlePaperUpload = async (requestId: string, file?: File) => {
        if (!file) return;
        setErrorMessage("");
        setUploadingRequestId(requestId);
        try {
            const result = await uploadReceivedPaper(requestId, file);
            setRequests((current) =>
                current.map((request) => request.id === requestId
                    ? { ...request, paper: result.paper, status: result.status }
                    : request)
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to upload the requested paper.");
        } finally {
            setUploadingRequestId(null);
        }
    };

    return (
        <div className="w-full space-y-7 pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                        Received Requests
                    </h1>
                    <p className="mt-1 text-sm text-white/60">
                        Manage incoming paper access requests.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div
                        className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md"
                        role="group"
                        aria-label="Filter requests"
                    >
                        {(["all", "pending", "accepted", "declined"] as const).map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                    filter === f
                                        ? "bg-[#F4F3EE] text-[#716F49] shadow-sm"
                                        : "text-white/70 hover:text-white"
                                )}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={refresh}
                        disabled={isLoading}
                        aria-busy={isLoading}
                        className="w-fit gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} aria-hidden />
                        <span className="hidden md:block">Reload</span>
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    "grid grid-cols-1 gap-4 sm:grid-cols-3",
                    isLoading && "hidden"
                )}
            >
                <SummaryStat title="Pending Review" value={pendingCount} icon={Clock} accent="#C58A3A" />
                <SummaryStat title="Accepted" value={acceptedCount} icon={CheckCircle} accent="#4F8A63" />
                <SummaryStat title="Declined" value={declinedCount} icon={XCircle} accent="#B85C55" />
            </div>

            {isLoading ? (
                <ReceivedRequestsSkeleton showStats={false} />
            ) : errorMessage ? (
                <Card className="rounded-2xl border border-[#E4C2BC] bg-[#FBF0EE] p-12 text-center">
                    <XCircle className="mx-auto mb-4 h-12 w-12 text-[#A45B4B]" aria-hidden />
                    <h3 className="mb-1 text-lg font-medium text-[#873F34]">Unable to load requests</h3>
                    <p className="text-sm text-[#9A5A50]">{errorMessage}</p>
                </Card>
            ) : filteredRequests.length === 0 ? (
                <Card className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] p-12 text-center">
                    <Mail className="mx-auto mb-4 h-16 w-16 text-[#B3B0A4]" aria-hidden />
                    <h3 className="mb-1 text-lg font-medium text-[#25251F]">No requests found</h3>
                    <p className="text-sm text-[#777568]">No access requests match your current filter.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => {
                        const statusConfig = STATUS_CONFIG[request.status];
                        const StatusIcon = statusConfig.icon;
                        const expired = isExpired(request.expiresAt);

                        return (
                            <Card
                                key={request.id}
                                className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#716F49]/10">
                                            <span className="text-sm font-medium text-[#716F49]">
                                                {request.fromUser.name.split(" ").map((n) => n[0]).join("")}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-[#25251F]">{request.fromUser.name}</h4>
                                                <span className="text-sm text-[#777568]">{request.fromUser.email}</span>
                                                <Badge className={cn("text-xs font-medium", statusConfig.badgeClass)}>
                                                    <StatusIcon className={cn("mr-1 h-3 w-3", statusConfig.iconColor)} aria-hidden />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>

                                            <p className="mb-2 text-xs text-[#89877B]">
                                                {request.fromUser.role} · {request.fromUser.institution}
                                            </p>

                                            {request.message && (
                                                <p className="mb-3 rounded-lg border border-[#DEDCD3] bg-[#FBFAF7] p-3 text-sm text-[#5E5D50]">
                                                    &ldquo;{request.message}&rdquo;
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-[#89877B]">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5" aria-hidden />
                                                    <a
                                                        href={request.shareLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#716F49] hover:underline"
                                                    >
                                                        View Link
                                                    </a>
                                                </span>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setOpenQrId(openQrId === request.id ? null : request.id)}
                                                    className="p-1.5 text-[#89877B] hover:bg-[#716F49]/10 hover:text-[#716F49]"
                                                    aria-label={openQrId === request.id ? "Hide QR code" : "Show QR code"}
                                                >
                                                    <QrCode className="h-4 w-4" aria-hidden />
                                                </Button>

                                                {request.expiresAt && (
                                                    <span className={cn("flex items-center gap-1", expired && "text-[#A45B4B]")}>
                                                        <Clock className="h-3.5 w-3.5" aria-hidden />
                                                        Expires: {formatDate(request.expiresAt)}
                                                        {expired && " (Expired)"}
                                                    </span>
                                                )}

                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" aria-hidden />
                                                    Requested: {formatDate(request.createdAt)}
                                                </span>
                                            </div>

                                            {["pending", "accepted"].includes(request.status) && (
                                                <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[#25251F]">
                                                            {request.paper ? "Requested paper uploaded" : "Upload requested paper"}
                                                        </p>
                                                        {request.paper?.originalFilename && (
                                                            <p className="truncate text-xs text-[#89877B]">
                                                                {request.paper.originalFilename}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <label
                                                        htmlFor={`paper-upload-${request.id}`}
                                                        className={cn(
                                                            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#716F49] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#625F3F]",
                                                            uploadingRequestId === request.id && "pointer-events-none opacity-60"
                                                        )}
                                                    >
                                                        <Upload className="h-3.5 w-3.5" aria-hidden />
                                                        {uploadingRequestId === request.id
                                                            ? "Uploading..."
                                                            : request.paper ? "Replace PDF" : "Upload PDF"}
                                                        <input
                                                            id={`paper-upload-${request.id}`}
                                                            type="file"
                                                            accept="application/pdf,.pdf"
                                                            className="sr-only"
                                                            disabled={uploadingRequestId !== null}
                                                            onChange={(event) => {
                                                                void handlePaperUpload(request.id, event.target.files?.[0]);
                                                                event.currentTarget.value = "";
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {openQrId === request.id && (
                                                <div className="mt-4 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-4 duration-200 animate-in fade-in slide-in-from-top-2">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-sm font-medium text-[#25251F]">QR Code</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setOpenQrId(null)}
                                                            className="p-1 text-[#89877B] hover:text-[#5E5D50]"
                                                            aria-label="Close QR code"
                                                        >
                                                            <XCircle className="h-4 w-4" aria-hidden />
                                                        </Button>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <QRCode
                                                            value={request.shareLink}
                                                            size={128}
                                                            level="M"
                                                            includeMargin={true}
                                                            bgColor="#FBFAF7"
                                                            fgColor="#25251F"
                                                        />
                                                    </div>
                                                    <p className="mt-2 truncate text-center text-xs text-[#89877B]">{request.shareLink}</p>
                                                </div>
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