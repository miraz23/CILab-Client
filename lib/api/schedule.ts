import type { AvailabilitySlot } from "@/lib/types/admin/schedule";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

interface PublicScheduleResponse {
    success: boolean;
    slots: AvailabilitySlot[];
}

export async function fetchPublicSchedule(): Promise<AvailabilitySlot[]> {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}/api/schedule`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Unable to load the schedule (HTTP ${response.status}).`);
    }

    const data = (await response.json()) as PublicScheduleResponse;
    if (!data.success || !Array.isArray(data.slots)) {
        throw new Error("The schedule response was invalid.");
    }

    return data.slots;
}
