import { CheckCircle, MessageSquareQuote, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ReviewNoteProps = {
    note: string;
    status?: string;
    /** ISO date string of when the review happened. */
    reviewedAt?: string | null;
    className?: string;
};

const TONES = {
    approved: {
        label: "Approved",
        icon: CheckCircle,
        accent: "bg-[#4F8A63]",
        iconWrap: "bg-[#EAF0EA] text-[#4F8A63]",
        label_: "text-[#4F8A63]",
    },
    rejected: {
        label: "Changes requested",
        icon: XCircle,
        accent: "bg-[#A45B4B]",
        iconWrap: "bg-[#FBF0EE] text-[#A45B4B]",
        label_: "text-[#A45B4B]",
    },
    neutral: {
        label: "Reviewer note",
        icon: MessageSquareQuote,
        accent: "bg-[#716F49]",
        iconWrap: "bg-[#716F49]/10 text-[#716F49]",
        label_: "text-[#716F49]",
    },
} as const;

function formatReviewDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ReviewNote({ note, status, reviewedAt, className }: ReviewNoteProps) {
    const tone = TONES[status === "approved" || status === "rejected" ? status : "neutral"];
    const Icon = tone.icon;
    const date = formatReviewDate(reviewedAt);

    return (
        <aside
            aria-label="Review note"
            className={cn(
                "relative overflow-hidden rounded-lg border border-[#DEDCD3] bg-linear-to-br from-white to-[#F4F3EE] shadow-[0_1px_2px_rgba(40,40,25,0.04)]",
                className,
            )}
        >
            <span aria-hidden className={cn("")} />
            <div className="flex items-start gap-2.5 px-3 py-3 sm:gap-3 sm:py-3.5 sm:pl-5 sm:pr-4">
                <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg sm:size-8", tone.iconWrap)}>
                    <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className={cn("text-[11px] font-semibold uppercase tracking-wider", tone.label_)}>
                            Review note
                        </p>
                        <span className="text-[11px] text-[#A5A297]">·</span>
                        <p className="text-[11px] font-medium text-[#89877B]">
                            {tone.label}
                            {date && ` · ${date}`}
                        </p>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-5 text-[#3F3E35] sm:text-sm sm:leading-6">
                        {note}
                    </p>
                </div>
            </div>
        </aside>
    );
}
