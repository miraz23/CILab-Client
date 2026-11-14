"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
    ArrowUpRight,
    BookOpenCheck,
    CalendarDays,
    Copyright,
    FileCheck2,
    Gavel,
    KeyRound,
    LockKeyhole,
    Mail,
    RefreshCw,
    ShieldAlert,
    UserRound,
    type LucideIcon,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const LAST_UPDATED = "November 5, 2026";

/* -------------------------------------------------------------------------- */
/*                                    data                                    */
/* -------------------------------------------------------------------------- */

type TermsBlock = {
    id: string;
    icon: LucideIcon;
    title: string;
    intro?: string;
    points: string[];
};

const SECTIONS: TermsBlock[] = [
    {
        id: "acceptance",
        icon: BookOpenCheck,
        title: "Using this platform",
        intro:
            "This website is run by the Computational Intelligence Lab to share its research, presentations, schedule and news with the community.",
        points: [
            "By browsing the site, creating an account or uploading content you agree to these terms. If you do not agree, please do not use the platform.",
            "Browsing the paper and presentation archive, the news feed and the schedule is open to everyone and needs no account.",
            "The platform is provided for academic, educational and collaborative purposes only.",
        ],
    },
    {
        id: "accounts",
        icon: UserRound,
        title: "Accounts & membership",
        intro:
            "An account unlocks the contributor dashboard - uploads, your profile and paper access requests.",
        points: [
            "Register with accurate details: your name, email, institution, academic role and Google Scholar ID. Keep them current.",
            "You are responsible for your password and for everything done through your account. Tell us promptly if you suspect misuse.",
            "One person, one account. Do not impersonate another researcher or claim an affiliation you do not hold.",
            "Lab admins may verify, suspend or remove accounts that give false information or break these terms.",
        ],
    },
    {
        id: "uploads",
        icon: FileCheck2,
        title: "Uploading papers & presentations",
        intro:
            "Contributors can submit papers and talks. Every submission is reviewed by a lab admin before it appears publicly.",
        points: [
            "Only upload work you authored or have the right to share, including permission from co-authors and any publisher or funder that requires it.",
            "Metadata - title, authors, abstract, venue, year and keywords - must be accurate. Duplicates and misleading entries may be rejected.",
            "Admins may approve, edit, reject or remove a submission to keep the archive accurate. Rejection does not prevent you from resubmitting a corrected version.",
            "Do not upload malware, personal data about others, confidential material or anything unlawful.",
        ],
    },
    {
        id: "restricted",
        icon: LockKeyhole,
        title: "Paper requests",
        intro:
            "Many papers on publisher sites such as IEEE and Springer can be downloaded only by members with institutional or paid access. Regular users can ask a member for a copy.",
        points: [
            "To request a paper, send its publisher link to one or more members through the platform. A member who has access may download it and upload the file back to you.",
            "Members decide whether to fulfil a request and may decline without giving a reason.",
            "Files you receive are for your own reading and research. Do not republish or redistribute them, and respect the publisher's copyright and licence terms.",
            "Members should share a paper only where their access and the publisher's terms allow it. Misuse can lead to loss of access and removal of your account.",
        ],
    },
    {
        id: "conduct",
        icon: ShieldAlert,
        title: "Acceptable use",
        points: [
            "Do not attempt to break, probe or overload the platform, bypass access controls, or scrape restricted content.",
            "Do not use the platform for harassment, spam, misleading claims or any activity that harms others.",
            "Keep requests to authors, and any message sent through the contact page, respectful and relevant.",
            "Research integrity matters here: do not fabricate results, authorship or citations in anything you submit.",
        ],
    },
    {
        id: "ip",
        icon: Copyright,
        title: "Ownership & copyright",
        points: [
            "Authors keep the copyright in their papers and presentations. By uploading, you give the lab a non-exclusive licence to host, display and index the work on this platform.",
            "Public items may be read, cited and linked to with proper attribution. Copying or reusing them beyond that follows the rights set by their authors and publishers.",
            "The lab's name, logo and site design belong to the Computational Intelligence Lab and may not be used to imply endorsement without permission.",
            "If you believe content infringes your rights, contact us and we will review it and, where appropriate, take it down.",
        ],
    },
    {
        id: "schedule",
        icon: CalendarDays,
        title: "Schedule, news & events",
        points: [
            "Weekly slots, seminars and announcements are published in good faith and may change at short notice, including mode (in person or online) and place.",
            "Open sessions are welcome to guests unless an announcement says otherwise. Attendees are expected to follow the lab's conduct expectations.",
        ],
    },
    {
        id: "availability",
        icon: KeyRound,
        title: "Availability & liability",
        points: [
            "The platform and everything on it is provided as is. We aim for accuracy and uptime but cannot promise uninterrupted or error-free service.",
            "Research content reflects its authors' views and findings. The lab is not responsible for how others rely on or reuse it.",
            "To the extent permitted by law, the lab is not liable for losses arising from use of, or inability to use, the platform. Links to outside sites are not endorsements.",
        ],
    },
    {
        id: "changes",
        icon: RefreshCw,
        title: "Changes & termination",
        points: [
            "We may update these terms as the platform grows. The date at the top shows the latest revision; continued use means you accept the changes.",
            "You can stop using the platform at any time and may ask us to remove your account. We may suspend or end access for serious or repeated breaches.",
        ],
    },
    {
        id: "governing",
        icon: Gavel,
        title: "Governing law",
        points: [
            "These terms are governed by the laws of Bangladesh. Any dispute should first be raised with the lab so we can try to resolve it informally.",
        ],
    },
];

const HIGHLIGHTS = [
    { icon: BookOpenCheck, title: "Open to read", text: "The archive needs no account." },
    { icon: FileCheck2, title: "Reviewed uploads", text: "Admins check every submission." },
    { icon: LockKeyhole, title: "Paper requests", text: "Ask members for papers you can't open." },
];

/* -------------------------------------------------------------------------- */
/*                                  component                                 */
/* -------------------------------------------------------------------------- */

export default function TermsSection() {
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
                        Terms &amp; <span className="text-[#716f49]">Conditions</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        The ground rules for reading, contributing to and sharing research on the Computational
                        Intelligence Lab platform.
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
                                    {intro && (
                                        <p className="text-[15px] leading-7 text-neutral-700">{intro}</p>
                                    )}
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
                    </div>
                </div>
            </div>
        </section>
    );
}
