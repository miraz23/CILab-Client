"use client";

import { cn } from "@/lib/utils";

export interface AdminFilterOption<T extends string> {
    value: T;
    label: string;
    count?: number;
}

interface AdminFilterChipsProps<T extends string> {
    options: AdminFilterOption<T>[];
    value: T;
    onValueChange: (value: T) => void;
    label: string;
}

export default function AdminFilterChips<T extends string>({
    options,
    value,
    onValueChange,
    label,
}: AdminFilterChipsProps<T>) {
    return (
        <div
            className="flex w-full flex-wrap gap-1 rounded-lg border border-[#D9D8CD] bg-[#E8E7DD] p-1 sm:w-fit"
            role="group"
            aria-label={label}
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onValueChange(option.value)}
                    aria-pressed={value === option.value}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        value === option.value
                            ? "bg-[#656748] text-white shadow-sm"
                            : "text-[#737568] hover:text-[#41482D]"
                    )}
                >
                    {option.label}

                    {typeof option.count === "number" && (
                        <span className="ml-1.5 tabular-nums opacity-70">
                            {option.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
