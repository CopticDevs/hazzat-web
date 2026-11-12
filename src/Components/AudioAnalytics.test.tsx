import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ContentViewProvider } from '../Contexts/ContentViewContext';
import { UserSettingProvider, UserSettingsContext } from '../Contexts/UserSettingsContext';
import { ContentLanguage, ContentType } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import { loadSoundCloudWidget, SoundCloudWidgetFactory } from './SoundCloudWidget';
import SoundCloudPlayer, { AudioAnalytics } from './SoundCloudPlayer';
import ReaderContents from './ReaderContents';

jest.mock('./SoundCloudWidget', () => ({ loadSoundCloudWidget: jest.fn() }));
const originalGtag = window.gtag;
const analytics = jest.fn();
const load = loadSoundCloudWidget as jest.MockedFunction<typeof loadSoundCloudWidget>;
const frames: { frame: HTMLIFrameElement; play?: () => void; bind: jest.Mock; unbind: jest.Mock }[] = [];
const context: AudioAnalytics = { view: { view_type: 'hymn', season_id: 'annual', service_id: 'vespers', hymn_id: 'first' }, variationId: 'recording1' };
const url = 'https://soundcloud.com/coptichazzat/meghalo';
let factory: SoundCloudWidgetFactory;
let settings: React.ContextType<typeof UserSettingsContext>;
function Controls() { settings = React.useContext(UserSettingsContext); return null; }
const player = (track = url, info: AudioAnalytics | undefined = context) => <React.StrictMode><UserSettingProvider><Controls />
    <SoundCloudPlayer url={track} label="Private display name" analytics={info} />
</UserSettingProvider></React.StrictMode>;
const starts = () => analytics.mock.calls.filter(call => call[1] === 'audio_start');
beforeEach(() => {
    localStorage.clear(); window.gtag = analytics; analytics.mockClear(); frames.length = 0;
    factory = Object.assign(jest.fn((frame: HTMLIFrameElement) => {
        const record = { frame, play: undefined as (() => void) | undefined, bind: jest.fn(), unbind: jest.fn() };
        record.bind.mockImplementation((event: string, callback: () => void) => { if (event === 'provider-play') record.play = callback; });
        frames.push(record); return record;
    }), { Events: { PLAY: 'provider-play' } });
    load.mockResolvedValue(factory);
});
afterEach(() => { window.gtag = originalGtag; localStorage.clear(); });

it('only real provider PLAY emits one start, with public IDs and the current preference', async () => {
    render(player());
    await waitFor(() => expect(frames).toHaveLength(1));
    const frame = screen.getByTitle('SoundCloud player: Private display name');
    fireEvent.load(frame); fireEvent.error(frame);
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://evil.example', data: { method: 'play' } }));
    expect(starts()).toHaveLength(0);
    act(() => settings.setContentLanguages([ContentLanguage.English]));
    act(() => { frames[0].play?.(); frames[0].play?.(); });
    expect(starts()).toHaveLength(1);
    expect(starts()[0]).toEqual(['event', 'audio_start', {
        event_category: 'Engagement', audio_provider: 'soundcloud', view_type: 'hymn', season_id: 'annual',
        service_id: 'vespers', hymn_id: 'first', variation_id: 'recording1', content_format: 'audio', content_languages: 'en'
    }]);
    expect(JSON.stringify(starts())).not.toMatch(/Private|https|meghalo|currentPosition/);
    expect(new URL((frame as HTMLIFrameElement).src).searchParams.get('auto_play')).toBe('false');
});

it('rerenders and resume notifications do not duplicate a start; new track and return visit can count again', async () => {
    const view = render(player()); await waitFor(() => expect(frames).toHaveLength(1));
    const old = frames[0]; act(() => old.play?.());
    view.rerender(player()); act(() => old.play?.()); expect(starts()).toHaveLength(1);
    view.rerender(player('https://soundcloud.com/coptichazzat/second', { ...context, variationId: 'recording2' }));
    await waitFor(() => expect(frames).toHaveLength(2));
    expect(old.unbind).toHaveBeenCalledWith('provider-play');
    act(() => { old.play?.(); frames[1].play?.(); });
    expect(starts()).toHaveLength(2); expect(starts()[1][2].variation_id).toBe('recording2');
    view.unmount(); act(() => frames[1].play?.()); expect(starts()).toHaveLength(2);
    render(player()); await waitFor(() => expect(frames).toHaveLength(3));
    act(() => frames[2].play?.()); expect(starts()).toHaveLength(3);
});

