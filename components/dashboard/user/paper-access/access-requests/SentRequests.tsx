"use client";

import { useCallback, useMemo, useState } from "react";
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
    fulfilled: { label: "Resolved", icon: CheckCircle, className: "bg-[#EAF0EA] text-[#4F8A63] border-[#D8E2D9]" },
};

type RequestGroup = {
    key: string;
    head: SentRequest;
    requests: SentRequest[];
};

/** The backend creates one request per recipient; merge those sent together into one row. */
function groupRequests(requests: SentRequest[]): RequestGroup[] {
    const groups: RequestGroup[] = [];
    const byKey = new Map<string, RequestGroup>();
    for (const request of requests) {
        const minute = request.createdAt.slice(0, 16);
        const key = [request.shareLink, request.message ?? "", request.expiresAt ?? "", minute].join("|");
        const existing = byKey.get(key);
        if (existing) {
            existing.requests.push(request);
        } else {
            const group = { key, head: request, requests: [request] };
            byKey.set(key, group);
            groups.push(group);
        }
    }
    return groups;
}

function RecipientList({ requests }: { requests: SentRequest[] }) {
    const shown = requests.slice(0, 3);
    const others = requests.slice(3);
    return (
        <p className="text-sm font-semibold text-[#292D25]">
            To: {shown.map((request) => request.toUser.name).join(", ")}
            {others.length > 0 && (
                <>
                    {" and "}
                    <span className="group relative inline-block">
                        <button
                            type="button"
                            className="cursor-pointer font-semibold text-[#716F49] underline decoration-dotted underline-offset-2"
                        >
                            {others.length} others
                        </button>
                        <span className="invisible absolute left-0 top-full z-20 w-72 pt-1 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                            <span className="block max-h-64 overflow-y-auto rounded-lg border border-[#D7D4C9] bg-white p-2 shadow-lg">
                                {others.map((request) => (
                                    <span key={request.id} className="block px-2 py-1.5">
                                        <span className="block text-xs font-semibold text-[#292D25]">{request.toUser.name}</span>
                                        <span className="block break-all text-xs font-normal text-[#7B7D72]">{request.toUser.email}</span>
                                    </span>
                                ))}
                            </span>
                        </span>
                    </span>
                </>
            )}
        </p>
    );
}

export default function SentRequests() {
    const [requests, setRequests] = useState<SentRequest[]>([]);
    const [filter, setFilter] = useState<"all" | SentRequestStatus>("all");
    const [errorMessage, setErrorMessage] = useState("");
    const [editingRequest, setEditingRequest] = useState<RequestGroup | null>(null);
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
    const filteredRequests = useMemo(
        () => groupRequests(requests.filter((request) => filter === "all" || request.status === filter)),
        [requests, filter],
    );

    const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const revokeRequest = async (group: RequestGroup) => {
        const ids = new Set(group.requests.map((item) => item.id));
        if (!await confirmAction({
            title: "Delete this access request?",
            text: "The recipient will no longer be able to use this request.",
            icon: "warning",
            confirmText: "Delete",
            tone: "danger",
        })) return;
        try {
            await Promise.all(group.requests.map((item) => updateAccessRequest(item.id, "revoked")));
            setRequests((current) => current.map((item) => (
                ids.has(item.id)
                    ? { ...item, status: "revoked", updatedAt: new Date().toISOString() }
                    : item
            )));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to revoke request.");
        }
    };

    const openEditor = (group: RequestGroup) => {
        const request = group.head;
        setEditingRequest(group);
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
            const payload = {
                shareLink: editLink,
                message: editMessage,
                expiresAt: editExpiresAt ? new Date(`${editExpiresAt}T23:59:59`).toISOString() : undefined,
            };
            const results = await Promise.all(
                editingRequest.requests.map((item) => updateSentAccessRequest(item.id, payload)),
            );
            const updated = new Map(editingRequest.requests.map((item, index) => [item.id, results[index].request]));
            setRequests((current) => current.map((request) => {
                const data = updated.get(request.id);
                return data
                    ? { ...request, shareLink: data.shareLink, message: data.message, expiresAt: data.expiresAt, updatedAt: data.updatedAt }
                    : request;
            }));
            setEditingRequest(null);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to update request.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="overflow-hidden rounded-lg border border-[#D8D5C9] bg-[#F4F3EE]">
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
                                        "rounded-lg px-2.5 py-1 text-xs font-medium",
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
                    <div className="rounded-lg border border-dashed border-[#CFCFC2] bg-[#FBFAF7] py-10 text-center">
                        <LinkIcon className="mx-auto mb-2 h-5 w-5 text-[#85897F]" />
                        <p className="text-sm font-medium text-[#4B4D42]">No sent requests found</p>
                        <p className="mt-1 text-xs text-[#8A8C81]">Requests you send will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRequests.map((group) => {
                            const request = group.head;
                            const allSame = group.requests.every((item) => item.status === request.status);
                            const canEdit = group.requests.every((item) => item.status === "pending");
                            const config = STATUS_CONFIG[request.status];
                            const StatusIcon = config.icon;
                            return (
                                <div key={group.key} className="rounded-lg border border-[#D9D8CD] bg-[#FBFAF7] p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <RecipientList requests={group.requests} />
                                                {allSame ? (
                                                    <Badge className={cn("gap-1 border", config.className)}>
                                                        <StatusIcon className="h-3 w-3" />{config.label}
                                                    </Badge>
                                                ) : (
                                                    Object.entries(
                                                        group.requests.reduce<Record<string, number>>((acc, item) => {
                                                            acc[item.status] = (acc[item.status] ?? 0) + 1;
                                                            return acc;
                                                        }, {}),
                                                    ).map(([status, count]) => {
                                                        const c = STATUS_CONFIG[status as SentRequestStatus];
                                                        const Icon = c.icon;
                                                        return (
                                                            <Badge key={status} className={cn("gap-1 border", c.className)}>
                                                                <Icon className="h-3 w-3" />{count} {c.label}
                                                            </Badge>
                                                        );
                                                    })
                                                )}
                                            </div>
                                            {group.requests.length === 1 && (
                                                <p className="mt-1 text-xs text-[#7B7D72]">{request.toUser.email}</p>
                                            )}
                                            <p className="mt-2 text-xs text-[#7B7D72]">
                                                Sent {formatDate(request.createdAt)}
                                                {request.expiresAt && ` • Expires ${formatDate(request.expiresAt)}`}
                                            </p>
                                            {request.message && <p className="mt-2 text-sm text-[#565D54]">{request.message}</p>}
                                        </div>
                                        <div className="flex flex-wrap shrink-0 items-center gap-2">
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
                                                    {canEdit && (
                                                        <Button type="button" variant="outline" size="sm" onClick={() => openEditor(group)}>
                                                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                                                        </Button>
                                                    )}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => revokeRequest(group)}>
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
                    <form className="w-full max-w-lg space-y-4 rounded-lg bg-[#F4F3EE] p-6 shadow-2xl" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
                        <div>
                            <h2 className="text-lg font-semibold text-[#292D25]">Edit access request</h2>
                            <p className="text-xs text-[#777568]">Update the shared link or request details.</p>
                        </div>
                        <label className="block space-y-1.5 text-sm font-medium text-[#565D54]">
                            Shared link
                            <input type="url" required value={editLink} onChange={(event) => setEditLink(event.target.value)} className="h-10 w-full rounded-lg border border-[#D7D4C9] bg-white px-3 text-sm" />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-[#565D54]">
                            Message
                            <textarea value={editMessage} onChange={(event) => setEditMessage(event.target.value)} rows={4} className="w-full rounded-lg border border-[#D7D4C9] bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium text-[#565D54]">
                            Expiration date
                            <input type="date" value={editExpiresAt} onChange={(event) => setEditExpiresAt(event.target.value)} className="h-10 w-full rounded-lg border border-[#D7D4C9] bg-white px-3 text-sm" />
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
