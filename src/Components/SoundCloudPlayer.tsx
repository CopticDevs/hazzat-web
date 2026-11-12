import { useContext, useEffect, useRef, useState } from 'react';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { trackAnalyticsEvent } from '../analytics';
import { serializeContentLanguages } from '../ContentLanguages';
import { ContentView, useRecordingStartGuard } from '../Contexts/ContentViewContext';
import { UserSettingsContext } from '../Contexts/UserSettingsContext';
import { loadSoundCloudWidget, SoundCloudWidget } from './SoundCloudWidget';
import { LanguageContext } from '../LanguageContext';
import { soundCloudEmbedUrl, soundCloudTrackUrl } from './SoundCloudUrl';
import './SoundCloudPlayer.css';

const messages = {
    en: {
        player: 'SoundCloud player',
        loading: 'Loading the SoundCloud frame…', slow: 'The frame is taking longer to load. You can open the track on SoundCloud.',
        error: 'The SoundCloud player could not be loaded.',
        open: 'Open on SoundCloud', newTab: '(opens in a new tab)', close: 'Close player',
    },
    ar: {
        player: 'مشغّل SoundCloud',
        loading: 'جارٍ تحميل إطار SoundCloud…', slow: 'يستغرق تحميل الإطار وقتاً أطول. يمكنك فتح التسجيل على SoundCloud.',
        error: 'تعذّر تحميل مشغّل SoundCloud.',
        open: 'فتح على SoundCloud', newTab: '(يفتح في علامة تبويب جديدة)', close: 'إغلاق المشغّل',
    },
};

export interface AudioAnalytics { view: ContentView; variationId: string }
interface Props { url: string; label: string; onClose?: () => void; analytics?: AudioAnalytics }

/** Automatically loads only validated public SoundCloud tracks, never audio autoplay. */
export default function SoundCloudPlayer({ url, ...props }: Props) {
    const canonical = soundCloudTrackUrl(url);
    // The keyed child resets status/timers when a recording changes under the same content ID.
    return canonical ? <TrackPlayer key={canonical} url={canonical} {...props} /> : null;
}

function TrackPlayer({ url, label, onClose, analytics }: Props) {
    const { languageProperties } = useContext(LanguageContext);
    const copy = messages[languageProperties.localeName === 'ar' ? 'ar' : 'en'];
    const [state, setState] = useState<'loading' | 'opened' | 'slow' | 'error'>('loading');

    const frame = useRef<HTMLIFrameElement>(null);
    const { userSettings } = useContext(UserSettingsContext);
    const latest = useRef({ analytics, combination: serializeContentLanguages(userSettings.contentLanguages) });
    latest.current = { analytics, combination: serializeContentLanguages(userSettings.contentLanguages) };
    const started = useRef(false);
    const firstRecordingStart = useRecordingStartGuard();
    const observePlayback = !!analytics;

    useEffect(() => {
        // Standalone/local preview players have no catalog context and send no analytics.
        if (!observePlayback || !frame.current) return;
        let active = true;
        let widget: SoundCloudWidget | undefined;
        let playEvent: string | undefined;
        const iframe = frame.current;
        loadSoundCloudWidget().then(createWidget => {
            if (!active || !createWidget) return;
            try {
                widget = createWidget(iframe);
                playEvent = createWidget.Events.PLAY;
                widget.bind(playEvent, () => {
                    // Only the official iframe-specific PLAY callback counts. Frame load,
                    // READY, resume, duplicated callbacks and stale listeners do not.
                    const current = latest.current;
                    if (!active || !current.analytics) return;
                    const { view, variationId } = current.analytics;
                    // The shared visit survives interface-language/feed remounts. The URL
                    // stays local and only distinguishes changed recordings under one ID.
                    const identity = JSON.stringify([view.season_id, view.service_id, view.hymn_id, variationId, url]);
                    if (firstRecordingStart ? !firstRecordingStart(identity) : started.current) return;
                    started.current = true;
                    const parameters: Record<string, string> = {
                        event_category: 'Engagement', audio_provider: 'soundcloud', view_type: view.view_type,
                        season_id: view.season_id, variation_id: variationId, content_format: 'audio',
                        content_languages: current.combination
                    };
                    if (view.service_id) parameters.service_id = view.service_id;
                    if (view.hymn_id) parameters.hymn_id = view.hymn_id;
                    trackAnalyticsEvent('audio_start', parameters);
                });
            } catch { /* Optional observation must never interfere with the player. */ }
        }).catch(() => { /* SDK failure does not prevent iframe playback. */ });
        return () => {
            active = false;
            try { if (widget && playEvent) widget.unbind(playEvent); } catch { /* Best-effort SDK cleanup. */ }
        };
    }, [observePlayback, firstRecordingStart, url]);


    useEffect(() => {
        if (state !== 'loading') return;
        const timeout = window.setTimeout(() => setState('slow'), 12000);
        return () => window.clearTimeout(timeout);
    }, [state]);

    return <div className="soundcloud-player">
        {onClose && <div className="soundcloud-player-actions">
            <button type="button" onClick={onClose}>{copy.close}</button>
        </div>}
        <iframe ref={frame} className="soundcloud-player-frame" height="166" width="100%"
            title={`${copy.player}: ${label}`} src={soundCloudEmbedUrl(url)}
            allow="autoplay" referrerPolicy="no-referrer"
            onLoad={() => setState('opened')} onErrorCapture={() => setState('error')} />
        {state !== 'opened' && <p className={state === 'loading' ? 'visually-hidden' : 'soundcloud-player-status'} role="status">
            {state === 'loading' ? copy.loading : state === 'slow' ? copy.slow : copy.error}
        </p>}
        {(state === 'slow' || state === 'error') && <div className="soundcloud-player-actions">
            <a className="soundcloud-player-external-link" href={url} target="_blank" rel="noopener noreferrer">
                <span>{copy.open}</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" focusable="false" />
                <span className="visually-hidden"> {copy.newTab}</span>
            </a>
        </div>}
    </div>;
}
