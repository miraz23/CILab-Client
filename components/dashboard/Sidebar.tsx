"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Home,
    LayoutDashboard,
    Upload,
    User,
    FolderOpen,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CollapsibleNavGroup, MobileNavSheet } from "@/components/dashboard/SidebarNavParts";

const NAV_ITEMS = [
    { label: "Home", href: "/", icon: Home, shortLabel: "Home" },
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard, shortLabel: "Overview" },
    { label: "Upload Paper & Presentation", href: "/dashboard/upload", icon: Upload, shortLabel: "Upload" },
];

const PROFILE_ITEM = { label: "Profile", href: "/dashboard/profile", icon: User };

function ProfileLink({ collapsed, isActive }: { collapsed: boolean; isActive: boolean }) {
    const Icon = PROFILE_ITEM.icon;

    return (
        <Link
            href={PROFILE_ITEM.href}
            className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-2",
                isActive && "bg-white/15 text-white shadow-inner"
            )}
            title={collapsed ? PROFILE_ITEM.label : undefined}
        >
            <Icon size={18} aria-hidden />
            {!collapsed && PROFILE_ITEM.label}
        </Link>
    );
}

const PAPER_ACCESS_LABEL = "Paper Access";
const PAPER_ACCESS_SHORT_LABEL = "Access";

const PAPER_ACCESS_ITEMS = [
    { label: "Access Requests", href: "/dashboard/paper-access/access-requests" },
    { label: "Received Requests", href: "/dashboard/paper-access/received-requests" },
];

const ADMIN_NAV_LABEL = "Admin";
const ADMIN_NAV_SHORT_LABEL = "Admin";
const ADMIN_NAV_ICON = ShieldCheck;

