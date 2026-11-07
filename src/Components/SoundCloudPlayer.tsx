import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../LanguageContext';
import { soundCloudEmbedUrl, soundCloudTrackUrl } from './SoundCloudUrl';
import './SoundCloudPlayer.css';

const messages = {
    en: {
        player: 'SoundCloud player', privacy: 'This player connects to SoundCloud automatically and may use cookies. Audio autoplay is off.',
        loading: 'Loading the SoundCloud frame…', slow: 'The frame is taking longer to load. You can retry or open the track on SoundCloud.',
        opened: 'Use the player’s Play button. If the recording is unavailable, try the SoundCloud link below.',
        open: 'Open on SoundCloud ↗', retry: 'Reload player', close: 'Close player',
    },
    ar: {
        player: 'مشغّل SoundCloud', privacy: 'يتصل هذا المشغّل بـ SoundCloud تلقائياً وقد يستخدم ملفات تعريف الارتباط. التشغيل التلقائي للصوت معطّل.',
        loading: 'جارٍ تحميل إطار SoundCloud…', slow: 'يستغرق تحميل الإطار وقتاً أطول. يمكنك إعادة المحاولة أو فتح التسجيل على SoundCloud.',
        opened: 'استخدم زر التشغيل داخل المشغّل. إذا كان التسجيل غير متاح، جرّب رابط SoundCloud أدناه.',
        open: 'فتح على SoundCloud ↗', retry: 'إعادة تحميل المشغّل', close: 'إغلاق المشغّل',
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
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<'loading' | 'opened' | 'slow'>('loading');

    useEffect(() => {
        if (state !== 'loading') return;
        const timeout = window.setTimeout(() => setState('slow'), 12000);
        return () => window.clearTimeout(timeout);
    }, [attempt, state]);

    return <div className="soundcloud-player">
        <p className="soundcloud-player-privacy">{copy.privacy}</p>
        <iframe key={attempt} className="soundcloud-player-frame" height="166" width="100%"
            title={`${copy.player}: ${label}`} src={soundCloudEmbedUrl(url)}
            allow="autoplay" referrerPolicy="no-referrer"
            onLoad={() => setState('opened')} />
        <p className="soundcloud-player-status" role="status">
            {state === 'loading' ? copy.loading : state === 'slow' ? copy.slow : copy.opened}
        </p>
        <div className="soundcloud-player-actions">
            <a href={url} target="_blank" rel="noopener noreferrer">{copy.open}</a>
            <button type="button" onClick={() => { setState('loading'); setAttempt(value => value + 1); }}>{copy.retry}</button>
            {onClose && <button type="button" onClick={onClose}>{copy.close}</button>}
        </div>
    </div>;
}
