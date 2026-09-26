import { cn } from "@/lib/utils";

function Skeleton({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                "animate-pulse rounded-md bg-[#E2E3DC]",
                className
            )}
            {...props}
        />
    );
}

function SkeletonCircle({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <Skeleton
            className={cn(
                "size-9 shrink-0 rounded-full",
                className
            )}
            {...props}
        />
    );
}

export { Skeleton, SkeletonCircle };
