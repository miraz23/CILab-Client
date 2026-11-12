"use client";

import { useState } from "react";
import { useResearch } from "@/lib/hooks/use-research";
import type { Presentation } from "@/lib/types/research";
import {
    DetailModal,
    ResearchCard,
    ResearchGrid,
    presentationModal,
    presentationYear,
    type ModalData,
} from "./research-shared";

export default function PresentationsSection({ showHeading = true }: { showHeading?: boolean }) {
    const { papers, presentations, loading, error } = useResearch();
    const [modal, setModal] = useState<ModalData | null>(null);
    const apiBaseUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    return (
        <>
            <ResearchGrid<Presentation>
                id="presentations"
                title="Presentations"
                description="Conference talks, seminars, workshops and keynotes, with slides and recordings."
                noun="presentation"
                items={presentations}
                loading={loading}
                error={error}
                showHeading={showHeading}
                searchPlaceholder="Search title, speaker, event, topic or year…"
                searchText={(p) =>
                    [p.title, p.speakers.join(" "), p.event, p.location ?? "", p.topic, p.type, presentationYear(p)].join(
                        " "
                    )
                }
                renderCard={(p, i, tokens) => (
                    <ResearchCard
                        index={i}
                        tokens={tokens}
                        topic={p.topic}
                        year={presentationYear(p)}
                        title={p.title}
                        byline={`${p.speakers[0]}${p.speakers.length > 1 ? " et al." : ""}`}
                        meta={p.type}
                        venue={[p.event, p.location].filter(Boolean).join(" · ")}
                        abstract={p.description}
                        summaryLabel="Description"
                        shareText={p.videoUrl ?? ""}
                        openLabel={`View details: ${p.title}`}
                        onOpen={() => {
                            const paper = papers.find((item) =>
                                Boolean(p.videoUrl && p.videoUrl === item.htmlUrl)
                            );
                            setModal(presentationModal(
                                p,
                                paper ? `${apiBaseUrl}/api/research/${paper.id}/preview` : undefined,
                            ));
                        }}
                    />
                )}
            />

            <DetailModal data={modal} onClose={() => setModal(null)} />
        </>
    );
}
