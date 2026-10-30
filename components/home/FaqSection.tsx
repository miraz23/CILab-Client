"use client";

// components/home/FaqSection.tsx
// Home page FAQ - answers the questions visitors actually ask before they
// browse the archive, register or get in touch.

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CalendarDays, ChevronDown, Mail } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*                                    data                                    */
/* -------------------------------------------------------------------------- */

const FAQ_ITEMS = [
    {
        question: "What is the Computational Intelligence Lab?",
        answer:
            "We are a research group working across machine learning, computer vision, natural language processing, cybersecurity and blockchain. The lab publishes peer-reviewed work, runs a weekly seminar series and archives everything it produces here so the community can build on it.",
    },
    {
        question: "Do I need an account to browse the archive?",
        answer:
            "No. Every paper and presentation can be read without signing in. An account is only needed when you want to request the full text of a restricted paper, upload your own work or keep a profile on the platform.",
    },
    {
        question: "What does the lock on a paper mean?",
        answer:
            "A locked paper is in the archive but not public - usually because of a publisher embargo or a collaborator's preference. Its title, authors and abstract stay visible; the full text is shared privately by the authors rather than published as a direct download.",
    },
    {
        question: "How do I get the full text of a locked paper?",
        answer:
            "Sign in and contact the corresponding author or the lab through the contact page. Authors can issue a private share link to your account from their dashboard; once you accept it under Paper access, the link unlocks the full text until it expires or is revoked.",
    },
    {
        question: "How do I join the lab?",
        answer:
            "Create an account with your name, email, institution, academic role and Google Scholar ID. Registration gives you a dashboard for uploads, your profile and paper access requests; prospective members and visiting researchers can then reach out through the contact page to discuss supervision or collaboration.",
    },
    {
        question: "When does the lab meet, and can I attend?",
        answer:
            "The weekly availability board on the Schedule page lists every slot with its day, time, mode (in person or online) and place. Open a day to see the full details, and check News for open seminars and announcements that guests are welcome to join.",
    },
    {
        question: "Where do I find slides and recordings of past talks?",
        answer:
            "The Presentations archive keeps every talk we have given - conference talks, seminars, workshops and posters - with slides or video attached wherever the speakers shared them.",
    },
    {
        question: "How do I get my own paper or talk listed?",
        answer:
            "Sign in, open Upload in your dashboard and submit a paper or a presentation. Submissions are reviewed by a lab admin before they appear publicly, so the archive stays accurate and free of duplicates.",
    },
    {
        question: "Can I collaborate with the lab?",
        answer:
            "Yes. We work with students, faculty and industry researchers on shared problems, joint publications and funded projects. Tell us what you are working on through the contact page and we will point you to the right person.",
    },
];

/* -------------------------------------------------------------------------- */
/*                                  accordion                                 */
/* -------------------------------------------------------------------------- */

function FaqItem({
    question,
    answer,
    index,
    open,
    onToggle,
}: {
    question: string;
    answer: string;
    index: number;
    open: boolean;
    onToggle: () => void;
}) {
    const reduceMotion = useReducedMotion();
    const panelId = `faq-panel-${index}`;
    const buttonId = `faq-button-${index}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.24), ease }}
            className={`relative border-b border-neutral-200/80 last:border-b-0 transition-colors duration-300 ${open ? "bg-[#F3F2E8]/60" : "bg-transparent"
                }`}
        >
            <h3>
                <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={onToggle}
                    className="group flex w-full items-center gap-4 px-5 py-5 text-left transition-colors duration-200 hover:bg-[#716f49]/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#716f49]/40 sm:px-7 sm:py-6"
                >
                    <span
                        className={`flex-1 text-[15px] font-semibold leading-6 tracking-tight transition-colors duration-200 sm:text-base ${open ? "text-[#1f321c]" : "text-neutral-900"
                            }`}
                    >
                        {question}
                    </span>

                    <span
                        aria-hidden
                        className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${open
                                ? "border-[#716f49] bg-[#716f49] text-white shadow-[0_8px_20px_-8px_rgba(113,111,73,0.7)]"
                                : "border-neutral-200 bg-white text-neutral-500 group-hover:border-[#716f49]/40 group-hover:text-[#716f49]"
                            }`}
                    >
                        <ChevronDown
                            className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        />
                    </span>
                </button>
            </h3>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-6 pr-16 text-sm leading-7 text-neutral-600 sm:px-7 sm:pr-20 sm:text-[15px]">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  section                                   */
/* -------------------------------------------------------------------------- */

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="relative overflow-hidden bg-[#F8FAFC] pt-20">
            <div className="relative">
                {/* heading */}
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
                    >
                        Frequently Asked <span className="text-[#716f49]">Questions</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.16, ease }}
                        className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg"
                    >
                        How the archive works, who can join and what to expect from a lab that publishes
                        everything it produces.
                    </motion.p>
                </div>

                {/* accordion card */}
                <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                    <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]">
                        {FAQ_ITEMS.map((item, index) => (
                            <FaqItem
                                key={item.question}
                                {...item}
                                index={index}
                                open={openIndex === index}
                                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}