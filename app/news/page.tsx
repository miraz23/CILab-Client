import NewsNotices from "@/components/news/NewsSection";
import type { Announcement } from "@/lib/types/admin/announcement";

async function getPublishedAnnouncements(): Promise<Announcement[]> {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!baseUrl) {
        console.error("NEXT_PUBLIC_SERVER_URL is not configured.");
        return [];
    }

    try {
        const response = await fetch(`${baseUrl}/api/announcements`, {
            next: { revalidate: 60 },
        });
        if (!response.ok) {
            console.error(`Unable to load published news: ${response.status}`);
            return [];
        }
        const data = (await response.json()) as {
            announcements?: Announcement[];
        };
        return data.announcements ?? [];
    } catch (error) {
        console.error("Unable to load published news:", error);
        return [];
    }
}

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string | string[] | undefined }>;
}) {
    const { notice } = await searchParams;
    const activeNoticeId = typeof notice === "string" ? notice : undefined;
    const announcements = await getPublishedAnnouncements();

    return (
        <main>
            <NewsNotices notices={announcements} activeNoticeId={activeNoticeId} />
        </main>
    );
}
