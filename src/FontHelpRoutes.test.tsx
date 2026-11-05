import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { LanguageContext } from './LanguageContext';
import { ArabicLanguageProperties, EnglishLanguageProperties, strings } from './l8n';

jest.mock('./Components/Header', () => () => null);
jest.mock('./Components/Footer', () => () => null);
jest.mock('./Components/RouteScroll', () => () => null);

// Keep unexpected errors visible, and fail the test rather than hiding React warnings.
let consoleError: jest.SpyInstance;
beforeEach(() => { consoleError = jest.spyOn(console, 'error'); });
afterEach(() => {
    try {
        cleanup();
        expect(consoleError).not.toHaveBeenCalled();
    } finally {
        consoleError.mockRestore();
        strings.setLanguage('en');
    }
});

describe.each([
    ['/Help/UsingHazzatFont', 'usingTheHazzatFont', 'HazzatFont', 53],
    ['/Help/UsingVerticalHazzatFont', 'usingTheVerticalHazzatFont', 'HazzatVFont', 28]
] as const)('%s', (path, title, fontClass, mappingCount) => {
    it.each([EnglishLanguageProperties, ArabicLanguageProperties])('preserves valid markup and examples in $localeName', languageProperties => {
        strings.setLanguage(languageProperties.localeName);
        const { container } = render(
            <LanguageContext.Provider value={{ languageProperties }}>
                <MemoryRouter initialEntries={[`${path}?lang=${languageProperties.localeName}`]}><App /></MemoryRouter>
            </LanguageContext.Provider>
        );
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(strings[title]);
        expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();

        const tables = container.querySelectorAll('table');
        expect(tables.length).toBeGreaterThan(1);
        container.querySelectorAll('thead, tbody, tfoot').forEach(group => {
            expect(group.parentElement?.tagName).toBe('TABLE');
            Array.from(group.children).forEach(row => expect(row.tagName).toBe('TR'));
        });
        container.querySelectorAll('th, td').forEach(cell => expect(cell.parentElement?.tagName).toBe('TR'));
        container.querySelectorAll('tr').forEach(row => {
            expect(['THEAD', 'TBODY', 'TFOOT']).toContain(row.parentElement?.tagName);
        });
        expect(container.querySelector('p div')).toBeNull();
        const mappingRows = container.querySelectorAll('#keymappings tbody > tr');
        expect(mappingRows).toHaveLength(mappingCount);
        const keys = Array.from(mappingRows, row => row.children[0].textContent);
        expect(new Set(keys).size).toBe(mappingCount);
        expect(container.querySelectorAll('#keymappings thead > tr > th')).toHaveLength(3);
        expect(container.querySelectorAll(`#keymappings .${fontClass}`)).toHaveLength(mappingCount);
        expect(container.querySelector(`#exampleHymn .${fontClass}`)).not.toBeNull();
        expect(container.querySelector(`#exampleHymn .dirLtr`)).not.toBeNull();
        expect(container.querySelector(languageProperties.isRtl ? '.padRight' : '.padLeft')).not.toBeNull();
        expect(container.querySelector(languageProperties.isRtl ? '.fRight' : '.fLeft')).not.toBeNull();
        const topicLinks = container.querySelectorAll('a[href^="#"]:not([href="#"])');
        expect(topicLinks.length).toBeGreaterThan(10);
        topicLinks.forEach(link => {
            expect(container.querySelector(link.getAttribute('href')!)).not.toBeNull();
        });
    });
});
