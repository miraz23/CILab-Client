export type ReceivedRequestStatus = "pending" | "accepted" | "declined" | "expired" | "revoked";
export type SentRequestStatus = ReceivedRequestStatus | "revoked";

export interface ReceivedRequest {
    id: string;
    fromUser: {
        id: string;
        name: string;
        email: string;
        role: string;
        institution: string;
    };
    shareLink: string;
    message?: string;
    expiresAt?: string;
    status: ReceivedRequestStatus;
    createdAt: string;
    updatedAt: string;
    paper?: {
        url: string;
        originalFilename?: string;
        uploadedAt?: string;
    };
}

export interface SentRequest {
    id: string;
    toUser: {
        id: string;
        name: string;
        email: string;
        role: string;
        institution: string;
    };
    shareLink: string;
    message?: string;
    expiresAt?: string;
    status: SentRequestStatus;
    createdAt: string;
    updatedAt: string;
    decidedAt?: string;
    paper?: ReceivedRequest["paper"];
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

function getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function parseResponse(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || "Access request operation failed.");
    }
    return data;
}

export async function createAccessRequest(payload: {
    shareLink: string;
    userIds: string[];
    message?: string;
    expiresAt?: string;
}) {
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const response = await fetch(`${SERVER_URL}/api/access-requests`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}

export async function fetchReceivedRequests(): Promise<ReceivedRequest[]> {
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const response = await fetch(`${SERVER_URL}/api/access-requests/received`, {
        headers: getHeaders(),
        credentials: "include",
    });
    const data = await parseResponse(response);
    return data.requests ?? [];
}

export async function uploadReceivedPaper(requestId: string, file: File) {
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("paper", file);
    const response = await fetch(`${SERVER_URL}/api/access-requests/${requestId}/paper`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData,
    });
    const data = await parseResponse(response);
    return {
        paper: data.paper as ReceivedRequest["paper"],
        status: data.status as ReceivedRequestStatus,
    };
}

export async function fetchSentRequests(): Promise<SentRequest[]> {
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const response = await fetch(`${SERVER_URL}/api/access-requests/sent`, {
        headers: getHeaders(),
        credentials: "include",
    });
    const data = await parseResponse(response);
    return data.requests ?? [];
}

export async function updateAccessRequest(
    requestId: string,
    status: "accepted" | "declined" | "revoked"
) {
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const response = await fetch(`${SERVER_URL}/api/access-requests/${requestId}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ status }),
    });
    return parseResponse(response);
}

export async function updateSentAccessRequest(
    requestId: string,
    payload: { shareLink: string; message?: string; expiresAt?: string }
) {
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");

    const response = await fetch(`${SERVER_URL}/api/access-requests/${requestId}`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
