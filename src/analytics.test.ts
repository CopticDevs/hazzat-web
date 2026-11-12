import { AnalyticsEvent, entityViewEvents, formatViewEvents, languageViewEvents, trackAnalyticsEvent } from './analytics';

const originalGtag = window.gtag;
afterEach(() => { window.gtag = originalGtag; });
const names: AnalyticsEvent[] = [...Object.values(entityViewEvents), ...Object.values(formatViewEvents), ...Object.values(languageViewEvents),
    'booklet_generated', 'change_content_languages', 'change_nav_lang', 'change_text_color', 'change_hazzat_color', 'change_text_size', 'button_click'];

test('the complete fixed taxonomy has 25 distinct GA-compatible names, with no legacy generic content_view', () => {
    expect(new Set(names).size).toBe(25);
    expect(names).not.toContain('content_view');
    names.forEach(name => expect(name).toMatch(/^[a-z][a-z0-9_]{0,39}$/));
    expect(Object.keys(entityViewEvents)).toHaveLength(3);
    expect(Object.keys(formatViewEvents)).toHaveLength(7);
    expect(Object.keys(languageViewEvents)).toEqual(['en', 'cop', 'ar', 'en+cop', 'en+ar', 'cop+ar', 'en+cop+ar', 'none']);
});

test.each(names)('sends %s unchanged through the existing tag', name => {
    window.gtag = jest.fn();
    const parameters = { event_category: 'Engagement', content_languages: 'en+cop+ar' };
    trackAnalyticsEvent(name, parameters);
    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith('event', name, parameters);
});

test.each(['missing', 'non-callable', 'throwing'])('all new and retained events remain optional with %s tracking', mode => {
    if (mode === 'missing') delete window.gtag;
    else if (mode === 'non-callable') window.gtag = {};
    else window.gtag = () => { throw new Error('Blocked'); };
    names.forEach(name => expect(() => trackAnalyticsEvent(name, { event_category: 'Engagement' })).not.toThrow());
});
