"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, GraduationCap, MapPin, Quote, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const FOUNDER = {
    name: "Dr. Md. Khaliluzzaman",
    title: "Associate Professor",
    department: "Department of Computer Science and Engineering",
    university: "International Islamic University Chittagong (IIUC)",
    location: "Chattogram, Bangladesh",
    photo: "/founder/khaliluzzaman.png",
    bio: "Dr. Khaliluzzaman founded the Computational Intelligence Lab to give researchers and students one open place to publish, present and collaborate. His own work spans image processing, computer vision, human-computer interaction and pattern recognition.",
    interests: ["Image Processing", "Computer Vision", "Human-Computer Interaction", "Pattern Recognition"],
    education: [
        { degree: "Ph.D. in CSE", school: "CUET", detail: "Chittagong University of Engineering & Technology" },
        { degree: "M.Sc. in CSE", school: "CUET", detail: "Completed 2017" },
        { degree: "B.Sc. in CSE", school: "KUET", detail: "Khulna University of Engineering & Technology, 2007" },
    ],
    profiles: [
        { label: "Google Scholar", href: "https://scholar.google.com/citations?user=_SXy3FkAAAAJ&hl=en" },
        { label: "ResearchGate", href: "https://www.researchgate.net/profile/Md-Khaliluzzaman" },
        { label: "ORCID", href: "https://orcid.org/0000-0001-6846-1610" },
        { label: "Scopus", href: "https://www.scopus.com/authid/detail.uri?authorId=48761432800" },
    ],
};

export default function Founder() {
    const reduceMotion = useReducedMotion();

    const reveal = (delay = 0) => ({
        initial: reduceMotion ? false : { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, delay, ease },
    });

    return (
        <section id="founder" className="relative overflow-hidden bg-[#1F321C] py-20 lg:py-28">
            {/* ambient depth */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(163,161,113,0.22),transparent_45%),radial-gradient(circle_at_90%_85%,rgba(113,111,73,0.35),transparent_50%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-size-[56px_56px]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <motion.div {...reveal()} className="mx-auto max-w-2xl text-center">
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        The mind behind{" "}
                        <span className="text-[#C9C7A0]">the lab</span>
                    </h2>
                </motion.div>

                <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
                    {/* portrait */}
                    <motion.div {...reveal(0.1)} className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
                        <div className="relative">
                            <div className="absolute -inset-3 rounded-[28px] bg-linear-to-br from-[#A3A171]/60 via-transparent to-[#716f49]/50 blur-xl" aria-hidden />
                            <div className="relative overflow-hidden rounded-3xl bg-[#F3F2E8] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/20">
                                <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-[#716f49]">
                                    <Image
                                        src={FOUNDER.photo}
                                        alt={`Portrait of ${FOUNDER.name}`}
                                        fill
                                        sizes="(min-width: 1024px) 40vw, 90vw"
                                        className="object-cover object-top"
                                        priority={false}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#1F321C]/80 to-transparent" />
                                    <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 text-white/90">
                                        <MapPin className="size-4 shrink-0" aria-hidden />
                                        <span className="text-sm font-medium">{FOUNDER.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* details */}
                    <motion.div {...reveal(0.2)} className="lg:col-span-7">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A3A171]">Founder</p>
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{FOUNDER.name}</h3>
                        <p className="mt-2 text-base text-white/70 lg:text-lg">
                            {FOUNDER.title}, {FOUNDER.department}
                            <br className="hidden sm:block" />
                            <span className="text-white/50">{FOUNDER.university}</span>
                        </p>

                        <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <Quote className="absolute -top-3 left-5 size-7 rotate-180 fill-[#716f49] text-[#716f49]" aria-hidden />
                            <p className="text-base leading-relaxed text-white/85 lg:text-lg">{FOUNDER.bio}</p>
                        </div>

                        {/* education */}
                        <div className="mt-8">
                            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A3A171]">
                                <GraduationCap className="size-4" aria-hidden />
                                Education
                            </h4>
                            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                                {FOUNDER.education.map((item) => (
                                    <li
                                        key={item.degree}
                                        className="rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#A3A171]/50 hover:bg-white/10"
                                    >
                                        <p className="text-sm font-semibold text-white">{item.degree}</p>
                                        <p className="mt-0.5 text-sm font-medium text-[#C9C7A0]">{item.school}</p>
                                        <p className="mt-1 text-xs leading-snug text-white/50">{item.detail}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* interests */}
                        <div className="mt-8">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A3A171]">Research interests</h4>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {FOUNDER.interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="rounded-full border border-[#A3A171]/40 bg-[#716f49]/30 px-4 py-1.5 text-sm font-medium text-[#EDEBD6]"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* profiles */}
                        <div className="mt-8 flex flex-wrap gap-3">
                            {FOUNDER.profiles.map((profile) => (
                                <a
                                    key={profile.label}
                                    href={profile.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-1.5 rounded-lg bg-[#F3F2E8] px-4 py-2.5 text-sm font-semibold text-[#1F321C] shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-0.5 hover:bg-white"
                                >
                                    {profile.label}
                                    <ArrowUpRight
                                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        aria-hidden
                                    />
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
