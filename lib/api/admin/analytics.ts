import type { PlatformStats } from "@/lib/types/admin/analytics";
import { adminRequest } from "@/lib/api/admin/client";

export async function fetchPlatformStats(): Promise<PlatformStats> {
    const response = await adminRequest<{ stats?: PlatformStats }>("/api/admin/analytics");
    if (!response.stats) {
        throw new Error("Platform analytics response did not include statistics.");
    }
    return response.stats;
}
