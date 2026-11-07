import { useContext, useEffect, useState } from 'react';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

interface Props { url: string; label: string; onClose?: () => void; }

/** Automatically loads only validated public SoundCloud tracks, never audio autoplay. */
export default function SoundCloudPlayer({ url, ...props }: Props) {
    const canonical = soundCloudTrackUrl(url);
    // The keyed child resets status/timers when a recording changes under the same content ID.
    return canonical ? <TrackPlayer key={canonical} url={canonical} {...props} /> : null;
}

function TrackPlayer({ url, label, onClose }: Props) {
    const { languageProperties } = useContext(LanguageContext);
    const copy = messages[languageProperties.localeName === 'ar' ? 'ar' : 'en'];
    const [state, setState] = useState<'loading' | 'opened' | 'slow' | 'error'>('loading');

    useEffect(() => {
        if (state !== 'loading') return;
        const timeout = window.setTimeout(() => setState('slow'), 12000);
        return () => window.clearTimeout(timeout);
    }, [state]);

    return <div className="soundcloud-player">
        {onClose && <div className="soundcloud-player-actions">
            <button type="button" onClick={onClose}>{copy.close}</button>
        </div>}
        <iframe className="soundcloud-player-frame" height="166" width="100%"
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
