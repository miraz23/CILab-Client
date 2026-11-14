"use client";

// components/privacy/PrivacySection.tsx
// Privacy Policy - built around what the platform actually handles: contributor
// accounts, uploads, paper access requests, and sign-in cookies / local storage.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
    ArrowUpRight,
    Cookie,
    Database,
    Eye,
    FileText,
    Handshake,
    Lock,
    Mail,
    RefreshCw,
    ServerCog,
    UserCheck,
    type LucideIcon,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const LAST_UPDATED = "November 5, 2026";

/* -------------------------------------------------------------------------- */
/*                                    data                                    */
/* -------------------------------------------------------------------------- */

type PolicyBlock = {
    id: string;
    icon: LucideIcon;
    title: string;
    intro?: string;
    points: string[];
};

const SECTIONS: PolicyBlock[] = [
    {
        id: "overview",
        icon: Eye,
        title: "Overview",
        intro:
            "The Computational Intelligence Lab publishes research openly, so we keep what we collect about people to a minimum.",
        points: [
            "Visitors can read the paper and presentation archive, news and schedule without an account and without giving us any personal details.",
            "We only ask for personal information when you register, upload work, request a paper or contact the lab.",
            "We do not sell your data or use it for advertising.",
        ],
    },
    {
        id: "collect",
        icon: Database,
        title: "What we collect",
        points: [
            "Account details you provide at registration: name, email address, institution, academic role and Google Scholar ID. Your password is submitted to our server to create your account and is never shown back to you.",
            "Content you submit: papers, presentations and their metadata (title, authors, abstract, venue, year, keywords), plus profile information you add in your dashboard.",
            "Activity tied to your account: uploads and their review status, and paper access requests you send or receive.",
            "Messages you send through the contact information page, and any details you include in them.",
        ],
    },
    {
        id: "use",
        icon: UserCheck,
        title: "How we use it",
        points: [
            "To create and secure your account and keep you signed in.",
            "To list approved papers and talks, credit their authors and let people find them by keyword, author or topic.",
            "To route paper requests from users to members and deliver the files members upload in response.",
            "To let lab admins review submissions, manage accounts and keep the archive accurate.",
            "To understand how the platform is used, for example overall visits and uploads, so we can improve it.",
            "To reply to your enquiries and send essential account or service messages.",
        ],
    },
    {
        id: "public",
        icon: FileText,
        title: "What is public",
        intro: "Some information is visible to others by design, because it is part of publishing research.",
        points: [
            "Approved papers and presentations show their title, authors, affiliations, abstract and related metadata to everyone.",
            "Files delivered in answer to a paper request are visible only to the person who requested them, the member who sent them and lab admins.",
            "Your email and other account details are not shown publicly. A paper author's name appears with their work, and a paper request is visible to the members you send it to and to lab admins.",
        ],
    },
    {
        id: "sharing",
        icon: Handshake,
        title: "Who we share it with",
        points: [
            "Members you send a paper request to see your name, institution, the paper link and your message.",
            "Lab admins can view account, upload and request information so they can moderate the platform.",
            "Service providers that host the website and its backend process data on our behalf, only to run the platform.",
            "We may disclose information when the law requires it or to protect the platform and its users from abuse.",
        ],
    },
    {
        id: "cookies",
        icon: Cookie,
        title: "Cookies & local storage",
        intro: "We use only what is needed to keep you signed in. There are no advertising or cross-site tracking cookies.",
        points: [
            "When you sign in, a session token cookie and a role cookie are set so protected pages, such as your dashboard, know who you are.",
            "Your session token and basic profile details are also kept in your browser's local storage so the dashboard loads without asking you to sign in again.",
            "Signing out clears these items. You can also clear them any time from your browser settings, which will sign you out.",
        ],
    },
    {
        id: "security",
        icon: Lock,
        title: "Security & retention",
        points: [
            "Account and content data are processed by our backend server, and sign-in cookies are scoped to this site.",
            "Files delivered for a paper request are tied to your account and are not listed in the public archive.",
            "We keep account information while your account is active and content while it remains in the archive. Rejected or deleted submissions are removed from public view.",
            "No system is perfectly secure. Choose a strong, unique password and tell us promptly if you suspect misuse.",
        ],
    },
    {
        id: "rights",
        icon: ServerCog,
        title: "Your choices & rights",
        points: [
            "You can view and update your profile details from your dashboard.",
            "You can ask us to correct or delete your account, or to remove a paper or presentation you uploaded.",
            "You can ask what information we hold about you.",
            "Removing a paper from our archive does not remove copies others have already downloaded or cited.",
        ],
    },
    {
        id: "changes",
        icon: RefreshCw,
        title: "Changes & children",
        points: [
            "We may update this policy as the platform grows. The date at the top shows the latest revision, and continued use means you accept the changes.",
            "The platform is intended for students and researchers and is not aimed at young children. If you think a child has registered, contact us and we will remove the account.",
        ],
    },
];

const HIGHLIGHTS = [
    { icon: Eye, title: "Browse anonymously", text: "No account to read the archive." },
    { icon: Cookie, title: "Sign-in only", text: "No ad or tracking cookies." },
    { icon: Lock, title: "No data sales", text: "We never sell your details." },
];

