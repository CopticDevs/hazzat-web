import { act, fireEvent, render, screen } from '@testing-library/react';
import SoundCloudPrototypePage from './SoundCloudPrototypePage';
import { soundCloudTrackUrl, soundCloudEmbedUrl } from './SoundCloudPrototypeUrl';
import { LanguageContext } from '../LanguageContext';
import { ArabicLanguageProperties } from '../l8n';

const track = 'https://soundcloud.com/forss/flickermood';
function load(url = track) {
    fireEvent.change(screen.getByLabelText('Public SoundCloud track link'), { target: { value: url } });
    fireEvent.click(screen.getByRole('button', { name: /Load (SoundCloud|\/ replace)/ }));
}

it.each([
    // eslint-disable-next-line no-script-url -- Regression fixture: script URLs must be rejected.
    ['', undefined], ['javascript:alert(1)', undefined], ['http://soundcloud.com/artist/song', undefined],
    ['https://soundcloud.com.evil.test/artist/song', undefined], ['https://evil.test/artist/song', undefined],
    ['https://soundcloud.com@evil.test/artist/song', undefined], ['https://user:password@soundcloud.com/artist/song', undefined],
    ['https://soundcloud.com:444/artist/song', undefined], ['https://soundcloud.com/artist', undefined],
    ['https://soundcloud.com/artist/sets/playlist', undefined], ['https://soundcloud.com/artist/song/s-secret', undefined],
    ['https://soundcloud.com/artist/song?secret_token=s-private', undefined], ['https://soundcloud.com/artist/song?TOKEN=private', undefined],
    ['https://soundcloud.com/discover/sets', undefined], ['https://on.soundcloud.com/short', undefined],
    ['https://w.soundcloud.com/player/?url=anything', undefined], ['https://soundcloud.com/artist/song%2Fevil', undefined],
    ['https://soundcloud.com/artist/%2e%2e/thing', undefined],
    [track, track], [' https://www.soundcloud.com/forss/flickermood/?utm_source=share#t=4 ', track],
    ['https://m.soundcloud.com/forss/flickermood', track],
])('validates and canonicalizes %s', (value, expected) => {
    expect(soundCloudTrackUrl(value)).toBe(expected);
});

test('builds only an official player URL with autoplay off and no tracking data', () => {
    const url = new URL(soundCloudEmbedUrl(`${track}?utm_source=test#t=12`));
    expect(url.origin + url.pathname).toBe('https://w.soundcloud.com/player/');
    expect(url.searchParams.get('url')).toBe(track);
    expect(url.searchParams.get('auto_play')).toBe('false');
    expect(url.searchParams.get('visual')).toBe('false');
    expect(() => soundCloudEmbedUrl('https://example.com/a')).toThrow();
});

test('does not load third-party resources until a valid form is submitted', () => {
    render(<SoundCloudPrototypePage />);
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Use SoundCloud demo link' }));
    expect(screen.getByLabelText('Public SoundCloud track link')).toHaveValue(track);
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    expect(screen.getByText(/not a Hazzat recording/)).toBeInTheDocument();
});

