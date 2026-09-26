import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_MIN_SKELETON_MS = 600;

export function useDashboardRefresh(
    minSkeletonMs: number = DEFAULT_MIN_SKELETON_MS
) {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        []
    );

    const refresh = useCallback(() => {
        if (timerRef.current) return;

        setIsRefreshing(true);
        router.refresh();

        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            setIsRefreshing(false);
        }, minSkeletonMs);
    }, [minSkeletonMs, router]);

    return { isRefreshing, refresh };
}
