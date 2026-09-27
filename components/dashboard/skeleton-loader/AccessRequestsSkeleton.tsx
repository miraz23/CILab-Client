import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton, SkeletonCircle } from "./Skeleton";


function UserRowSkeleton() {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-transparent p-3">
            <SkeletonCircle />

            <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
            </div>

            <Skeleton className="hidden h-3 w-16 rounded sm:block" />
        </div>
    );
}

function ShareDetailsSkeleton() {
    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="mt-1.5 h-3 w-48 rounded" />
            </CardHeader>

            <CardContent className="space-y-5 p-5">
                <div>
                    <Skeleton className="h-3 w-32 rounded" />
                    <Skeleton className="mt-2 h-11 w-full rounded-lg" />
                    <Skeleton className="mt-2 h-3 w-3/4 rounded" />
                </div>

                <div>
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="mt-2 h-24 w-full rounded-lg" />
                    <Skeleton className="mt-2 h-3 w-3/4 rounded" />
                </div>

                <div>
                    <Skeleton className="h-3 w-36 rounded" />
                    <Skeleton className="mt-2 h-11 w-full rounded-lg" />
                    <Skeleton className="mt-2 h-3 w-2/3 rounded" />
                </div>
            </CardContent>
        </Card>
    );
}

function RecipientsSkeleton() {
    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] shadow-[0_12px_35px_rgba(30,31,20,0.08)]">
            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="mt-1.5 h-3 w-36 rounded" />
                    </div>

                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4">
                <Skeleton className="h-10 w-full rounded-lg" />

                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-lg" />
                    <Skeleton className="h-9 flex-1 rounded-lg" />
                </div>

                <div className="space-y-1.5">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <UserRowSkeleton key={index} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function AccessRequestsSkeleton() {
    return (
        <div
            className="w-full"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                    <ShareDetailsSkeleton />
                </div>

                <RecipientsSkeleton />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <Skeleton className="h-10 w-24 rounded-lg bg-white/10" />
                <Skeleton className="h-10 w-48 rounded-lg bg-white/10" />
            </div>
        </div>
    );
}

export { AccessRequestsSkeleton };