it('a late SDK result after unmount never binds or emits', async () => {
    let finish!: (value: SoundCloudWidgetFactory) => void;
    load.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const view = render(<SoundCloudPlayer url={url} label="Recording" analytics={context} />);
    view.unmount(); await act(async () => finish(factory));
    expect(frames).toHaveLength(0); expect(starts()).toHaveLength(0);
});

it.each(['missing', 'reject', 'bind-error'])('SDK %s leaves the iframe usable without fabricating a start', async mode => {
    if (mode === 'missing') load.mockResolvedValue(undefined);
    else if (mode === 'reject') load.mockRejectedValue(new Error('Blocked'));
    else load.mockResolvedValue(Object.assign(() => { throw new Error('Cannot bind'); }, { Events: { PLAY: 'play' } }));
    render(player()); await waitFor(() => expect(load).toHaveBeenCalled());
    const frame = screen.getByTitle('SoundCloud player: Private display name'); fireEvent.load(frame);
    expect(frame).toBeInTheDocument(); expect(starts()).toHaveLength(0);
});

it.each(['missing', 'non-callable', 'throwing'])('optional %s analytics cannot break the PLAY callback', async mode => {
    if (mode === 'missing') delete window.gtag;
    else if (mode === 'non-callable') window.gtag = {};
    else window.gtag = () => { throw new Error('Blocked'); };
    render(player()); await waitFor(() => expect(frames).toHaveLength(1));
    expect(() => { frames[0].play?.(); frames[0].play?.(); }).not.toThrow();
    expect(screen.getByTitle('SoundCloud player: Private display name')).toBeInTheDocument();
});

it('standalone preview players do not request the telemetry SDK or emit catalog playback events', async () => {
    render(<SoundCloudPlayer url={url} label="Preview" />);
    expect(load).not.toHaveBeenCalled(); expect(starts()).toHaveLength(0);
});

it('service-wide audio views stay one service view while actual starts identify the played hymn/recording', async () => {
    const entry = (id: string) => ({ id, title: `Hymn ${id}`, variations: [{ id: `recording-${id}`, name: id, displayName: id,
        content: { contentType: ContentType.AudioContent, audioFilePath: `${url}-${id}` } }] });
    render(<MemoryRouter><ContentViewProvider><ReaderContents formatId="5"
        view={{ view_type: 'service', season_id: 'annual', service_id: 'vespers' }} entries={[entry('first'), entry('second')]} />
    </ContentViewProvider></MemoryRouter>);
    await waitFor(() => expect(frames).toHaveLength(2));
    expect(analytics.mock.calls.filter(call => call[1] === 'service_view')).toHaveLength(1);
    expect(analytics.mock.calls.filter(call => call[1] === 'hymn_view')).toHaveLength(0);
    expect(analytics.mock.calls.filter(call => call[1] === 'audio_view')).toHaveLength(1);
    act(() => { frames[1].play?.(); frames[1].play?.(); });
    expect(starts()).toHaveLength(1);
    expect(starts()[0][2]).toMatchObject({ view_type: 'service', hymn_id: 'second', variation_id: 'recording-second' });
});


it('same-path locale remounts do not duplicate starts, while navigation and Back start a new visit', async () => {
    let navigate!: ReturnType<typeof useNavigate>;
    function Navigation() { navigate = useNavigate(); return null; }
    function Scene({ locale }: { locale: string }) {
        return <MemoryRouter initialEntries={['/Seasons/annual/services/vespers/hymns/first/5']}>
            <Navigation /><ContentViewProvider>
                <SoundCloudPlayer key={locale} url={url} label="Recording" analytics={context} />
            </ContentViewProvider>
        </MemoryRouter>;
    }
    const view = render(<Scene locale="en" />);
    await waitFor(() => expect(frames).toHaveLength(1)); act(() => frames[0].play?.());
    view.rerender(<Scene locale="ar" />);
    await waitFor(() => expect(frames).toHaveLength(2)); act(() => frames[1].play?.());
    expect(starts()).toHaveLength(1);
    act(() => navigate('/Seasons/annual/services/vespers/hymns/first/1'));
    await waitFor(() => expect(frames).toHaveLength(3));
    act(() => { frames[1].play?.(); frames[2].play?.(); });
    expect(starts()).toHaveLength(2);
    act(() => navigate(-1)); await waitFor(() => expect(frames).toHaveLength(4));
    act(() => frames[3].play?.()); expect(starts()).toHaveLength(3);
});
