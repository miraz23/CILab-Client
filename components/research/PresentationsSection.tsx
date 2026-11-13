"use client";

import { useState } from "react";
import { useResearch } from "@/lib/hooks/use-research";
import type { Presentation } from "@/lib/types/research";
import PresentationCard from "./PresentationCard";
import {
    DetailModal,
    ResearchGrid,
    presentationModal,
    formatDate as formatPresentationDate,
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
                layout="landscape"
                searchPlaceholder="Search title, speaker, event, topic or year…"
                searchText={(p) =>
                    [p.title, p.speakers.join(" "), p.event, p.location ?? "", p.topic, p.type, presentationYear(p)].join(
                        " "
                    )
                }
                renderCard={(p, i, tokens) => (
                    <PresentationCard
                        index={i}
                        tokens={tokens}
                        topic={p.topic}
                        type={p.type}
                        year={presentationYear(p)}
                        date={formatPresentationDate(p.date)}
                        title={p.title}
                        speakers={`${p.speakers[0]}${p.speakers.length > 1 ? " et al." : ""}`}
                        event={[p.event, p.location].filter(Boolean).join(" · ")}
                        description={p.description}
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
