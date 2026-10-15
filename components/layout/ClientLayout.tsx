"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { usePathname } from "next/navigation";
import { ToastContainer, Bounce } from "react-toastify";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const hideChrome = pathname.startsWith("/dashboard");

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />

            <header>
                {!hideChrome && <Navbar />}
            </header>

            <main>
                {children}
            </main>

            {!hideChrome && <Footer />}
        </>
    );
}