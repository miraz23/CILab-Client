// app/lectures/reference-seminar-schedule/page.tsx

import SeminarScheduleSection from "@/components/lectures/SeminarScheduleSection";
import type { Seminar } from "@/components/lectures/SeminarScheduleSection";

// SAMPLE DATA
const sample: Seminar[] = [
    {
        id: "sem1",
        series: 24,
        title: "Graph Neural Networks for Molecular Property Prediction",
        speaker: "Dr. Ayesha Rahman",
        affiliation: "Department of CSE, BUET",
        date: "2026-10-24",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "An overview of message-passing architectures for chemistry, covering benchmark datasets, transfer learning across molecular tasks and practical tips for handling sparse supervision.",
    },
    {
        id: "sem2",
        series: 25,
        title: "Privacy-Preserving Federated Learning in Healthcare",
        speaker: "Prof. Kenji Nakamura",
        affiliation: "Osaka Prefecture University",
        date: "2026-10-31",
        time: "16:00",
        venue: "Online - link shared by email",
        summary:
            "How hospitals can train shared models without exchanging patient data: secure aggregation, differential privacy budgets and lessons from multi-site clinical deployments.",
    },
    {
        id: "sem3",
        series: 26,
        title: "Large Language Models for Low-Resource Languages",
        speaker: "Dr. Sanjana Iyer",
        affiliation: "IIIT Hyderabad",
        date: "2026-11-07",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Data-efficient pre-training, cross-lingual transfer and evaluation pitfalls for languages with limited corpora, with examples from Indic and African language families.",
    },
    {
        id: "sem4",
        series: 27,
        title: "Reinforcement Learning for Sustainable Energy Grids",
        speaker: "Dr. Mahmud Hasan",
        affiliation: "ABB Global Energy Research",
        date: "2026-11-14",
        time: "14:30",
        venue: "Auditorium, Block A",
        summary:
            "Applying offline reinforcement learning to demand-response scheduling, and how constraint handling keeps learned policies safe for real grid operation.",
    },
    {
        id: "sem5",
        series: 28,
        title: "Explainable AI in Clinical Decision Support",
        speaker: "Prof. Elena Petrova",
        affiliation: "Technical University of Munich",
        date: "2026-11-21",
        time: "17:00",
        venue: "Online - Microsoft Teams",
        summary:
            "Which explanation formats clinicians actually trust, a comparison of attribution methods on hospital benchmarks, and regulatory considerations under the EU AI Act.",
    },
    {
        id: "sem6",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem7",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem8",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem9",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem10",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem11",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem12",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
    {
        id: "sem13",
        series: 29,
        title: "Efficient Vision Transformers on Edge Devices",
        speaker: "Tanvir Ahmed",
        affiliation: "Computational Intelligence Lab",
        date: "2026-11-28",
        time: "15:00",
        venue: "Seminar Hall, Block B",
        summary:
            "Quantization-aware training, token pruning and distillation recipes that bring transformer-based perception to embedded hardware under tight power budgets.",
    },
];

export default async function ReferenceSeminarSchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ seminar?: string | string[] | undefined }>;
}) {
    const { seminar } = await searchParams;
    const activeSeminarId = typeof seminar === "string" ? seminar : undefined;
    const seminars = sample;

    return (
        <main>
            <SeminarScheduleSection seminars={seminars} activeSeminarId={activeSeminarId} />
        </main>
    );
}
