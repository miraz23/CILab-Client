import type { User } from "@/lib/types/user/paper-access/access-request";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function fetchUsers(): Promise<User[]> {
    if (!SERVER_URL) {
        throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${SERVER_URL}/api/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Failed to fetch users: ${response.statusText}`);
    }

    return data.users ?? [];
}