test('invalid links show an accessible error and focus the input without loading', () => {
    render(<SoundCloudPrototypePage />);
    load('https://example.com/private');
    expect(screen.getByRole('alert')).toHaveTextContent('public HTTPS track link');
    expect(screen.getByLabelText('Public SoundCloud track link')).toHaveFocus();
    expect(screen.getByLabelText('Public SoundCloud track link')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
});

test('loads the labeled frame with a safe fallback and does not claim audio playback succeeded', () => {
    render(<SoundCloudPrototypePage />);
    fireEvent.change(screen.getByLabelText('Recording label (optional)'), { target: { value: 'Test recording' } });
    load(`${track}?utm_source=demo`);
    const frame = screen.getByTitle('SoundCloud player: Test recording');
    expect(frame).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(frame).toHaveAttribute('referrerPolicy', 'no-referrer');
    expect(screen.getByRole('status')).toHaveTextContent('Loading the SoundCloud frame');
    fireEvent.load(frame);
    expect(screen.getByRole('status')).toHaveTextContent('If the recording is unavailable');
    const fallback = screen.getByRole('link', { name: 'Open on SoundCloud ↗' });
    expect(fallback).toHaveAttribute('href', track);
    expect(fallback).toHaveAttribute('rel', 'noopener noreferrer');
    expect(fallback).toHaveAttribute('target', '_blank');
});

test('editing a link does not replace the active frame until submission; replacing removes the old frame', () => {
    render(<SoundCloudPrototypePage />);
    load();
    const original = screen.queryByTitle(/^SoundCloud player:/);
    fireEvent.change(screen.getByLabelText('Public SoundCloud track link'), { target: { value: 'https://soundcloud.com/example/another-track' } });
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBe(original);
    fireEvent.click(screen.getByRole('button', { name: 'Load / replace player' }));
    expect(original).not.toBeInTheDocument();
    expect(screen.queryAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
    expect(screen.queryByTitle(/^SoundCloud player:/)).toHaveAttribute('src', soundCloudEmbedUrl('https://soundcloud.com/example/another-track'));
});

test('reload replaces the frame, close removes it and returns focus, reopening leaves only one frame', () => {
    render(<SoundCloudPrototypePage />);
    load();
    const first = screen.queryByTitle(/^SoundCloud player:/);
    fireEvent.click(screen.getByRole('button', { name: 'Reload player' }));
    expect(first).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close player' }));
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    expect(screen.getByLabelText('Public SoundCloud track link')).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'Open on SoundCloud ↗' })).not.toBeInTheDocument();
    load();
    expect(screen.queryAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
});

test('slow loading offers retry/fallback, while close and unmount clean up timeouts', () => {
    jest.useFakeTimers();
    try {
        const { unmount } = render(<SoundCloudPrototypePage />);
        load();
        act(() => jest.advanceTimersByTime(12000));
        expect(screen.getByRole('status')).toHaveTextContent('taking longer');
        fireEvent.load(screen.getByTitle(/^SoundCloud player:/));
        expect(screen.getByRole('status')).toHaveTextContent('Use the player');
        fireEvent.click(screen.getByRole('button', { name: 'Reload player' }));
        expect(screen.getByRole('status')).toHaveTextContent('Loading');
        fireEvent.click(screen.getByRole('button', { name: 'Close player' }));
        expect(jest.getTimerCount()).toBe(0);
        load();
        unmount();
        expect(jest.getTimerCount()).toBe(0);
    } finally { jest.useRealTimers(); }
});

test('localizes the preview and keeps the URL input left-to-right in Arabic', () => {
    render(<LanguageContext.Provider value={{ languageProperties: ArabicLanguageProperties }}><SoundCloudPrototypePage /></LanguageContext.Provider>);
    expect(screen.getByRole('heading', { name: 'استمع عبر SoundCloud' })).toBeInTheDocument();
    expect(screen.getByLabelText('رابط تسجيل عام على SoundCloud')).toHaveAttribute('dir', 'ltr');
});

 test('late frame events and previous timeouts do not change a replacement frame', () => {
    jest.useFakeTimers();
    try {
        render(<SoundCloudPrototypePage />);
        load();
        const oldFrame = screen.getByTitle(/^SoundCloud player:/);
        act(() => jest.advanceTimersByTime(6000));
        fireEvent.click(screen.getByRole('button', { name: 'Reload player' }));
        fireEvent.load(oldFrame);
        expect(screen.getByRole('status')).toHaveTextContent('Loading');
        act(() => jest.advanceTimersByTime(6000));
        expect(screen.getByRole('status')).toHaveTextContent('Loading');
        act(() => jest.advanceTimersByTime(6000));
        expect(screen.getByRole('status')).toHaveTextContent('taking longer');
    } finally { jest.useRealTimers(); }
});
