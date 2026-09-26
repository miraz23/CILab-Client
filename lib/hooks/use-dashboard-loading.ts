import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_MIN_SKELETON_MS = 600;

type LoadTask = () => unknown | Promise<unknown>;

export function useDashboardLoading(
    task?: LoadTask,
    { minSkeletonMs = DEFAULT_MIN_SKELETON_MS }: { minSkeletonMs?: number } = {}
) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [runId, setRunId] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const startedAt = Date.now();

        Promise.resolve()
            .then(task)
            .catch((error) => {
                console.error("Dashboard data load failed:", error);
            })
            .finally(() => {
                if (cancelled) return;

                const remaining = Math.max(
                    0,
                    minSkeletonMs - (Date.now() - startedAt)
                );

                timer = setTimeout(() => {
                    if (cancelled) return;

                    setIsLoading(false);
                }, remaining);
            });

        return () => {
            cancelled = true;

            if (timer) clearTimeout(timer);
        };
    }, [runId, task, minSkeletonMs]);

    const refresh = useCallback(() => {
        router.refresh();

        setIsLoading(true);
        setRunId((id) => id + 1);
    }, [router]);

    return { isLoading, refresh };
}
