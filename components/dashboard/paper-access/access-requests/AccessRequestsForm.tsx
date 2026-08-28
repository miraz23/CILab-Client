"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Link as LinkIcon,
    UserCheck,
    UserX,
    Search,
    Loader2,
    Share2,
    Calendar,
    AlertCircle,
    CheckCircle,
    RefreshCw,
} from "lucide-react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { fetchUsers } from "@/lib/api/paper-access/users";

import type {
    User,
    AccessRequestFormData,
    AccessRequestFormErrors,
    AccessRequestApiResponse,
} from "@/lib/types/paper-access/access-request";

import { useRouter } from "next/navigation";

export default function AccessRequestsForm() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [submitStatus, setSubmitStatus] = useState<
        "idle" | "success" | "error"
    >("idle");

    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] =
        useState<AccessRequestFormData>({
            shareLink: "",
            userIds: [],
            message: "",
            expiresAt: "",
        });

    const [formErrors, setFormErrors] =
        useState<AccessRequestFormErrors>({});

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

    const handleShareLinkChange = useCallback(
        (value: string) => {
            setFormData((prev) => ({
                ...prev,
                shareLink: value,
            }));

            if (formErrors.shareLink) {
                setFormErrors((prev) => ({
                    ...prev,
                    shareLink: undefined,
                }));
            }
        },
        [formErrors.shareLink]
    );

    const handleMessageChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            message: value,
        }));
    }, []);

    const handleExpiresAtChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            expiresAt: value,
        }));
    }, []);

    const handleUserSelection = useCallback(
        (userId: string, checked: boolean) => {
            setSelectedUsers((prev) =>
                checked
                    ? [...prev, userId]
                    : prev.filter((id) => id !== userId)
            );

            setFormData((prev) => ({
                ...prev,
                userIds: checked
                    ? [...prev.userIds, userId]
                    : prev.userIds.filter((id) => id !== userId),
            }));

            if (formErrors.userIds) {
                setFormErrors((prev) => ({
                    ...prev,
                    userIds: undefined,
                }));
            }
        },
        [formErrors.userIds]
    );

    const filteredUsers = users.filter(
        (user) =>
            user.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            user.email
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = useCallback(() => {
        const allIds = filteredUsers.map((user) => user.id);

        setSelectedUsers(allIds);

        setFormData((prev) => ({
            ...prev,
            userIds: allIds,
        }));
    }, [filteredUsers]);

    const handleDeselectAll = useCallback(() => {
        setSelectedUsers([]);

        setFormData((prev) => ({
            ...prev,
            userIds: [],
        }));
    }, []);

    const isValidUrl = (value: string) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    };

    const validateForm = () => {
        const errors: AccessRequestFormErrors = {};

        if (!formData.shareLink.trim()) {
            errors.shareLink = "Share link is required";
        } else if (!isValidUrl(formData.shareLink)) {
            errors.shareLink = "Please enter a valid URL";
        }

        if (formData.userIds.length === 0) {
            errors.userIds = "At least one recipient must be selected";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

            const endpoint = SERVER_URL
                ? `${SERVER_URL}/api/access-requests`
                : "/api/mock-access-request";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({}));

                throw new Error(
                    errorData.message ||
                    "Failed to create access request"
                );
            }

            const data: AccessRequestApiResponse =
                await response.json();

            console.log(data);

            setSubmitStatus("success");

            setFormData({
                shareLink: "",
                userIds: [],
                message: "",
                expiresAt: "",
            });

            setSelectedUsers([]);
        } catch (error) {
            setSubmitStatus("error");

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to create access request. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCount = selectedUsers.length;

    return (
        <div className="w-full space-y-7 pb-8">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                                Create Access Request
                            </h1>

                            <p className="mt-1 text-sm text-white/60">
                                Share research material securely with collaborators.
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.refresh()}
                    className="w-fit gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:block">Reload</span>
                </Button>
            </div>

            {/* =====================================================
                FORM
            ====================================================== */}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

                    {/* =================================================
                        LEFT COLUMN
                    ================================================== */}

                    <div className="space-y-5">

                        {/* SHARE DETAILS */}

                        <Card
                            className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]"
                        >
                            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lgbg-[#716F49]/10"
                                    >
                                        <LinkIcon
                                            className="h-4.5 w-4.5 text-[#716F49]"
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    <div>
                                        <CardTitle className="text-base font-semibold text-[#25251F]">
                                            Share Details
                                        </CardTitle>

                                        <p className="mt-0.5 text-xs text-[#777568]">
                                            Define what you want to share.
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5 p-5">

                                {/* LINK */}

                                <div>
                                    <Label
                                        htmlFor="shareLink"
                                        className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                    >
                                        Link to Share
                                        <span className="ml-1 text-[#A45B4B]">
                                            *
                                        </span>
                                    </Label>

                                    <div className="relative mt-2">

                                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"/>

                                        <Input
                                            id="shareLink"
                                            type="url"
                                            value={formData.shareLink}
                                            onChange={(e) =>
                                                handleShareLinkChange(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://example.com/paper"
                                            className="h-11 rounded-lg border-[#D7D4C9] bg-[#FBFAF7] pl-10 text-sm text-[#2D2D27] shadow-none placeholder:text-[#A5A297] focus-visible:border-[#716F49] focus-visible:ring-1 focus-visible:ring-[#716F49]"
                                            aria-invalid={
                                                !!formErrors.shareLink
                                            }
                                        />
                                    </div>

                                    {formErrors.shareLink && (
                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#A45B4B]">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {formErrors.shareLink}
                                        </p>
                                    )}

                                    {!formErrors.shareLink && (
                                        <p className="mt-2 text-xs text-[#89877B]">
                                            Enter the URL you want to share with the selected recipients.
                                        </p>
                                    )}
                                </div>

                                {/* MESSAGE */}

                                <div>
                                    <Label
                                        htmlFor="message"
                                        className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                    >
                                        Message
                                        <span className="ml-1 font-normal normal-case tracking-normal text-[#99978C]">
                                            Optional
                                        </span>
                                    </Label>

                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) =>
                                            handleMessageChange(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Add a short message for the recipients..."
                                        rows={4}
                                        className="mt-2 w-full resize-none rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] px-3 py-2.5 text-sm text-[#2D2D27] outline-none placeholder:text-[#A5A297] focus:border-[#716F49] focus:ring-1 focus:ring-[#716F49]"
                                    />

                                    <p className="mt-2 text-xs text-[#89877B]">
                                        This message will be included with the access request.
                                    </p>
                                </div>

                                {/* EXPIRATION */}

                                <div>
                                    <Label
                                        htmlFor="expiresAt"
                                        className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                    >
                                        Expiration Date
                                        <span className="ml-1 font-normal normal-case tracking-normal text-[#99978C]">
                                            Optional
                                        </span>
                                    </Label>

                                    <div className="relative mt-2">

                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"/>

                                        <Input
                                            id="expiresAt"
                                            type="date"
                                            value={formData.expiresAt}
                                            onChange={(e) =>
                                                handleExpiresAtChange(
                                                    e.target.value
                                                )
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            className="h-11 rounded-lg border-[#D7D4C9] bg-[#FBFAF7] pl-10 text-sm text-[#2D2D27] shadow-none focus-visible:border-[#716F49] focus-visible:ring-1 focus-visible:ring-[#716F49]"
                                        />
                                    </div>

                                    <p className="mt-2 text-xs text-[#89877B]">
                                        Leave empty if the access should not expire.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SUCCESS */}

                        {submitStatus === "success" && (
                            <div className="flex items-start gap-3 rounded-xl border border-[#BFD6C1] bg-[#EEF6EE] p-4">
                                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#397A40]" />

                                <div>
                                    <p className="text-sm font-semibold text-[#285C2D]">
                                        Access request created successfully.
                                    </p>

                                    <p className="mt-1 text-xs text-[#4D7750]">
                                        Selected users have been notified with the shared link.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ERROR */}

                        {submitStatus === "error" && (
                            <div className="flex items-start gap-3 rounded-xl border border-[#E4C2BC] bg-[#FBF0EE] p-4">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#A45B4B]" />

                                <div>
                                    <p className="text-sm font-semibold text-[#873F34]">
                                        Unable to create access request.
                                    </p>

                                    <p className="mt-1 text-xs text-[#9A5A50]">
                                        {errorMessage}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        RIGHT COLUMN — RECIPIENTS
                    ================================================== */}

                    <div>
                        <Card
                            className="sticky top-24 overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                        >
                            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">

                                <div className="flex items-center justify-between gap-3">

                                    <div className="flex items-center gap-3">

                                        <div
                                            className="
                                                flex h-9 w-9
                                                items-center justify-center
                                                rounded-lg
                                                bg-[#716F49]/10
                                            "
                                        >
                                            <UserCheck
                                                className="h-4.5 w-4.5 text-[#716F49]"
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div>
                                            <CardTitle className="text-base font-semibold text-[#25251F]">
                                                Recipients
                                            </CardTitle>

                                            <p className="mt-0.5 text-xs text-[#777568]">
                                                Choose collaborators
                                            </p>
                                        </div>
                                    </div>

                                    <span 
                                        className="whitespace-nowrap rounded-full border border-[#716F49]/15 bg-[#716F49]/8 px-2.5 py-1 text-[11px] font-semibold text-[#716F49]"
                                    >
                                        {selectedCount} selected
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 p-4">

                                {/* SEARCH */}

                                <div className="relative">

                                    <Search
                                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]"
                                    />

                                    <Input
                                        type="search"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="h-10 rounded-lg border-[#D7D4C9] bg-[#FBFAF7] pl-9 text-sm shadow-none placeholder:text-[#A5A297] focus-visible:border-[#716F49] focus-visible:ring-1 focus-visible:ring-[#716F49]"
                                    />
                                </div>

                                {/* CONTROLS */}

                                <div className="flex gap-2">

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        disabled={
                                            filteredUsers.length === 0 ||
                                            selectedCount ===
                                            filteredUsers.length
                                        }
                                        className="h-9 flex-1 rounded-lg border-[#D7D4C9] bg-[#FBFAF7] text-xs text-[#5E5D50] shadow-none hover:bg-[#ECEAE2]"
                                    >
                                        Select all
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeselectAll}
                                        disabled={selectedCount === 0}
                                        className="h-9 flex-1 rounded-lg border-[#D7D4C9] bg-[#FBFAF7] text-xs text-[#5E5D50] shadow-none hover:bg-[#ECEAE2] "
                                    >
                                        Clear
                                    </Button>
                                </div>

                                {/* USERS */}

                                {isLoading ? (
                                    <div className="space-y-2">

                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 rounded-xl border border-transparent p-3"
                                            >
                                                <div className="h-9 w-9 animate-pulse rounded-full bg-[#DEDCD3]" />

                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#DEDCD3]" />
                                                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#DEDCD3]" />
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="py-10 text-center">

                                        <UserX className="mx-auto mb-3 h-8 w-8 text-[#B3B0A4]" />

                                        <p className="text-xs font-medium text-[#6D6B60]">
                                            No users found
                                        </p>

                                        <p className="mt-1 text-[11px] text-[#99978C]">
                                            Try another search term.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-97.5 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin"
                                    >
                                        {filteredUsers.map((user) => {

                                            const isSelected =
                                                selectedUsers.includes(
                                                    user.id
                                                );

                                            const initials = user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase();

                                            return (
                                                <label
                                                    key={user.id}
                                                    className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200
                                                        ${isSelected
                                                            ? "border-[#716F49]/25 bg-[#716F49]/[0.07]"
                                                            : "border-transparent hover:border-[#DEDCD3] hover:bg-[#FBFAF7]"
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) =>
                                                            handleUserSelection(
                                                                user.id,
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="h-4 w-4 shrink-0 cursor-pointer accent-[#716F49]"
                                                    />

                                                    <div
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors
                                                            ${isSelected
                                                                ? "bg-[#716F49] text-white"
                                                                : "bg-[#E4E1D7] text-[#716F49]"
                                                            }
                                                        `}
                                                    >
                                                        {initials}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-[#292923]">
                                                            {user.name}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-[11px] text-[#89877B]">
                                                            {user.email}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className="hidden whitespace-nowrap text-[10px] font-medium text-[#99978C] sm:block"
                                                    >
                                                        {user.role}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {formErrors.userIds && (
                                    <p className="flex items-center gap-1.5 text-xs text-[#A45B4B]">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {formErrors.userIds}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* =====================================================
                    ACTION BAR
                ====================================================== */}

                <div
                    className="flex flex-col-reverse gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-end"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setFormData({
                                shareLink: "",
                                userIds: [],
                                message: "",
                                expiresAt: "",
                            });

                            setSelectedUsers([]);
                            setFormErrors({});
                            setSubmitStatus("idle");
                            setErrorMessage("");
                        }}
                        disabled={isSubmitting}
                        className="rounded-lg border border-white/15 bg-white/5 px-5 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 hover:text-white"
                    >
                        Reset
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-[#716F49] px-5 text-sm font-medium text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] transition-all hover:bg-[#625F3F] hover:shadow-[0_7px_18px_rgba(40,40,25,0.25)]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Share2 className="mr-2 h-4 w-4" />
                                Create Access Request
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}