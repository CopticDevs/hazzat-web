/** Minimal official Widget API surface used for observing playback, never controlling it. */
export interface SoundCloudWidget {
    bind: (event: string, listener: () => void) => void;
    unbind: (event: string) => void;
}
export interface SoundCloudWidgetFactory {
    (frame: HTMLIFrameElement): SoundCloudWidget;
    Events: { PLAY: string };
}
declare global {
    interface Window { SC?: { Widget?: SoundCloudWidgetFactory } }
}
const scriptUrl = 'https://w.soundcloud.com/player/api.js';
let loading: Promise<SoundCloudWidgetFactory | undefined> | undefined;
function factory(): SoundCloudWidgetFactory | undefined {
    const widget = window.SC?.Widget;
    return typeof widget === 'function' && typeof widget.Events?.PLAY === 'string' ? widget : undefined;
}

/** Share one bounded SDK request across active recordings. No key or credentials required. */
export function loadSoundCloudWidget(): Promise<SoundCloudWidgetFactory | undefined> {
    const ready = factory();
    if (ready) return Promise.resolve(ready);
    if (loading) return loading;
    loading = new Promise<SoundCloudWidgetFactory | undefined>(resolve => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.referrerPolicy = 'no-referrer';
        script.dataset.hazzatSoundcloudApi = 'true';
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeout);
            script.removeEventListener('load', finish);
            script.removeEventListener('error', finish);
            const widget = factory();
            if (!widget) script.remove();
            resolve(widget);
        };
        const timeout = window.setTimeout(finish, 15000);
        script.addEventListener('load', finish);
        script.addEventListener('error', finish);
        try { document.head.appendChild(script); } catch { finish(); }
    }).finally(() => { loading = undefined; });
    return loading;
}
