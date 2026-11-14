// app/terms/page.tsx
import type { Metadata } from "next";
import TermsSection from "@/components/terms/TermsSection";

export const metadata: Metadata = {
    title: "Terms & Conditions | Computational Intelligence Lab",
    description:
        "The terms for using the Computational Intelligence Lab platform: accounts, uploads, paper requests, copyright and acceptable use.",
};

export default function TermsPage() {
    return <TermsSection />;
}
