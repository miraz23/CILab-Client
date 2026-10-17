export const MEETING_MODES = ["in-person", "online"] as const;

export type MeetingMode = (typeof MEETING_MODES)[number];

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
};

export interface AvailabilitySlot {
    id: string;
    name: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    mode: MeetingMode;
    place: string;
    active: boolean;
}

export interface ScheduleBoardResponse {
    success: boolean;
    message: string;
    slot?: AvailabilitySlot;
    slots?: AvailabilitySlot[];
}

export interface CreateAvailabilitySlotPayload {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    mode: MeetingMode;
    place: string;
}

export interface AvailabilitySlotFormData {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    mode: MeetingMode | "";
    place: string;
}

export interface AvailabilitySlotFormErrors {
    startTime?: string;
    endTime?: string;
    mode?: string;
    place?: string;
}
