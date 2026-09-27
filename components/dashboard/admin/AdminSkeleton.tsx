import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton-loader/Skeleton";
import { cn } from "@/lib/utils";

type AdminSkeletonVariant =
    | "list"
    | "users"
    | "announcements"
    | "moderation"
    | "access-requests"
    | "analytics"
    | "schedule";

const TWO_COLUMN_CLASS = "grid grid-cols-1 gap-6 xl:grid-cols-2";
const FORM_LAYOUT_CLASS = "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]";

function AdminStatCardsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, index) => (
                <Card
                    key={index}
                    className="rounded-[18px] border border-white/60 bg-[#F4F3EE]/95"
                >
                    <CardContent className="flex flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                            <Skeleton className="h-3 w-28 rounded" />
                        </div>

                        <Skeleton className="mt-3 h-8 w-16 rounded-md" />

                        <Skeleton className="mt-2 h-2.5 w-36 rounded" />

                        <div className="mt-auto pt-5">
                            <Skeleton className="h-0.75 w-full rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function AdminFieldSkeleton({
    labelWidth = "w-24",
    className,
    controlHeight = "h-11",
}: {
    labelWidth?: string;
    className?: string;
    controlHeight?: string;
}) {
    return (
        <div className={className}>
            <Skeleton className={cn("h-3 rounded", labelWidth)} />

            <Skeleton className={cn("mt-2 w-full rounded-lg", controlHeight)} />
        </div>
    );
}

function AdminChipsSkeleton({ items = 4, className }: { items?: number; className?: string }) {
    return (
        <div
            className={cn(
                "flex w-full flex-wrap gap-1 rounded-lg border border-[#D9D8CD] bg-[#E8E7DD] p-1 sm:w-fit",
                className
            )}
        >
            {Array.from({ length: items }).map((_, index) => (
                <Skeleton
                    key={index}
                    className={cn("h-8 rounded-md", index % 2 === 0 ? "w-20" : "w-24")}
                />
            ))}
        </div>
    );
}

function AdminSearchFieldSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("relative", className)}>
            <Skeleton className="h-11 w-full rounded-lg" />
        </div>
    );
}

function AdminCardSkeleton({
    title,
    subtitle,
    withIcon = false,
    className,
    bodyClassName,
    children,
}: {
    title?: boolean;
    subtitle?: boolean;
    withIcon?: boolean;
    className?: string;
    bodyClassName?: string;
    children?: ReactNode;
}) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]",
                className
            )}
        >
            {(title || subtitle) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDCD3] px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {withIcon && <Skeleton className="size-9 shrink-0 rounded-xl" />}

                        <div className="min-w-0 space-y-2">
                            {title && <Skeleton className="h-4 w-44 rounded" />}

                            {subtitle && <Skeleton className="h-3 w-56 max-w-full rounded" />}
                        </div>
                    </div>
                </div>
            )}

            {children && <div className={cn("p-5", bodyClassName)}>{children}</div>}
        </div>
    );
}

function AdminBadgeRowSkeleton({ count = 2 }: { count?: number }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton
                    key={index}
                    className={cn("h-5 rounded-full", index % 2 === 0 ? "w-20" : "w-24")}
                />
            ))}
        </div>
    );
}

function AdminButtonRowSkeleton({
    count = 2,
    width = "w-20",
    height = "h-7",
    className,
}: {
    count?: number;
    width?: string;
    height?: string;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} className={cn("rounded-lg", height, width)} />
            ))}
        </div>
    );
}

function AdminBarRowSkeleton() {
    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-40 rounded" />

                <Skeleton className="h-3.5 w-8 rounded" />
            </div>

            <Skeleton className="h-1 w-full rounded-full" />
        </div>
    );
}

function AdminRowCardSkeleton({
    avatar = false,
    actions = 2,
    metaLines = 1,
    badges = 2,
}: {
    avatar?: boolean;
    actions?: number;
    metaLines?: number;
    badges?: number;
}) {
    return (
        <div className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                {avatar && <Skeleton className="size-12 shrink-0 rounded-xl" />}

                <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-5 w-2/3 rounded" />

                    {Array.from({ length: metaLines }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className={cn(
                                "h-3.5 rounded",
                                index === metaLines - 1 ? "w-full max-w-md" : "w-64 max-w-full"
                            )}
                        />
                    ))}

                    {badges > 0 && <AdminBadgeRowSkeleton count={badges} />}
                </div>

                {actions > 0 && (
                    <AdminButtonRowSkeleton
                        count={actions}
                        className="shrink-0 lg:flex-col lg:items-end"
                    />
                )}
            </div>
        </div>
    );
}

