"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { toast } from "react-toastify";
import {
    AVATAR_MAX_BYTES,
    AVATAR_TYPES,
    ProfileApiError,
    removeAvatar,
    uploadAvatar,
} from "@/lib/api/users/profile";
import { updateStoredUser } from "@/lib/auth/session";

/** Profile photo with upload / replace / remove. The server crops it to a square. */
export default function AvatarEditor({
    initials,
    avatarUrl,
    onChange,
}: {
    initials: string;
    avatarUrl?: string | null;
    onChange: (url: string | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // Release the temporary object URL once it is replaced or the component unmounts.
    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview);
        },
        [preview]
    );

    const shown = preview ?? avatarUrl ?? null;

    const handleFile = async (file: File | undefined) => {
        if (inputRef.current) inputRef.current.value = "";
        if (!file) return;

        if (!AVATAR_TYPES.includes(file.type)) {
            toast.error("Use a JPG, PNG or WebP image.");
            return;
        }
        if (file.size > AVATAR_MAX_BYTES) {
            toast.error("The image must be 5 MB or smaller.");
            return;
        }

        setPreview(URL.createObjectURL(file));
        setBusy(true);
        try {
            const url = await uploadAvatar(file);
            onChange(url);
            updateStoredUser({ avatarUrl: url });
            toast.success("Profile photo updated.");
        } catch (error) {
            toast.error(error instanceof ProfileApiError ? error.message : "Could not upload the photo.");
        } finally {
            setPreview(null);
            setBusy(false);
        }
    };

    const handleRemove = async () => {
        setBusy(true);
        try {
            await removeAvatar();
            onChange(null);
            updateStoredUser({ avatarUrl: null });
            toast.success("Profile photo removed.");
        } catch (error) {
            toast.error(error instanceof ProfileApiError ? error.message : "Could not remove the photo.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="relative">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-[#716F49]/10 text-2xl font-semibold tracking-wide text-[#716F49] ring-1 ring-[#D8D5C9]">
                    {shown ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shown} alt="Your profile photo" className="h-full w-full object-cover" />
                    ) : (
                        initials || <User className="h-9 w-9 text-[#969386]" />
                    )}
                    {busy && (
                        <div className="absolute inset-0 grid place-items-center bg-black/40">
                            <Loader2 className="h-6 w-6 animate-spin text-white" aria-label="Uploading" />
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    aria-label={shown ? "Change profile photo" : "Upload profile photo"}
                    className="absolute -bottom-2 -right-2 grid size-8 cursor-pointer place-items-center rounded-full border border-[#D8D5C9] bg-white text-[#716F49] shadow transition hover:bg-[#F3F2E8] disabled:opacity-50"
                >
                    <Camera className="size-4" />
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={AVATAR_TYPES.join(",")}
                    className="hidden"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                />
            </div>

            {avatarUrl && (
                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#A45B4B] hover:underline disabled:opacity-50"
                >
                    <Trash2 className="size-3" />
                    Remove
                </button>
            )}
        </div>
    );
}
