"use client";

// components/news/InteractiveBackground.tsx
// Drop-in background for any `relative` section. It tracks the cursor over its parent element:
//  - a soft olive glow follows the pointer (spring-smoothed)
//  - the dot grid brightens in a circle around the pointer
// Nothing renders while the pointer is outside, on touch devices, or when the user prefers reduced motion.

import { useEffect, useRef } from "react";
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from "motion/react";

const DOTS = "radial-gradient(rgba(113,111,73,0.6) 1.2px, transparent 1.2px)";

export default function InteractiveBackground() {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    // raw pointer position (relative to the section) → springs for smooth trailing
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 140, damping: 22, mass: 0.5 });
    const y = useSpring(my, { stiffness: 140, damping: 22, mass: 0.5 });
    const presence = useSpring(0, { stiffness: 100, damping: 22 }); // fades the effect in/out

    useEffect(() => {
        const host = ref.current?.parentElement;
        if (!host || reduce) return;

        const toLocal = (e: PointerEvent) => {
            const r = host.getBoundingClientRect();
            return [e.clientX - r.left, e.clientY - r.top] as const;
        };

        const onEnter = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            const [px, py] = toLocal(e);
            mx.set(px);
            my.set(py);
            x.jump(px); // start under the cursor instead of sliding in from the corner
            y.jump(py);
            presence.set(1);
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            const [px, py] = toLocal(e);
            mx.set(px);
            my.set(py);
            presence.set(1);
        };
        const onLeave = () => presence.set(0);

        host.addEventListener("pointerenter", onEnter);
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
        return () => {
            host.removeEventListener("pointerenter", onEnter);
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerleave", onLeave);
        };
    }, [reduce, mx, my, x, y, presence]);

    const glow = useMotionTemplate`radial-gradient(380px circle at ${x}px ${y}px, rgba(163,161,113,0.32), transparent 70%)`;
    const dotMask = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, #000 0%, transparent 100%)`;

    return (
        <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* cursor glow */}
            <motion.div className="absolute inset-0" style={{ background: glow, opacity: presence }} />

            {/* dots that light up around the cursor */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: DOTS,
                    backgroundSize: "24px 24px",
                    maskImage: dotMask,
                    WebkitMaskImage: dotMask,
                    opacity: presence,
                }}
            />
        </div>
    );
}