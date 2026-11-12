import { useCallback, useContext, useEffect, useState } from 'react';
import { serializeContentLanguages } from '../ContentLanguages';
import { UserSettingsContext } from '../Contexts/UserSettingsContext';
import { readerFormats } from '../analytics';
import { ContentView, ReaderContentState, useContentView } from '../Contexts/ContentViewContext';
import { IVariationInfo } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import Content from './Content';

interface Entry { id: string; title: string; variations: IVariationInfo<any>[] }
interface Props { view: ContentView; formatId: string; entries: Entry[] }

/** A service reader is one view, not one event for every hymn or variation. */
export default function ReaderContents({ view, formatId, entries }: Props) {
    const report = useContentView();
    const { userSettings } = useContext(UserSettingsContext);
    const combination = serializeContentLanguages(userSettings.contentLanguages);
    const [states, setStates] = useState<Record<string, { state: ReaderContentState; combination: string; variations: Entry["variations"] }>>({});
    const onState = useCallback((id: string, variations: Entry["variations"], state: ReaderContentState, selection: string) => {
        setStates(previous => previous[id]?.variations === variations && previous[id]?.state === state && previous[id]?.combination === selection ? previous : { ...previous, [id]: { state, combination: selection, variations } });
    }, []);
    const { view_type, season_id, service_id, hymn_id } = view;
    useEffect(() => {
        const format = readerFormats[formatId];
        if (!format) return;
        const values = entries.map(entry => states[entry.id]?.variations === entry.variations && states[entry.id]?.combination === combination ? states[entry.id].state : undefined);
        // A partial service is available once at least one actual content section is shown.
        // A filtered-empty state waits for all children, so a missing translation in one
        // hymn cannot mask available content in another.
        const state = values.includes('available') ? 'available'
            : values.length && values.every(Boolean) && values.includes('no_selected_language_content') ? 'no_selected_language_content' : undefined;
        if (state) report({ view_type, season_id, service_id, hymn_id }, { content_format: format, content_state: state });
    }, [report, view_type, season_id, service_id, hymn_id, formatId, entries, states, combination]);
    return <>{entries.map(entry => <ReaderEntry key={entry.id} entry={entry} formatId={formatId} onState={onState} />)}</>;
}

function ReaderEntry({ entry, formatId, onState }: { entry: Entry; formatId: string; onState: (id: string, variations: Entry["variations"], state: ReaderContentState, combination: string) => void }) {
    const variationsCallback = useCallback(async () => entry.variations, [entry.variations]);
    const ready = useCallback((state: ReaderContentState, combination: string) => onState(entry.id, entry.variations, state, combination), [onState, entry.id, entry.variations]);
    return <Content formatId={formatId} hymnTitle={entry.title} variationsCallback={variationsCallback} onContentState={ready} />;
}
