import { act, fireEvent, render, screen } from '@testing-library/react';
import SoundCloudPrototypePage from './SoundCloudPrototypePage';
import { soundCloudTrackUrl, soundCloudEmbedUrl } from './SoundCloudUrl';
import { LanguageContext } from '../LanguageContext';
import { ArabicLanguageProperties } from '../l8n';

const track = 'https://soundcloud.com/coptichazzat/meghalo';
function changeUrl(url: string) {
    fireEvent.change(screen.getByLabelText('Public SoundCloud track link'), { target: { value: url } });
}
function settleUrl() { act(() => jest.advanceTimersByTime(500)); }
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

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
    [track, track], [' https://www.soundcloud.com/coptichazzat/meghalo/?utm_source=share#t=4 ', track],
    ['https://m.soundcloud.com/coptichazzat/meghalo', track],
])('validates and canonicalizes %s', (value, expected) => {
    expect(soundCloudTrackUrl(value)).toBe(expected);
});

test('builds only an official player URL with autoplay off and no tracking data', () => {
    const url = new URL(soundCloudEmbedUrl(`${track}?utm_source=test#t=12`));
    expect(url.origin + url.pathname).toBe('https://w.soundcloud.com/player/');
    expect(url.searchParams.get('url')).toBe(track);
    expect(url.searchParams.get('auto_play')).toBe('false');
    expect(url.searchParams.get('visual')).toBe('false');
    expect(url.searchParams.get('color')).toBe('#302c26');
    expect(() => soundCloudEmbedUrl('https://example.com/a')).toThrow();
});

test('loads the supplied Meghalo recording immediately, without a Load click or audio autoplay', () => {
    render(<SoundCloudPrototypePage />);
    const frame = screen.getByTitle('SoundCloud player: Meghalo · Great Lent Saturdays & Sundays · Liturgy');
    expect(frame).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(screen.getByLabelText('Public SoundCloud track link')).toHaveValue(track);
    expect(screen.queryByRole('button', { name: /^Load/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Meghalo from Hazzat on SoundCloud/)).toBeInTheDocument();
    expect(screen.getByText(/automatically on opening/)).toHaveTextContent('Audio stays paused until you press Play');
});

test('invalid links remove the previous frame and show an error without moving focus', () => {
    render(<SoundCloudPrototypePage />);
    const input = screen.getByLabelText('Public SoundCloud track link');
    input.focus();
    changeUrl('https://example.com/private');
    expect(screen.getByRole('alert')).toHaveTextContent('public HTTPS track link');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    settleUrl();
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
});

test('clearing the link removes the frame without showing an invalid-link error', () => {
    render(<SoundCloudPrototypePage />);
    changeUrl('');
    settleUrl();
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
});

test('label edits preserve the frame and a loaded frame has no text or actions underneath', () => {
    render(<SoundCloudPrototypePage />);
    const original = screen.getByTitle(/^SoundCloud player:/);
    fireEvent.change(screen.getByLabelText('Recording label (optional)'), { target: { value: 'Test recording' } });
    const frame = screen.getByTitle('SoundCloud player: Test recording');
    expect(frame).toBe(original);
    expect(frame).toHaveAttribute('referrerPolicy', 'no-referrer');
    expect(screen.getByRole('status')).toHaveTextContent('Loading the SoundCloud frame');
    expect(screen.getByRole('status')).toHaveClass('visually-hidden');
    fireEvent.load(frame);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open on SoundCloud/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Use the player/)).not.toBeInTheDocument();
});

