"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { authButtonClass, authInputClass, authLabelClass } from "@/components/shared/AuthShell";
import { requestPasswordReset } from "@/lib/api/auth/password-reset";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!email.trim()) {
            setError("Email is required.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        setError("");
        setIsSubmitting(true);
        try {
            await requestPasswordReset(email.trim());
            setSent(true);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Unable to send the reset email.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthShell>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Forgot <span className="text-[#716f49]">password?</span>
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Enter your account email and we&apos;ll send you a link to reset your password.
            </p>

            {sent ? (
                <div className="mt-8 space-y-5">
                    <p className="rounded-lg bg-[#EAF0EA] p-4 text-xs leading-relaxed text-[#356044]">
                        Check your email for the password reset link. If an account exists for that email, it will arrive shortly.
                    </p>
                    <p className="pt-2 text-center text-xs text-neutral-400">
                        <Link href="/auth/login" className="font-semibold text-[#716f49] hover:underline">
                            Return to sign in
                        </Link>
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                    <div>
                        <Label htmlFor="reset-email" className={authLabelClass}>
                            Your email
                        </Label>
                        <Input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            placeholder="khalil@iiuc.ac.bd"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError("");
                            }}
                            className={`mt-1.5 ${authInputClass}`}
                            aria-invalid={Boolean(error)}
                        />
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className={authButtonClass}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send reset link"
                        )}
                    </Button>

                    <p className="pt-2 text-center text-xs text-neutral-400">
                        Remembered your password?{" "}
                        <Link href="/auth/login" className="font-semibold text-[#716f49] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            )}
        </AuthShell>
    );
}
