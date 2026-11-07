import { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { LanguageContext } from '../LanguageContext';
import MainPaper, { Size } from './MainPaper';
import { ReactComponent as SoundCloudIcon } from '../images/soundcloud.svg';
import { soundCloudPrototypeCopy } from './SoundCloudPrototypeCopy';
import { soundCloudTrackUrl, soundCloudEmbedUrl } from './SoundCloudPrototypeUrl';
import './SoundCloudPrototype.css';

/** Local review only. App excludes this module and route from production builds. */
export default function SoundCloudPrototypePage() {
    const { languageProperties } = useContext(LanguageContext);
    const copy = soundCloudPrototypeCopy[languageProperties.localeName === 'ar' ? 'ar' : 'en'];
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');
    const [invalid, setInvalid] = useState(false);
    const [active, setActive] = useState<{ url: string; label: string; attempt: number }>();
    const [frameState, setFrameState] = useState<'loading' | 'opened' | 'slow'>('loading');
    const input = useRef<HTMLInputElement>(null);
    const attempt = useRef(0);

    useEffect(() => {
        const previous = document.title;
        document.title = `${copy.title} - hazzat.com`;
        return () => { document.title = previous; };
    }, [copy.title]);

    useEffect(() => {
        if (!active || frameState !== 'loading') return;
        const timeout = window.setTimeout(() => setFrameState('slow'), 12000);
        return () => window.clearTimeout(timeout);
    }, [active, frameState]);

    function load(event: FormEvent) {
        event.preventDefault();
        const canonical = soundCloudTrackUrl(url);
        if (!canonical) {
            setInvalid(true);
            input.current?.focus();
            return;
        }
        setInvalid(false);
        setFrameState('loading');
        setActive({ url: canonical, label: label.trim() || copy.recording, attempt: ++attempt.current });
    }

    function close() {
        setActive(undefined); // Removing the iframe also stops its playback.
        setFrameState('loading');
        input.current?.focus();
    }

    function retry() {
        setFrameState('loading');
        setActive(value => value ? { ...value, attempt: ++attempt.current } : value);
    }

    return <MainPaper size={Size.Wide}>
        <section className="soundcloud-prototype" aria-labelledby="soundcloud-prototype-title">
            <p className="soundcloud-prototype-badge">{copy.badge}</p>
            <h1 id="soundcloud-prototype-title" className="pageTitle">{copy.title}</h1>
            <p className="soundcloud-prototype-intro">{copy.intro}</p>
            <div className="soundcloud-prototype-notice">{copy.scope}</div>

            <form onSubmit={load} noValidate className="soundcloud-prototype-form">
                <label htmlFor="soundcloud-track-url">{copy.urlLabel}</label>
                <input ref={input} id="soundcloud-track-url" type="url" inputMode="url" dir="ltr"
                    value={url} onChange={event => { setUrl(event.target.value); setInvalid(false); }}
                    placeholder="https://soundcloud.com/artist/track" autoComplete="off" spellCheck={false}
                    maxLength={2048} aria-invalid={invalid} aria-describedby={`soundcloud-url-help${invalid ? ' soundcloud-url-error' : ''}`} />
                <p id="soundcloud-url-help" className="soundcloud-prototype-help">{copy.urlHelp}</p>
                {invalid && <p id="soundcloud-url-error" className="soundcloud-prototype-error" role="alert">{copy.invalid}</p>}
                <div className="soundcloud-prototype-example">
                    <button type="button" onClick={() => {
                        setUrl('https://soundcloud.com/forss/flickermood');
                        setLabel(copy.demoLabel);
                        setInvalid(false);
                    }}>{copy.useDemo}</button>
                    <span>{copy.demoHint}</span>
                </div>
                <label htmlFor="soundcloud-recording-label">{copy.labelLabel}</label>
                <input id="soundcloud-recording-label" value={label} onChange={event => setLabel(event.target.value)}
                    maxLength={120} placeholder={copy.labelPlaceholder} />
                <p className="soundcloud-prototype-privacy">{copy.privacy}</p>
                <button type="submit" className="soundcloud-prototype-load">{active ? copy.replace : copy.load}</button>
            </form>

            <section className="soundcloud-prototype-card" aria-labelledby="soundcloud-recording-heading">
                <div className="soundcloud-prototype-card-heading">
                    <SoundCloudIcon aria-hidden="true" focusable="false" />
                    <div><p>{copy.provider}</p><h2 id="soundcloud-recording-heading">{active?.label || copy.emptyTitle}</h2></div>
                </div>
                {active ? <>
                    <iframe key={active.attempt} className="soundcloud-prototype-frame" height="166" width="100%"
                        title={`${copy.playerTitle}: ${active.label}`} src={soundCloudEmbedUrl(active.url)}
                        allow="autoplay" referrerPolicy="no-referrer"
                        onLoad={() => setFrameState('opened')} />
                    <p className="soundcloud-prototype-status" role="status">
                        {frameState === 'loading' ? copy.loading : frameState === 'slow' ? copy.slow : copy.opened}
                    </p>
                    <div className="soundcloud-prototype-actions">
                        <a href={active.url} target="_blank" rel="noopener noreferrer">{copy.open}</a>
                        <button type="button" onClick={retry}>{copy.retry}</button>
                        <button type="button" onClick={close}>{copy.close}</button>
                    </div>
                </> : <div className="soundcloud-prototype-empty">
                    <p>{copy.empty}</p><p>{copy.noRequests}</p>
                </div>}
            </section>
            <p className="soundcloud-prototype-footnote">{copy.terms}</p>
        </section>
    </MainPaper>;
}
