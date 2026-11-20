"use client";

import { useState } from "react";
import type { Paper, Presentation } from "@/lib/types/research";
import PresentationCard from "@/components/research/PresentationCard";
import {
    DetailModal,
    ResearchCard,
    formatDate,
    paperModal,
    presentationModal,
    presentationYear,
    type ModalData,
} from "@/components/research/research-shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const NO_TOKENS: string[] = [];

function Empty({ noun }: { noun: string }) {
    return (
        <p className="rounded-lg border border-dashed border-[#D8D5C9] bg-white/60 px-4 py-10 text-center text-sm text-neutral-500">
            No published {noun} yet.
        </p>
    );
}

/** Responsive card grids for one person's papers / presentations, with the shared detail modal. */
export default function ContributionLists({
    tab,
    papers,
    presentations,
}: {
    tab: "papers" | "presentations";
    papers: Paper[];
    presentations: Presentation[];
}) {
    const [modal, setModal] = useState<ModalData | null>(null);

    return (
        <>
            {tab === "papers" ? (
                papers.length === 0 ? (
                    <Empty noun="papers" />
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {papers.map((p, i) => {
                            const presentation = presentations.find((item) =>
                                Boolean(p.htmlUrl && p.htmlUrl === item.videoUrl)
                            );
                            return (
                                <ResearchCard
                                    key={p.id}
                                    index={i}
                                    tokens={NO_TOKENS}
                                    topic={p.topic}
                                    year={p.year}
                                    title={p.title}
                                    byline={`${p.authors[0]}${p.authors.length > 1 ? " et al." : ""}`}
                                    meta={`${p.type} · ${p.publisher}`}
                                    venue={p.venue}
                                    abstract={p.abstract}
                                    publisher={p.publisher}
                                    footnote={String(p.year)}
                                    thumbId={p.id}
                                    shareText={p.htmlUrl ?? ""}
                                    openLabel={`View details: ${p.title}`}
                                    onOpen={() =>
                                        setModal(
                                            paperModal(
                                                p,
                                                `${API_BASE_URL}/api/research/${p.id}/pdf`,
                                                `${API_BASE_URL}/api/research/${p.id}/preview`,
                                                presentation,
                                                presentation
                                                    ? `${API_BASE_URL}/api/research/${presentation.id}/presentation`
                                                    : undefined
                                            )
                                        )
                                    }
                                />
                            );
                        })}
                    </div>
                )
            ) : presentations.length === 0 ? (
                <Empty noun="presentations" />
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {presentations.map((p, i) => (
                        <PresentationCard
                            key={p.id}
                            index={i}
                            tokens={NO_TOKENS}
                            topic={p.topic}
                            type={p.type}
                            year={presentationYear(p)}
                            date={formatDate(p.date)}
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
                                setModal(
                                    presentationModal(
                                        p,
                                        paper ? `${API_BASE_URL}/api/research/${paper.id}/preview` : undefined
                                    )
                                );
                            }}
                        />
                    ))}
                </div>
            )}

            <DetailModal data={modal} onClose={() => setModal(null)} />
        </>
    );
}
