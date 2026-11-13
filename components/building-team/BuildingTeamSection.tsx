"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Code, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type TeamMember = {
    name: string;
    role: string;
    summary: string;
    icon: LucideIcon;
    image: string;
    tint: { from: string; to: string };
    contributions: string[];
    tags: string[];
};

const TEAM: TeamMember[] = [
    {
        name: "Ameer Hamzah Daiyan",
        role: "Frontend Developer",
        summary: "Shaped everything users see and touch, and wired it to the backend.",
        icon: Code,
        image: "https://res.cloudinary.com/dgt4ygjhp/image/upload/v1794560592/pp_sq_c1m04e.png",
        tint: { from: "#716f49", to: "#1f321c" },
        contributions: [
            "Designed the platform's UI/UX and visual identity",
            "Built the responsive frontend for the website and dashboard",
            "Integrated the frontend with the backend APIs",
        ],
        tags: ["Frontend", "UI/UX Design", "API Integration"],
    },
    {
        name: "MD. Mohiul Islam Miraz",
        role: "Backend Developer",
        summary: "Built the server that powers Computational Intelligence Lab, from data to access control.",
        icon: Server,
        image: "https://res.cloudinary.com/dgt4ygjhp/image/upload/v1794560877/1735528590619_fyxsmj.jpg",
        tint: { from: "#8FA382", to: "#1f321c" },
        contributions: [
            "Designed and developed the entire backend of the platform",
            "Built the APIs the frontend consumes",
            "Implemented authentication, roles and data management",
        ],
        tags: ["Backend", "APIs", "Database"],
    },
];

function initials(name: string) {
    return name
        .replace(/^MD\.?\s+/i, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
    const [imgFailed, setImgFailed] = useState(false);
    const Icon = member.icon;

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: index * 0.1, ease }}
            whileHover={{ y: -6 }}
            className="group flex flex-col overflow-hidden rounded-lg p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-24px_rgba(31,50,28,0.45)]"
            style={{ background: `linear-gradient(135deg, ${member.tint.from} 0%, ${member.tint.to} 100%)` }}
        >
            {/* photo */}
            <div
                className="relative aspect-4/3 w-full overflow-hidden rounded-lg"
                style={{ background: `linear-gradient(315deg, ${member.tint.from} 0%, ${member.tint.to} 100%)` }}
            >
                {!imgFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        onError={() => setImgFailed(true)}
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div
                        aria-hidden
                        className="absolute inset-0 grid place-items-center text-7xl font-bold tracking-tight text-white/85 drop-shadow-sm"
                    >
                        {initials(member.name)}
                    </div>
                )}

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    <Icon className="size-3.5" aria-hidden />
                    {member.tags[0]}
                </span>
            </div>

            {/* details */}
            <div className="mt-2 flex flex-1 flex-col gap-4 rounded-lg bg-[#F4F3EE] p-5">
                <div>
                    <h2 className="text-xl font-semibold leading-snug text-[#25251F]">{member.name}</h2>
                    <p className="mt-1 text-sm font-medium text-[#716f49]">{member.role}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5E5D50]">{member.summary}</p>
                </div>

                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#89877B]">
                        Contributions
                    </p>
                    <ul className="mt-2.5 space-y-2">
                        {member.contributions.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-[#3D3D35]">
                                <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-[#716f49]/15 text-[#716f49]">
                                    <Check className="size-3" aria-hidden />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {member.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-lg border border-[#D8D5C9] bg-[#ECEBE4] px-2.5 py-1 text-xs font-medium text-[#5E5D50]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.article>
    );
}

export default function BuildingTeamSection() {
    return (
        <section className="relative overflow-hidden py-28">
            {/* ambient background, same as Members */}
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

            <div className="relative">
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Meet the <span className="text-[#716f49]">Building Team</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        The people who designed, built and connected the Computational Intelligence Lab platform.
                    </motion.p>
                </div>

                <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 items-stretch gap-6 px-4 sm:px-6 md:grid-cols-2">
                    {TEAM.map((member, index) => (
                        <TeamCard key={member.name} member={member} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
