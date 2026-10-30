import PapersSection from "@/components/research/PapersSection";
import { ResearchHero, ResearchShell } from "@/components/research/ResearchShell";

export default function PapersPage() {
    return (
        <ResearchShell
            hero={
                <ResearchHero
                    title={
                        <>
                            Research <span className="text-[#716f49]">Papers</span>
                        </>
                    }
                    description="Journal articles, conference papers and early-access publications from our lab. Search by title, author, venue, topic or year."
                />
            }
        >
            <div className="mt-14">
                <PapersSection showHeading={false} />
            </div>
        </ResearchShell>
    );
}