/* -------------------------------------------------------------------------- */
/*                                  component                                 */
/* -------------------------------------------------------------------------- */

export default function PrivacySection() {
    const reduceMotion = useReducedMotion();
    const [activeId, setActiveId] = useState(SECTIONS[0].id);

    // Scroll-spy: highlight the section nearest the top of the viewport.
    useEffect(() => {
        const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
            (el): el is HTMLElement => el !== null,
        );
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActiveId(visible[0].target.id);
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const goTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
        });
        setActiveId(id);
    };

    return (
        <section className="relative overflow-x-clip bg-[#F8FAFC] pb-24 pt-28 sm:pt-32">
            {/* ambient background */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-105 w-205 -translate-x-1/2 rounded-full bg-[#A3A171]/25 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.14]"
                    style={{
                        backgroundImage: "radial-gradient(#716f49 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        maskImage: "radial-gradient(ellipse 70% 45% at 50% 0%, #000, transparent)",
                        WebkitMaskImage: "radial-gradient(ellipse 70% 45% at 50% 0%, #000, transparent)",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                {/* heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Privacy <span className="text-[#716f49]">Policy</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        What the Computational Intelligence Lab collects, why we collect it, and the choices you
                        have.
                    </motion.p>
                </div>

                {/* highlights */}
                <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
                    {HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.3 + i * 0.07, ease }}
                            className="flex items-center gap-4 rounded-lg border border-[#dddbd8] bg-[#F3F2E8] p-4 shadow-[0_0px_8px_rgba(31,50,28,0.08)]"
                        >
                            <div>
                                <p className="text-sm font-semibold text-[#1F321C]">{title}</p>
                                <p className="text-sm text-neutral-600">{text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* body */}
                <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                    {/* table of contents */}
                    <aside className="lg:col-span-4 lg:self-start xl:col-span-3 lg:sticky lg:top-28">
                        <nav
                            aria-label="Table of contents"
                            className="rounded-lg border border-neutral-200/70 bg-white p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
                        >
                            <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                On this page
                            </p>
                            <ul className="max-h-[60vh] space-y-0.5 overflow-y-auto">
                                {SECTIONS.map((s, i) => {
                                    const active = s.id === activeId;
                                    return (
                                        <li key={s.id}>
                                            <button
                                                type="button"
                                                onClick={() => goTo(s.id)}
                                                aria-current={active ? "true" : undefined}
                                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${
                                                    active
                                                        ? "bg-[#716f49] font-semibold text-white"
                                                        : "text-neutral-600 hover:bg-[#F3F2E8] hover:text-[#1F321C]"
                                                }`}
                                            >
                                                <span
                                                    className={`text-xs tabular-nums ${
                                                        active ? "text-white/70" : "text-neutral-400"
                                                    }`}
                                                >
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                {s.title}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    {/* sections */}
                    <div className="space-y-6 lg:col-span-8 xl:col-span-9">
                        {SECTIONS.map(({ id, icon: Icon, title, intro, points }, i) => (
                            <motion.article
                                key={id}
                                id={id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.6, ease }}
                                className="scroll-mt-28 overflow-hidden rounded-lg border border-neutral-200/70 bg-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
                            >
                                <header className="relative flex items-center gap-4 overflow-hidden bg-linear-to-br from-[#1F321C] to-[#716f49] px-5 py-5 sm:px-7">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.22),transparent_60%)]" />
                                    <span className="relative text-3xl font-bold leading-none text-white/90">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <h2 className="relative border-l border-white/40 pl-4 text-lg font-semibold text-white sm:text-xl">
                                        {title}
                                    </h2>
                                </header>

                                <div className="px-5 py-6 sm:px-7">
                                    {intro && <p className="text-[15px] leading-7 text-neutral-700">{intro}</p>}
                                    <ul className={`space-y-3 ${intro ? "mt-4" : ""}`}>
                                        {points.map((point) => (
                                            <li
                                                key={point}
                                                className="flex gap-3 text-sm leading-7 text-neutral-600 sm:text-[15px]"
                                            >
                                                <span
                                                    aria-hidden
                                                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#716f49]"
                                                />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.article>
                        ))}

                        {/* contact card */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, ease }}
                            className="relative overflow-hidden rounded-lg bg-[#1f321c] p-6 text-white sm:p-8"
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#716f49]/40 blur-[90px]"
                            />
                            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/10">
                                        <Mail className="size-5" aria-hidden />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-semibold">Privacy questions or requests?</h2>
                                        <p className="mt-1 max-w-md text-sm leading-6 text-white/65">
                                            Contact the lab to access, correct or delete your data, or to remove
                                            something you uploaded. See also our{" "}
                                            <Link href="/terms" className="underline underline-offset-2 hover:text-white">
                                                Terms &amp; Conditions
                                            </Link>
                                            .
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/about-us/contact-information"
                                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#716f49] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8a8860]"
                                >
                                    Contact the lab
                                    <ArrowUpRight
                                        className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        aria-hidden
                                    />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
