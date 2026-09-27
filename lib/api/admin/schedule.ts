import type {
    AvailabilitySlot,
    CreateAvailabilitySlotPayload,
    MeetingUpdatePayload,
    ScheduleBoardResponse,
    StudentMeetingRequest,
    Supervisor,
} from "@/lib/types/admin/schedule";

export interface ScheduleBoard {
    supervisors: Supervisor[];
    slots: AvailabilitySlot[];
    requests: StudentMeetingRequest[];
}

export async function fetchScheduleBoard(): Promise<ScheduleBoard> {
    return {
        supervisors: getMockSupervisors(),
        slots: getMockSlots(),
        requests: getMockRequests(),
    };
}

export async function createAvailabilitySlot(
    payload: CreateAvailabilitySlotPayload
): Promise<ScheduleBoardResponse> {
    return {
        success: true,
        message: `Slot ${payload.startTime}-${payload.endTime} added for ${payload.supervisorId}.`,
    };
}

export async function updateAvailabilitySlot(
    slotId: string,
    payload: Partial<CreateAvailabilitySlotPayload> & { active?: boolean }
): Promise<ScheduleBoardResponse> {
    return {
        success: true,
        message: `Slot ${slotId} updated${payload.active === undefined ? "" : ` (active: ${payload.active})`}.`,
    };
}

export async function deleteAvailabilitySlot(
    slotId: string
): Promise<ScheduleBoardResponse> {
    return {
        success: true,
        message: `Slot ${slotId} removed.`,
    };
}

export async function submitMeetingUpdate(
    payload: MeetingUpdatePayload
): Promise<ScheduleBoardResponse> {
    return {
        success: true,
        message: `Meeting request ${payload.requestId} ${payload.status}.`,
    };
}

function getMockSupervisors(): Supervisor[] {
    return [
        {
            id: "u-1",
            name: "Dr. Sarah Chen",
            email: "sarah.chen@university.edu",
            academicRole: "Professor",
            institution: "Stanford University",
        },
        {
            id: "u-2",
            name: "Dr. Marcus Reid",
            email: "marcus.reid@lab.org",
            academicRole: "Assistant Professor",
            institution: "MIT",
        },
        {
            id: "u-8",
            name: "Dr. Hana Sato",
            email: "hana.sato@university.edu",
            academicRole: "Professor",
            institution: "University of Tokyo",
        },
    ];
}

function getMockSlots(): AvailabilitySlot[] {
    return [
        {
            id: "s-1",
            supervisorId: "u-1",
            dayOfWeek: 1,
            startTime: "10:00",
            endTime: "11:30",
            mode: "in-person",
            place: "Lab Office 4.12",
            capacity: 2,
            bookedCount: 1,
            active: true,
        },
        {
            id: "s-2",
            supervisorId: "u-1",
            dayOfWeek: 3,
            startTime: "14:00",
            endTime: "16:00",
            mode: "online",
            place: "Meet Link",
            capacity: 4,
            bookedCount: 0,
            active: true,
        },
        {
            id: "s-3",
            supervisorId: "u-2",
            dayOfWeek: 2,
            startTime: "09:00",
            endTime: "10:00",
            mode: "online",
            place: "Meet Link",
            capacity: 3,
            bookedCount: 2,
            active: true,
        },
        {
            id: "s-4",
            supervisorId: "u-2",
            dayOfWeek: 5,
            startTime: "13:00",
            endTime: "15:00",
            mode: "in-person",
            place: "Seminar Room B",
            capacity: 2,
            bookedCount: 0,
            active: false,
        },
        {
            id: "s-5",
            supervisorId: "u-8",
            dayOfWeek: 4,
            startTime: "16:00",
            endTime: "17:30",
            mode: "in-person",
            place: "Room 2.07",
            capacity: 2,
            bookedCount: 1,
            active: true,
        },
    ];
}

function getMockRequests(): StudentMeetingRequest[] {
    return [
        {
            id: "mr-1",
            student: {
                id: "u-3",
                name: "Alex Rivera",
                email: "alex.rivera@lab.org",
                academicRole: "PhD Student",
                institution: "MIT",
            },
            supervisorId: "u-1",
            topic: "Chapter 4 feedback on the GNN ablation study",
            preferredMode: "in-person",
            preferredNote: "Any afternoon works best for me.",
            place: "",
            status: "pending",
            requestedAt: "2026-09-25T08:45:00Z",
        },
        {
            id: "mr-2",
            student: {
                id: "u-6",
                name: "Mei Lin",
                email: "mei.lin@university.edu",
                academicRole: "Master's Student",
                institution: "Tsinghua University",
            },
            supervisorId: "u-2",
            topic: "Extension of my thesis benchmark plan",
            preferredMode: "online",
            place: "",
            status: "pending",
            requestedAt: "2026-09-24T17:20:00Z",
        },
        {
            id: "mr-3",
            student: {
                id: "u-7",
                name: "Lucas Moreau",
                email: "lucas.moreau@lab.org",
                academicRole: "Postdoctoral Researcher",
                institution: "ETH Zurich",
            },
            supervisorId: "u-1",
            topic: "Diffusion model hyperparameters",
            preferredMode: "in-person",
            place: "Lab Office 4.12",
            slotId: "s-1",
            scheduledAt: "2026-09-29T10:00:00Z",
            status: "confirmed",
            requestedAt: "2026-09-22T09:10:00Z",
        },
        {
            id: "mr-4",
            student: {
                id: "u-4",
                name: "Priya Sharma",
                email: "priya.sharma@research.institute",
                academicRole: "Research Scientist",
                institution: "Google Research",
            },
            supervisorId: "u-8",
            topic: "Collaboration proposal on federated consent",
            preferredMode: "online",
            place: "",
            status: "declined",
            requestedAt: "2026-09-15T11:35:00Z",
            adminNote: "Supervised by Dr. Reid instead.",
        },
    ];
}