test('a valid edited link automatically replaces the frame after typing settles', () => {
    render(<SoundCloudPrototypePage />);
    const original = screen.getByTitle(/^SoundCloud player:/);
    const next = 'https://soundcloud.com/example/another-track';
    changeUrl(next);
    expect(screen.getByTitle(/^SoundCloud player:/)).toBe(original);
    act(() => jest.advanceTimersByTime(499));
    expect(screen.getByTitle(/^SoundCloud player:/)).toBe(original);
    act(() => jest.advanceTimersByTime(1));
    expect(original).not.toBeInTheDocument();
    expect(screen.queryAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
    expect(screen.getByTitle(/^SoundCloud player:/)).toHaveAttribute('src', soundCloudEmbedUrl(next));
});

test('rapid edits cancel previous replacements, and a later invalid link cancels the pending load', () => {
    render(<SoundCloudPrototypePage />);
    changeUrl('https://soundcloud.com/example/first');
    act(() => jest.advanceTimersByTime(300));
    changeUrl('https://soundcloud.com/example/second');
    act(() => jest.advanceTimersByTime(200));
    expect(screen.getByTitle(/^SoundCloud player:/)).toHaveAttribute('src', soundCloudEmbedUrl(track));
    act(() => jest.advanceTimersByTime(300));
    expect(screen.getByTitle(/^SoundCloud player:/)).toHaveAttribute('src', soundCloudEmbedUrl('https://soundcloud.com/example/second'));
    changeUrl('https://soundcloud.com/example/third');
    changeUrl('https://soundcloud.com/example/private?secret_token=s-private');
    settleUrl();
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
});

test('equivalent normalized links do not reload the frame or forward tracking data', () => {
    render(<SoundCloudPrototypePage />);
    const original = screen.getByTitle(/^SoundCloud player:/);
    changeUrl(`https://www.soundcloud.com/coptichazzat/meghalo/?utm_source=test#t=10`);
    settleUrl();
    expect(screen.getByTitle(/^SoundCloud player:/)).toBe(original);
    expect(original).toHaveAttribute('src', soundCloudEmbedUrl(track));
});

test('close stays dismissed and restores input focus; Meghalo reopens automatically', () => {
    render(<SoundCloudPrototypePage />);
    expect(screen.queryByRole('button', { name: 'Reload player' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close player' }));
    act(() => jest.advanceTimersByTime(13000));
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    expect(screen.getByLabelText('Public SoundCloud track link')).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'Open on SoundCloud (opens in a new tab)' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Recording label (optional)'), { target: { value: 'A label' } });
    settleUrl();
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Use Meghalo recording' }));
    settleUrl();
    expect(screen.queryAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
});

test('closing during a pending replacement cancels it until the link changes again', () => {
    render(<SoundCloudPrototypePage />);
    changeUrl('https://soundcloud.com/example/next');
    fireEvent.click(screen.getByRole('button', { name: 'Close player' }));
    settleUrl();
    expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
    expect(jest.getTimerCount()).toBe(0);
    changeUrl('https://soundcloud.com/example/reopen');
    settleUrl();
    expect(screen.getByTitle(/^SoundCloud player:/)).toHaveAttribute('src', soundCloudEmbedUrl('https://soundcloud.com/example/reopen'));
});

test('slow loading keeps fallback, while close and unmount clean up all timers', () => {
    const { unmount } = render(<SoundCloudPrototypePage />);
    act(() => jest.advanceTimersByTime(12000));
    expect(screen.getByRole('status')).toHaveTextContent('taking longer');
    fireEvent.load(screen.getByTitle(/^SoundCloud player:/));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reload player' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close player' }));
    expect(jest.getTimerCount()).toBe(0);
    changeUrl('https://soundcloud.com/example/next');
    unmount();
    expect(jest.getTimerCount()).toBe(0);
});

test('localizes the automatically loaded preview and keeps the URL input left-to-right in Arabic', () => {
    render(<LanguageContext.Provider value={{ languageProperties: ArabicLanguageProperties }}><SoundCloudPrototypePage /></LanguageContext.Provider>);
    expect(screen.getByRole('heading', { name: 'استمع عبر SoundCloud' })).toBeInTheDocument();
    expect(screen.getByLabelText('رابط تسجيل عام على SoundCloud')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByTitle(/^مشغّل SoundCloud:/)).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(screen.getByText(/يتم تحميل مشغّل SoundCloud تلقائياً/)).toBeInTheDocument();
});

test('late frame events and previous timeouts do not change a replacement frame', () => {
    render(<SoundCloudPrototypePage />);
    const oldFrame = screen.getByTitle(/^SoundCloud player:/);
    act(() => jest.advanceTimersByTime(6000));
    changeUrl('https://soundcloud.com/example/replacement');
    settleUrl();
    fireEvent.load(oldFrame);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    act(() => jest.advanceTimersByTime(6000));
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    act(() => jest.advanceTimersByTime(6000));
    expect(screen.getByRole('status')).toHaveTextContent('taking longer');
});
