import type { Metadata } from "next";
import Sidebar from "@/components/ui/dashboard/Sidebar";

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
        <div className="flex min-h-screen bg-linear-to-br from-[#716f49] to-[#1f321c]">
            <Sidebar />
            <main className="w-full p-6 pb-24 lg:pb-6">
                {children}
            </main>
        </div>
    );
}