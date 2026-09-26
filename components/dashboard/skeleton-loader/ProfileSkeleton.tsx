import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "./Skeleton";

function IdentityCardSkeleton() {
    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative h-24 w-24 shrink-0">
                    <Skeleton className="size-24 rounded-2xl" />
                    <Skeleton className="absolute -right-1.5 -bottom-1.5 size-9 rounded-full" />
                </div>

                <div className="min-w-0">
                    <Skeleton className="h-5 w-48 rounded" />
                    <Skeleton className="mt-2 h-4 w-64 rounded" />

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-3 w-40 rounded" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SectionCardSkeleton({
    titleWidth = "w-32",
    subtitleWidth = "w-44",
    children,
}: {
    titleWidth?: string;
    subtitleWidth?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">
                <Skeleton className={`h-4 ${titleWidth} rounded`} />
                <Skeleton className={`mt-1.5 h-3 ${subtitleWidth} rounded`} />
            </CardHeader>

            <CardContent className="space-y-5 p-5">
                {children}
            </CardContent>
        </Card>
    );
}

function FieldSkeleton({ labelWidth = "w-24" }: { labelWidth?: string }) {
    return (
        <div className="space-y-2">
            <Skeleton className={`h-3 ${labelWidth} rounded`} />
            <Skeleton className="h-11 w-full rounded-lg" />
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div
            className="w-full space-y-5 py-7"
            aria-busy="true"
            aria-live="polite"
        >
            <IdentityCardSkeleton />

            <SectionCardSkeleton
                titleWidth="w-36"
                subtitleWidth="w-48"
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FieldSkeleton labelWidth="w-24" />
                    <FieldSkeleton labelWidth="w-16" />
                </div>
            </SectionCardSkeleton>

            <SectionCardSkeleton
                titleWidth="w-44"
                subtitleWidth="w-56"
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FieldSkeleton labelWidth="w-24" />
                    <FieldSkeleton labelWidth="w-28" />
                </div>

                <div className="md:w-1/2 md:pr-2.5">
                    <FieldSkeleton labelWidth="w-32" />
                </div>
            </SectionCardSkeleton>

            <SectionCardSkeleton
                titleWidth="w-24"
                subtitleWidth="w-40"
            >
                <div className="md:w-1/2 md:pr-2.5">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-32 rounded" />
                        <Skeleton className="h-11 w-full rounded-lg" />
                        <Skeleton className="h-3 w-56 rounded" />
                    </div>
                </div>
            </SectionCardSkeleton>

            <div className="flex flex-col-reverse gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-3 w-40 bg-white/10" />

                <div className="flex items-center justify-end gap-3">
                    <Skeleton className="h-10 w-24 rounded-lg bg-white/10" />
                    <Skeleton className="h-10 w-36 rounded-lg bg-white/10" />
                </div>
            </div>
        </div>
    );
}

export { ProfileSkeleton };
