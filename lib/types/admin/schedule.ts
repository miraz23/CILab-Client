import type { AcademicRole } from "@/lib/types/auth/register";

export const SUPERVISOR_ACADEMIC_ROLES = ["Professor", "Assistant Professor"] as const;

export type SupervisorAcademicRole = (typeof SUPERVISOR_ACADEMIC_ROLES)[number];

export const MEETING_MODES = ["in-person", "online"] as const;

export type MeetingMode = (typeof MEETING_MODES)[number];

export const MEETING_STATUSES = [
    "pending",
    "confirmed",
    "declined",
    "completed",
    "cancelled",
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

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

export interface Supervisor {
    id: string;
    name: string;
    email: string;
    academicRole: SupervisorAcademicRole;
    institution: string;
}

export interface StudentMeetingParty {
    id: string;
    name: string;
    email: string;
    academicRole: AcademicRole;
    institution: string;
}

export interface AvailabilitySlot {
    id: string;
    supervisorId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    mode: MeetingMode;
    place: string;
    capacity: number;
    bookedCount: number;
    active: boolean;
}

export interface StudentMeetingRequest {
    id: string;
    student: StudentMeetingParty;
    supervisorId: string;
    topic: string;
    preferredMode: MeetingMode;
    preferredNote?: string;
    place: string;
    scheduledAt?: string;
    slotId?: string;
    status: MeetingStatus;
    requestedAt: string;
    adminNote?: string;
}

export interface ScheduleBoardResponse {
    success: boolean;
    message: string;
    supervisors?: Supervisor[];
    slots?: AvailabilitySlot[];
    requests?: StudentMeetingRequest[];
}

export interface CreateAvailabilitySlotPayload {
    supervisorId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    mode: MeetingMode;
    place: string;
    capacity: number;
}

export interface AvailabilitySlotFormData {
    supervisorId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    mode: MeetingMode | "";
    place: string;
    capacity: string;
}

export interface AvailabilitySlotFormErrors {
    supervisorId?: string;
    startTime?: string;
    endTime?: string;
    mode?: string;
    place?: string;
    capacity?: string;
}

export interface MeetingUpdatePayload {
    requestId: string;
    status: Extract<MeetingStatus, "confirmed" | "declined" | "completed" | "cancelled">;
    slotId?: string;
    place?: string;
    scheduledAt?: string;
    note?: string;
}
