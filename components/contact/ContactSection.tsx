"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";

const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/*  EDIT THIS BLOCK - replace the placeholder values with the real lab  */
/*  details. Everything on the page is driven from here.               */
/* ------------------------------------------------------------------ */
const CONTACT = {
    address: ["Computational Intelligence Lab", "Computer Science & Engineering, Room no.", "International Islamic University Chittagong, Chittagong, Bangladesh"],
    phone: "+880 1XXX-XXXXXX",
    email: "lab@example.com",
    hours: ["Saturday – Wednesday", "10:00 am – 5:00 pm"],
    // Exact embed URL: Google Maps → Share → Embed a map → Copy HTML → src="..."
    mapEmbedSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.199751066927!2d91.72031249999999!3d22.4966875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30acd10345e7ed67%3A0xd558e3c1af516fe9!2sCSE%20Office%2C%20IIUC!5e0!3m2!1sen!2sbd!4v1793385791393!5m2!1sen!2sbd",
    // Anything Google Maps understands, used for the "Open in Google Maps" link.
    mapQuery: "CSE Office, IIUC",
    // Short label shown under the map.
    mapCaption: "CSE Office, IIUC",
    socials: [
        { label: "GitHub", href: "#", icon: "github" },
        { label: "LinkedIn", href: "#", icon: "linkedin" },
        { label: "X", href: "#", icon: "x" },
        { label: "YouTube", href: "#", icon: "youtube" },
    ] as { label: string; href: string; icon: SocialKey }[],
};

type SocialKey = "github" | "linkedin" | "x" | "youtube";

const SOCIAL_ICONS: Record<SocialKey, IconType> = {
    github: FaGithub,
    linkedin: FaLinkedinIn,
    x: FaXTwitter,
    youtube: FaYoutube,
};

/* ------------------------------------------------------------------ */
/*                              fragments                              */
/* ------------------------------------------------------------------ */

function InfoRow({
    label,
    index,
    children,
}: {
    label: string;
    index: number;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.06, ease }}
            className="flex gap-4 py-5 first:pt-1 last:pb-1"
        >
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{label}</p>
                <div className="mt-1.5 space-y-0.5 text-sm leading-6 text-neutral-700">{children}</div>
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*                               section                               */
/* ------------------------------------------------------------------ */

export default function ContactSection() {
    const [mapReady, setMapReady] = useState(false);

    // The embed starts loading while the HTML streams, so its `load` event can
    // fire before React attaches `onLoad`. Drop the placeholder regardless.
    useEffect(() => {
        const timer = window.setTimeout(() => setMapReady(true), 2500);
        return () => window.clearTimeout(timer);
    }, []);

    const mapSrc = CONTACT.mapEmbedSrc;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapQuery)}`;
    const mapCaption = CONTACT.mapCaption;

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-28 sm:py-32">
            {/* ambient background: soft olive glow + fading dot grid */}
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

            <div className="relative">
                {/* heading */}
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Get in <span className="text-[#716f49]">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        Visit the lab, call, or send us an email - we would love to hear about your research,
                        collaboration ideas and questions.
                    </motion.p>
                </div>

                {/* content */}
                <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                        {/* details card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, ease }}
                            className="h-fit rounded-[28px] border border-neutral-200/70 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.18)] sm:p-7"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Lab details</h2>
                                <span className="rounded-full bg-[#EAF0E5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#5C7A4C]">
                                    {CONTACT.hours[0]}
                                </span>
                            </div>

                            <div className="mt-2 divide-y divide-neutral-200/70">
                                <InfoRow label="Lab" index={0}>
                                    {CONTACT.address.map((line, i) => (
                                        <p key={line} className={i === 0 ? "font-semibold text-neutral-900" : undefined}>
                                            {line}
                                        </p>
                                    ))}
                                </InfoRow>

                                <InfoRow label="Call" index={1}>
                                    <a
                                        href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`}
                                        className="transition-colors hover:text-[#716f49]"
                                    >
                                        {CONTACT.phone}
                                    </a>
                                </InfoRow>

                                <InfoRow label="E-mail" index={2}>
                                    <a
                                        href={`mailto:${CONTACT.email}`}
                                        className="break-all transition-colors hover:text-[#716f49]"
                                    >
                                        {CONTACT.email}
                                    </a>
                                </InfoRow>

                                <InfoRow label="Time" index={3}>
                                    {CONTACT.hours.map((line) => (
                                        <p key={line}>{line}</p>
                                    ))}
                                </InfoRow>
                            </div>

                            {/* primary actions */}
                            <div className="mt-6 flex gap-2.5">
                                <a
                                    href={`mailto:${CONTACT.email}`}
                                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-linear-to-br from-[#716f49] to-[#1f321c] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(31,50,28,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(31,50,28,0.85)] active:translate-y-0 active:scale-[0.98]"
                                >
                                    <Mail className="size-4" aria-hidden />
                                    Email
                                </a>
                                <a
                                    href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#716f49]/50 hover:bg-[#716f49]/5 hover:text-[#1f321c] active:translate-y-0"
                                >
                                    <Phone className="size-4 text-neutral-500" aria-hidden />
                                    Call
                                </a>
                            </div>

                            {/* socials */}
                            <div className="mt-6 border-t border-neutral-200/70 pt-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                    Follow
                                </p>
                                <div className="mt-3 flex gap-2.5">
                                    {CONTACT.socials.map((s) => {
                                        const Icon = SOCIAL_ICONS[s.icon];
                                        const external = s.href.startsWith("http");
                                        return (
                                            <a
                                                key={s.label}
                                                href={s.href}
                                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                                aria-label={s.label}
                                                className="grid size-9 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#716f49] hover:bg-[#716f49] hover:text-white"
                                            >
                                                <Icon className="size-4" aria-hidden />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, delay: 0.1, ease }}
                            className="flex flex-col overflow-hidden rounded-[28px] border border-neutral-200/70 bg-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.18)]"
                        >
                            <div className="relative min-h-90 flex-1 bg-[#F3F2E8] sm:min-h-105 lg:min-h-130">
                                {/* placeholder until the embed paints */}
                                {!mapReady && (
                                    <div className="absolute inset-0 grid place-items-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="grid size-11 place-items-center rounded-full bg-white/80 text-[#716f49] shadow-sm">
                                                <MapPin className="size-5" aria-hidden />
                                            </span>
                                            <span className="text-xs font-medium text-neutral-500">Loading map…</span>
                                        </div>
                                    </div>
                                )}

                                <iframe
                                    title={`${CONTACT.mapCaption} - location map`}
                                    src={mapSrc}
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    onLoad={() => setMapReady(true)}
                                    className="absolute inset-0 size-full border-0 grayscale-[0.25] transition duration-500 hover:grayscale-0"
                                />
                            </div>

                            {/* map footer */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/70 px-5 py-4">
                                <span className="flex min-w-0 items-center gap-2 text-sm text-neutral-600">
                                    <MapPin className="size-4 shrink-0 text-[#716f49]" aria-hidden />
                                    <span className="truncate">{mapCaption}</span>
                                </span>
                                <a
                                    href={mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:border-[#716f49]/50 hover:bg-[#E4E6DC]"
                                >
                                    Open in Google Maps
                                    <ArrowUpRight
                                        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        aria-hidden
                                    />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
