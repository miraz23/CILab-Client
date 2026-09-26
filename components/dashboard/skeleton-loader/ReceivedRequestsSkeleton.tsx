import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

function SummaryStatSkeleton() {
    return (
        <Card className="rounded-[18px] border border-white/60 bg-[#F4F3EE]/95">
            <CardContent className="flex h-full flex-col p-5">
                <Skeleton className="h-3 w-28 rounded" />

                <Skeleton className="mt-3 h-8 w-12 rounded-md" />

                <div className="mt-auto pt-6">
                    <Skeleton className="h-0.75 w-full rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}

function RequestCardSkeleton() {
    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <Skeleton className="size-12 shrink-0 rounded-full" />

                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-4 w-40 rounded" />
                            <Skeleton className="h-4 w-56 rounded" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>

                        <Skeleton className="h-3 w-72 max-w-full rounded" />

                        <div className="space-y-2 rounded-lg border border-[#DEDCD3] bg-[#FBFAF7] p-3">
                            <Skeleton className="h-3.5 w-full rounded" />
                            <Skeleton className="h-3.5 w-4/5 rounded" />
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Skeleton className="h-3.5 w-20 rounded" />
                            <Skeleton className="h-3.5 w-36 rounded" />
                            <Skeleton className="h-3.5 w-40 rounded" />
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ReceivedRequestsSkeleton({ showStats = true }: { showStats?: boolean }) {
    return (
        <div
            className="w-full"
            aria-busy="true"
            aria-live="polite"
        >
            {showStats && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <SummaryStatSkeleton key={index} />
                    ))}
                </div>
            )}

            <div className={cn("space-y-4", showStats && "mt-7")}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <RequestCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}

export { ReceivedRequestsSkeleton };
