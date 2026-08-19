"use client";

import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Loader2, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoginApiError, submitLoginApplication } from "@/lib/api/auth/login";
import type { LoginFormData, LoginFormErrors, LoginTextField } from "@/lib/types/auth/login";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
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
                localStorage.setItem("token", data.token ?? "");
                localStorage.setItem("user", JSON.stringify({ userId: data.userId }));
                window.dispatchEvent(new Event("auth-changed"));
                toast.success("Signed in. Redirecting to your dashboard…");
                router.push("/dashboard");
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
        <section className="relative isolate overflow-hidden bg-[#F8FAFC] px-4 py-32 sm:px-6 font-montserrat">
            <div className="relative mx-auto max-w-3xl text-center">
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Welcome <span className="text-[#716f49]">back</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                    Sign in to publish, discover, and collaborate on research with the community.
                </p>
            </div>

            <div className="relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/3 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="grid md:grid-cols-2">
                    <div className="relative hidden min-h-140 overflow-hidden md:block">
                        <div className="absolute inset-0 bg-linear-to-br from-[#716f49] to-[#1F321C]" />
                        <motion.div
                            className="absolute inset-0 bg-linear-to-br from-[#1F321C] to-[#716f49]"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                        <div className="absolute bottom-8 left-8 right-8 text-white/80">
                            <p className="text-sm font-medium">Built for the research community.</p>
                            <p className="mt-1 text-xs text-white/50">Verified scholar profiles, one platform.</p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 flex flex-col justify-center">
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">
                            <div>
                                <Label htmlFor="email" className="text-slate-900">
                                    Email <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jane@university.edu"
                                        value={formData.email}
                                        onChange={handleTextChange("email")}
                                        className="w-full h-10 pl-11 pr-4 py-3 bg-[#dddbd8] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] text-[#707070] font-medium shadow-[0px_3px_4px_2px_#564F5C33]"
                                        aria-invalid={Boolean(errors.email)}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-slate-900">
                                    Password <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative mt-1.5">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Your password"
                                        value={formData.password}
                                        onChange={handleTextChange("password")}
                                        className="w-full h-10 pl-11 pr-4 py-3 bg-[#dddbd8] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] text-[#707070] font-medium shadow-[0px_3px_4px_2px_#564F5C33]"
                                        aria-invalid={Boolean(errors.password)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#716f49] hover:cursor-pointer"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-10 px-4 py-3 bg-[#716f49] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49]/30 text-white font-medium shadow-[0px_3px_4px_2px_#564F5C33] cursor-pointer hover:bg-[] transition-colors duration-200"
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

                            <div className="flex items-center justify-center gap-2">
                                <p>Don&apos;t have an account?</p>
                                <Link href="/auth/register" className="text-[#716f49] font-semibold hover:underline">
                                    Register
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}