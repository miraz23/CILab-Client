// app/about-us/contact-information/page.tsx
import type { Metadata } from "next";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
    title: "Contact Information | Computational Intelligence Lab",
    description: "Find the address, phone, email and opening hours of the Computational Intelligence Lab.",
};

export default function ContactInformationPage() {
    return <ContactSection />;
}