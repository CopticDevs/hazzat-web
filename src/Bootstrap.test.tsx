import { act } from '@testing-library/react';
import reportWebVitals from './reportWebVitals';

const mockEffectLifecycle = jest.fn();
jest.mock('./reportWebVitals', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('./App', () => {
    const React = require('react');
    const { useLocation } = require('react-router-dom');
    const { EnvironmentContext } = require('./Contexts/Environment/EnvironmentContext');
    const { LanguageContext } = require('./LanguageContext');
    const { UserSettingsContext } = require('./Contexts/UserSettingsContext');
    const { useTheme } = require('./Contexts/ThemeContext');
    return { __esModule: true, default: function BootstrapApp() {
        React.useEffect(() => {
            mockEffectLifecycle('mount');
            return () => mockEffectLifecycle('cleanup');
        }, []);
        const environment = React.useContext(EnvironmentContext);
        const language = React.useContext(LanguageContext);
        const settings = React.useContext(UserSettingsContext);
        return <output>{JSON.stringify({ path: useLocation().pathname, environment: environment.environmentProperties.baseUrl,
            language: language.languageProperties.localeName, size: settings.userSettings.englishFontSize, theme: useTheme().theme })}</output>;
    } };
});

it('mounts the application with routing, environment, localization, reading and theme providers', () => {
    localStorage.clear();
    localStorage.setItem('hazzat.theme', 'dark');
    localStorage.setItem('hazzat.reader-settings', JSON.stringify({ size: 24 }));
    window.history.replaceState({}, '', '/Seasons?env=PPE&lang=ar');
    const root = document.createElement('div');
    root.id = 'root'; document.body.appendChild(root);
    try {
        act(() => { require('./index'); });
        expect(JSON.parse(root.textContent!)).toEqual({ path: '/Seasons', environment: 'https://hazzat-api-ppe.azurewebsites.net', language: 'ar', size: '24px', theme: 'dark' });
        expect(document.documentElement).toHaveAttribute('dir', 'rtl');
        expect(reportWebVitals).toHaveBeenCalledTimes(1);
        expect(reportWebVitals).toHaveBeenCalledWith();
        expect(mockEffectLifecycle.mock.calls.map(([event]) => event)).toEqual(['mount', 'cleanup', 'mount']);
    } finally {
        act(() => { require('./index').root.unmount(); });
        expect(mockEffectLifecycle.mock.calls.map(([event]) => event)).toEqual(['mount', 'cleanup', 'mount', 'cleanup']);
        root.remove(); localStorage.clear(); window.history.replaceState({}, '', '/');
    }
});
