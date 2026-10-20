import { AppSettings } from "../AppSettings";

interface YouTubeProps { videoId: string; width?: number; height?: number }

/** Each embed has its own frame; multiple alternatives cannot share a player ID. */
export default function YouTube({ videoId }: YouTubeProps) {
    return <div style={{ position: "relative", width: "100%", height: 0, paddingBottom: "56.25%", textAlign: "center" }}>
        <iframe title="YouTube video" src={`https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=${AppSettings.autoPlayVideo ? "1" : "0"}`}
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: "absolute", width: "90%", height: "100%", left: "5%", top: 0, border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>;
}
