import type {
    AvailabilitySlot,
    CreateAvailabilitySlotPayload,
    ScheduleBoardResponse,
} from "@/lib/types/admin/schedule";
import { adminRequest } from "@/lib/api/admin/client";

export interface ScheduleBoard {
    slots: AvailabilitySlot[];
}

export async function fetchScheduleBoard(): Promise<ScheduleBoard> {
    return adminRequest<ScheduleBoard>("/api/admin/schedule");
}

export async function createAvailabilitySlot(
    payload: CreateAvailabilitySlotPayload
): Promise<ScheduleBoardResponse> {
    return adminRequest<ScheduleBoardResponse>("/api/admin/schedule", {
        method: "POST",
        body: payload,
    });
}

export async function updateAvailabilitySlot(
    slotId: string,
    payload: Partial<CreateAvailabilitySlotPayload> & { active?: boolean }
): Promise<ScheduleBoardResponse> {
    return adminRequest<ScheduleBoardResponse>(`/api/admin/schedule/${slotId}`, {
        method: "PATCH",
        body: payload,
    });
}

export async function deleteAvailabilitySlot(
    slotId: string
): Promise<ScheduleBoardResponse> {
    return adminRequest<ScheduleBoardResponse>(`/api/admin/schedule/${slotId}`, {
        method: "DELETE",
    });
}
