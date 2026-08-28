"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link as LinkIcon, UserCheck, UserX, Search, Loader2, Share2, Calendar, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchUsers } from "@/lib/api/paper-access/users";
import type { User, AccessRequestFormData, AccessRequestFormErrors, AccessRequestApiResponse } from "@/lib/types/paper-access/access-request";
import { useRouter } from "next/navigation";

export default function AccessRequestsForm() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState<AccessRequestFormData>({
        shareLink: "",
        userIds: [],
        message: "",
        expiresAt: "",
    });

    const [formErrors, setFormErrors] = useState<AccessRequestFormErrors>({});

    const loadUsers = async () => {
        setIsLoading(true);
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
        setIsLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, []);

    const handleShareLinkChange = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, shareLink: value }));
        if (formErrors.shareLink) {
            setFormErrors((prev) => ({ ...prev, shareLink: undefined }));
        }
    }, [formErrors.shareLink]);

    const handleMessageChange = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, message: value }));
    }, []);

    const handleExpiresAtChange = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, expiresAt: value }));
    }, []);

    const handleUserSelection = useCallback((userId: string, checked: boolean) => {
        setSelectedUsers((prev) =>
            checked ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
        setFormData((prev) => ({
            ...prev,
            userIds: checked ? [...prev.userIds, userId] : prev.userIds.filter((id) => id !== userId),
        }));

        if (formErrors.userIds) {
            setFormErrors((prev) => ({ ...prev, userIds: undefined }));
        }
    }, [formErrors.userIds]);

    const handleSelectAll = useCallback(() => {
        const filteredUsers = users.filter((u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const allIds = filteredUsers.map((u) => u.id);
        setSelectedUsers(allIds);
        setFormData((prev) => ({ ...prev, userIds: allIds }));
    }, [users, searchQuery]);

    const handleDeselectAll = useCallback(() => {
        setSelectedUsers([]);
        setFormData((prev) => ({ ...prev, userIds: [] }));
    }, []);

    const validateForm = (): boolean => {
        const errors: AccessRequestFormErrors = {};

        if (!formData.shareLink.trim()) {
            errors.shareLink = "Share link is required";
        } else if (!isValidUrl(formData.shareLink)) {
            errors.shareLink = "Please enter a valid URL";
        }

        if (formData.userIds.length === 0) {
            errors.userIds = "At least one user must be selected";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
            const endpoint = SERVER_URL ? `${SERVER_URL}/api/access-requests` : "/api/mock-access-request";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to create access request");
            }

            const data: AccessRequestApiResponse = await response.json();
            setSubmitStatus("success");
            setFormData({ shareLink: "", userIds: [], message: "", expiresAt: "" });
            setSelectedUsers([]);
        } catch (error) {
            setSubmitStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Failed to create access request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCount = selectedUsers.length;

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <div className='flex items-center justify-between'>
                    <h1 className="text-2xl font-bold text-white">Create Access Request</h1>

                    <div className='flex gap-1'>
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

                <p className="text-white/80 mt-1">Share paper access with collaborators</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white rounded-2xl shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#716f49]/10">
                                        <LinkIcon className="w-5 h-5 text-[#716f49]" aria-hidden />
                                    </div>
                                    <CardTitle className="text-lg">Share Link</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div>
                                    <Label htmlFor="shareLink" className="text-sm font-medium text-gray-700">
                                        Link to Share <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative mt-1">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
                                        <Input
                                            id="shareLink"
                                            type="url"
                                            value={formData.shareLink}
                                            onChange={(e) => handleShareLinkChange(e.target.value)}
                                            placeholder="https://example.com/paper-access-link"
                                            className="pl-10 focus:ring-2 focus:ring-[#716f49] focus:border-transparent"
                                            aria-invalid={!!formErrors.shareLink}
                                            aria-describedby={formErrors.shareLink ? "shareLink-error" : undefined}
                                        />
                                    </div>
                                    {formErrors.shareLink && (
                                        <p id="shareLink-error" className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" aria-hidden />
                                            {formErrors.shareLink}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">Enter the URL you want to share with selected users</p>
                                </div>

                                <div>
                                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message (Optional)</Label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => handleMessageChange(e.target.value)}
                                        placeholder="Add a personal message for recipients..."
                                        rows={3}
                                        className="mt-1 w-full px-3 py-2 border border-[#E6E6E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] focus:border-transparent text-sm resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This message will be included in the access request notification</p>
                                </div>

                                <div>
                                    <Label htmlFor="expiresAt" className="text-sm font-medium text-gray-700">Expiration Date (Optional)</Label>
                                    <div className="relative mt-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
                                        <Input
                                            id="expiresAt"
                                            type="date"
                                            value={formData.expiresAt}
                                            onChange={(e) => handleExpiresAtChange(e.target.value)}
                                            className="pl-10 focus:ring-2 focus:ring-[#716f49] focus:border-transparent"
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Access will expire on this date. Leave empty for no expiration.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {submitStatus === "success" && (
                            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3 animate-in fade-in">
                                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" aria-hidden />
                                <div>
                                    <p className="font-medium text-green-800">Access request created successfully!</p>
                                    <p className="text-sm text-green-700">Selected users have been notified with the share link.</p>
                                </div>
                            </div>
                        )}

                        {submitStatus === "error" && (
                            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 animate-in fade-in">
                                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" aria-hidden />
                                <div>
                                    <p className="font-medium text-red-800">Failed to create access request</p>
                                    <p className="text-sm text-red-700">{errorMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="bg-white rounded-2xl shadow-sm sticky top-24 h-fit">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#716f49]/10">
                                            <UserCheck className="w-5 h-5 text-[#716f49]" aria-hidden />
                                        </div>
                                        <CardTitle className="text-lg">Recipients</CardTitle>
                                    </div>
                                    <span className="bg-[#716f49]/10 text-[#716f49] text-xs font-medium px-2.5 py-1 rounded-full">
                                        {selectedCount} selected
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
                                    <Input
                                        type="search"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 focus:ring-2 focus:ring-[#716f49] focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        disabled={filteredUsers.length === 0 || selectedCount === filteredUsers.length}
                                        className="flex-1 text-xs"
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeselectAll}
                                        disabled={selectedCount === 0}
                                        className="flex-1 text-xs"
                                    >
                                        Clear All
                                    </Button>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <UserX className="w-10 h-10 mx-auto mb-2 text-gray-300" aria-hidden />
                                        <p className="text-sm">No users found matching your search</p>
                                    </div>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                                        {filteredUsers.map((user) => {
                                            const isSelected = selectedUsers.includes(user.id);
                                            return (
                                                <label
                                                    key={user.id}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                                        ? "bg-[#716f49]/5 border border-[#716f49]/20"
                                                        : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                                        className="w-4 h-4 text-[#716f49] border-gray-300 rounded focus:ring-2 focus:ring-[#716f49] focus:ring-offset-2"
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-[#716f49]/10 flex items-center justify-center shrink-0">
                                                        <span className="text-[#716f49] font-medium text-sm">
                                                            {user.name.split(" ").map((n) => n[0]).join("")}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                                                        {user.role}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setFormData({ shareLink: "", userIds: [], message: "", expiresAt: "" });
                            setSelectedUsers([]);
                            setFormErrors({});
                            setSubmitStatus("idle");
                        }}
                        disabled={isSubmitting}
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#716f49] hover:bg-[#5d5b3d] text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4 mr-2" aria-hidden />
                                Create Access Request
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}