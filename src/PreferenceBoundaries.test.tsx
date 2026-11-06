import React, { useContext } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from './Contexts/ThemeContext';
import { UserSettingProvider, UserSettingsContext, readerColor } from './Contexts/UserSettingsContext';
import LanguageProvider from './LanguageProvider';
import { LanguageContext } from './LanguageContext';
import { AppSettings } from './AppSettings';

const originalMatchMedia = window.matchMedia;
const originalGtag = window.gtag;
function State() {
    const { userSettings, setContentFontSize, setContentFontColor, setHazzatFontColor } = useContext(UserSettingsContext);
    const { languageProperties } = useContext(LanguageContext);
    const { theme } = useTheme();
    return <><output>{JSON.stringify({ ...userSettings, language: languageProperties.localeName, theme })}</output>
        <button onClick={() => setContentFontSize(NaN)}>Invalid size</button>
        <button onClick={() => setContentFontSize(-1)}>Too small</button>
        <button onClick={() => setContentFontSize(1000)}>Too large</button>
        <button onClick={() => setContentFontColor('INVALID')}>Invalid color</button>
        <button onClick={() => setContentFontColor('NAVY')}>Navy</button>
        <button onClick={() => setHazzatFontColor('MAROON')}>Maroon notation</button></>;
}
function Preview() { return <ThemeProvider><MemoryRouter><LanguageProvider><UserSettingProvider><State /></UserSettingProvider></LanguageProvider></MemoryRouter></ThemeProvider>; }
const state = () => JSON.parse(screen.getByRole('status').textContent!);
beforeEach(() => { localStorage.clear(); jest.spyOn(navigator, 'languages', 'get').mockReturnValue(['en']); window.gtag = jest.fn(); });
afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); window.matchMedia = originalMatchMedia; window.gtag = originalGtag; });

it.each(['not-json', 'false', '42', JSON.stringify({ size: 'not-a-number' }), JSON.stringify({ size: -10 })])('uses safe defaults for corrupt or invalid saved settings: %s', raw => {
    localStorage.setItem('hazzat.reader-settings', raw);
    render(<Preview />);
    expect(state()).toMatchObject({ englishFontSize: '18px', arabicFontSize: '22px', contentFontColor: 'BLACK', hazzatFontColor: 'BLACK' });
});

it('ignores invalid customization, clamps finite sizes, and emits bounded analytics', () => {
    render(<Preview />);
    const write = jest.spyOn(Storage.prototype, 'setItem');
    fireEvent.click(screen.getByText('Invalid size')); fireEvent.click(screen.getByText('Invalid color'));
    expect(write).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Too small'));
    expect(state().englishFontSize).toBe(`${AppSettings.minContentTextSize}px`);
    expect(state().arabicFontSize).toBe(`${AppSettings.minContentTextSize + 4}px`);
    fireEvent.click(screen.getByText('Too large'));
    expect(state().englishFontSize).toBe(`${AppSettings.maxContentTextSize}px`);
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'change_text_size', { event_category: 'Customization', event_label: `${AppSettings.maxContentTextSize} Size Selected` });
    fireEvent.click(screen.getByText('Navy'));
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'change_text_color', { event_category: 'Customization', event_label: 'NAVY Color Selected' });
    fireEvent.click(screen.getByText('Maroon notation'));
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'change_hazzat_color', { event_category: 'Customization', event_label: 'MAROON Color Selected' });
});

it('ignores session storage events and unrelated local-storage keys', () => {
    render(<Preview />);
    const before = state();
    act(() => {
        for (const [key, newValue] of [['hazzat.theme', 'dark'], ['hazzat.navigation-language', 'ar'], ['hazzat.reader-settings', '{"size":24}']]) {
            window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: sessionStorage }));
        }
        window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated', newValue: 'dark', storageArea: localStorage }));
    });
    expect(state()).toEqual(before);
});

it('supports and cleans up legacy media-query listeners', () => {
    let dark = false;
    const addListener = jest.fn(); const removeListener = jest.fn();
    window.matchMedia = jest.fn(() => ({ get matches() { return dark; }, addListener, removeListener } as unknown as MediaQueryList));
    const view = render(<Preview />);
    expect(state().theme).toBe('light');
    expect(addListener).toHaveBeenCalledTimes(1);
    const update = addListener.mock.calls[0][0];
    act(() => { dark = true; update(); });
    expect(state().theme).toBe('dark');
    view.unmount();
    expect(removeListener).toHaveBeenCalledWith(update);
});

it('maps supported reader colors to theme variables and preserves custom CSS colors', () => {
    expect(readerColor('BLACK')).toBe('var(--reader-black, BLACK)');
    expect(readerColor('#abcdef')).toBe('#abcdef');
});
