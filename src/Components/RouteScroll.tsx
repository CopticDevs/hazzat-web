import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/** New routes start at the reader heading; Back restores the saved reading position. */
export default function RouteScroll() {
    const { key, pathname, hash } = useLocation();
    const action = useNavigationType();
    const positions = useRef(new Map<string, number>());
    useEffect(() => {
        const restoration = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";
        return () => { window.history.scrollRestoration = restoration; };
    }, []);
    useEffect(() => {
        if (hash) return;
        const returning = action === "POP" && positions.current.has(key);
        const target = returning ? positions.current.get(key)! : 0;
        let frame: number;
        let observer: ResizeObserver | undefined;
        // Content may load after navigation; keep restoring only until it can fit.
        const restore = () => {
            window.scrollTo({ top: target, behavior: "auto" });
            if (document.documentElement.scrollHeight - window.innerHeight >= target) observer?.disconnect();
        };
        if (returning && typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(restore); observer.observe(document.body);
        }
        frame = window.requestAnimationFrame(() => {
            restore();
            if (action !== "POP") document.getElementById("main-content")?.focus({ preventScroll: true });
        });
        const stop = () => { observer?.disconnect(); window.cancelAnimationFrame(frame); };
        window.addEventListener("wheel", stop, { once: true });
        window.addEventListener("touchstart", stop, { once: true });
        window.addEventListener("keydown", stop, { once: true });
        const timeout = window.setTimeout(stop, 10000);
        const save = () => positions.current.set(key, window.scrollY);
        window.addEventListener("scroll", save, { passive: true });
        return () => {
            stop(); window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop);
            window.removeEventListener("scroll", save); window.removeEventListener("keydown", stop); window.clearTimeout(timeout);
        };
    }, [key, pathname, hash, action]);
    return null;
}
