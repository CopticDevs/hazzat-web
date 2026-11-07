import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../Contexts/ThemeContext';
import { LanguageContext } from '../LanguageContext';
import { ArabicLanguageProperties, EnglishLanguageProperties } from '../l8n';
import SoundCloudPlayer from './SoundCloudPlayer';

const track = 'https://soundcloud.com/coptichazzat/meghalo';
const englishLink = 'Open on SoundCloud (opens in a new tab)';
const arabicLink = 'فتح على SoundCloud (يفتح في علامة تبويب جديدة)';
const cases = [
    ['light', 'ltr', EnglishLanguageProperties, englishLink],
    ['dark', 'ltr', EnglishLanguageProperties, englishLink],
    ['light', 'rtl', ArabicLanguageProperties, arabicLink],
    ['dark', 'rtl', ArabicLanguageProperties, arabicLink],
] as const;

beforeEach(() => { jest.useFakeTimers(); localStorage.clear(); });
afterEach(() => { jest.useRealTimers(); localStorage.clear(); delete document.documentElement.dataset.theme; });

function expectNoInlineNotice() {
    expect(screen.queryByText(/This player connects to SoundCloud|يتصل هذا المشغّل بـ SoundCloud/)).not.toBeInTheDocument();
}

function expectFailureLink(name: string) {
    expectNoInlineNotice();
    const fallback = screen.getByRole('link', { name });
    expect(fallback).toHaveAttribute('href', track);
    expect(fallback).toHaveAttribute('target', '_blank');
    expect(fallback).toHaveAttribute('rel', 'noopener noreferrer');
    expect(fallback).toHaveClass('soundcloud-player-external-link');
    // eslint-disable-next-line testing-library/no-node-access -- Decorative SVG is intentionally absent from accessible roles.
    const icon = fallback.querySelector('svg')!;
    expect(icon).toHaveAttribute('data-icon', 'arrow-up-right-from-square');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('focusable', 'false');
    // eslint-disable-next-line testing-library/no-node-access -- Verify the decorative icon follows the surrounding theme color.
    expect(icon.querySelector('path')).toHaveAttribute('fill', 'currentColor');
    fallback.focus();
    expect(fallback).toHaveFocus();
    expect(screen.getByRole('status')).not.toHaveClass('visually-hidden');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
}

for (const failure of ['timeout', 'error'] as const) {
    test.each(cases)(`%s / %s shows an accessible fallback only after ${failure}`, (theme, direction, languageProperties, linkName) => {
        localStorage.setItem('hazzat.theme', theme);
        const { unmount } = render(<ThemeProvider>
            <LanguageContext.Provider value={{ languageProperties }}>
                <div data-testid="player-direction" dir={direction}><SoundCloudPlayer url={track} label="Meghalo" /></div>
            </LanguageContext.Provider>
        </ThemeProvider>);
        expect(document.documentElement).toHaveAttribute('data-theme', theme);
        expect(screen.getByTestId('player-direction')).toHaveAttribute('dir', direction);
        const frame = screen.getByTitle(/^(SoundCloud player|مشغّل SoundCloud):/);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveClass('visually-hidden');
        expectNoInlineNotice();
        if (failure === 'timeout') act(() => jest.advanceTimersByTime(12000));
        else fireEvent.error(frame);
        expectFailureLink(linkName);
        expect(screen.getByRole('status')).not.toHaveTextContent(/retry|إعادة المحاولة/);
        expect(jest.getTimerCount()).toBe(0);
        fireEvent.load(frame);
        expectNoInlineNotice();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByTitle(/^(SoundCloud player|مشغّل SoundCloud):/)).toBe(frame);
        unmount();
        expect(jest.getTimerCount()).toBe(0);
    });
}

test.each(cases)('%s / %s has no loaded-state text, link or controls beneath the player', (theme, direction, languageProperties) => {
    localStorage.setItem('hazzat.theme', theme);
    render(<ThemeProvider><LanguageContext.Provider value={{ languageProperties }}>
        <div dir={direction}><SoundCloudPlayer url={track} label="Meghalo" /></div>
    </LanguageContext.Provider></ThemeProvider>);
    const frame = screen.getByTitle(/^(SoundCloud player|مشغّل SoundCloud):/) as HTMLIFrameElement;
    expect(new URL(frame.src).searchParams.get('auto_play')).toBe('false');
    expect(new URL(frame.src).searchParams.get('color')).toBe('#302c26');
    expectNoInlineNotice();
    fireEvent.load(frame);
    act(() => jest.advanceTimersByTime(12000));
    expectNoInlineNotice();
    expect(document.documentElement).toHaveAttribute('data-theme', theme);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/Use the player|استخدم زر التشغيل/)).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
});

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle test theme</button>;
}

test('theme and language changes preserve the frame URL and charcoal accent without restoring removed text', () => {
    const view = (arabic: boolean) => <ThemeProvider>
        <LanguageContext.Provider value={{ languageProperties: arabic ? ArabicLanguageProperties : EnglishLanguageProperties }}>
            <div dir={arabic ? 'rtl' : 'ltr'}><ThemeToggle /><SoundCloudPlayer url={track} label="Meghalo" /></div>
        </LanguageContext.Provider>
    </ThemeProvider>;
    const { rerender } = render(view(false));
    const frame = screen.getByTitle(/^(SoundCloud player|مشغّل SoundCloud):/);
    const source = frame.getAttribute('src')!;
    expect(new URL(source).searchParams.get('color')).toBe('#302c26');
    fireEvent.load(frame);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle test theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    rerender(view(true));
    expect(screen.getByTitle(/^(SoundCloud player|مشغّل SoundCloud):/)).toBe(frame);
    expect(frame).toHaveAttribute('src', source);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle test theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    rerender(view(false));
    expect(screen.getByTitle(/^(SoundCloud player|مشغّل SoundCloud):/)).toBe(frame);
    expect(frame).toHaveAttribute('src', source);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(jest.getTimerCount()).toBe(0);
});
