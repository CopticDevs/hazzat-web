declare global {
    interface Window {
        onYouTubeIframeAPIReady: (() => void) | undefined;
        YT: {
            Player: new (elementId: string, options: YT.PlayerOptions) => YT.Player;
        };
    }
}

declare namespace YT {
    interface PlayerOptions {
        height?: number;
        width?: number;
        videoId: string;
        events?: PlayerEvents;
    }

    interface PlayerEvents {
        onReady?: (event: PlayerEvent) => void;
    }

    interface PlayerEvent {
        target: Player;
    }

    interface Player {
        playVideo: () => void;
        destroy: () => void;
    }
}
