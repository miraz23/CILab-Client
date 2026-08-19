"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavChild {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    href?: string;
    children?: NavChild[];
}

// ─── Nav Data ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "News", href: "/news" },
    {
        label: "About us",
        children: [
            { label: "Introduction", href: "/about-us/introduction" },
            { label: "Members", href: "/about-us/members" },
            { label: "Photos", href: "/about-us/photos" },
            { label: "Join CILab", href: "/about-us/ci-lab" },
            { label: "Contact information", href: "/about-us/contact-information" },
        ],
    },
    {
        label: "Research",
        children: [
            { label: "Research area", href: "/research/research-area" },
            { label: "Projects", href: "/research/projects" },
            { label: "Papers", href: "/research/papers" },
        ],
    },
    {
        label: "Lectures",
        children: [
            { label: "Class description", href: "/lectures/class-description" },
            { label: "Schedule", href: "/lectures/schedule" },
            { label: "Reference seminar schedule", href: "/lectures/reference-seminar-schedule" },
            { label: "Reference seminar archive", href: "/lectures/reference-seminar-archive" },
        ],
    },
    { label: "Board", href: "/board" },
];

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
function DropdownMenu({ items }: { items: NavChild[] }) {
    return (
        <div className="absolute top-full left-1/2 z-50 min-w-50 -translate-x-1/2 pt-2">
            <div className="overflow-hidden rounded-xl bg-[#FFFFFF]/97 py-1 shadow-2xl backdrop-blur-md">
                {items.map((child) => (
                    <Link
                        key={child.label}
                        href={child.href}
                        className="block px-5 py-2.5 text-sm font-medium tracking-wide text-[#1f321c] transition-colors duration-150 hover:bg-[#716f49]/10"
                    >
                        {child.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

// ─── Nav Link ─────────────────────────────────────────────────────────────────
function NavLink({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false);
    const hasChildren = Boolean(item.children?.length);

    return (
        <div
            className="relative"
            onMouseEnter={() => hasChildren && setOpen(true)}
            onMouseLeave={() => hasChildren && setOpen(false)}
        >
            {hasChildren ? (
                <button
                    type="button"
                    className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold tracking-[0.04em] text-[#1f321c] transition-colors duration-150 hover:text-[#716f49]"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    {item.label}
                    <ChevronDown
                        size={14}
                        className={cn(
                            "text-[#1f321c] transition-transform duration-200",
                            open && "rotate-180"
                        )}
                    />
                </button>
            ) : (
                <Link
                    href={item.href ?? "#"}
                    className="whitespace-nowrap text-sm font-semibold tracking-[0.04em] text-[#1f321c] transition-colors duration-150 hover:text-[#716f49]"
                >
                    {item.label}
                </Link>
            )}

            {hasChildren && open && <DropdownMenu items={item.children!} />}
        </div>
    );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose, isLoggedIn }: { open: boolean; onClose: () => void; isLoggedIn: boolean }) {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-100 flex flex-col overflow-y-auto bg-[#FFFFFF]">
            {/* Header row */}
            <div className="flex items-center justify-between px-5 py-4">
                <ComputationalIntelligenceLabLogo /> 
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-[#1f321c] hover:text-[#716f49]"
                    aria-label="Close menu"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="h-px w-full bg-[#1f321c]/25" />

            <nav className="flex flex-col gap-1 px-4 py-4">
                {NAV_ITEMS.map((item, idx) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-3 py-3 text-left text-base font-semibold text-[#1f321c] hover:text-[#716f49]"
                                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                >
                                    {item.label}
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "text-[#1f321c] transition-transform duration-200",
                                            expandedIdx === idx && "rotate-180"
                                        )}
                                    />
                                </button>
                                {expandedIdx === idx && (
                                    <div className="ml-4 flex flex-col gap-0.5 border-l border-[#716f49]/30 pl-3">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                onClick={onClose}
                                                className="py-2.5 text-sm font-medium text-[#1f321c] hover:text-[#716f49]"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.href ?? "#"}
                                onClick={onClose}
                                className="block px-3 py-3 text-base font-semibold text-[#1f321c] hover:text-[#716f49]"
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className="mt-auto px-5 pb-8 pt-4">
                <Link
                    href={isLoggedIn ? "/dashboard" : "/auth/login"}
                    onClick={onClose}
                    className="block w-full rounded-full bg-[#1f321c] py-3 text-center text-sm font-bold tracking-wider text-white"
                >
                    {isLoggedIn ? "Dashboard" : "Login"}
                </Link>
            </div>
        </div>
    );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function ComputationalIntelligenceLabLogo() {
    return (
        <Link href="/" className="flex items-center gap-2" aria-label="Computational Intelligence Lab Home">
            <Image
                src="/logos/logo.png"
                alt="Computational Intelligence Lab Logo"
                width={150}
                height={60}
                priority
            />
        </Link>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const sync = () => setIsLoggedIn(Boolean(localStorage.getItem("user") || localStorage.getItem("token")));
        sync();
        window.addEventListener("storage", sync);
        window.addEventListener("auth-changed", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("auth-changed", sync);
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            <header
                className={cn(
                    "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
                    scrolled
                        ? "border-b border-[#f9a31a]/15 shadow-lg backdrop-blur-xl"
                        : "border-b border-transparent bg-transparent"
                )}
            >
                <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                    {/* Logo */}
                    <ComputationalIntelligenceLabLogo />

                    {/* Desktop Nav Links */}
                    <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <NavLink item={item} />
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="hidden items-center lg:flex">
                        <Link
                            href={isLoggedIn ? "/dashboard" : "/auth/login"}
                            className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-linear-to-br from-[#716f49]/95 to-[#1f321c]/80 px-5 py-2 text-sm font-semibold tracking-[0.06em] text-white shadow-[0_12px_30px_rgba(31,50,28,0.35),0_4px_12px_rgba(113,111,73,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
                        >
                            {isLoggedIn ? "Dashboard" : "Login"}
                            <ArrowUpRight
                                size={15}
                                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                aria-hidden
                            />
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        className="flex items-center justify-center rounded-lg p-2 text-[#1f321c] hover:text-[#716f49] lg:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                </nav>

                {/* Bottom accent line */}
                <div className="h-px w-full bg-linear-to-r from-transparent via-[#716f49]/40 to-transparent" />
            </header>

            <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} isLoggedIn={isLoggedIn} />
        </>
    );
}