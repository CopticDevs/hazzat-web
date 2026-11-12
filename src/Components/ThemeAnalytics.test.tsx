import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { ThemeProvider, useTheme } from '../Contexts/ThemeContext';
import { Theme, themeStorageKey } from '../sitePreferences';

let choose: (theme: Theme) => void;
function Consumer() {
    const { theme, setTheme } = useTheme();
    choose = setTheme;
    return <span>{theme}</span>;
}
let mediaChange: () => void;
let media: { matches: boolean };
const originalMatchMedia = window.matchMedia;
beforeEach(() => {
    localStorage.clear();
    window.gtag = jest.fn();
    media = { matches: false };
    window.matchMedia = jest.fn(() => ({
        get matches() { return media.matches; },
        addEventListener: (_: string, callback: () => void) => { mediaChange = callback; },
        removeEventListener: jest.fn()
    } as unknown as MediaQueryList));
});
afterEach(() => { window.matchMedia = originalMatchMedia; });
function mount() { return render(<StrictMode><ThemeProvider><Consumer /></ThemeProvider></StrictMode>); }
test('counts deliberate effective changes once, including same-tick and stale callbacks', () => {
    mount();
    const retained = choose;
    expect(window.gtag).not.toHaveBeenCalled();
    act(() => { retained('light'); retained('dark'); retained('dark'); retained('light'); });
    expect(window.gtag).toHaveBeenNthCalledWith(1, 'event', 'change_theme',
        { event_category: 'Customization', previous_theme: 'light', theme: 'dark' });
    expect(window.gtag).toHaveBeenNthCalledWith(2, 'event', 'change_theme',
        { event_category: 'Customization', previous_theme: 'dark', theme: 'light' });
    act(() => retained('dark'));
    expect(window.gtag).toHaveBeenCalledTimes(3);
    expect(screen.getByText('dark')).toBeInTheDocument();
});
test('restoration, OS and cross-tab changes are silent and subsequent choices use their effective value', () => {
    localStorage.setItem(themeStorageKey, 'dark');
    mount();
    expect(window.gtag).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: themeStorageKey, newValue: null })));
    act(() => { media.matches = true; mediaChange(); });
    expect(window.gtag).not.toHaveBeenCalled();
    act(() => choose('dark'));
    expect(window.gtag).not.toHaveBeenCalled();
    act(() => {
        window.dispatchEvent(new StorageEvent('storage', { key: themeStorageKey, newValue: 'light' }));
        choose('dark');
    });
    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'change_theme',
        { event_category: 'Customization', previous_theme: 'light', theme: 'dark' });
});
test.each([undefined, 'blocked', () => { throw new Error('blocked'); }])('optional analytics never blocks changing theme (%s)', tag => {
    window.gtag = tag as typeof window.gtag;
    mount();
    act(() => choose('dark'));
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(localStorage.getItem(themeStorageKey)).toBe('dark');
});
