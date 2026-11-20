"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Link2, Loader2, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
    ShareApiError,
    contributorPath,
    createShareToken,
    getShareToken,
    revokeShareToken,
} from "@/lib/api/contributors";

/** "Share" button: generates a public link to the user's contributions page. */
export default function ShareProfile() {
    const [token, setToken] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let active = true;
        getShareToken()
            .then((existing) => active && setToken(existing))
            .catch(() => {
                // Not fatal: the button still works and will create/return the link on click.
            });
        return () => {
            active = false;
        };
    }, []);

    const url = token ? `${window.location.origin}${contributorPath(token)}` : "";

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
            toast.success("Link copied to clipboard.");
        } catch {
            toast.info("Copy the link from the box below.");
        }
    };

    const handleShare = async () => {
        setBusy(true);
        try {
            const created = await createShareToken();
            setToken(created);
            if (created) await copy(`${window.location.origin}${contributorPath(created)}`);
        } catch (error) {
            toast.error(error instanceof ShareApiError ? error.message : "Could not create the link.");
        } finally {
            setBusy(false);
        }
    };

    const handleStop = async () => {
        setBusy(true);
        try {
            await revokeShareToken();
            setToken(null);
            toast.success("Sharing turned off. The old link no longer works.");
        } catch (error) {
            toast.error(error instanceof ShareApiError ? error.message : "Could not turn sharing off.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-4 w-full max-w-xl">
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleShare}
                disabled={busy}
                className="rounded-lg border-[#716F49] text-[#716F49] hover:bg-[#716F49]/10"
            >
                {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />}
                {token ? "Copy link" : "Share"}
            </Button>

            {token && (
                <div className="mt-3 rounded-lg border border-[#D8D5C9] bg-white/70 p-3">
                    <p className="text-xs text-[#777568]">
                        Anyone with this link can see your name, role, institution, Scholar ID, email, and your
                        approved papers and presentations.
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]" />
                            <input
                                readOnly
                                value={url}
                                aria-label="Public share link"
                                onFocus={(event) => event.currentTarget.select()}
                                className="h-9 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] pl-9 pr-3 text-xs text-[#2D2D27] outline-none focus-visible:border-[#716F49]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => copy(url)}
                                className="flex-1 rounded-lg bg-[#716F49] text-white hover:bg-[#625F3F] sm:flex-none"
                            >
                                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                render={<a href={url} target="_blank" rel="noopener noreferrer" />}
                                nativeButton={false}
                                className="flex-1 rounded-lg sm:flex-none"
                            >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                Open
                            </Button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleStop}
                        disabled={busy}
                        className="mt-2 cursor-pointer text-xs font-medium text-[#A45B4B] hover:underline disabled:opacity-50"
                    >
                        Stop sharing
                    </button>
                </div>
            )}
        </div>
    );
}
