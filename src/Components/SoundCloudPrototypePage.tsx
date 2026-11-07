import { useContext, useEffect, useRef, useState } from 'react';
import { LanguageContext } from '../LanguageContext';
import MainPaper, { Size } from './MainPaper';
import { ReactComponent as SoundCloudIcon } from '../images/soundcloud.svg';
import { soundCloudPrototypeCopy } from './SoundCloudPrototypeCopy';
import { soundCloudTrackUrl } from './SoundCloudUrl';
import SoundCloudPlayer from './SoundCloudPlayer';
import './SoundCloudPrototype.css';

const sampleTrack = 'https://soundcloud.com/coptichazzat/meghalo';

/** Local review only. App excludes this module and route from production builds. */
export default function SoundCloudPrototypePage() {
    const { languageProperties } = useContext(LanguageContext);
    const copy = soundCloudPrototypeCopy[languageProperties.localeName === 'ar' ? 'ar' : 'en'];
    const [url, setUrl] = useState(sampleTrack);
    const [label, setLabel] = useState('');
    const [closed, setClosed] = useState(false);
    const [active, setActive] = useState<{ url: string; attempt: number } | undefined>({ url: sampleTrack, attempt: 0 });
    const input = useRef<HTMLInputElement>(null);
    const attempt = useRef(0);
    const canonical = soundCloudTrackUrl(url);
    const invalid = url.trim() !== '' && !canonical;
    const recordingLabel = label.trim() || (active?.url === sampleTrack ? copy.sampleLabel : copy.recording);

    useEffect(() => {
        const previous = document.title;
        document.title = `${copy.title} - hazzat.com`;
        return () => { document.title = previous; };
    }, [copy.title]);

    useEffect(() => {
        if (!canonical || closed) {
            setActive(undefined);
            return;
        }
        if (active?.url === canonical) return;
        // Wait briefly for typing to settle; only validated public track links reach the frame.
        const timeout = window.setTimeout(() => {
            setActive({ url: canonical, attempt: ++attempt.current });
        }, 500);
        return () => window.clearTimeout(timeout);
    }, [canonical, closed, active?.url]);

    function close() {
        setClosed(true); // Keep it dismissed until the link changes or the sample is restored.
        setActive(undefined); // Removing the iframe also stops its playback.
        input.current?.focus();
    }

    return <MainPaper size={Size.Wide}>
        <section className="soundcloud-prototype" aria-labelledby="soundcloud-prototype-title">
            <p className="soundcloud-prototype-badge">{copy.badge}</p>
            <h1 id="soundcloud-prototype-title" className="pageTitle">{copy.title}</h1>
            <p className="soundcloud-prototype-intro">{copy.intro}</p>
            <div className="soundcloud-prototype-notice">{copy.scope}</div>

            <div className="soundcloud-prototype-form">
                <p className="soundcloud-prototype-privacy">{copy.privacy}</p>
                <label htmlFor="soundcloud-track-url">{copy.urlLabel}</label>
                <input ref={input} id="soundcloud-track-url" type="url" inputMode="url" dir="ltr"
                    value={url} onChange={event => { setUrl(event.target.value); setClosed(false); }}
                    placeholder="https://soundcloud.com/artist/track" autoComplete="off" spellCheck={false}
                    maxLength={2048} aria-invalid={invalid} aria-describedby={`soundcloud-url-help${invalid ? ' soundcloud-url-error' : ''}`} />
                <p id="soundcloud-url-help" className="soundcloud-prototype-help">{copy.urlHelp}</p>
                {invalid && <p id="soundcloud-url-error" className="soundcloud-prototype-error" role="alert">{copy.invalid}</p>}
                <div className="soundcloud-prototype-example">
                    <button type="button" onClick={() => {
                        setUrl(sampleTrack);
                        setLabel('');
                        setClosed(false);
                    }}>{copy.useSample}</button>
                    <span>{copy.sampleHint}</span>
                </div>
                <label htmlFor="soundcloud-recording-label">{copy.labelLabel}</label>
                <input id="soundcloud-recording-label" value={label} onChange={event => setLabel(event.target.value)}
                    maxLength={120} placeholder={copy.labelPlaceholder} />
            </div>

            <section className="soundcloud-prototype-card" aria-labelledby="soundcloud-recording-heading">
                <div className="soundcloud-prototype-card-heading">
                    <SoundCloudIcon aria-hidden="true" focusable="false" />
                    <div><p>{copy.provider}</p><h2 id="soundcloud-recording-heading">{active ? recordingLabel : copy.emptyTitle}</h2></div>
                </div>
                {active ? <SoundCloudPlayer key={active.attempt} url={active.url} label={recordingLabel} onClose={close} /> : <div className="soundcloud-prototype-empty">
                    <p>{copy.empty}</p><p>{copy.noRequests}</p>
                </div>}
            </section>
            <p className="soundcloud-prototype-footnote">{copy.terms}</p>
        </section>
    </MainPaper>;
}
