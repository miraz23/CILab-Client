"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { useResearch } from "@/lib/hooks/use-research";
import type { Presentation } from "@/lib/types/research";
import {
    DetailModal,
    ResearchCard,
    ResearchGrid,
    pill,
    presentationModal,
    presentationYear,
    type ModalData,
} from "./research-shared";

export default function PresentationsSection({ showHeading = true }: { showHeading?: boolean }) {
    const { presentations, loading, error } = useResearch();
    const [modal, setModal] = useState<ModalData | null>(null);

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
                        meta={`${p.type} · ${p.event}`}
                        shareText={p.title}
                        openLabel={`View details: ${p.title}`}
                        onOpen={() => setModal(presentationModal(p))}
                        badge={
                            p.videoUrl ? (
                                <span className={pill}>
                                    <Video className="size-3" /> Recording
                                </span>
                            ) : undefined
                        }
                    />
                )}
            />

            <DetailModal data={modal} onClose={() => setModal(null)} />
        </>
    );
}
