import { act, fireEvent, render, screen } from '@testing-library/react';
import { LanguageContext } from '../LanguageContext';
import { ArabicLanguageProperties } from '../l8n';
import { ContentType, IAudioContent, IVariationInfo } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import ContentAudio from './ContentAudio';
import { soundCloudEmbedUrl } from './SoundCloudUrl';

const track = 'https://soundcloud.com/coptichazzat/meghalo';
const azure = 'https://hazzatstorage.blob.core.windows.net/downloads/Audio/Great Lent/Sat & Sun - Liturgy/Great Lent Sat & Sun - Meghalo.mp3';
const audio = (id: string, path: string): IVariationInfo<IAudioContent> => ({
    id, name: id, displayName: `Recording ${id}`, content: { contentType: ContentType.AudioContent, audioFilePath: path },
});

test('mixed records embed SoundCloud automatically without legacy links, artwork or empty headings', () => {
    render(<ContentAudio hymnTitle="Meghalo" variations={[
        audio('Azure', azure), audio('SoundCloud', track), audio('Other', '/recording.mp3'), audio('Empty', ''),
    ]} />);
    expect(screen.getByText('Meghalo')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Recording /)).not.toBeInTheDocument();
    expect(screen.getAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
    const frame = screen.getByTitle('SoundCloud player: Recording SoundCloud');
    expect(frame).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(new URL(frame.getAttribute('src')!).searchParams.get('auto_play')).toBe('false');
    expect(frame).toHaveAttribute('width', '100%');
    expect(frame).toHaveAttribute('height', '166');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(/connects to SoundCloud automatically/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close player' })).not.toBeInTheDocument();
});

test('an entirely unsupported audio collection keeps only the hymn title', () => {
    render(<ContentAudio hymnTitle="Meghalo" variations={[
        audio('Azure', azure), audio('Empty', ''), audio('Other', '/recording.mp3'),
    ]} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Meghalo' })).toBeInTheDocument();
    expect(screen.queryByTitle(/^SoundCloud player:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
});

test.each([
    azure, '', ' ', '/recording.mp3', 'data:audio/mpeg;base64,AAAA',
    // eslint-disable-next-line no-script-url -- Rejected URL input must never become an executable link.
    'javascript:alert(1)',
    'https://soundcloud.com.evil.test/artist/track',
    'https://soundcloud.com@evil.test/artist/track',
    'https://user:password@soundcloud.com/artist/track',
    'https://soundcloud.com:444/artist/track',
    'http://soundcloud.com/artist/track',
    'https://soundcloud.com/artist',
    'https://soundcloud.com/artist/sets/playlist',
    'https://soundcloud.com/artist/track?secret_token=private',
    'https://on.soundcloud.com/VJE3hsqdiIB2EW6d8H',
    'https://example.com/audio.mp3?source=soundcloud.com',
])('unsupported or lookalike URL renders no player, link or artwork: %s', path => {
    const { container } = render(<ContentAudio variations={[audio('legacy', path)]} />);
    expect(container.textContent).toBe('');
    expect(screen.queryByTitle(/^SoundCloud player:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test.each(['https://www.soundcloud.com/coptichazzat/meghalo/?utm_source=share#t=12', 'https://m.soundcloud.com/coptichazzat/meghalo'])('normalizes supported SoundCloud hosts without forwarding tracking: %s', path => {
    render(<ContentAudio variations={[audio('Meghalo', path)]} />);
    expect(screen.getByTitle('SoundCloud player: Recording Meghalo')).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(screen.queryByRole('link', { name: /Open on SoundCloud/ })).not.toBeInTheDocument();
});

test('a stable content ID can migrate, change recording and become unsupported without leaving an old frame', () => {
    jest.useFakeTimers();
    try {
        const { rerender, unmount } = render(<ContentAudio variations={[audio('same-id', azure)]} />);
        expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
        rerender(<ContentAudio variations={[audio('same-id', track)]} />);
        const first = screen.getByTitle(/^SoundCloud player:/);
        fireEvent.load(first);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        rerender(<ContentAudio variations={[audio('same-id', 'https://soundcloud.com/example/another')]} />);
        expect(first).not.toBeInTheDocument();
        expect(screen.getAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
        expect(screen.getByRole('status')).toHaveTextContent('Loading');
        fireEvent.load(first);
        expect(screen.getByRole('status')).toHaveTextContent('Loading');
        rerender(<ContentAudio variations={[audio('same-id', azure)]} />);
        expect(screen.queryByTitle(/^SoundCloud player:/)).toBeNull();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: 'same-id' })).not.toBeInTheDocument();
        expect(jest.getTimerCount()).toBe(0);
        rerender(<ContentAudio variations={[audio('same-id', track)]} />);
        unmount();
        expect(jest.getTimerCount()).toBe(0);
    } finally { jest.useRealTimers(); }
});

test('slow or unavailable embeds retain fallback without reload controls or a false playback claim', () => {
    jest.useFakeTimers();
    try {
        render(<ContentAudio variations={[audio('Meghalo', track)]} />);
        const first = screen.getByTitle(/^SoundCloud player:/);
        act(() => jest.advanceTimersByTime(12000));
        expect(screen.getByRole('status')).toHaveTextContent('taking longer');
        const fallback = screen.getByRole('link', { name: 'Open on SoundCloud (opens in a new tab)' });
        expect(fallback).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.queryByRole('button', { name: 'Reload player' })).not.toBeInTheDocument();
        expect(screen.getByRole('status')).not.toHaveTextContent('retry');
        expect(first).toBeInTheDocument();
        fireEvent.load(first);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally { jest.useRealTimers(); }
});

test('Arabic content uses localized player labels without the inline notice', () => {
    render(<LanguageContext.Provider value={{ languageProperties: ArabicLanguageProperties }}>
        <ContentAudio variations={[audio('ميغالو', track)]} />
    </LanguageContext.Provider>);
    expect(screen.getByTitle('مشغّل SoundCloud: Recording ميغالو')).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(screen.queryByText(/يتصل هذا المشغّل بـ SoundCloud تلقائياً/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /فتح على SoundCloud/ })).not.toBeInTheDocument();
});
