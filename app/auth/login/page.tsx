"use client";

import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Loader2, Eye, EyeOff, Asterisk } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoginApiError, submitLoginApplication } from "@/lib/api/auth/login";
import { safeRedirectPath, saveSession } from "@/lib/auth/session";
import type { LoginFormData, LoginFormErrors, LoginTextField } from "@/lib/types/auth/login";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { authInputClass } from "@/components/shared/AuthShell";
import { toast } from "react-toastify";

const initialFormData: LoginFormData = {
    email: "",
    password: "",
};

function validate(data: LoginFormData): LoginFormErrors {
    const errors: LoginFormErrors = {};
    if (!data.email.trim()) {
        errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.email = "Enter a valid email address.";
    }
    if (!data.password) {
        errors.password = "Password is required.";
    }
    return errors;
}

export default function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>(initialFormData);
    const [errors, setErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleTextChange = useCallback(
        (field: LoginTextField) => (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        []
    );

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const validationErrors = validate(formData);
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0) return;

            setIsSubmitting(true);
            try {
                const data = await submitLoginApplication({
                    email: formData.email,
                    password: formData.password,
                });
                if (!data.token) {
                    toast.error("Sign-in failed: the server did not return a session token.");
                    return;
                }
                saveSession(data.token, data.user ?? { userId: data.userId });
                toast.success("Signed in. Redirecting to your dashboard…");
                const next = new URLSearchParams(window.location.search).get("next");
                router.replace(safeRedirectPath(next));
                router.refresh();
            } catch (error) {
                const message =
                    error instanceof LoginApiError
                        ? error.message
                        : "Something went wrong. Please try again.";
                toast.error(message);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, router]
    );

    return (
        <AuthShell>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Welcome <span className="text-[#716f49]">back</span>
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Sign in to publish, discover, and collaborate on research with the community.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div>
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-900">
                        Your email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="khalil@iiuc.ac.bd"
                        value={formData.email}
                        onChange={handleTextChange("email")}
                        className={`mt-1.5 ${authInputClass}`}
                        aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-900">
                        Your password
                    </Label>
                    <div className="relative mt-1.5">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Your password"
                            value={formData.password}
                            onChange={handleTextChange("password")}
                            className={`${authInputClass} pr-10`}
                            aria-invalid={Boolean(errors.password)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:cursor-pointer hover:text-[#716f49]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    <div className="mt-2 text-right">
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs font-semibold text-[#716f49] hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full cursor-pointer rounded-lg bg-[#716f49] text-sm font-medium text-white shadow-[0_14px_24px_-8px_#716f49] transition-colors duration-200 hover:bg-[#1F321C] disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>

                <p className="pt-2 text-center text-xs text-neutral-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="font-semibold text-[#716f49] hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
