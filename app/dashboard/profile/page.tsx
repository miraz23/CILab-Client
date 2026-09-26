"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchUserProfile, type UserProfile } from "@/lib/api/users/profile";
import ProfileForm from "@/components/dashboard/profile/ProfileForm";
import { ProfileSkeleton } from "@/components/dashboard/skeleton-loader/ProfileSkeleton";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";

export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const loadProfile = useCallback(async () => {
        try {
            const profile = await fetchUserProfile();

            setUserProfile(profile);
        } catch (error) {
            console.error("Failed to load profile:", error);
        }
    }, []);

    const { isLoading } = useDashboardLoading(loadProfile);

    if (isLoading) {
        return (
            <div className="w-[95%] mx-auto py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-heading">Profile</h1>
                        <p className="text-white/70 mt-1">Manage your account information and preferences</p>
                    </div>
                </div>

                <ProfileSkeleton />
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

            <ProfileForm key={userProfile.id} initialData={userProfile} />
        </div>
    );
}