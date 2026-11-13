"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import {
    ArrowRight,
    BadgeCheck,
    Check,
    FileUp,
    Inbox,
    Lock,
    MailCheck,
    Search,
    Send,
    ShieldCheck,
    UserPlus,
    UserRoundPlus,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type Step = {
    title: string;
    text: string;
    icon: LucideIcon;
    cta?: { label: string; href: string };
};

const STEPS: Step[] = [
    {
        title: "Create your account",
        text: "Register with your name, email, institution, academic role and Google Scholar ID.",
        icon: UserPlus,
        cta: { label: "Create account", href: "/auth/register" },
    },
    {
        title: "Verify your email",
        text: "Open the verification link we email you, then sign in to your dashboard.",
        icon: MailCheck,
    },
    {
        title: "Start as a registered user",
        text: "Browse the research archive and request access to specific papers. This is where every account begins.",
        icon: Search,
    },
    {
        title: "Request membership",
        text: "From your Profile, press “Join as member”. Your request stays pending while the lab reviews it.",
        icon: UserRoundPlus,
        cta: { label: "Open profile", href: "/dashboard/profile" },
    },
    {
        title: "Admin review",
        text: "A lab administrator approves or declines the request. If declined, you can request again later.",
        icon: ShieldCheck,
    },
    {
        title: "You are a member",
        text: "Your account is upgraded and the member tools unlock in your dashboard straight away.",
        icon: BadgeCheck,
    },
];

const USER_CAN = [
    { icon: Search, text: "Browse papers and presentations" },
    { icon: Send, text: "Request access to a specific paper" },
    { icon: Lock, text: "Open private links shared with you" },
];

const MEMBER_CAN = [
    { icon: Check, text: "Everything a registered user can do" },
    { icon: FileUp, text: "Upload papers and presentations and manage your uploads" },
    { icon: Inbox, text: "Receive access requests and share papers with other researchers" },
    { icon: Users, text: "Be listed in the lab's Members directory" },
];

function Capability({ icon: Icon, text, light }: { icon: LucideIcon; text: string; light?: boolean }) {
    return (
        <li className="flex items-start gap-3 text-sm leading-5">
            <span
                className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg ${
                    light ? "bg-white/15 text-white" : "bg-[#716f49]/12 text-[#716f49]"
                }`}
            >
                <Icon className="size-3.5" aria-hidden />
            </span>
            <span className={light ? "text-white/90" : "text-[#3D3D35]"}>{text}</span>
        </li>
    );
}

export default function JoinRoadmap() {
    const reduceMotion = useReducedMotion();
    const roadmapRef = useRef<HTMLOListElement>(null);
    const { scrollYProgress } = useScroll({ target: roadmapRef, offset: ["start 65%", "end 60%"] });
    const lineProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

    return (
        <section className="relative overflow-hidden py-28 sm:py-32">
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-105 w-205 -translate-x-1/2 rounded-lg bg-[#A3A171]/25 blur-3xl" />
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

            <div className="relative mx-auto max-w-11/12 px-4 sm:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease }}
                        className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Join <span className="text-[#716f49]">Computational Intelligence Lab</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        Anyone can register and request papers. Becoming a member takes a few more steps and unlocks
                        publishing in the lab.
                    </motion.p>
                </div>

                {/* roadmap */}
                <ol ref={roadmapRef} className="relative mx-auto mt-16 max-w-6xl">
                    {/* track + scroll-driven fill */}
                    <span
                        aria-hidden
                        className="absolute bottom-6 left-5.5 top-6 w-0.5 bg-[#D8D5C9] md:left-1/2 md:-translate-x-1/2"
                    />
                    <motion.span
                        aria-hidden
                        style={{ scaleY: reduceMotion ? 1 : lineProgress }}
                        className="absolute bottom-6 left-5.5 top-6 w-0.5 origin-top bg-linear-to-b from-[#716f49] to-[#1F321C] md:left-1/2 md:-translate-x-1/2"
                    />
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isFinal = index === STEPS.length - 1;
                        // Even-numbered steps sit on the left, odd-numbered on the right (desktop).
                        const isLeft = (index + 1) % 2 === 0;
                        const viewport = { once: true, margin: "-80px" } as const;
                        return (
                            <li
                                key={step.title}
                                className="relative flex gap-5 pb-8 last:pb-0 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8"
                            >
                                <motion.span
                                    initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={viewport}
                                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                                    className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-4 border-[#F4F3EE] shadow-md md:col-start-2 md:row-start-1 ${
                                        isFinal
                                            ? "bg-linear-to-br from-[#716f49] to-[#1F321C] text-white"
                                            : "bg-[#F3F2E8] text-[#716f49] ring-1 ring-[#D8D5C9]"
                                    }`}
                                >
                                    {isFinal && !reduceMotion && (
                                        <motion.span
                                            aria-hidden
                                            className="absolute inset-0 rounded-full bg-[#716f49]"
                                            animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                        />
                                    )}
                                    <Icon className="relative size-4.5" aria-hidden />
                                </motion.span>
                                <motion.div
                                    initial={reduceMotion ? false : { opacity: 0, x: isLeft ? -48 : 48 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={viewport}
                                    transition={{ duration: 0.6, delay: 0.12, ease }}
                                    whileHover={{ y: -4 }}
                                    className={`flex-1 rounded-lg border p-5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-20px_rgba(31,50,28,0.45)] md:row-start-1 ${
                                        isLeft ? "md:col-start-1" : "md:col-start-3"
                                    } ${
                                        isFinal
                                            ? "border-[#716f49]/40 bg-[#EEEDE2]"
                                            : "border-[#D8D5C9] bg-[#F4F3EE]"
                                    }`}
                                >
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#89877B]">
                                        Step {index + 1}
                                    </p>
                                    <h2 className="mt-1 text-lg font-semibold text-[#25251F]">{step.title}</h2>
                                    <p className="mt-1.5 text-sm leading-6 text-[#5E5D50]">{step.text}</p>
                                    {step.cta && (
                                        <Link
                                            href={step.cta.href}
                                            className="group/cta mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#716f49]"
                                        >
                                            {step.cta.label}
                                            <ArrowRight
                                                className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-1"
                                                aria-hidden
                                            />
                                        </Link>
                                    )}
                                </motion.div>
                            </li>
                        );
                    })}
                </ol>

                {/* what each role can do */}
                <div className="mx-auto mt-20 grid max-w-4xl gap-6 md:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, ease }}
                        className="rounded-lg border border-[#D8D5C9] bg-[#F4F3EE] p-6"
                    >
                        <span className="rounded-lg border border-[#D8D5C9] bg-[#ECEBE4] px-2.5 py-1 text-xs font-semibold text-[#5E5D50]">
                            Registered user
                        </span>
                        <h3 className="mt-4 text-lg font-semibold text-[#25251F]">Read and request</h3>
                        <ul className="mt-4 space-y-3">
                            {USER_CAN.map((item) => (
                                <Capability key={item.text} {...item} />
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: 0.1, ease }}
                        className="rounded-lg bg-linear-to-br from-[#716f49] to-[#1F321C] p-6 shadow-[0_18px_40px_-12px_rgba(31,50,28,0.5)]"
                    >
                        <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                            Lab member
                        </span>
                        <h3 className="mt-4 text-lg font-semibold text-white">Contribute and share</h3>
                        <ul className="mt-4 space-y-3">
                            {MEMBER_CAN.map((item) => (
                                <Capability key={item.text} {...item} light />
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
