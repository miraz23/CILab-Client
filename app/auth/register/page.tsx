"use client";

import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Loader2, User, Mail, KeyRound, Hash, Building2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RegisterApiError, submitRegisterApplication } from "@/lib/api/auth/register";
import { ACADEMIC_ROLES, type RegisterFormData, type RegisterFormErrors, type RegisterTextField, type AcademicRole } from "@/lib/types/auth/register";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "react-toastify";

const initialFormData: RegisterFormData = {
    name: "",
    email: "",
    password: "",
    scholarId: "",
    institution: "",
    role: "",
};

function validate(data: RegisterFormData): RegisterFormErrors {
    const errors: RegisterFormErrors = {};

    if (!data.name.trim()) errors.name = "Name is required.";

    if (!data.email.trim()) {
        errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!data.password) {
        errors.password = "Password is required.";
    } else if (data.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if (!data.scholarId.trim()) errors.scholarId = "Scholar ID is required.";
    if (!data.institution.trim()) errors.institution = "Institution / organization is required.";
    if (!data.role) errors.role = "Please select your current role.";

    return errors;
}

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleTextChange = useCallback(
        (field: RegisterTextField) => (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        []
    );

    const handleRoleChange = useCallback((value: string | null) => {
        if (!value) return;
        setFormData((prev) => ({ ...prev, role: value as AcademicRole }));
        setErrors((prev) => ({ ...prev, role: undefined }));
    }, []);

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const validationErrors = validate(formData);
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0 || !formData.role) return;

            setIsSubmitting(true);
            try {
                await submitRegisterApplication({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    scholarId: formData.scholarId,
                    institution: formData.institution,
                    role: formData.role,
                });
                toast.success("Account created. You can now sign in.");
                router.push("/auth/login");
            } catch (error) {
                const message =
                    error instanceof RegisterApiError ? error.message : "Something went wrong. Please try again.";
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
                    Create your <span className="text-[#716f49]">researcher account</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                    Publish, discover, and collaborate on research. Whether you&apos;re a student, faculty, or
                    industry researcher, your account connects you to the community.
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
                                <Label htmlFor="name" className="text-slate-900">
                                    Name <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative mt-1.5">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                    <Input
                                        id="name"
                                        placeholder="Jane Smith"
                                        value={formData.name}
                                        onChange={handleTextChange("name")}
                                        className="w-full h-10 pl-11 pr-4 py-3 bg-[#dddbd8] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] text-[#707070] font-medium shadow-[0px_3px_4px_2px_#564F5C33]"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                            </div>

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
                                    Create Password <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative mt-1.5">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 8 characters"
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

                            <div className="grid gap-5 grid-cols-1">
                                <div>
                                    <Label htmlFor="scholarId" className="text-slate-900">
                                        Scholar ID <span className="text-red-400">*</span>
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                        <Input
                                            id="scholarId"
                                            placeholder="e.g. 0000-0002-1825-0097"
                                            value={formData.scholarId}
                                            onChange={handleTextChange("scholarId")}
                                            className="w-full h-10 pl-11 pr-4 py-3 bg-[#dddbd8] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] text-[#707070] font-medium shadow-[0px_3px_4px_2px_#564F5C33]"
                                            aria-invalid={Boolean(errors.scholarId)}
                                        />
                                    </div>
                                    {errors.scholarId && <p className="mt-1 text-xs text-red-400">{errors.scholarId}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="institution" className="text-slate-900">
                                        Institution / Organization <span className="text-red-400">*</span>
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
                                        <Input
                                            id="institution"
                                            placeholder="IIUC"
                                            value={formData.institution}
                                            onChange={handleTextChange("institution")}
                                            className="w-full h-10 pl-11 pr-4 py-3 bg-[#dddbd8] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] text-[#707070] font-medium shadow-[0px_3px_4px_2px_#564F5C33]"
                                            aria-invalid={Boolean(errors.institution)}
                                        />
                                    </div>
                                    {errors.institution && (
                                        <p className="mt-1 text-xs text-red-400">{errors.institution}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="role" className="text-slate-900">
                                    Current Role <span className="text-red-400">*</span>
                                </Label>
                                <Select value={formData.role} onValueChange={handleRoleChange}>
                                    <SelectTrigger
                                        id="role"
                                        className="mt-1.5 w-full p-4 bg-[#dddbd8] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] text-[#707070] shadow-[0px_3px_4px_2px_#564F5C33]"
                                        aria-invalid={Boolean(errors.role)}
                                    >
                                        <SelectValue placeholder="Select your current role" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        {ACADEMIC_ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-10 px-4 py-3 bg-[#716f49] border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49]/30 text-white font-medium shadow-[0px_3px_4px_2px_#564F5C33] cursor-pointer hover:bg-[] transition-colors duration-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2">
                                <p>Already have an account?</p>
                                <Link href="/auth/login" className="text-[#716f49] font-semibold hover:underline">
                                    Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}