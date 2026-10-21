import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../Contexts/ThemeContext";
import { UserSettingProvider } from "../Contexts/UserSettingsContext";
import LanguageProvider from "../LanguageProvider";
import SitePreferences from "./SitePreferences";
import { strings } from "../l8n";

function Preview() {
    return <ThemeProvider><MemoryRouter initialEntries={['/Seasons/annual?env=PPE#hymn']}><LanguageProvider>
        <UserSettingProvider><SitePreferences /></UserSettingProvider>
    </LanguageProvider></MemoryRouter></ThemeProvider>;
}
beforeEach(() => { localStorage.clear(); strings.setLanguage('en'); delete document.documentElement.dataset.theme; });
afterEach(() => { jest.restoreAllMocks(); strings.setLanguage('en'); delete document.documentElement.dataset.theme; });
test('first visit retains light appearance and switching by keyboard persists dark mode', async () => {
    const view = render(<Preview />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    const dark = screen.getByRole('button', { name: 'Dark' });
    dark.focus(); await userEvent.keyboard('{Enter}');
    expect(dark).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('hazzat.theme')).toBe('dark');
    view.unmount(); render(<Preview />);
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    userEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});
test('language changes retain theme, environment and anchor without reloading the page', () => {
    localStorage.setItem('hazzat.theme', 'dark');
    render(<Preview />);
    userEvent.click(screen.getByRole('link', { name: 'العربية' }));
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    const languages = screen.getByRole('group', { name: 'لغة التصفح' });
    expect(within(languages).getByRole('link', { name: 'العربية' })).toHaveAttribute('aria-current', 'true');
    expect(within(languages).getByRole('link', { name: 'English' })).toHaveAttribute('href', '/Seasons/annual?env=PPE&lang=en#hymn');
});
test('invalid saved theme falls back to light', () => {
    localStorage.setItem('hazzat.theme', 'invalid'); render(<Preview />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});
test('storage failures do not prevent theme switching', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<Preview />);
    userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});
test('theme switching does not overwrite saved reader preferences', () => {
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ size: 24, contentFontColor: 'MAROON', hazzatFontColor: 'NAVY' }));
    render(<Preview />);
    const before = localStorage.getItem('hazzat.reader-settings');
    userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(localStorage.getItem('hazzat.reader-settings')).toBe(before);
});
