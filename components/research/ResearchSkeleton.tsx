"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CARD_COUNT = 8;

function ResearchCardSkeleton() {
    return (
        <div className="w-full rounded-[28px] bg-neutral-100 p-2.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]">
            {/* gradient panel placeholder */}
            <div className="relative h-52.5 overflow-hidden rounded-[22px] bg-neutral-200/70">
                <Skeleton className="absolute left-3.5 top-5.5 h-6 w-28 rounded-full bg-white/55" />
                <Skeleton className="absolute right-3.5 top-3.5 size-10 rounded-xl bg-white/55" />
                <Skeleton className="absolute -bottom-4 left-3 h-16 w-32 rounded-none bg-white/40" />

                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 space-y-2">
                    <Skeleton className="h-4 w-full bg-white/55" />
                    <Skeleton className="h-4 w-4/5 bg-white/55" />
                </div>
            </div>

            {/* footer placeholder */}
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="size-9.5 shrink-0 rounded-md" />
            </div>
        </div>
    );
}

/** Card grid placeholder that mirrors the real research grid layout. */
function ResearchGridSkeleton({ count = CARD_COUNT }: { count?: number }) {
    return (
        <div
            aria-hidden
            className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {Array.from({ length: count }).map((_, index) => (
                <ResearchCardSkeleton key={index} />
            ))}
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
