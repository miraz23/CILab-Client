import type { User } from "@/lib/types/paper-access/access-request";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function fetchUsers(): Promise<User[]> {
    if (!SERVER_URL) {
        console.warn("NEXT_PUBLIC_SERVER_URL not configured, returning mock users");
        return getMockUsers();
    }

    try {
        const response = await fetch(`${SERVER_URL}/api/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();
        return data.users || data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return getMockUsers();
    }
}

function getMockUsers(): User[] {
    return [
        { id: "1", name: "Dr. Sarah Chen", email: "sarah.chen@university.edu", role: "Professor", institution: "Stanford University" },
        { id: "2", name: "Alex Rivera", email: "alex.rivera@lab.org", role: "PhD Student", institution: "MIT" },
        { id: "3", name: "Priya Sharma", email: "priya.sharma@research.institute", role: "Research Scientist", institution: "Google Research" },
        { id: "4", name: "Marcus Johnson", email: "marcus.j@company.com", role: "AI/ML Engineer", institution: "OpenAI" },
        { id: "5", name: "Dr. Elena Rodriguez", email: "elena.r@university.edu", role: "Associate Professor", institution: "UC Berkeley" },
        { id: "6", name: "James Wilson", email: "j.wilson@lab.org", role: "Postdoctoral Researcher", institution: "Harvard University" },
        { id: "7", name: "Fatima Al-Zahra", email: "fatima.az@institute.org", role: "Research Fellow", institution: "Oxford University" },
        { id: "8", name: "David Kim", email: "david.kim@company.com", role: "Software Engineer", institution: "Anthropic" },
    ];
}