import { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

interface IProps {
    musicXml: string;
}

function MusicXmlScore(props: IProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function renderScore() {
            if (!containerRef.current) {
                return;
            }

            setError(null);
            containerRef.current.innerHTML = "";

            try {
                const osmd = new OpenSheetMusicDisplay(containerRef.current, {
                    autoResize: true,
                    backend: "svg",
                    drawTitle: true
                });
                osmd.Zoom = 0.9;
                await osmd.load(props.musicXml);

                if (cancelled) {
                    return;
                }

                osmd.render();
                osmdRef.current = osmd;
            } catch (ex) {
                if (!cancelled) {
                    setError(ex instanceof Error ? ex.message : "Unable to render musical notes.");
                }
            }
        }

        renderScore();

        return () => {
            cancelled = true;
            osmdRef.current?.clear();
        };
    }, [props.musicXml]);

    return (
        <div className="musicXmlScoreWrap">
            {error && <div className="musicXmlScoreError">{error}</div>}
            <div ref={containerRef} className="musicXmlScore" />
        </div>
    );
}

export default MusicXmlScore;
