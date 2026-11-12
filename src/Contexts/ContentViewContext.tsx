import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { entityViewEvents, formatViewEvents, languageViewEvents, ReaderFormat, trackAnalyticsEvent, ViewType } from '../analytics';
import { serializeContentLanguages } from '../ContentLanguages';
import { UserSettingsContext } from './UserSettingsContext';

export interface ContentView {
    view_type: ViewType;
    season_id: string;
    service_id?: string;
    hymn_id?: string;
}
export type ReaderContentState = 'available' | 'no_selected_language_content' | 'empty';
type ReaderDetails = { content_format: ReaderFormat; content_state: Exclude<ReaderContentState, 'empty'> };
const ContentViewContext = createContext<(view: ContentView, reader?: ReaderDetails) => void>(() => {});
export const useContentView = () => useContext(ContentViewContext);

/** Each navigation has one primary entity view and independent format/language facets. */
export function ContentViewProvider({ children }: React.PropsWithChildren) {
    const { pathname } = useLocation();
    const { userSettings } = useContext(UserSettingsContext);
    // Query/hash edits (including interface language) are not new content views.
    const path = pathname.toLowerCase().replace(/\/+$/, '');
    const visit = useMemo(() => ({ path, entityReported: false, formatReported: false, languageReported: false, active: false }), [path]);
    useLayoutEffect(() => {
        visit.active = true;
        return () => { visit.active = false; };
    }, [visit]);
    const combination = serializeContentLanguages(userSettings.contentLanguages);
    const report = useCallback((view: ContentView, reader?: ReaderDetails) => {
        if (!visit.active || (view.view_type === 'hymn' && !reader)) return;
        const parameters: Record<string, string> = { event_category: 'Engagement', view_type: view.view_type, season_id: view.season_id };
        if (view.service_id) parameters.service_id = view.service_id;
        if (view.hymn_id) parameters.hymn_id = view.hymn_id;
        if (reader) Object.assign(parameters, reader, { content_languages: combination });
        // Only loaded content counts as a reader entity/format view. The first
        // filtered-empty selection is still measurable through its language facet.
        if (!reader || reader.content_state === 'available') {
            if (!visit.entityReported) {
                visit.entityReported = true;
                trackAnalyticsEvent(entityViewEvents[view.view_type], parameters);
            }
            if (reader && !visit.formatReported) {
                visit.formatReported = true;
                trackAnalyticsEvent(formatViewEvents[reader.content_format], parameters);
            }
        }
        if (reader && !visit.languageReported) {
            visit.languageReported = true;
            trackAnalyticsEvent(languageViewEvents[combination as keyof typeof languageViewEvents], parameters);
        }
    }, [visit, combination]);
    return <ContentViewContext.Provider value={report}>{children}</ContentViewContext.Provider>;
}

/** Mount only after the current landing catalog has loaded and validated. */
export function ContentLandingView({ view }: { view: ContentView }) {
    const report = useContentView();
    const { view_type, season_id, service_id, hymn_id } = view;
    useEffect(() => { report({ view_type, season_id, service_id, hymn_id }); }, [report, view_type, season_id, service_id, hymn_id]);
    return null;
}
