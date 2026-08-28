"use client";

import ReceivedRequests from "@/components/dashboard/paper-access/received-requests/ReceivedRequests";


export default function AccessRequestsPage() {
    return (
        <div className="w-[95%] mx-auto py-5">
            <ReceivedRequests />
        </div>
    );
}