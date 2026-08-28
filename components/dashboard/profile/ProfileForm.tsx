"use client";

import { useState, useCallback, useMemo } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
    Loader2,
    User,
    Mail,
    KeyRound,
    GraduationCap,
    Building2,
    Eye,
    EyeOff,
    Camera,
    Trash2,
    CheckCircle,
    IdCard,
    AlertCircle,
    UserCog,
    ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    updateUserProfile,
    type UpdateProfilePayload,
    type UserProfile,
    ProfileApiError,
} from "@/lib/api/users/profile";
import { ACADEMIC_ROLES, type AcademicRole } from "@/lib/types/auth/register";
import { toast } from "react-toastify";

interface ProfileFormProps {
    initialData: UserProfile;
}

/* ---------- shared field styling ---------- */

const fieldBase =
    "h-11 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] text-sm text-[#2D2D27] shadow-none " +
    "placeholder:text-[#A5A297] transition-colors focus-visible:border-[#716F49] focus-visible:ring-1 " +
    "focus-visible:ring-[#716F49] aria-[invalid=true]:border-[#A45B4B] aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-[#A45B4B]";

const fieldWithIcon = `${fieldBase} pl-10 pr-4`;
const fieldWithIconAndAction = `${fieldBase} pl-10 pr-11`;

const iconClass =
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]";

/* ---------- small building blocks ---------- */

function SectionCard({
    icon: Icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
            <CardHeader className="border-b border-[#DEDCD3] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div>
                        <CardTitle className="text-base font-semibold text-[#25251F]">{title}</CardTitle>
                        <p className="mt-0.5 text-xs text-[#777568]">{subtitle}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5">{children}</CardContent>
        </Card>
    );
}

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
    return (
        <Label
            htmlFor={htmlFor}
            className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
        >
            {children}
            {required && <span className="ml-1 text-[#A45B4B]">*</span>}
        </Label>
    );
}

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-[#A45B4B]">
            <AlertCircle className="h-3.5 w-3.5" />
            {message}
        </p>
    );
}

function FieldHint({ id, children }: { id: string; children: ReactNode }) {
    return (
        <p id={id} className="mt-2 text-xs text-[#89877B]">
            {children}
        </p>
    );
}

