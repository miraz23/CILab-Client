import { cache } from "react";
import type { Metadata } from "next";
import { fetchContributor, type ContributorData } from "@/lib/api/contributors";
import ContributorProfile from "@/components/contributors/ContributorProfile";
import { ResearchShell } from "@/components/research/ResearchShell";

type PageProps = { params: Promise<{ token: string }> };

// cached so generateMetadata and the page share one request
const load = cache(async (token: string): Promise<{ data: ContributorData | null; failed: boolean }> => {
    try {
        return { data: await fetchContributor(token), failed: false };
    } catch {
        return { data: null, failed: true };
    }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { token } = await params;
    const { data } = await load(token);
    if (!data) return { title: "Contributions | Computational Intelligence Lab", robots: { index: false } };
    return {
        title: `${data.profile.name} | Contributions`,
        description: `Research papers and presentations by ${data.profile.name} at the Computational Intelligence Lab.`,
        robots: { index: false },
    };
}

export default async function ContributorPage({ params }: PageProps) {
    const { token } = await params;
    const { data, failed } = await load(token);

    return (
        <ResearchShell>
            {data ? (
                <ContributorProfile data={data} />
            ) : (
                <div className="mx-auto max-w-lg px-4 text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                        {failed ? "Couldn't load this page" : "Link unavailable"}
                    </h1>
                    <p className="mt-3 text-neutral-600">
                        {failed
                            ? "The server could not be reached. Please try again in a moment."
                            : "This link is invalid, or the owner has turned sharing off."}
                    </p>
                </div>
            )}
        </ResearchShell>
    );
}
