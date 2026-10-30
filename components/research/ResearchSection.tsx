"use client";

import PapersSection from "./PapersSection";
import PresentationsSection from "./PresentationsSection";
import { ResearchHero, ResearchShell } from "./ResearchShell";

/** Overview page: both research collections on one page. */
export default function ResearchSection() {
    return (
        <ResearchShell
            hero={
                <ResearchHero
                    title={
                        <>
                            Explore Research That Shapes <span className="text-[#716f49]">Intelligent Systems</span>
                        </>
                    }
                    description="Browse our peer-reviewed papers and presentations across machine learning, computer vision, cybersecurity and blockchain. Search by title, author, topic or year."
                />
            }
        >
            {/* research papers */}
            <div className="mt-16">
                <PapersSection />
            </div>

            {/* divider */}
            <div className="mx-auto my-20 h-px max-w-7xl bg-linear-to-r from-transparent via-neutral-300 to-transparent" />

            {/* presentations */}
            <PresentationsSection />
        </ResearchShell>
    );
}
