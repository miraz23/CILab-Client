import type { AcademicRole } from "@/lib/types/auth/register";
import type { AppRole } from "@/lib/types/admin/role";

export const USER_STATUSES = ["active", "pending", "suspended"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const MANAGED_USER_SORTS = ["newest", "name", "active"] as const;

export type ManagedUserSort = (typeof MANAGED_USER_SORTS)[number];

export interface ManagedUser {
    id: string;
    name: string;
    email: string;
    scholarId: string;
    institution: string;
    academicRole: AcademicRole;
    appRole: AppRole;
    status: UserStatus;
    joinedAt: string;
    lastActiveAt?: string;
    papersCount: number;
    presentationsCount: number;
}

export interface ManagedUserFilters {
    search?: string;
    status?: UserStatus | "all";
    appRole?: AppRole | "all";
    academicRole?: AcademicRole | "all";
    sort?: ManagedUserSort;
}

export interface ManagedUsersResponse {
    success: boolean;
    message: string;
    users?: ManagedUser[];
    total?: number;
}

export interface UpdateUserAccessPayload {
    userId: string;
    appRole?: AppRole;
    status?: UserStatus;
}
