import Sidebar from "@/components/dashboard/Sidebar";
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
        <div className="flex min-h-screen bg-[#505837]">
            <Sidebar />
            <main className="w-full p-6 pb-24 lg:pb-6">
                {children}
            </main>
        </div>
    );
}