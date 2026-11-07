import { cleanup, render, screen, within } from '@testing-library/react';
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
        render(
            <LanguageContext.Provider value={{ languageProperties }}>
                <MemoryRouter initialEntries={[`${path}?lang=${languageProperties.localeName}`]}><App /></MemoryRouter>
            </LanguageContext.Provider>
        );
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(strings[title]);
        expect(screen.queryByText(strings.noContent)).not.toBeInTheDocument();

        const tables = screen.getAllByRole('table');
        expect(tables.length).toBeGreaterThan(1);
        // These selectors assert the markup contract on elements found by their roles.
        screen.getAllByRole('rowgroup').forEach(group => {
            expect(group.matches('table > thead, table > tbody, table > tfoot')).toBe(true);
            within(group).getAllByText(() => true, { selector: ':scope > *' }).forEach(row => {
                expect(row.tagName).toBe('TR');
            });
        });
        [...screen.getAllByRole('columnheader'), ...screen.getAllByRole('cell')].forEach(cell => {
            expect(cell.matches('tr > th, tr > td')).toBe(true);
        });
        screen.getAllByRole('row').forEach(row => {
            expect(row.matches('thead > tr, tbody > tr, tfoot > tr')).toBe(true);
        });
        expect(screen.queryAllByText(() => true, { selector: 'p div' })).toHaveLength(0);
        const mappings = screen.getByRole('table', { name: strings.keyMappings });
        const mappingRows = within(mappings).getAllByRole('row').filter(row => row.matches('tbody > tr'));
        expect(mappingRows).toHaveLength(mappingCount);
        const keys = mappingRows.map(row => within(row).getAllByRole('cell')[0].textContent);
        expect(new Set(keys).size).toBe(mappingCount);
        expect(within(mappings).getAllByRole('columnheader').filter(cell => cell.matches('thead > tr > th'))).toHaveLength(3);
        expect(within(mappings).getAllByText(() => true, { selector: `.${fontClass}` })).toHaveLength(mappingCount);
        expect(screen.getAllByText(() => true, { selector: `#exampleHymn .${fontClass}` }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(() => true, { selector: '#exampleHymn .dirLtr' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(() => true, { selector: languageProperties.isRtl ? '.padRight' : '.padLeft' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(() => true, { selector: languageProperties.isRtl ? '.fRight' : '.fLeft' }).length).toBeGreaterThan(0);
        const topicLinks = screen.getAllByRole('link').filter(link => /^#.+/.test(link.getAttribute('href') ?? ''));
        expect(topicLinks.length).toBeGreaterThan(10);
        topicLinks.forEach(link => {
            expect(screen.getAllByText(() => true, { selector: link.getAttribute('href')! }).length).toBeGreaterThan(0);
        });
    });
});
