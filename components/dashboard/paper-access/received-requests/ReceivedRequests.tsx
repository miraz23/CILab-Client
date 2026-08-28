"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, Clock, XCircle, Eye, Download, QrCode, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { useRouter } from "next/navigation";

interface ReceivedRequest {
    id: string;
    fromUser: {
        id: string;
        name: string;
        email: string;
        role: string;
        institution: string;
    };
    shareLink: string;
    message?: string;
    expiresAt?: string;
    status: "pending" | "accepted" | "declined" | "expired";
    createdAt: string;
    updatedAt: string;
}

const MOCK_REQUESTS: ReceivedRequest[] = [
    {
        id: "1",
        fromUser: {
            id: "1",
            name: "Dr. Sarah Chen",
            email: "sarah.chen@university.edu",
            role: "Professor",
            institution: "Stanford University",
        },
        shareLink: "https://drive.google.com/file/d/1abc123/view",
        message: "Hi, I'm sharing my latest research paper on Graph Neural Networks. Would love your feedback!",
        expiresAt: "2026-09-15",
        status: "pending",
        createdAt: "2026-08-20T10:30:00Z",
        updatedAt: "2026-08-20T10:30:00Z",
    },
    {
        id: "2",
        fromUser: {
            id: "2",
            name: "Alex Rivera",
            email: "alex.rivera@lab.org",
            role: "PhD Student",
            institution: "MIT",
        },
        shareLink: "https://arxiv.org/abs/2026.12345",
        message: "Sharing the preprint of our Computer Vision paper.",
        expiresAt: "2026-09-01",
        status: "accepted",
        createdAt: "2026-08-18T14:20:00Z",
        updatedAt: "2026-08-19T09:15:00Z",
    },
    {
        id: "3",
        fromUser: {
            id: "3",
            name: "Priya Sharma",
            email: "priya.sharma@research.institute",
            role: "Research Scientist",
            institution: "Google Research",
        },
        shareLink: "https://example.com/paper/ml-optimization",
        message: "Here's the optimization techniques paper we discussed.",
        expiresAt: "2026-08-25",
        status: "declined",
        createdAt: "2026-08-15T11:00:00Z",
        updatedAt: "2026-08-16T16:30:00Z",
    },
    {
        id: "4",
        fromUser: {
            id: "4",
            name: "Marcus Johnson",
            email: "marcus.j@company.com",
            role: "AI/ML Engineer",
            institution: "OpenAI",
        },
        shareLink: "https://github.com/user/rl-paper",
        message: "Reinforcement Learning research paper with code.",
        status: "pending",
        createdAt: "2026-08-22T09:45:00Z",
        updatedAt: "2026-08-22T09:45:00Z",
    },
];

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
    const router = useRouter();

    const [requests, setRequests] = useState<ReceivedRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");
    const [openQrId, setOpenQrId] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setRequests(MOCK_REQUESTS);
            setIsLoading(false);
        }, 500);
    }, []);

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
                        onClick={() => router.refresh()}
                        className="w-fit gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
                    >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        <span className="hidden md:block">Reload</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryStat title="Pending Review" value={pendingCount} icon={Clock} accent="#C58A3A" />
                <SummaryStat title="Accepted" value={acceptedCount} icon={CheckCircle} accent="#4F8A63" />
                <SummaryStat title="Declined" value={declinedCount} icon={XCircle} accent="#B85C55" />
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card
                            key={i}
                            className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 animate-pulse rounded-full bg-[#DEDCD3]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/4 animate-pulse rounded bg-[#DEDCD3]" />
                                        <div className="h-3 w-1/3 animate-pulse rounded bg-[#DEDCD3]" />
                                        <div className="h-3 w-1/2 animate-pulse rounded bg-[#DEDCD3]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
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

                                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                                            {request.status === "pending" && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="rounded-lg bg-[#716F49] text-sm font-medium text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                                    >
                                                        <CheckCircle className="mr-1 h-3.5 w-3.5" aria-hidden />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-lg border-[#E4C2BC] text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                    >
                                                        <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden />
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                            {request.status === "accepted" && (
                                                <a
                                                    href={request.shareLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-1 rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] px-3 py-2 text-sm font-medium text-[#716F49] hover:bg-[#ECEAE2]"
                                                >
                                                    <Download className="h-3.5 w-3.5" aria-hidden />
                                                    Access Paper
                                                </a>
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