export function isPdfPoster(poster: string | undefined): boolean {
    return (
        /^data:application\/pdf(?:;|,)/i.test(poster ?? "") ||
        /^\/api\/announcements\/[^/]+\/preview$/i.test(poster ?? "")
    );
}

export function announcementPosterHref(poster: string): string {
    if (!poster.startsWith("/api/")) return poster;
    return `${process.env.NEXT_PUBLIC_SERVER_URL ?? ""}${poster}`;
}
