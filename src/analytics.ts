/** Reuse the site's configured tag and consent controls. Never bypass them or retry. */
export function trackAnalyticsEvent(
    eventName: 'content_view' | 'change_content_languages' | 'booklet_generated',
    parameters: Record<string, string>
): void {
    try {
        if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
    } catch {
        // Analytics is optional; blocked or broken tracking must not affect the reader.
    }
}

export const readerFormats: Record<string, string | undefined> = {
    '1': 'text', '2': 'hazzat', '3': 'vertical_hazzat', '4': 'musical_notes',
    '5': 'audio', '6': 'video', '7': 'information'
};
