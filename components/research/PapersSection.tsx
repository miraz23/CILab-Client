"use client";

import { useState } from "react";
import { useResearch } from "@/lib/hooks/use-research";
import type { Paper } from "@/lib/types/research";
import {
    DetailModal,
    ResearchCard,
    ResearchGrid,
    paperModal,
    type ModalData,
} from "./research-shared";

export default function PapersSection({ showHeading = true }: { showHeading?: boolean }) {
    const { papers, loading, error } = useResearch();
    const [modal, setModal] = useState<ModalData | null>(null);

    return (
        <>
            <ResearchGrid<Paper>
                id="research-papers"
                title="Research Papers"
                description="Journal articles, conference papers and early-access publications from our lab."
                noun="paper"
                items={papers}
                loading={loading}
                error={error}
                showHeading={showHeading}
                searchPlaceholder="Search title, author, venue, topic or year…"
                searchText={(p) =>
                    [p.title, p.authors.join(" "), p.venue, p.topic, p.type, p.publisher, p.year].join(" ")
                }
                renderCard={(p, i, tokens) => (
                    <ResearchCard
                        index={i}
                        tokens={tokens}
                        topic={p.topic}
                        year={p.year}
                        title={p.title}
                        byline={`${p.authors[0]}${p.authors.length > 1 ? " et al." : ""}`}
                        meta={`${p.type} · Cited by ${p.citedBy}`}
                        shareText={p.title}
                        openLabel={`View details: ${p.title}`}
                        onOpen={() => setModal(paperModal(p))}
                    />
                )}
            />

            <DetailModal data={modal} onClose={() => setModal(null)} />
        </>
    );
}
