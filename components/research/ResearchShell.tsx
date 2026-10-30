"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ease } from "./research-shared";

export function ResearchHero({ title, description }: { title: ReactNode; description: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mx-auto max-w-3xl px-4 text-center"
        >
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">{description}</p>
        </motion.div>
    );
}

/** Shared page chrome: ambient olive glow + fading dot grid. */
export function ResearchShell({ hero, children }: { hero?: ReactNode; children: ReactNode }) {
    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-32">
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
                {hero}
                {children}
            </div>
        </section>
    );
}
