"use client";

import { useCallback, useMemo, useState } from "react";
import {
    CheckCircle,
    Clock,
    Filter,
    Loader2,
    Search,
    ShieldCheck,
    UserCheck,
    UserCog,
    UserMinus,
    UserX,
    Users,
    XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminEmptyState from "@/components/dashboard/admin/AdminEmptyState";
import AdminSectionHeader from "@/components/dashboard/admin/AdminSectionHeader";
import AdminStatCards from "@/components/dashboard/admin/AdminStatCards";
import type { AdminStat } from "@/components/dashboard/admin/AdminStatCards";
import { AdminSkeleton } from "@/components/dashboard/admin/AdminSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { fetchManagedUsers, updateUserAccess } from "@/lib/api/admin/users";
import { useDashboardLoading } from "@/lib/hooks/use-dashboard-loading";
import { ACADEMIC_ROLES } from "@/lib/types/auth/register";
import { APP_ROLES } from "@/lib/types/admin/role";
import type { AppRole } from "@/lib/types/admin/role";
import type {
    ManagedUser,
    ManagedUserSort,
    UserStatus,
} from "@/lib/types/admin/user";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
    UserStatus,
    { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
    active: {
        label: "Active",
        icon: CheckCircle,
        badgeClass: "bg-[#EAF0EA] text-[#4F8A63] border border-[#D8E2D9]",
    },
    pending: {
        label: "Pending",
        icon: Clock,
        badgeClass: "bg-[#FBF3E4] text-[#8A6420] border border-[#EBD9AE]",
    },
    suspended: {
        label: "Suspended",
        icon: XCircle,
        badgeClass: "bg-[#FBF0EE] text-[#A45B4B] border border-[#E4C2BC]",
    },
};

const APP_ROLE_CONFIG: Record<AppRole, { label: string; badgeClass: string }> = {
    ADMIN: {
        label: "Admin",
        badgeClass: "bg-[#F0EAF3] text-[#6B4E86] border border-[#DED1E6]",
    },
    USER: {
        label: "User",
        badgeClass: "bg-[#ECEBE4] text-[#5E5D50] border border-[#DEDCD3]",
    },
};

const SORT_LABELS: Record<ManagedUserSort, string> = {
    newest: "Newest first",
    name: "Name A–Z",
    active: "Recently active",
};

const SEARCH_FIELD =
    "h-11 w-full rounded-lg border border-[#D7D4C9] bg-[#FBFAF7] pl-10 pr-4 text-sm text-[#2D2D27] shadow-none " +
    "placeholder:text-[#A5A297] transition-colors focus-visible:border-[#716F49] focus-visible:ring-1 " +
    "focus-visible:ring-[#716F49]";

const SEARCH_ICON_CLASS =
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969386]";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function UserManagement() {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<UserStatus | "all">("all");
    const [appRole, setAppRole] = useState<AppRole | "all">("all");
    const [academicRole, setAcademicRole] = useState<string>("all");
    const [sort, setSort] = useState<ManagedUserSort>("newest");
    const [busyUserId, setBusyUserId] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        const fetchedUsers = await fetchManagedUsers();

        setUsers(fetchedUsers);
    }, []);

    const { isLoading, refresh } = useDashboardLoading(loadUsers);

    const counts = useMemo(
        () => ({
            total: users.length,
            active: users.filter((user) => user.status === "active").length,
            pending: users.filter((user) => user.status === "pending").length,
            suspended: users.filter((user) => user.status === "suspended").length,
            admins: users.filter((user) => user.appRole === "ADMIN").length,
        }),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        const matched = users.filter((user) => {
            if (status !== "all" && user.status !== status) return false;
            if (appRole !== "all" && user.appRole !== appRole) return false;
            if (academicRole !== "all" && user.academicRole !== academicRole) return false;

            if (!query) return true;

            return [user.name, user.email, user.institution, user.scholarId].some(
                (value) => value.toLowerCase().includes(query)
            );
        });

        switch (sort) {
            case "name":
                return [...matched].sort((a, b) => a.name.localeCompare(b.name));
            case "active":
                return [...matched].sort(
                    (a, b) =>
                        Date.parse(b.lastActiveAt ?? "0") -
                        Date.parse(a.lastActiveAt ?? "0")
                );
            default:
                return [...matched].sort(
                    (a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt)
                );
        }
    }, [users, search, status, appRole, academicRole, sort]);

    const stats: AdminStat[] = [
        {
            id: "total",
            label: "Registered Users",
            value: counts.total,
            hint: "Across all institutions",
            accent: "#5579A6",
            icon: Users,
        },
        {
            id: "active",
            label: "Active",
            value: counts.active,
            hint: "Able to use the platform",
            accent: "#4F8A63",
            icon: UserCheck,
        },
        {
            id: "pending",
            label: "Awaiting Approval",
            value: counts.pending,
            hint: "Requires an admin decision",
            accent: "#C58A3A",
            icon: Clock,
        },
        {
            id: "admins",
            label: "Administrators",
            value: counts.admins,
            hint: "Full platform access",
            accent: "#8A6A9C",
            icon: ShieldCheck,
        },
    ];

    const patchUser = async (
        user: ManagedUser,
        changes: { appRole?: AppRole; status?: UserStatus },
        confirmMessage: string
    ) => {
        if (!window.confirm(confirmMessage)) return;

        setBusyUserId(user.id);

        try {
            await updateUserAccess({ userId: user.id, ...changes });

            setUsers((current) =>
                current.map((item) =>
                    item.id === user.id ? { ...item, ...changes } : item
                )
            );

            toast.success(
                changes.appRole
                    ? `${user.name} is now an ${changes.appRole === "ADMIN" ? "administrator" : "user"}.`
                    : changes.status === "active"
                        ? `${user.name} has been reinstated.`
                        : `${user.name} has been suspended.`
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to update this account."
            );
        } finally {
            setBusyUserId(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-8">
            <AdminSectionHeader
                title="User Management"
                description="Approve registrations, control platform access, and promote trusted members to administrators."
                isLoading={isLoading}
                onRefresh={refresh}
            />

            {isLoading ? (
                <AdminSkeleton variant="users" />
            ) : (
                <>
                    <AdminStatCards stats={stats} />

                    <Card className="rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE]">
                        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <Label
                                    htmlFor="admin-user-search"
                                    className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                >
                                    Search
                                </Label>

                                <div className="relative mt-2">
                                    <Search className={SEARCH_ICON_CLASS} aria-hidden />

                                    <Input
                                        id="admin-user-search"
                                        type="search"
                                        placeholder="Name, email, scholar ID…"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className={SEARCH_FIELD}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="admin-user-status"
                                    className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                >
                                    Status
                                </Label>

                                <Select
                                    value={status}
                                    onValueChange={(value) =>
                                        setStatus(value as UserStatus | "all")
                                    }
                                >
                                    <SelectTrigger
                                        id="admin-user-status"
                                        className="mt-2 h-11 w-full justify-between border-[#D7D4C9] bg-[#FBFAF7] text-[#2D2D27]"
                                    >
                                        <SelectValue placeholder="Any status" />
                                    </SelectTrigger>

                                    <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                        <SelectGroup>
                                            <SelectItem
                                                value="all"
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                Any status
                                            </SelectItem>

                                            <SelectItem
                                                value="active"
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                Active
                                            </SelectItem>

                                            <SelectItem
                                                value="pending"
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                Pending approval
                                            </SelectItem>

                                            <SelectItem
                                                value="suspended"
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                Suspended
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label
                                    htmlFor="admin-user-access"
                                    className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                >
                                    Access level
                                </Label>

                                <Select
                                    value={appRole}
                                    onValueChange={(value) =>
                                        setAppRole(value as AppRole | "all")
                                    }
                                >
                                    <SelectTrigger
                                        id="admin-user-access"
                                        className="mt-2 h-11 w-full justify-between border-[#D7D4C9] bg-[#FBFAF7] text-[#2D2D27]"
                                    >
                                        <SelectValue placeholder="Any access level" />
                                    </SelectTrigger>

                                    <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                        <SelectGroup>
                                            <SelectItem
                                                value="all"
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                Any access level
                                            </SelectItem>

                                            {APP_ROLES.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                    className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                                >
                                                    {APP_ROLE_CONFIG[role].label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label
                                    htmlFor="admin-user-academic-role"
                                    className="text-xs font-semibold uppercase tracking-wide text-[#5E5D50]"
                                >
                                    Academic role
                                </Label>

                                <Select
                                    value={academicRole}
                                    onValueChange={(value) => setAcademicRole(value ?? "all")}
                                >
                                    <SelectTrigger
                                        id="admin-user-academic-role"
                                        className="mt-2 h-11 w-full justify-between border-[#D7D4C9] bg-[#FBFAF7] text-[#2D2D27]"
                                    >
                                        <SelectValue placeholder="Any academic role" />
                                    </SelectTrigger>

                                    <SelectContent className="max-h-72 border-[#D8D5C9] bg-[#F4F3EE]">
                                        <SelectGroup>
                                            <SelectItem
                                                value="all"
                                                className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                            >
                                                Any academic role
                                            </SelectItem>

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
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">


                        <div className="flex items-center gap-2 sm:w-auto">
                            <Filter className="h-4 w-4 shrink-0 text-[#85897F]" aria-hidden />

                            <Select value={sort} onValueChange={(value) => setSort(value as ManagedUserSort)}>
                                <SelectTrigger
                                    className="h-9 w-full justify-between border-[#D7D4C9] bg-[#FBFAF7] text-[#2D2D27] sm:w-auto"
                                    aria-label="Sort users"
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent className="border-[#D8D5C9] bg-[#F4F3EE]">
                                    <SelectGroup>
                                        {(Object.keys(SORT_LABELS) as ManagedUserSort[]).map(
                                            (option) => (
                                                <SelectItem
                                                    key={option}
                                                    value={option}
                                                    className="text-[#2D2D27] focus:bg-[#716F49] focus:text-white"
                                                >
                                                    {SORT_LABELS[option]}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <AdminEmptyState
                            icon={Users}
                            title="No users found"
                            description="No accounts match the current search and filters. Try widening the criteria."
                        />
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((user) => {
                                const statusConfig = STATUS_CONFIG[user.status];
                                const StatusIcon = statusConfig.icon;
                                const accessConfig = APP_ROLE_CONFIG[user.appRole];
                                const isBusy = busyUserId === user.id;

                                return (
                                    <Card
                                        key={user.id}
                                        className="overflow-hidden rounded-2xl border border-[#D8D5C9] bg-[#F4F3EE] transition-shadow hover:shadow-[0_12px_35px_rgba(30,31,20,0.08)]"
                                    >
                                        <CardContent className="p-5 sm:p-6">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#716F49]/10 text-sm font-semibold text-[#716F49]">
                                                    {getInitials(user.name)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-base font-semibold text-[#25251F]">
                                                        {user.name}
                                                    </h4>

                                                    <p className="mt-1 wrap-break-word text-sm text-[#777568]">
                                                        {user.email} · {user.scholarId}
                                                    </p>

                                                    <p className="mt-1 wrap-break-word text-sm text-[#777568]">
                                                        {user.academicRole} · {user.institution}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                accessConfig.badgeClass
                                                            )}
                                                        >
                                                            {accessConfig.label}
                                                        </Badge>

                                                        <Badge
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                statusConfig.badgeClass
                                                            )}
                                                        >
                                                            <StatusIcon
                                                                className="mr-1 h-3 w-3"
                                                                aria-hidden
                                                            />

                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#89877B]">
                                                        <span>Joined {formatDate(user.joinedAt)}</span>

                                                        <span>{user.papersCount} papers</span>

                                                        <span>
                                                            {user.presentationsCount} presentations
                                                        </span>

                                                        {user.lastActiveAt && (
                                                            <span>
                                                                Last active{" "}
                                                                {formatDate(user.lastActiveAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                                                    {isBusy && (
                                                        <span className="flex items-center gap-2 text-xs text-[#969386]">
                                                            <Loader2
                                                                className="h-3.5 w-3.5 animate-spin"
                                                                aria-hidden
                                                            />

                                                            Saving…
                                                        </span>
                                                    )}

                                                    <div className="flex lg:flex-col gap-2 lg:justify-end">
                                                        {user.status === "pending" && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() =>
                                                                    patchUser(
                                                                        user,
                                                                        { status: "active" },
                                                                        `Approve ${user.name}?`
                                                                    )
                                                                }
                                                                className="rounded-lg bg-[#716F49] text-white shadow-[0_5px_15px_rgba(40,40,25,0.2)] hover:bg-[#625F3F]"
                                                            >
                                                                <UserCheck
                                                                    className="mr-1 h-3.5 w-3.5"
                                                                    aria-hidden
                                                                />

                                                                Approve
                                                            </Button>
                                                        )}

                                                        {user.status === "suspended" ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() =>
                                                                    patchUser(
                                                                        user,
                                                                        { status: "active" },
                                                                        `Reinstate ${user.name}?`
                                                                    )
                                                                }
                                                                className="rounded-lg border-[#D7D4C9] bg-[#FBFAF7] text-[#4F8A63] hover:bg-[#EEF4EE]"
                                                            >
                                                                <UserCheck
                                                                    className="mr-1 h-3.5 w-3.5"
                                                                    aria-hidden
                                                                />

                                                                Reinstate
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() =>
                                                                    patchUser(
                                                                        user,
                                                                        { status: "suspended" },
                                                                        `Suspend ${user.name}? They will lose access immediately.`
                                                                    )
                                                                }
                                                                className="rounded-lg border-[#E4C2BC] text-[#A45B4B] hover:bg-[#FBF0EE]"
                                                            >
                                                                <UserX
                                                                    className="mr-1 h-3.5 w-3.5"
                                                                    aria-hidden
                                                                />

                                                                Suspend
                                                            </Button>
                                                        )}

                                                        {user.appRole === "ADMIN" ? (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() =>
                                                                    patchUser(
                                                                        user,
                                                                        { appRole: "USER" },
                                                                        `Remove admin rights from ${user.name}?`
                                                                    )
                                                                }
                                                                className="rounded-lg text-[#6B4E86] hover:bg-[#F0EAF3]"
                                                            >
                                                                <UserMinus
                                                                    className="mr-1 h-3.5 w-3.5"
                                                                    aria-hidden
                                                                />

                                                                Demote
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={isBusy}
                                                                onClick={() =>
                                                                    patchUser(
                                                                        user,
                                                                        { appRole: "ADMIN" },
                                                                        `Grant admin rights to ${user.name}?`
                                                                    )
                                                                }
                                                                className="rounded-lg text-[#5E5D50] hover:bg-[#ECEBE4]"
                                                            >
                                                                <UserCog
                                                                    className="mr-1 h-3.5 w-3.5"
                                                                    aria-hidden
                                                                />

                                                                Promote
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
