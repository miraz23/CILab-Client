import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

function StateCardSkeleton() {
    return (
        <Card className="rounded-[18px] border border-white/60 bg-[#F4F3EE]">
            <CardContent className="p-5">
                <Skeleton className="h-3 w-28 rounded" />

                <div className="mt-2 flex items-baseline gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded" />
                </div>

                <div className="mt-6">
                    <Skeleton className="h-1.25 w-full rounded-full" />

                    <div className="mt-2 flex items-center justify-between">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatColumnSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("px-3", className)}>
            <Skeleton className="h-4 w-40 rounded" />

            <div className="mt-7 space-y-5">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between gap-3">
                            <Skeleton className="h-3 w-28 rounded" />
                            <Skeleton className="h-3 w-10 rounded" />
                        </div>

                        <Skeleton className="mt-2.5 h-1 w-full rounded-full" />

                        <Skeleton className="mt-1.5 h-2.5 w-24 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SummaryTileSkeleton() {
    return (
        <div className="rounded-[14px] border border-[#D9DAD3] bg-[#ECEBE4]/70 px-4 py-4">
            <Skeleton className="h-2.5 w-36 rounded" />

            <div className="mt-3 flex items-end gap-2">
                <Skeleton className="h-6 w-12 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
            </div>
        </div>
    );
}

function OverviewSkeleton() {
    return (
        <div
            className="w-full space-y-4"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <StateCardSkeleton key={index} />
                ))}
            </div>

            <div className="w-full py-4">
                <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95">
                    <CardContent className="p-5">
                        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:gap-0">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <StatColumnSkeleton
                                    key={index}
                                    className={
                                        index < 2
                                            ? "xl:border-r xl:border-[#D9DAD3]"
                                            : undefined
                                    }
                                />
                            ))}
                        </div>

                        <div className="my-7 h-px bg-[#D8D9D2]" />

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <SummaryTileSkeleton key={index} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export { OverviewSkeleton };
