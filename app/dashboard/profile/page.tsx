"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { fetchUserProfile, type UserProfile } from "@/lib/api/users/profile";
import ProfileForm from "@/components/dashboard/profile/ProfileForm";

function ProfileFormClient({ initialData }: { initialData: UserProfile }) {
    return <ProfileForm initialData={initialData} />;
}

function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="overflow-hidden">
                {/* Identity header */}
                <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
                    <div className="relative h-24 w-24 shrink-0">
                        <div className="h-24 w-24 rounded-2xl bg-white/10 ring-1 ring-white/25" />
                        <div className="absolute -bottom-1.5 -right-1.5 h-9 w-9 rounded-full bg-white/10" />
                    </div>
                    <div className="min-w-0">
                        <div className="h-6 w-48 bg-white/10 rounded" />
                        <div className="mt-1 h-4 w-64 bg-white/10 rounded" />
                        <div className="mt-3 flex items-center gap-3">
                            <div className="h-5 w-24 bg-white/10 rounded" />
                            <div className="h-5 w-16 bg-white/10 rounded" />
                            <div className="h-4 w-36 bg-white/10 rounded" />
                        </div>
                    </div>
                </div>

                {/* Account details */}
                <div className="space-y-5 px-6 py-7 sm:px-8">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-5" />
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <div className="h-4 bg-white/10 rounded w-1/3" />
                            <div className="h-11 bg-white/10 rounded-lg" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-4 bg-white/10 rounded w-1/3" />
                            <div className="h-11 bg-white/10 rounded-lg" />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Academic affiliation */}
                <div className="space-y-5 px-6 py-7 sm:px-8">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-5" />
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <div className="h-4 bg-white/10 rounded w-1/2" />
                            <div className="h-11 bg-white/10 rounded-lg" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-4 bg-white/10 rounded w-1/2" />
                            <div className="h-11 bg-white/10 rounded-lg" />
                        </div>
                    </div>
                    <div className="md:w-1/2 md:pr-2.5 space-y-1.5">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-11 bg-white/10 rounded-lg" />
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Security */}
                <div className="space-y-5 px-6 py-7 sm:px-8">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-5" />
                    <div className="md:w-1/2 md:pr-2.5 space-y-1.5">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="relative">
                            <div className="h-11 bg-white/10 rounded-lg" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/10 rounded-md" />
                        </div>
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="flex items-center justify-end gap-3">
                        <div className="h-10 w-20 bg-white/10 rounded-lg" />
                        <div className="h-10 w-32 bg-white/10 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const profile = await fetchUserProfile();
                setUserProfile(profile);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-heading">Profile</h1>
                        <p className="text-white/70 mt-1">Manage your account information and preferences</p>
                    </div>
                </div>
                <Suspense fallback={<ProfileSkeleton />}>
                    <ProfileSkeleton />
                </Suspense>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto mb-4" />
                <p className="text-white/70">Unable to load profile</p>
            </div>
        );
    }

    return (
        <div className="w-[95%] mx-auto py-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Profile</h1>
                    <p className="text-white/70 mt-1">Manage your account information and preferences</p>
                </div>
            </div>

            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileFormClient key={userProfile.id} initialData={userProfile} />
            </Suspense>
        </div>
    );
}