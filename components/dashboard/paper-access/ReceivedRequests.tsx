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
    pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800", iconColor: "text-yellow-600" },
    accepted: { label: "Accepted", icon: CheckCircle, color: "bg-green-100 text-green-800", iconColor: "text-green-600" },
    declined: { label: "Declined", icon: XCircle, color: "bg-red-100 text-red-800", iconColor: "text-red-600" },
    expired: { label: "Expired", icon: Clock, color: "bg-gray-100 text-gray-800", iconColor: "text-gray-600" },
} as const;

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
        <div className="space-y-6">
            <div>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Received Requests</h1>
                        <p className="text-white/80 mt-1">Manage incoming paper access requests</p>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="Filter requests">
                            {(["all", "pending", "accepted", "declined"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                                        filter === f
                                            ? "bg-white text-[#716f49] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="lg"
                            className="gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                            onClick={() => router.refresh()}
                        >
                            <RefreshCw className="w-4 h-4" aria-hidden />
                            <p className='hidden md:block'>Reload</p>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-100">
                            <Clock className="w-5 h-5 text-yellow-600" aria-hidden />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Review</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100">
                            <CheckCircle className="w-5 h-5 text-green-600" aria-hidden />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Accepted</p>
                            <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/4 bg-gray-200 rounded" />
                                        <div className="h-3 w-1/3 bg-gray-200 rounded" />
                                        <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <Card className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" aria-hidden />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
                    <p className="text-gray-500">No access requests match your current filter.</p>
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
                                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#716f49]/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[#716f49] font-medium text-sm">
                                                {request.fromUser.name.split(" ").map((n) => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900">{request.fromUser.name}</h4>
                                                <span className="text-sm text-gray-500">{request.fromUser.email}</span>
                                                <Badge className={cn("text-xs", statusConfig.color)}>
                                                    <StatusIcon className={cn("w-3 h-3 mr-1", statusConfig.iconColor)} aria-hidden />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {request.fromUser.role} · {request.fromUser.institution}
                                            </p>
                                            {request.message && (
                                                <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    &ldquo;{request.message}&rdquo;
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" aria-hidden />
                                                    <a
                                                        href={request.shareLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#716f49] hover:underline"
                                                    >
                                                        View Link
                                                    </a>
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setOpenQrId(openQrId === request.id ? null : request.id)}
                                                    className="text-gray-500 hover:text-[#716f49] p-1.5"
                                                    aria-label={openQrId === request.id ? "Hide QR code" : "Show QR code"}
                                                >
                                                    <QrCode className="w-4 h-4" aria-hidden />
                                                </Button>
                                                {request.expiresAt && (
                                                    <span className={cn("flex items-center gap-1", expired && "text-red-500")}>
                                                        <Clock className="w-3.5 h-3.5" aria-hidden />
                                                        Expires: {formatDate(request.expiresAt)}
                                                        {expired && " (Expired)"}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" aria-hidden />
                                                    Requested: {formatDate(request.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        {openQrId === request.id && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-medium text-gray-900">QR Code</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setOpenQrId(null)}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                        aria-label="Close QR code"
                                                    >
                                                        <XCircle className="w-4 h-4" aria-hidden />
                                                    </Button>
                                                </div>
                                                <div className="flex justify-center">
                                                    <QRCode
                                                        value={request.shareLink}
                                                        size={128}
                                                        level="M"
                                                        includeMargin={true}
                                                        bgColor="#ffffff"
                                                        fgColor="#1F321C"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 text-center mt-2 truncate">{request.shareLink}</p>
                                            </div>
                                        )}
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                            {request.status === "pending" && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[#716f49] border-[#716f49] hover:bg-[#716f49]/5"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 mr-1" aria-hidden />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 mr-1" aria-hidden />
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                            {request.status === "accepted" && (
                                                <a
                                                    href={request.shareLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-1 text-sm font-medium text-[#716f49] hover:underline px-3 py-2"
                                                >
                                                    <Download className="w-3.5 h-3.5" aria-hidden />
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