"use client";

import AccessRequestsForm from "@/components/dashboard/user/paper-access/access-requests/AccessRequestsForm";
import SentRequests from "@/components/dashboard/user/paper-access/access-requests/SentRequests";

export default function AccessRequestsPage() {
    return (
        <div className="w-[95%] mx-auto py-5">
            <div className="space-y-7">
                <AccessRequestsForm />
                <SentRequests />
            </div>
        </div>
    );
}