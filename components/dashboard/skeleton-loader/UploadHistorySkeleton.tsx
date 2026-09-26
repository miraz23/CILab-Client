import { Skeleton } from "./Skeleton";

function HistoryRowSkeleton() {
    return (
        <div className="rounded-xl border border-[#D9D8CD] bg-[#F7F6F1] px-4 py-4">
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Skeleton className="h-4 w-2/3 rounded" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-14 rounded" />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

function UploadHistorySkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div
            className="w-full"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="px-6 py-4 border-b border-[#D9D8CD]">
                <div className="flex h-10 w-full gap-1 rounded-xl border border-[#D5D4C9] bg-[#E8E7DD] p-1 sm:w-fit">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
            </div>

            <div className="px-4 py-3 sm:px-6">
                <div className="space-y-2">
                    {Array.from({ length: rows }).map((_, index) => (
                        <HistoryRowSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export { UploadHistorySkeleton };
