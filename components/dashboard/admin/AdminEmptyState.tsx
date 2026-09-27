"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminEmptyStateProps {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function AdminEmptyState({
    icon: Icon,
    title,
    description,
    action,
}: AdminEmptyStateProps) {
    return (
        <Card className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] p-12 text-center">
            <CardContent className="flex flex-col items-center">
                <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#ECEBE4]">
                    <Icon className="h-7 w-7 text-[#B3B0A4]" strokeWidth={1.7} aria-hidden />
                </span>

                <h3 className="text-lg font-medium text-[#25251F]">{title}</h3>

                <p className="mt-1 max-w-md text-sm text-[#777568]">
                    {description}
                </p>

                {action && <div className="mt-5">{action}</div>}
            </CardContent>
        </Card>
    );
}
