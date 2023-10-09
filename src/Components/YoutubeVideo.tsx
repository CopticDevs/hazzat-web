import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../AppSettings';

interface YouTubeProps {
    videoId: string;
    width?: number;
    height?: number;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: (() => void) | undefined;
        YT: {
            Player: new (elementId: string, options: YT.PlayerOptions) => YT.Player;
        };
    }
}

const YouTube: React.FC<YouTubeProps> = ({ videoId }) => {
    const playerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scriptTag = document.createElement('script');
        scriptTag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(scriptTag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            const onPlayerReady = (event: YT.PlayerEvent) => {
                if (AppSettings.autoPlayVideo) {
                    event.target.playVideo();
                }
            };

            const player = new window.YT.Player(playerRef.current!.id, {
                videoId,
                events: {
                    onReady: onPlayerReady,
                },
            });

            return () => {
                player.destroy();
            };
        };
    }, [videoId]);

    return (
        <div style={{ position: "relative", width: "100%", height: "0", paddingBottom: "56.25%", textAlign: "center" }}>
            <div id="youtube-player" style={{ position: "absolute", width: "90%", height: "100%", left: "5%", top: 0 }} ref={playerRef} />
        </div>
    );
};

export default YouTube;
