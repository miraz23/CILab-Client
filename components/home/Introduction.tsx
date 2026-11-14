"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
    ArrowRight,
    CalendarDays,
    LibraryBig,
    LockKeyhole,
    Megaphone,
    Presentation,
    UploadCloud,
    type LucideIcon,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*                                    data                                    */
/* -------------------------------------------------------------------------- */

const FEATURES: {
    icon: LucideIcon;
    title: string;
    text: string;
    href: string;
    cta: string;
}[] = [
    {
        icon: LibraryBig,
        title: "Research Archive",
        text: "Peer-reviewed papers across machine learning, vision, NLP, cybersecurity and blockchain - searchable by keyword, author or topic.",
        href: "/research/papers",
        cta: "Browse papers",
    },
    {
        icon: Presentation,
        title: "Presentation Library",
        text: "Conference talks, seminars, workshops and posters, with slides and recordings attached wherever speakers shared them.",
        href: "/research/presentations",
        cta: "View presentations",
    },
    {
        icon: LockKeyhole,
        title: "Request Any Paper",
        text: "Can't open a paper on IEEE, Springer or another publisher? Send its link to the lab's members. A member with access downloads it and shares the file with you.",
        href: "/auth/register",
        cta: "Create an account",
    },
    {
        icon: UploadCloud,
        title: "Contributor Dashboard",
        text: "Upload your papers and talks, manage your profile and track access requests. Every submission is reviewed before it goes live.",
        href: "/auth/login",
        cta: "Open dashboard",
    },
    {
        icon: CalendarDays,
        title: "Weekly Schedule",
        text: "See when the lab meets - day, time, mode and place - so you can plan to join in person or online.",
        href: "/schedule",
        cta: "See the schedule",
    },
    {
        icon: Megaphone,
        title: "News & Announcements",
        text: "Open seminars, publications and lab updates in one place, so the community never misses what is happening.",
        href: "/news",
        cta: "Read the news",
    },
];

// Palette-only gradients stand in for the images of the original layout.
const GRADIENTS = [
    "bg-linear-to-br from-[#1F321C] to-[#716f49]",
    "bg-linear-to-tr from-[#716f49] to-[#A3A171]",
    "bg-linear-to-br from-[#1F321C] via-[#716f49] to-[#A3A171]",
    "bg-linear-to-bl from-[#A3A171] to-[#1F321C]",
    "bg-linear-to-tl from-[#716f49] to-[#1F321C]",
    "bg-linear-to-r from-[#1F321C] to-[#A3A171]",
];

const STEPS = [
    { n: "01", title: "Explore", text: "Search the archive freely - no account needed." },
    { n: "02", title: "Connect", text: "Register, then send a paper's link to members who can access it." },
    { n: "03", title: "Contribute", text: "Upload your own work and share it with the community." },
];

/* -------------------------------------------------------------------------- */
/*                                  component                                 */
/* -------------------------------------------------------------------------- */

export default function Introduction() {
    const reduceMotion = useReducedMotion();
    const [activeStep, setActiveStep] = useState(0);
    const cardsRef = useRef<HTMLDivElement>(null);

    const reveal = (delay = 0) => ({
        initial: reduceMotion ? false : { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, delay, ease },
    });

    // Work out which card is "current" from how far the card column has scrolled.
    useEffect(() => {
        let raf = 0;

        const update = () => {
            raf = 0;
            const el = cardsRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const progress = (window.innerHeight * 0.4 - rect.top) / rect.height;
            const index = Math.floor(progress * FEATURES.length);
            setActiveStep(Math.min(FEATURES.length - 1, Math.max(0, index)));
        };

        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    const scrollToStep = (index: number) => {
        const el = cardsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const slot = rect.height / FEATURES.length;
        window.scrollTo({
            top: window.scrollY + rect.top - window.innerHeight * 0.4 + slot * (index + 0.5),
            behavior: reduceMotion ? "auto" : "smooth",
        });
        setActiveStep(index);
    };

    return (
        <section id="introduction" className="relative bg-[#F8FAFC] pt-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
                    {/* Left column - sticky intro + step selector */}
                    <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                            One home for the lab&apos;s{" "}
                            <span className="text-[#716f49]">research, people and ideas</span>
                        </h2>
                        <p className="mt-5 max-w-xl mx-auto text-base leading-relaxed text-neutral-500 lg:text-lg">
                            The Computational Intelligence Lab brings its publications, weekly talks and
                            community together on a single platform - openly browsable for visitors,
                            and a full workspace for the researchers who build it.
                        </p>

                        {/* step buttons */}
                        <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
                            {FEATURES.map((feature, index) => (
                                <motion.button
                                    key={feature.title}
                                    type="button"
                                    onClick={() => scrollToStep(index)}
                                    aria-label={`Go to ${feature.title}`}
                                    aria-current={index === activeStep}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                    animate={{ scale: index === activeStep ? 1.1 : 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`cursor-pointer rounded-lg px-6 py-2.5 text-lg font-medium transition-colors duration-300 ${
                                        index === activeStep
                                            ? "bg-[#716f49] text-white"
                                            : "border border-[#dddbd8] bg-[#F3F2E8] text-[#716f49] hover:border-[#716f49]"
                                    }`}
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </motion.button>
                            ))}
                        </div>

                        <p className="mt-4 hidden text-sm font-semibold text-[#1F321C] md:block" aria-live="polite">
                            {FEATURES[activeStep].title}
                        </p>
                    </motion.div>

                    {/* Right column - stacking cards */}
                    <div ref={cardsRef} className="relative">
                        {FEATURES.map(({ icon: Icon, title, text, href, cta }, i) => (
                            <div
                                key={title}
                                className="mb-6 md:mb-8 lg:sticky lg:top-(--top)"
                                style={{ "--top": `${120 + i * 36}px` } as React.CSSProperties}
                            >
                                <div className="overflow-hidden rounded-lg bg-[#F3F2E8] p-3 shadow-[0_0px_8px_rgba(31,50,28,0.12)] ring-1 ring-[#dddbd8]">
                                    {/* gradient "image" */}
                                    <div className={`relative h-56 overflow-hidden rounded-lg md:h-72 ${GRADIENTS[i]}`}>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.25),transparent_55%)]" />
                                        <Icon
                                            className="absolute -right-6 -top-6 size-48 text-white/10"
                                            strokeWidth={1}
                                            aria-hidden
                                        />
                                        {/* <div className="absolute left-6 top-6 flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-md">
                                            <Icon className="size-7" aria-hidden />
                                        </div> */}

                                        {/* overlay with number + title */}
                                        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 rounded-b-[40px] bg-black/10 px-6 py-4 backdrop-blur-[15px]">
                                            <div>
                                                <span className="block text-xs font-medium tracking-widest text-white/80 md:text-sm">
                                                    FEATURE
                                                </span>
                                                <span className="block text-5xl font-bold leading-none text-white lg:text-6xl">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                            </div>
                                            <div className="mb-1 flex-1 border-b border-white/70 pb-1">
                                                <span className="text-base text-white md:text-xl lg:text-2xl">{title}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* content */}
                                    <div className="px-2 py-5 md:px-4">
                                        <p className="text-base leading-relaxed text-neutral-600 md:text-lg">{text}</p>
                                        <Link
                                            href={href}
                                            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#716f49] transition-colors hover:text-[#1F321C] md:text-base"
                                        >
                                            {cta}
                                            <ArrowRight
                                                className="size-4 transition-transform group-hover:translate-x-1"
                                                aria-hidden
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}