/* ---------- component ---------- */

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const [formData, setFormData] = useState<UpdateProfilePayload>(() => ({
        name: initialData.name,
        email: initialData.email,
        scholarId: initialData.scholarId,
        institution: initialData.institution,
        role: initialData.role,
        avatar: initialData.avatar,
    }));
    const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfilePayload, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatar || null);
    const [isDirty, setIsDirty] = useState(false);

    const initials = useMemo(() => {
        const source = (formData.name || initialData.name || "").trim();
        if (!source) return "";
        return source
            .replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, "")
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
    }, [formData.name, initialData.name]);

    const validate = useCallback(
        (data: UpdateProfilePayload): Partial<Record<keyof UpdateProfilePayload, string>> => {
            const newErrors: Partial<Record<keyof UpdateProfilePayload, string>> = {};

            if (!data.name?.trim()) {
                newErrors.name = "Enter your full name.";
            } else if (data.name.trim().length < 2) {
                newErrors.name = "Name must be at least 2 characters.";
            }

            if (!data.email?.trim()) {
                newErrors.email = "Enter your email address.";
            } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
                newErrors.email = "That email address isn't valid.";
            }

            if (data.password) {
                if (data.password.length < 8) {
                    newErrors.password = "Use at least 8 characters.";
                }
            }

            if (!data.scholarId?.trim()) newErrors.scholarId = "Enter your Scholar ID.";
            if (!data.institution?.trim()) newErrors.institution = "Enter your institution.";
            if (!data.role) newErrors.role = "Choose your academic role.";

            return newErrors;
        },
        []
    );

    const handleTextChange = useCallback(
        (field: keyof UpdateProfilePayload) => (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
            setIsDirty(true);
        },
        []
    );

    const handleSelectChange = useCallback(
        (field: keyof UpdateProfilePayload) => (value: string | null) => {
            setFormData((prev) => ({ ...prev, [field]: value || "" }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
            setIsDirty(true);
        },
        []
    );

    const handleAvatarChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Choose an image file (PNG, JPG or WebP).");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("That image is over 2MB. Choose a smaller one.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setAvatarPreview(result);
            setFormData((prev) => ({ ...prev, avatar: result }));
            setIsDirty(true);
        };
        reader.readAsDataURL(file);

        // allow re-selecting the same file
        event.target.value = "";
    }, []);

    const removeAvatar = useCallback(() => {
        setAvatarPreview(null);
        setFormData((prev) => ({ ...prev, avatar: "" }));
        setIsDirty(true);
    }, []);

    const handleReset = useCallback(() => {
        setFormData({
            name: initialData.name,
            email: initialData.email,
            scholarId: initialData.scholarId,
            institution: initialData.institution,
            role: initialData.role,
            avatar: initialData.avatar,
        });
        setAvatarPreview(initialData.avatar || null);
        setErrors({});
        setIsDirty(false);
    }, [initialData]);

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const validationErrors = validate(formData);
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0) {
                const firstField = Object.keys(validationErrors)[0];
                document.getElementById(firstField)?.focus();
                return;
            }

            setIsSubmitting(true);
            try {
                const payload: UpdateProfilePayload = {
                    name: formData.name,
                    email: formData.email,
                    scholarId: formData.scholarId,
                    institution: formData.institution,
                    role: formData.role as AcademicRole,
                };

                if (formData.password) payload.password = formData.password;
                if (formData.avatar !== undefined) payload.avatar = formData.avatar;

                const response = await updateUserProfile(payload);

                if (response.user) {
                    localStorage.setItem("user", JSON.stringify({ userId: response.user.id }));
                    window.dispatchEvent(new Event("auth-changed"));
                }

                toast.success(response.message || "Profile saved");
                setFormData((prev) => ({ ...prev, password: "" }));
                setIsDirty(false);
            } catch (error) {
                toast.error(
                    error instanceof ProfileApiError
                        ? error.message
                        : "Couldn't save your profile. Try again."
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validate]
    );

    return (
        <div className="w-full space-y-7 py-7">
            <form id="profile-form" onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* =================================================
                    IDENTITY CARD
                ================================================== */}
                <Card className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
                    <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6">
                        <div className="relative h-24 w-24 shrink-0">
                            {avatarPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={avatarPreview}
                                    alt=""
                                    className="h-24 w-24 rounded-2xl object-cover ring-1 ring-[#D8D5C9]"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#716F49]/10 text-2xl font-semibold tracking-wide text-[#716F49] ring-1 ring-[#D8D5C9]">
                                    {initials || <User className="h-9 w-9 text-[#969386]" />}
                                </div>
                            )}

                            <label
                                htmlFor="avatar-upload"
                                title="Change photo"
                                className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#716F49] shadow-md ring-2 ring-[#F4F3EE] transition-colors hover:bg-[#625F3F] focus-within:ring-2 focus-within:ring-[#716F49]"
                            >
                                <Camera className="h-4 w-4 text-white" />
                                <span className="sr-only">Change profile photo</span>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="sr-only"
                                />
                            </label>
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-[#25251F]">
                                {formData.name?.trim() || "Your profile"}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-[#777568]">
                                {[formData.role, formData.institution].filter(Boolean).join(" · ") ||
                                    "Add your role and institution below"}
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer text-xs font-medium text-[#716F49] underline-offset-4 hover:underline"
                                >
                                    Upload photo
                                </label>
                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={removeAvatar}
                                        className="flex items-center gap-1 text-xs font-medium text-[#89877B] transition-colors hover:text-[#A45B4B]"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                )}
                                <span className="text-xs text-[#99978C]">PNG or JPG, up to 2MB</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =================================================
                    ACCOUNT DETAILS
                ================================================== */}
                <SectionCard icon={User} title="Account details" subtitle="Your name and contact email.">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <FieldLabel htmlFor="name" required>
                                Full name
                            </FieldLabel>
                            <div className="relative mt-2">
                                <User className={iconClass} />
                                <Input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Dr. Sarah Chen"
                                    value={formData.name ?? ""}
                                    onChange={handleTextChange("name")}
                                    className={fieldWithIcon}
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? "name-error" : undefined}
                                />
                            </div>
                            <FieldError id="name-error" message={errors.name} />
                        </div>

                        <div>
                            <FieldLabel htmlFor="email" required>
                                Email
                            </FieldLabel>
                            <div className="relative mt-2">
                                <Mail className={iconClass} />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="sarah.chen@university.edu"
                                    value={formData.email ?? ""}
                                    onChange={handleTextChange("email")}
                                    className={fieldWithIcon}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                />
                            </div>
                            <FieldError id="email-error" message={errors.email} />
                        </div>
                    </div>
                </SectionCard>

                {/* =================================================
                    ACADEMIC AFFILIATION
                ================================================== */}
                <SectionCard
                    icon={GraduationCap}
                    title="Academic affiliation"
                    subtitle="Where you're based and how you're identified."
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <FieldLabel htmlFor="scholarId" required>
                                Scholar ID
                            </FieldLabel>
                            <div className="relative mt-2">
                                <IdCard className={iconClass} />
                                <Input
                                    id="scholarId"
                                    type="text"
                                    placeholder="SCH-2024-001"
                                    value={formData.scholarId ?? ""}
                                    onChange={handleTextChange("scholarId")}
                                    className={`${fieldWithIcon} font-mono tracking-tight`}
                                    aria-invalid={Boolean(errors.scholarId)}
                                    aria-describedby={errors.scholarId ? "scholarId-error" : undefined}
                                />
                            </div>
                            <FieldError id="scholarId-error" message={errors.scholarId} />
                        </div>

                        <div>
                            <FieldLabel htmlFor="institution" required>
                                Institution
                            </FieldLabel>
                            <div className="relative mt-2">
                                <Building2 className={iconClass} />
                                <Input
                                    id="institution"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="Stanford University"
                                    value={formData.institution ?? ""}
                                    onChange={handleTextChange("institution")}
                                    className={fieldWithIcon}
                                    aria-invalid={Boolean(errors.institution)}
                                    aria-describedby={errors.institution ? "institution-error" : undefined}
                                />
                            </div>
                            <FieldError id="institution-error" message={errors.institution} />
                        </div>
                    </div>

                    <div className="md:w-1/2 md:pr-2.5">
                        <FieldLabel htmlFor="role" required>
                            Academic role
                        </FieldLabel>
                        <div className="relative mt-2">
                            <GraduationCap className={`${iconClass} z-10`} />
                            <Select value={formData.role || ""} onValueChange={handleSelectChange("role")}>
                                <SelectTrigger
                                    id="role"
                                    className={`${fieldWithIcon} justify-between [&>span]:truncate`}
                                    aria-invalid={Boolean(errors.role)}
                                    aria-describedby={errors.role ? "role-error" : undefined}
                                >
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent className="max-h-72 border-[#D8D5C9] bg-[#F4F3EE]">
                                    <SelectGroup>
                                        {ACADEMIC_ROLES.map((role) => (
                                            <SelectItem
                                                key={role}
                                                value={role}
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <FieldError id="role-error" message={errors.role} />
                    </div>
                </SectionCard>

                {/* =================================================
                    SECURITY
                ================================================== */}
                <SectionCard icon={ShieldCheck} title="Security" subtitle="Update your password.">
                    <div className="md:w-1/2 md:pr-2.5">
                        <FieldLabel htmlFor="password">New password</FieldLabel>
                        <div className="relative mt-2">
                            <KeyRound className={iconClass} />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                                value={formData.password || ""}
                                onChange={handleTextChange("password")}
                                className={fieldWithIconAndAction}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby="password-hint"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#969386] transition-colors hover:bg-[#716F49]/10 hover:text-[#716F49] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#716F49]"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password ? (
                            <FieldError id="password-error" message={errors.password} />
                        ) : (
                            <FieldHint id="password-hint">Leave blank to keep your current password.</FieldHint>
                        )}
                    </div>
                </SectionCard>

                {/* =====================================================
                    ACTION BAR
                ====================================================== */}
                <div className="flex flex-col-reverse gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-white/60" aria-live="polite">
                        {isDirty ? "You have unsaved changes." : "All changes saved."}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleReset}
                            disabled={!isDirty || isSubmitting}
                            className="rounded-lg border border-white/15 bg-white/5 px-5 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 hover:text-white disabled:opacity-40"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                            className="rounded-lg bg-[#716F49] px-5 text-sm font-medium text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] transition-all hover:bg-[#625F3F] hover:shadow-[0_7px_18px_rgba(40,40,25,0.25)] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Save changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}