"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const LINK_GROUPS = [
    {
        title: "Explore",
        links: [
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: "Schedule", href: "/schedule" },
        ],
    },
    {
        title: "About us",
        links: [
            { label: "Introduction", href: "/about-us/introduction" },
            { label: "Members", href: "/about-us/members" },
            { label: "Contact information", href: "/about-us/contact-information" },
        ],
    },
    {
        title: "Research",
        links: [
            { label: "Papers", href: "/research/papers" },
            { label: "Presentations", href: "/research/presentations" },
        ],
    }
];

const SOCIALS = [
    { label: "GitHub", href: "#", Icon: FaGithub },
    { label: "LinkedIn", href: "#", Icon: FaLinkedinIn },
    { label: "X", href: "#", Icon: FaXTwitter },
    { label: "YouTube", href: "#", Icon: FaYoutube },
];

export default function Footer() {
    const year = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative isolate overflow-hidden bg-[#1f321c] text-white">
            {/* top hairline accent */}
            <div className="h-px w-full bg-linear-to-r from-transparent via-[#716f49] to-transparent" />

            {/* ambient glows */}
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-24 -top-24 size-104 rounded-full bg-[#716f49]/25 blur-[120px]"
                animate={{ y: [0, 28, 0], x: [0, 20, 0], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-32 -right-24 size-120 rounded-full bg-[#505837]/45 blur-[140px]"
                animate={{ y: [0, -24, 0], x: [0, -18, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* fine grid texture */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    maskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 0%, #000 0%, transparent 75%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 0%, #000 0%, transparent 75%)",
                }}
            />

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-120px" }}
                variants={container}
                className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20"
            >
                <div className="grid gap-12 lg:grid-cols-9 lg:gap-10">
                    {/* brand */}
                    <motion.div variants={item} className="lg:col-span-3">
                        <Link
                            href="/"
                            className="inline-flex items-center"
                            aria-label="Computational Intelligence Lab Home"
                        >
                            <Image
                                src="/logos/sidebar-logo.png"
                                alt="Computational Intelligence Lab"
                                width={175}
                                height={54}
                                className="h-12 w-auto"
                            />
                        </Link>

                        <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
                            Advancing the frontiers of computational intelligence - where machine
                            learning, computer vision, cybersecurity and blockchain research meet.
                        </p>

                        <Link
                            href="/about-us/contact-information"
                            className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#c7c69b] transition-colors hover:text-white"
                        >
                            Contact the lab
                            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>

                        <div className="mt-7 flex items-center gap-3">
                            {SOCIALS.map(({ label, href, Icon }) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    whileHover={{ y: -3, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:border-[#716f49]/60 hover:bg-[#716f49]/20 hover:text-white"
                                >
                                    <Icon className="size-4" aria-hidden />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* link columns */}
                    <motion.nav
                        variants={item}
                        aria-label="Footer"
                        className="lg:col-span-6"
                    >
                        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-3">
                            {LINK_GROUPS.map((group) => (
                                <div key={group.title}>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                                        {group.title}
                                    </h3>
                                    <ul className="mt-4 space-y-3">
                                        {group.links.map((link) => (
                                            <li key={link.label}>
                                                <Link
                                                    href={link.href}
                                                    className="group inline-flex text-sm text-white/65 transition-colors hover:text-white"
                                                >
                                                    <span className="relative">
                                                        {link.label}
                                                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#b9c48f] transition-all duration-300 group-hover:w-full" />
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </motion.nav>
                </div>

                {/* bottom bar */}
                <motion.div
                    variants={item}
                    className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row"
                >
                    <p className="text-xs text-white/45">
                        © {year} Computational Intelligence Lab. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <Link
                            href="#"
                            className="text-xs text-white/45 transition-colors hover:text-white"
                        >
                            Privacy
                        </Link>

                        <Link
                            href="#"
                            className="text-xs text-white/45 transition-colors hover:text-white"
                        >
                            Terms
                        </Link>

                        <motion.button
                            type="button"
                            onClick={scrollToTop}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition-colors hover:border-[#716f49]/60 hover:text-white"
                        >
                            Back to top
                            <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
}
