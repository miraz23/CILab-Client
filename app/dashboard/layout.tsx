import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Computational Intelligence Lab",
    description: "Manage your research profile in the Computational Intelligence Lab.",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="min-h-screen bg-[#F1F5F9]">
            {children}
        </main>
    );
}