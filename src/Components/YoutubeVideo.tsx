import { AppSettings } from "../AppSettings";

interface YouTubeProps { videoId: string; width?: number; height?: number }

/** Each embed has its own frame; multiple alternatives cannot share a player ID. */
export default function YouTube({ videoId }: YouTubeProps) {
    return <div className="youtube-video">
        <iframe title="YouTube video" src={`https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=${AppSettings.autoPlayVideo ? "1" : "0"}`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>;
}
