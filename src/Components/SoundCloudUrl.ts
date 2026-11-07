/** Accept public canonical track links only; never pass secrets or arbitrary embeds through. */
export function soundCloudTrackUrl(value: string): string | undefined {
    if (value.length > 2048) return;
    try {
        const url = new URL(value.trim());
        if (url.protocol !== 'https:' || !['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com'].includes(url.hostname)
            || url.username || url.password || url.port) return;
        const segments = url.pathname.replace(/\/$/, '').split('/').slice(1);
        if (segments.length !== 2 || segments.some(part => !/^[a-zA-Z0-9_-]+$/.test(part))) return;
        if (['discover', 'you', 'stream', 'upload', 'search', 'pages', 'settings', 'notifications', 'messages'].includes(segments[0].toLowerCase())) return;
        if (Array.from(url.searchParams.keys()).some(key => /secret|token/i.test(key))) return;
        // Tracking/query parameters and fragments are deliberately not shared with the player.
        return `https://soundcloud.com/${segments.join('/')}`;
    } catch { return; }
}

export function soundCloudEmbedUrl(trackUrl: string): string {
    const canonical = soundCloudTrackUrl(trackUrl);
    if (!canonical) throw new Error('A public SoundCloud track link is required');
    const params = new URLSearchParams({ url: canonical, auto_play: 'false', color: '#9b4f24', visual: 'false' });
    return `https://w.soundcloud.com/player/?${params.toString()}`;
}
