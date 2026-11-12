export type ViewType = 'season' | 'service' | 'hymn';
export type ReaderFormat = 'text' | 'hazzat' | 'vertical_hazzat' | 'musical_notes' | 'audio' | 'video' | 'information';

export const entityViewEvents = { season: 'season_view', service: 'service_view', hymn: 'hymn_view' } as const;
export const formatViewEvents = {
    text: 'text_view', hazzat: 'hazzat_view', vertical_hazzat: 'vertical_hazzat_view', musical_notes: 'musical_notes_view',
    audio: 'audio_view', video: 'video_view', information: 'information_view'
} as const;
export const languageViewEvents = {
    en: 'content_languages_en_view', cop: 'content_languages_cop_view', ar: 'content_languages_ar_view',
    'en+cop': 'content_languages_en_cop_view', 'en+ar': 'content_languages_en_ar_view', 'cop+ar': 'content_languages_cop_ar_view',
    'en+cop+ar': 'content_languages_en_cop_ar_view', none: 'content_languages_none_view'
} as const;
export type EntityViewEvent = typeof entityViewEvents[ViewType];
export type FormatViewEvent = typeof formatViewEvents[ReaderFormat];
export type LanguageViewEvent = typeof languageViewEvents[keyof typeof languageViewEvents];
export type AnalyticsEvent = EntityViewEvent | FormatViewEvent | LanguageViewEvent | 'change_content_languages' | 'booklet_generated'
    | 'change_nav_lang' | 'change_text_color' | 'change_hazzat_color' | 'change_text_size' | 'button_click';

/** Reuse the site's configured tag and consent controls. Never bypass them or retry. */
export function trackAnalyticsEvent(eventName: AnalyticsEvent, parameters: Record<string, string>): void {
    try {
        if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
    } catch {
        // Analytics is optional; blocked or broken tracking must not affect the app.
    }
}

export const readerFormats: Record<string, ReaderFormat | undefined> = {
    '1': 'text', '2': 'hazzat', '3': 'vertical_hazzat', '4': 'musical_notes',
    '5': 'audio', '6': 'video', '7': 'information'
};
