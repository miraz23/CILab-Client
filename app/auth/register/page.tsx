"use client";

import { useState, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RegisterApiError, submitRegisterApplication } from "@/lib/api/auth/register";
import { ACADEMIC_ROLES, type RegisterFormData, type RegisterFormErrors, type RegisterTextField } from "@/lib/types/auth/register";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { authButtonClass, authInputClass, authLabelClass } from "@/components/shared/AuthShell";
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
    if (!data.role.trim()) errors.role = "Current role is required.";

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

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const validationErrors = validate(formData);
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0) return;

            setIsSubmitting(true);
            try {
                await submitRegisterApplication({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    scholarId: formData.scholarId,
                    institution: formData.institution,
                    role: formData.role.trim(),
                });
                toast.success("Verification email sent. Check your inbox to complete registration.");
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
        <AuthShell>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Create your <span className="text-[#716f49]">account</span>
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Publish, discover, and collaborate on research. Whether you&apos;re a student, faculty, or
                industry researcher, your account connects you to the community.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div>
                    <Label htmlFor="name" className={authLabelClass}>
                        Name
                    </Label>
                    <Input
                        id="name"
                        placeholder="Dr. Md. Khaliluzzaman"
                        value={formData.name}
                        onChange={handleTextChange("name")}
                        className={`mt-1.5 ${authInputClass}`}
                        aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <Label htmlFor="email" className={authLabelClass}>
                        Your email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="khalilcse021@gmail.com"
                        value={formData.email}
                        onChange={handleTextChange("email")}
                        className={`mt-1.5 ${authInputClass}`}
                        aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <Label htmlFor="password" className={authLabelClass}>
                        Create password
                    </Label>
                    <div className="relative mt-1.5">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
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
                </div>

                <div>
                    <Label htmlFor="scholarId" className={authLabelClass}>
                        Scholar ID
                    </Label>
                    <Input
                        id="scholarId"
                        placeholder="e.g. _SXy3FkAAAAJ&hl"
                        value={formData.scholarId}
                        onChange={handleTextChange("scholarId")}
                        className={`mt-1.5 ${authInputClass}`}
                        aria-invalid={Boolean(errors.scholarId)}
                    />
                    {errors.scholarId && <p className="mt-1 text-xs text-red-500">{errors.scholarId}</p>}
                </div>

                <div>
                    <Label htmlFor="institution" className={authLabelClass}>
                        Institution / organization
                    </Label>
                    <Input
                        id="institution"
                        placeholder="International Islamic University Chittagong"
                        value={formData.institution}
                        onChange={handleTextChange("institution")}
                        className={`mt-1.5 ${authInputClass}`}
                        aria-invalid={Boolean(errors.institution)}
                    />
                    {errors.institution && <p className="mt-1 text-xs text-red-500">{errors.institution}</p>}
                </div>

                <div>
                    <Label htmlFor="role" className={authLabelClass}>
                        Current role
                    </Label>
                    <Input
                        id="role"
                        list="role-suggestions"
                        autoComplete="organization-title"
                        placeholder="e.g. Undergraduate Student"
                        value={formData.role}
                        onChange={handleTextChange("role")}
                        className={`mt-1.5 ${authInputClass}`}
                        aria-invalid={Boolean(errors.role)}
                    />
                    {/* <datalist id="role-suggestions">
                        {ACADEMIC_ROLES.map((role) => (
                            <option key={role} value={role} />
                        ))}
                    </datalist> */}
                    {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
                </div>

                <Button type="submit" disabled={isSubmitting} className={authButtonClass}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending verification email...
                        </>
                    ) : (
                        "Register"
                    )}
                </Button>

                <p className="pt-2 text-center text-xs text-neutral-400">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-semibold text-[#716f49] hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