const ADMIN_NAV_ITEMS = [
    { label: "User Management", href: "/dashboard/admin/users" },
    { label: "Content Moderation", href: "/dashboard/admin/moderation" },
    { label: "Access Requests", href: "/dashboard/admin/access-requests" },
    { label: "Schedule Manager", href: "/dashboard/admin/schedule" },
    { label: "Announcements", href: "/dashboard/admin/announcements" },
    { label: "Platform Analytics", href: "/dashboard/admin/analytics" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [paperAccessOpen, setPaperAccessOpen] = useState(true);
    const [adminOpen, setAdminOpen] = useState(true);
    const [mobileSheet, setMobileSheet] = useState<null | "paper-access" | "admin">(null);

    const isPaperAccessActive = PAPER_ACCESS_ITEMS.some((item) => pathname === item.href);
    const isAdminActive = ADMIN_NAV_ITEMS.some((item) => pathname === item.href);

    const expandIfCollapsed = () => {
        if (collapsed) setCollapsed(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        document.cookie = "auth_token=; path=/; max-age=0";
        window.location.href = "/";
    };

    return (
        <>
            <aside
                className={cn(
                    "sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col gap-6 rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:flex ml-4",
                    collapsed ? "w-20 items-center px-3 py-5" : "w-72 p-5"
                )}
            >
                <button
                    type="button"
                    onClick={() => setCollapsed((v) => !v)}
                    className="absolute top-10 -right-3 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-[#716f49] transition-colors cursor-pointer"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <PanelLeftOpen size={13} aria-hidden /> : <PanelLeftClose size={13} aria-hidden />}
                </button>

                <div className={cn("flex items-center justify-center gap-2", collapsed && "flex-col")}>
                    {collapsed ? (
                        <Image
                            src="/logos/sidebar-logo.png"
                            alt="Computational Intelligence Lab Logo"
                            width={59}
                            height={59}
                            className="hidden"
                            priority
                        />
                    ) : (
                        <Image
                            src="/logos/sidebar-logo.png"
                            alt="Computational Intelligence Lab Logo"
                            width={175}
                            height={54}
                            className="rounded-lg p-2"
                            priority
                        />
                    )}
                </div>

                <nav className="flex w-full flex-col gap-1.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                                    collapsed && "justify-center px-2",
                                    isActive && "bg-white/15 text-white shadow-inner"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={18} aria-hidden />
                                {!collapsed && item.label}
                            </Link>
                        );
                    })}

                    <CollapsibleNavGroup
                        label={PAPER_ACCESS_LABEL}
                        icon={FolderOpen}
                        items={PAPER_ACCESS_ITEMS}
                        open={paperAccessOpen}
                        onOpenChange={(open) => {
                            expandIfCollapsed();
                            setPaperAccessOpen(open);
                        }}
                        onNavigate={expandIfCollapsed}
                        collapsed={collapsed}
                    />

                    <CollapsibleNavGroup
                        label={ADMIN_NAV_LABEL}
                        icon={ADMIN_NAV_ICON}
                        items={ADMIN_NAV_ITEMS}
                        open={adminOpen}
                        onOpenChange={(open) => {
                            expandIfCollapsed();
                            setAdminOpen(open);
                        }}
                        onNavigate={expandIfCollapsed}
                        collapsed={collapsed}
                    />

                    <ProfileLink collapsed={collapsed} isActive={pathname === PROFILE_ITEM.href} />
                </nav>

                <div className="mt-auto">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-red-500/20 hover:text-white cursor-pointer",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut size={18} aria-hidden />
                        {!collapsed && "Logout"}
                    </button>
                </div>
            </aside>

            <nav className="fixed bottom-2 left-2 right-2 z-50 flex items-stretch justify-around gap-1 border border-white/10 bg-[#716f49]/80 shadow-2xl px-2 py-2 backdrop-blur-xl rounded-2xl lg:hidden">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium leading-none text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                                isActive && "bg-white/15 text-white"
                            )}
                        >
                            <Icon size={18} aria-hidden />
                            <span className="w-full text-center leading-tight">{item.shortLabel}</span>
                        </Link>
                    );
                })}

                <button
                    type="button"
                    onClick={() => setMobileSheet("paper-access")}
                    className={cn(
                        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium leading-none text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                        isPaperAccessActive && "bg-white/15 text-white"
                    )}
                    aria-haspopup="dialog"
                    aria-expanded={mobileSheet === "paper-access"}
                >
                    <FolderOpen size={18} aria-hidden />
                    <span className="w-full text-center leading-tight">{PAPER_ACCESS_SHORT_LABEL}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setMobileSheet("admin")}
                    className={cn(
                        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium leading-none text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                        isAdminActive && "bg-white/15 text-white"
                    )}
                    aria-haspopup="dialog"
                    aria-expanded={mobileSheet === "admin"}
                >
                    <ADMIN_NAV_ICON size={18} aria-hidden />
                    <span className="w-full text-center leading-tight">{ADMIN_NAV_SHORT_LABEL}</span>
                </button>

                <Link
                    href={PROFILE_ITEM.href}
                    className={cn(
                        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium leading-none text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                        pathname === PROFILE_ITEM.href && "bg-white/15 text-white"
                    )}
                >
                    <User size={18} aria-hidden />
                    <span className="w-full text-center leading-tight">{PROFILE_ITEM.label}</span>
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium leading-none text-red-300/90 transition-colors duration-150 hover:bg-red-500/20 hover:text-red-100"
                >
                    <LogOut size={18} aria-hidden />
                    <span className="w-full text-center leading-tight">Logout</span>
                </button>
            </nav>

            <MobileNavSheet
                open={mobileSheet === "paper-access"}
                title={PAPER_ACCESS_LABEL}
                groups={[{ label: PAPER_ACCESS_LABEL, icon: FolderOpen, items: PAPER_ACCESS_ITEMS }]}
                onClose={() => setMobileSheet(null)}
            />

            <MobileNavSheet
                open={mobileSheet === "admin"}
                title={ADMIN_NAV_LABEL}
                groups={[{ label: ADMIN_NAV_LABEL, icon: ADMIN_NAV_ICON, items: ADMIN_NAV_ITEMS }]}
                onClose={() => setMobileSheet(null)}
            />
        </>
    );
}