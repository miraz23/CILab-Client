import PresentationsSection from "@/components/research/PresentationsSection";
import { ResearchHero, ResearchShell } from "@/components/research/ResearchShell";

export default function PresentationsPage() {
    return (
        <ResearchShell
            hero={
                <ResearchHero
                    title={
                        <>
                            Research <span className="text-[#716f49]">Presentations</span>
                        </>
                    }
                    description="Conference talks, seminars, workshops and keynotes from our lab, with slides and recordings. Search by title, speaker, event, topic or year."
                />
            }
        >
            <div className="mt-14">
                <PresentationsSection showHeading={false} />
            </div>
        </ResearchShell>
    );
}
