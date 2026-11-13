"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CARD_COUNT = 8;

function ResearchCardSkeleton() {
    return (
        <div className="relative mx-auto aspect-3/4 w-full max-w-72">
            {/* stacked sheets */}
            <div className="absolute inset-0 -rotate-3 rounded-lg bg-neutral-200/60" />
            <div className="absolute inset-0 rotate-2 rounded-lg bg-neutral-200/80" />

            {/* first page */}
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-black/10">
                <Skeleton className="h-1.5 w-full rounded-none" />
                <div className="flex-1 space-y-3 px-4 pt-4">
                    <Skeleton className="h-2 w-full" />
                    <div className="space-y-2 pt-2">
                        <Skeleton className="mx-auto h-4 w-11/12" />
                        <Skeleton className="mx-auto h-4 w-4/5" />
                        <Skeleton className="mx-auto h-4 w-3/5" />
                    </div>
                    <Skeleton className="mx-auto h-2 w-2/3" />
                    <div className="space-y-1.5 pt-3">
                        <Skeleton className="h-1.5 w-full" />
                        <Skeleton className="h-1.5 w-11/12" />
                        <Skeleton className="h-1.5 w-full" />
                        <Skeleton className="h-1.5 w-3/4" />
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                    <Skeleton className="h-3 w-16" />
                    <div className="flex gap-1.5">
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="size-8 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PresentationCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border border-[#D8D5C9] bg-white">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                    <Skeleton className="h-6 w-28" />
                    <div className="flex gap-1.5">
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="h-8 w-14 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Card grid placeholder that mirrors the real research grid layout. */
function ResearchGridSkeleton({
    count,
    variant = "portrait",
}: {
    count?: number;
    variant?: "portrait" | "landscape";
}) {
    const isLandscape = variant === "landscape";
    return (
        <div
            aria-hidden
            className={
                isLandscape
                    ? "mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                    : "mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
        >
            {Array.from({ length: count ?? (isLandscape ? 6 : CARD_COUNT) }).map((_, index) =>
                isLandscape ? <PresentationCardSkeleton key={index} /> : <ResearchCardSkeleton key={index} />
            )}
        </div>
    );
}

/** Single-line placeholder for the "Showing x–y of z" results bar. */
function ResearchResultsSkeleton() {
    return (
        <div className="mt-5" aria-hidden>
            <Skeleton className="h-4 w-56" />
        </div>
    );
}

export { ResearchGridSkeleton, ResearchResultsSkeleton };
