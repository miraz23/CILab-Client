import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "./Skeleton";

function UploadStatCardSkeleton({
    hasTrend = false,
}: {
    hasTrend?: boolean;
}) {
    return (
        <Card className="rounded-[18px] border border-white/60 bg-[#F4F3EE]/95">
            <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                    <Skeleton className="h-3 w-28 rounded" />

                    {hasTrend && (
                        <Skeleton className="h-5 w-16 rounded-[8px]" />
                    )}
                </div>

                <div className="mt-4">
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="mt-2 h-3 w-40 rounded" />
                </div>

                <div className="mt-auto pt-6">
                    <Skeleton className="h-0.75 w-full rounded-full" />

                    {hasTrend && (
                        <Skeleton className="mt-2 h-2.5 w-20 rounded" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function UploadSkeleton() {
    return (
        <div
            className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
            aria-live="polite"
        >
            <UploadStatCardSkeleton hasTrend />
            <UploadStatCardSkeleton hasTrend />
            <UploadStatCardSkeleton />
            <UploadStatCardSkeleton hasTrend />
            <UploadStatCardSkeleton />
            <UploadStatCardSkeleton hasTrend />
        </div>
    );
}

export { UploadSkeleton };
