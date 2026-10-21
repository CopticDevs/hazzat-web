import { render, screen } from "@testing-library/react";
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
    expect(dark).toHaveAttribute('title', 'Switch to dark mode');
    dark.focus(); await userEvent.keyboard('{Enter}');
    expect(dark).toHaveAttribute('aria-pressed', 'true');
    expect(dark).toHaveAttribute('title', 'Switch to light mode');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('hazzat.theme')).toBe('dark');
    view.unmount(); render(<Preview />);
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});
test('language changes retain theme, environment and anchor without reloading the page', () => {
    localStorage.setItem('hazzat.theme', 'dark');
    render(<Preview />);
    userEvent.click(screen.getByRole('link', { name: 'Switch to Arabic' }));
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('link', { name: 'التبديل إلى الإنجليزية' })).toHaveAttribute('href', '/Seasons/annual?env=PPE&lang=en#hymn');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getAllByRole('link')).toHaveLength(1);
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
