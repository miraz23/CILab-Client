import { adminRequest } from "@/lib/api/admin/client";
import type {
    ManagedUser,
    ManagedUserFilters,
    ManagedUsersResponse,
    UpdateUserAccessPayload,
} from "@/lib/types/admin/user";

export async function fetchManagedUsers(
    filters: ManagedUserFilters = {}
): Promise<ManagedUser[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value && value !== "all") params.set(key, value);
    }
    const response = await adminRequest<ManagedUsersResponse>(
        `/api/admin/users${params.size ? `?${params.toString()}` : ""}`
    );
    return response.users ?? [];
}

export function updateUserAccess(
    payload: UpdateUserAccessPayload
): Promise<ManagedUsersResponse> {
    return adminRequest<ManagedUsersResponse>(
        `/api/admin/users/${payload.userId}/access`,
        { method: "PATCH", body: payload }
    );
}

export async function fetchManagedUserById(
    userId: string
): Promise<ManagedUser | null> {
    const users = await fetchManagedUsers();
    return users.find((user) => user.id === userId) ?? null;
}
