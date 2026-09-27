"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";


export interface CollapsibleNavGroupProps {
    label: string;
    icon: LucideIcon;
    items: { label: string; href: string }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNavigate?: () => void;
    collapsed?: boolean;
}

export function CollapsibleNavGroup({
    label,
    icon: Icon,
    items,
    open,
    onOpenChange,
    onNavigate,
    collapsed = false,
}: CollapsibleNavGroupProps) {
    const pathname = usePathname();
    const isGroupActive = items.some((item) => pathname === item.href);

    return (
        <>
            <button
                type="button"
                onClick={() => onOpenChange(!open)}
                className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white cursor-pointer",
                    collapsed && "justify-center px-2",
                    isGroupActive && "bg-white/15 text-white"
                )}
                aria-expanded={open}
                title={collapsed ? label : undefined}
            >
                <Icon className="size-4.5" aria-hidden />

                {!collapsed && <span className="flex-1 text-left">{label}</span>}

                {!collapsed && (
                    <ChevronDown
                        className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
                        aria-hidden
                    />
                )}
            </button>

            {!collapsed && open && (
                <div className="ml-6 flex flex-col gap-1 border-l border-white/20 pl-4">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "rounded-lg px-3 py-2 text-sm text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                                pathname === item.href && "bg-white/15 text-white"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

export interface MobileNavSheetGroup {
    label: string;
    icon: LucideIcon;
    items: { label: string; href: string }[];
}

export interface MobileNavSheetProps {
    open: boolean;
    title: string;
    groups: MobileNavSheetGroup[];
    onClose: () => void;
}

export function MobileNavSheet({ open, title, groups, onClose }: MobileNavSheetProps) {
    const pathname = usePathname();

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-12 duration-300 ease-out">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#1f321c]">{title}</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[#1f321c] transition-colors hover:bg-[#716f49]/10"
                        aria-label="Close menu"
                    >
                        <X size={20} aria-hidden />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {groups.map((group) => {
                        const Icon = group.icon;

                        return (
                            <div key={group.label} className="flex flex-col gap-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "rounded-xl px-4 py-3 text-sm font-medium text-[#1f321c] transition-colors duration-150 hover:bg-[#716f49]/10",
                                            pathname === item.href && "bg-[#716f49]/15 text-[#716f49]"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
