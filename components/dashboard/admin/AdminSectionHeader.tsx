"use client";

import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSectionHeaderProps {
    title: string;
    description: string;
    isLoading?: boolean;
    onRefresh?: () => void;
    actions?: ReactNode;
}

const RELOAD_BUTTON_CLASS =
    "gap-2 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-60";

export default function AdminSectionHeader({
    title,
    description,
    isLoading,
    onRefresh,
    actions,
}: AdminSectionHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">{title}</h1>

                <div className="flex shrink-0 items-center gap-1">
                    {actions}

                    {onRefresh && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            onClick={onRefresh}
                            disabled={isLoading}
                            aria-busy={isLoading}
                            className={RELOAD_BUTTON_CLASS}
                        >
                            <RefreshCw
                                className={cn("h-4 w-4", isLoading && "animate-spin")}
                                aria-hidden
                            />

                            <span className="hidden md:block">Reload</span>
                        </Button>
                    )}
                </div>
            </div>

            <p className="mt-1 text-white/80">{description}</p>
        </div>
    );
}
