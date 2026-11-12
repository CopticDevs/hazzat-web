import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { trackAnalyticsEvent } from '../analytics';
import { serializeContentLanguages } from '../ContentLanguages';
import { UserSettingsContext } from './UserSettingsContext';

export interface ContentView {
    view_type: 'season' | 'service' | 'hymn';
    season_id: string;
    service_id?: string;
    hymn_id?: string;
}
export type ReaderContentState = 'available' | 'no_selected_language_content' | 'empty';
type ReaderDetails = { content_format: string; content_state: Exclude<ReaderContentState, 'empty'> };
const ContentViewContext = createContext<(view: ContentView, reader?: ReaderDetails) => void>(() => {});
export const useContentView = () => useContext(ContentViewContext);

/** One counter per pathname visit, shared by every nested reader component. */
export function ContentViewProvider({ children }: React.PropsWithChildren) {
    const { pathname } = useLocation();
    const { userSettings } = useContext(UserSettingsContext);
    // Query/hash edits (including interface language) are not new content views.
    const path = pathname.toLowerCase().replace(/\/+$/, '');
    const visit = useMemo(() => ({ path, reported: false, active: false }), [path]);
    useLayoutEffect(() => {
        visit.active = true;
        return () => { visit.active = false; };
    }, [visit]);
    const combination = serializeContentLanguages(userSettings.contentLanguages);
    const report = useCallback((view: ContentView, reader?: ReaderDetails) => {
        if (!visit.active || visit.reported) return;
        visit.reported = true;
        const parameters: Record<string, string> = { event_category: 'Engagement', view_type: view.view_type, season_id: view.season_id };
        if (view.service_id) parameters.service_id = view.service_id;
        if (view.hymn_id) parameters.hymn_id = view.hymn_id;
        if (reader) Object.assign(parameters, reader, { content_languages: combination });
        trackAnalyticsEvent('content_view', parameters);
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