function AdminListSkeleton({
    rows = 5,
    avatar = false,
    actions = 2,
    metaLines = 1,
    badges = 2,
}: {
    rows?: number;
    avatar?: boolean;
    actions?: number;
    metaLines?: number;
    badges?: number;
}) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, index) => (
                <AdminRowCardSkeleton
                    key={index}
                    avatar={avatar}
                    actions={actions}
                    metaLines={metaLines}
                    badges={badges}
                />
            ))}
        </div>
    );
}

function AdminNoteSkeleton() {
    return <Skeleton className="h-16 w-full rounded-lg" />;
}

function AdminFilterBarSkeleton({
    chipGroups = 1,
    className,
}: {
    chipGroups?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
                className
            )}
        >
            <div className="flex max-w-xl flex-wrap items-center gap-3">
                {Array.from({ length: chipGroups }).map((_, index) => (
                    <AdminChipsSkeleton key={index} items={4} />
                ))}
            </div>

            <AdminSearchFieldSkeleton className="lg:w-80" />
        </div>
    );
}

function AdminFormSkeleton() {
    return (
        <AdminCardSkeleton title subtitle withIcon>
            <div className="space-y-4">
                <AdminFieldSkeleton />

                <AdminFieldSkeleton labelWidth="w-28" />

                <div className="grid grid-cols-2 gap-4">
                    <AdminFieldSkeleton />
                    <AdminFieldSkeleton />
                </div>

                <AdminFieldSkeleton labelWidth="w-28" />

                <Skeleton className="h-11 w-full rounded-lg" />
            </div>
        </AdminCardSkeleton>
    );
}

function AdminPanelsSkeleton() {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95">
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-2.5 w-20 rounded" />

                            <Skeleton className="h-5 w-56 rounded" />
                        </div>

                        <Skeleton className="h-3 w-32 rounded" />
                    </div>

                    <Skeleton className="mt-6 h-72 w-full rounded-xl" />

                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#D8D9D2] pt-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Skeleton className="size-2 rounded-full" />

                                <Skeleton className="h-2.5 w-20 rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className={TWO_COLUMN_CLASS}>
                <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95">
                    <CardContent className="p-5">
                        <Skeleton className="h-2.5 w-24 rounded" />

                        <Skeleton className="mt-2 h-5 w-44 rounded" />

                        <div className="mt-6 space-y-5">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <AdminBarRowSkeleton key={index} />
                            ))}
                        </div>

                        <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#DEDCD3] bg-[#FBFAF7] p-4">
                            <Skeleton className="size-9 shrink-0 rounded-lg" />

                            <div className="space-y-2">
                                <Skeleton className="h-2.5 w-32 rounded" />

                                <Skeleton className="h-4 w-24 rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-[20px] border border-white/60 bg-[#F4F3EE]/95">
                    <CardContent className="p-5">
                        <Skeleton className="h-2.5 w-24 rounded" />

                        <Skeleton className="mt-2 h-5 w-44 rounded" />

                        <div className="mt-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <AdminBarRowSkeleton key={index} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function AdminUsersSkeleton() {
    return (
        <div className="space-y-6">
            <Card className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
                <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminFieldSkeleton labelWidth="w-16" />

                    <AdminFieldSkeleton labelWidth="w-16" />

                    <AdminFieldSkeleton labelWidth="w-24" />

                    <AdminFieldSkeleton labelWidth="w-28" />
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                <Skeleton className="h-9 w-44 rounded-lg" />
            </div>

            <AdminListSkeleton rows={5} avatar actions={3} metaLines={2} badges={2} />
        </div>
    );
}

function AdminAnnouncementsSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className={FORM_LAYOUT_CLASS}>
            <AdminCardSkeleton title subtitle>
                <div className="space-y-4">
                    <AdminFieldSkeleton labelWidth="w-16" />

                    <AdminFieldSkeleton labelWidth="w-16" controlHeight="h-32" />

                    <div className="grid grid-cols-2 gap-4">
                        <AdminFieldSkeleton labelWidth="w-20" />
                        <AdminFieldSkeleton labelWidth="w-20" />
                    </div>

                    <AdminFieldSkeleton labelWidth="w-24" />

                    <div className="flex items-center gap-2.5">
                        <Skeleton className="size-4 shrink-0 rounded" />

                        <Skeleton className="h-3.5 w-56 max-w-full rounded" />
                    </div>

                    <div className="flex gap-2 sm:flex-row">
                        <Skeleton className="h-11 flex-1 rounded-lg" />

                        <Skeleton className="h-11 flex-1 rounded-lg" />
                    </div>
                </div>
            </AdminCardSkeleton>

            <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:items-end lg:justify-between">
                    <AdminChipsSkeleton items={4} />

                    <AdminSearchFieldSkeleton className="lg:w-80" />
                </div>

                <div className="space-y-4">
                    {Array.from({ length: rows }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] p-6"
                        >
                            <AdminBadgeRowSkeleton count={3} />

                            <Skeleton className="mt-3 h-5 w-2/3 rounded" />

                            <div className="mt-2 space-y-2">
                                <Skeleton className="h-3.5 w-full rounded" />

                                <Skeleton className="h-3.5 w-full rounded" />

                                <Skeleton className="h-3.5 w-3/4 rounded" />
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <Skeleton className="h-3 w-52 max-w-full rounded" />

                                <AdminButtonRowSkeleton count={3} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AdminModerationSkeleton() {
    return (
        <div className="space-y-6">
            <AdminFilterBarSkeleton chipGroups={2} />

            <AdminListSkeleton rows={5} avatar actions={2} metaLines={1} badges={3} />
        </div>
    );
}

function AdminAccessRequestsSkeleton() {
    return (
        <div className="space-y-6">
            <AdminFilterBarSkeleton />

            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] p-6"
                    >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-24 rounded-full" />

                                    <Skeleton className="h-3 w-32 rounded" />
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="min-w-0 space-y-2">
                                        <Skeleton className="h-2.5 w-20 rounded" />

                                        <Skeleton className="h-3.5 w-40 rounded" />

                                        <Skeleton className="h-3 w-56 max-w-full rounded" />
                                    </div>

                                    <Skeleton className="hidden h-4 w-4 shrink-0 rounded-full sm:block" />

                                    <div className="min-w-0 space-y-2">
                                        <Skeleton className="h-2.5 w-24 rounded" />

                                        <Skeleton className="h-3.5 w-40 rounded" />

                                        <Skeleton className="h-3 w-56 max-w-full rounded" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <AdminNoteSkeleton />

                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-3 w-32 rounded" />

                                        <Skeleton className="h-3 w-28 rounded" />
                                    </div>
                                </div>
                            </div>

                            <AdminButtonRowSkeleton
                                count={2}
                                className="shrink-0 lg:flex-col lg:items-end"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminScheduleSkeleton() {
    return (
        <div className="w-full">
            <AdminChipsSkeleton items={3} />

            <div className={cn("mt-6", FORM_LAYOUT_CLASS)}>
                <AdminFormSkeleton />

                <AdminCardSkeleton title subtitle>
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-[#D9D8CD] bg-[#FBFAF7] px-4 py-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 space-y-2.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Skeleton className="h-4 w-40 rounded" />

                                            <Skeleton className="h-5 w-20 rounded-full" />

                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <Skeleton className="h-3 w-44 rounded" />

                                            <Skeleton className="h-3 w-32 rounded" />

                                            <Skeleton className="h-3 w-20 rounded" />
                                        </div>
                                    </div>

                                    <AdminButtonRowSkeleton
                                        count={2}
                                        className="shrink-0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCardSkeleton>
            </div>
        </div>
    );
}

function AdminSkeletonBody({ variant, rows }: { variant: AdminSkeletonVariant; rows: number }) {
    switch (variant) {
        case "users":
            return <AdminUsersSkeleton />;
        case "announcements":
            return <AdminAnnouncementsSkeleton rows={rows} />;
        case "moderation":
            return <AdminModerationSkeleton />;
        case "access-requests":
            return <AdminAccessRequestsSkeleton />;
        case "analytics":
            return <AdminPanelsSkeleton />;
        case "schedule":
            return <AdminScheduleSkeleton />;
        default:
            return <AdminListSkeleton rows={rows} />;
    }
}

function AdminSkeleton({
    showStats = true,
    variant = "list",
    rows = 5,
    className,
}: {
    showStats?: boolean;
    variant?: AdminSkeletonVariant;
    rows?: number;
    className?: string;
}) {
    return (
        <div
            className={cn("w-full", className)}
            aria-busy="true"
            aria-live="polite"
        >
            {showStats && <AdminStatCardsSkeleton />}

            <div className={cn(showStats && "mt-6")}>
                <AdminSkeletonBody variant={variant} rows={rows} />
            </div>
        </div>
    );
}

export {
    AdminSkeleton,
    AdminStatCardsSkeleton,
    AdminListSkeleton,
    AdminRowCardSkeleton,
    AdminPanelsSkeleton,
    AdminFormSkeleton,
};
