import ScheduleSection from "@/components/schedule/ScheduleSection";
import { fetchPublicSchedule } from "@/lib/api/schedule";

export default async function SchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ slot?: string | string[] | undefined }>;
}) {
    const { slot } = await searchParams;
    const activeSlotId = typeof slot === "string" ? slot : undefined;
    const slots = await fetchPublicSchedule();

    return (
        <main>
            <ScheduleSection slots={slots} activeSlotId={activeSlotId} />
        </main>
    );
}
