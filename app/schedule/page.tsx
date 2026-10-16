// app/lectures/schedule/page.tsx

import ScheduleSection from "@/components/schedule/ScheduleSection";
import type { AvailabilitySlot } from "@/lib/types/admin/schedule";

// TODO: replace with your real admin-managed data, e.g.
//
// async function getSlots(): Promise<AvailabilitySlot[]> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/schedule`, {
//     next: { revalidate: 60 }, // refresh at most once a minute
//   });
//   if (!res.ok) return [];
//   return (await res.json()).slots ?? [];
// }

// SAMPLE DATA
const sample: AvailabilitySlot[] = [
    {
        id: "s1",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "10:30",
        mode: "in-person",
        place: "Room 4.12, CSE Building",
        active: true,
    },
    {
        id: "s2",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 0,
        startTime: "11:00",
        endTime: "12:00",
        mode: "online",
        place: "Google Meet - link in the course portal",
        active: true,
    },
    {
        id: "s3",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:30",
        mode: "in-person",
        place: "Lab Office 4.12",
        active: true,
    },
    {
        id: "s4",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 2,
        startTime: "14:00",
        endTime: "15:30",
        mode: "online",
        place: "Zoom - see the course page",
        active: true,
    },
    {
        id: "s5",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 3,
        startTime: "09:30",
        endTime: "11:00",
        mode: "in-person",
        place: "Seminar Hall, Block B",
        active: true,
    },
    {
        id: "s6",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 4,
        startTime: "13:00",
        endTime: "14:30",
        mode: "online",
        place: "Microsoft Teams - link shared by email",
        active: true,
    },
    {
        id: "s7",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 4,
        startTime: "15:00",
        endTime: "16:00",
        mode: "in-person",
        place: "Lab Office 4.12",
        active: true,
    },
    {
        id: "s8",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "12:00",
        mode: "in-person",
        place: "Consultation Room 2.07",
        active: true,
    },
    {
        id: "s9",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "12:00",
        mode: "in-person",
        place: "Consultation Room 2.07",
        active: true,
    },
    {
        id: "s10",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "12:00",
        mode: "in-person",
        place: "Consultation Room 2.07",
        active: true,
    },
    {
        id: "s11",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "12:00",
        mode: "in-person",
        place: "Consultation Room 2.07",
        active: true,
    },
    {
        id: "s12",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "12:00",
        mode: "in-person",
        place: "Consultation Room 2.07",
        active: true,
    },
    {
        id: "s13",
        name: "Md. Khaliluzzaman",
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "12:00",
        mode: "in-person",
        place: "Consultation Room 2.07",
        active: true,
    },
];

export default async function SchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ slot?: string | string[] | undefined }>;
}) {
    const { slot } = await searchParams;
    const activeSlotId = typeof slot === "string" ? slot : undefined;
    const slots = sample; // await getSlots();

    return (
        <main>
            <ScheduleSection slots={slots} activeSlotId={activeSlotId} />
        </main>
    );
}
