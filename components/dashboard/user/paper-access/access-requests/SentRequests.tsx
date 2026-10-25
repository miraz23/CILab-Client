"use client";

import { useCallback, useState } from "react";
import { CheckCircle, Clock, Download, ExternalLink, Link as LinkIcon, Pencil, RefreshCw, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import { cn } from "@/lib/utils";
import {
    fetchSentRequests,
    updateAccessRequest,
    updateSentAccessRequest,
    type SentRequest,
    type SentRequestStatus,
} from "@/lib/api/paper-access/access-requests";
import { confirmAction } from "@/lib/confirm";

const STATUS_CONFIG: Record<SentRequestStatus, {
    label: string;
    icon: typeof Clock;
    className: string;
}> = {
    pending: { label: "Pending", icon: Clock, className: "bg-[#FBF3E4] text-[#8A6420] border-[#EBD9AE]" },
    accepted: { label: "Accepted", icon: CheckCircle, className: "bg-[#EAF0EA] text-[#4F8A63] border-[#D8E2D9]" },
    declined: { label: "Declined", icon: XCircle, className: "bg-[#FBF0EE] text-[#A45B4B] border-[#E4C2BC]" },
    expired: { label: "Expired", icon: Clock, className: "bg-[#F1F0EA] text-[#85897F] border-[#DEDCD3]" },
    revoked: { label: "Revoked", icon: XCircle, className: "bg-[#F1F0EA] text-[#85897F] border-[#DEDCD3]" },
};

export default function SentRequests() {
    const [requests, setRequests] = useState<SentRequest[]>([]);
    const [filter, setFilter] = useState<"all" | SentRequestStatus>("all");
    const [errorMessage, setErrorMessage] = useState("");
    const [editingRequest, setEditingRequest] = useState<SentRequest | null>(null);
    const [editLink, setEditLink] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [editExpiresAt, setEditExpiresAt] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const loadRequests = useCallback(async () => {
        setErrorMessage("");
        try {
            setRequests(await fetchSentRequests());
        } catch (error) {
            setRequests([]);
            setErrorMessage(error instanceof Error ? error.message : "Unable to load sent requests.");
        }
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadRequests);
    const filteredRequests = requests.filter((request) => filter === "all" || request.status === filter);

    const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const revokeRequest = async (request: SentRequest) => {
        if (!await confirmAction({
            title: "Delete this access request?",
            text: "The recipient will no longer be able to use this request.",
            icon: "warning",
            confirmText: "Delete",
            tone: "danger",
        })) return;
        try {
            await updateAccessRequest(request.id, "revoked");
            setRequests((current) => current.map((item) => (
                item.id === request.id
                    ? { ...item, status: "revoked", updatedAt: new Date().toISOString() }
                    : item
            )));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to revoke request.");
        }
    };

    const openEditor = (request: SentRequest) => {
        setEditingRequest(request);
        setEditLink(request.shareLink);
        setEditMessage(request.message ?? "");
        setEditExpiresAt(request.expiresAt ? request.expiresAt.slice(0, 10) : "");
        setErrorMessage("");
    };

    const saveEdit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editingRequest) return;
        setIsSaving(true);
        setErrorMessage("");
        try {
            const data = await updateSentAccessRequest(editingRequest.id, {
                shareLink: editLink,
                message: editMessage,
                expiresAt: editExpiresAt ? new Date(`${editExpiresAt}T23:59:59`).toISOString() : undefined,
            });
            setRequests((current) => current.map((request) => (
                request.id === editingRequest.id
                    ? { ...request, shareLink: data.request.shareLink, message: data.request.message, expiresAt: data.request.expiresAt, updatedAt: data.request.updatedAt }
                    : request
            )));
            setEditingRequest(null);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to update request.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold text-[#25251F]">Sent Access Requests</CardTitle>
                        <p className="mt-0.5 text-xs text-[#777568]">Track requests you sent to collaborators.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 rounded-lg border border-[#D7D4C9] bg-[#E8E7DD] p-1">
                            {(["all", "pending", "accepted", "declined"] as const).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFilter(value)}
                                    className={cn(
                                        "rounded-md px-2.5 py-1 text-xs font-medium",
                                        filter === value ? "bg-white text-[#716F49] shadow-sm" : "text-[#737568]"
                                    )}
                                >
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </button>
                            ))}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={refresh} disabled={isLoading} title="Reload sent requests">
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5">
                {errorMessage && <p className="mb-4 rounded-lg bg-[#FBF0EE] px-3 py-2 text-xs text-[#A45B4B]">{errorMessage}</p>}
                {isLoading ? (
                    <p className="py-8 text-center text-sm text-[#777568]">Loading sent requests...</p>
                ) : filteredRequests.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#CFCFC2] bg-[#FBFAF7] py-10 text-center">
                        <LinkIcon className="mx-auto mb-2 h-5 w-5 text-[#85897F]" />
                        <p className="text-sm font-medium text-[#4B4D42]">No sent requests found</p>
                        <p className="mt-1 text-xs text-[#8A8C81]">Requests you send will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRequests.map((request) => {
                            const config = STATUS_CONFIG[request.status];
                            const StatusIcon = config.icon;
                            return (
                                <div key={request.id} className="rounded-xl border border-[#D9D8CD] bg-[#FBFAF7] p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-[#292D25]">
                                                    To: {request.toUser.name}
                                                </p>
                                                <Badge className={cn("gap-1 border", config.className)}>
                                                    <StatusIcon className="h-3 w-3" />{config.label}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-[#7B7D72]">{request.toUser.email}</p>
                                            <p className="mt-2 text-xs text-[#7B7D72]">
                                                Sent {formatDate(request.createdAt)}
                                                {request.expiresAt && ` • Expires ${formatDate(request.expiresAt)}`}
                                            </p>
                                            {request.message && <p className="mt-2 text-sm text-[#565D54]">{request.message}</p>}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => window.open(request.shareLink, "_blank", "noopener,noreferrer")}>
                                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open link
                                            </Button>
                                            {request.paper && (
                                                <Button variant="outline" size="sm" onClick={() => window.open(request.paper?.url, "_blank", "noopener,noreferrer")}>
                                                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download paper
                                                </Button>
                                            )}
                                            {(request.status === "pending" || request.status === "accepted") && (
                                                <>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => openEditor(request)}>
                                                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                                                    </Button>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => revokeRequest(request)}>
                                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
            {editingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#30351f]/45 p-4" onClick={() => !isSaving && setEditingRequest(null)}>
                    <form className="w-full max-w-lg space-y-4 rounded-2xl bg-[#F4F3EE] p-6 shadow-2xl" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className="text-lg font-semibold text-[#292D25]">Edit access request</h2>
                            <p className="text-xs text-[#777568]">Update the shared link or request details.</p>
                        </div>
                        <label className="block space-y-1.5 text-sm font-medium text-[#565D54]">
                            Shared link
                            <input type="url" required value={editLink} onChange={(event) => setEditLink(event.target.value)} className="h-10 w-full rounded-md border border-[#D7D4C9] bg-white px-3 text-sm" />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-[#565D54]">
                            Message
                            <textarea value={editMessage} onChange={(event) => setEditMessage(event.target.value)} rows={4} className="w-full rounded-md border border-[#D7D4C9] bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-[#565D54]">
                            Expiration date
                            <input type="date" value={editExpiresAt} onChange={(event) => setEditExpiresAt(event.target.value)} className="h-10 w-full rounded-md border border-[#D7D4C9] bg-white px-3 text-sm" />
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditingRequest(null)} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
                        </div>
                    </form>
                </div>
            )}
        </Card>
    );
}
