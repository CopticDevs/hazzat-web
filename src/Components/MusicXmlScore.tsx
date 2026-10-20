import { useContext, useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { AppSettings } from "../AppSettings";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import "./Content.css";

interface IProps {
    musicXml: string;
}

function MusicXmlScore(props: IProps) {
    const { userSettings } = useContext(UserSettingsContext);
    const requestedSize = parseFloat(userSettings.englishFontSize);
    const fontSize = Math.min(AppSettings.maxContentTextSize, Math.max(AppSettings.minContentTextSize, Number.isFinite(requestedSize) ? requestedSize : 18));
    const fontSizeRef = useRef(fontSize);
    fontSizeRef.current = fontSize;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const redrawRef = useRef<(() => void) | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [heading, setHeading] = useState({ title: "", subtitle: "" });

    useEffect(() => {
        let cancelled = false;
        let loaded = false;
        let osmd: OpenSheetMusicDisplay | undefined;
        let frame: number | undefined;
        const container = containerRef.current;
        if (!container) return;
        let width = container.clientWidth;

        const redraw = () => {
            frame = undefined;
            if (cancelled || !loaded || !osmd || !container.clientWidth) return;
            try {
                // Re-engrave at the available width; scaling the SVG with CSS would
                // shrink the entire page instead of reflowing readable notation.
                const baseZoom = Math.min(0.9, Math.max(0.5, container.clientWidth / 800));
                osmd.Zoom = baseZoom * fontSizeRef.current / 18;
                osmd.render();
            } catch (ex) {
                setError(ex instanceof Error ? ex.message : "Unable to render musical notes.");
            }
        };
        const requestRedraw = () => {
            if (!cancelled && frame === undefined) frame = window.requestAnimationFrame(redraw);
        };
        redrawRef.current = requestRedraw;
        const resized = () => {
            if (container.clientWidth !== width) {
                width = container.clientWidth;
                requestRedraw();
            }
        };
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resized) : undefined;
        observer?.observe(container);
        if (!observer) window.addEventListener("resize", resized);

        async function renderScore() {
            if (!container) return;
            setError(null);
            setHeading({ title: "", subtitle: "" });
            container.innerHTML = "";

            try {
                osmd = new OpenSheetMusicDisplay(container, {
                    autoResize: false,
                    backend: "svg",
                    drawTitle: false,
                    drawSubtitle: false
                });
                await osmd.load(props.musicXml);

                if (cancelled) {
                    return;
                }

                setHeading({ title: osmd.Sheet.TitleString || "", subtitle: osmd.Sheet.SubtitleString || "" });
                loaded = true;
                requestRedraw();
            } catch (ex) {
                if (!cancelled) {
                    setError(ex instanceof Error ? ex.message : "Unable to render musical notes.");
                }
            }
        }

        renderScore();

        return () => {
            cancelled = true;
            observer?.disconnect();
            if (!observer) window.removeEventListener("resize", resized);
            if (frame !== undefined) window.cancelAnimationFrame(frame);
            if (redrawRef.current === requestRedraw) redrawRef.current = null;
            osmd?.clear();
        };
    }, [props.musicXml]);

    useEffect(() => { redrawRef.current?.(); }, [fontSize]);

    return (
        <div className="musicXmlScoreWrap" style={{ fontSize }}>
            {error && <div className="musicXmlScoreError">{error}</div>}
            {!error && heading.title && <h3 className="musicXmlScoreTitle" dir="auto">{heading.title}</h3>}
            {!error && heading.subtitle && <p className="musicXmlScoreSubtitle" dir="auto">{heading.subtitle}</p>}
            <div ref={containerRef} className="musicXmlScore" />
        </div>
    );
}

export default MusicXmlScore;
