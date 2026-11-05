import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContentText from './ContentText';
import HymnRow from './HymnRow';
import FontInstall7 from './FontInstall7';
import FontInstallXP from './FontInstallXP';
import UsingHazzatFont from './UsingHazzatFont';
import UsingVerticalHazzatFont from './UsingVerticalHazzatFont';
import { ContentLanguage, ContentType } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import { strings } from '../l8n';

afterEach(() => jest.restoreAllMocks());

test('adjacent paragraphs share a table until the set of languages changes', () => {
    render(<ContentText variations={[{ id: 'text', name: 'text', displayName: 'text', content: { contentType: ContentType.TextContent, paragraphs: [
        { columns: [{ language: ContentLanguage.English, content: 'First paragraph' }] },
        { columns: [{ language: ContentLanguage.English, content: 'Second paragraph' }] },
        { columns: [{ language: ContentLanguage.Arabic, content: 'Arabic paragraph' }] },
        { columns: [{ language: 'unsupported' as ContentLanguage, content: 'Unsupported only' }] }
    ] } }]} />);
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
    expect(within(tables[0]).getAllByRole('row')).toHaveLength(2);
    expect(tables[0]).toHaveTextContent('First paragraph');
    expect(tables[0]).toHaveTextContent('Second paragraph');
    expect(tables[1]).toHaveTextContent('Arabic paragraph');
    expect(screen.queryByText('Unsupported only')).not.toBeInTheDocument();
});

test.each(['1', '2', '3', '4', '5', '6', '7'])('a hymn with only format %s links its title to that format and reports its availability', id => {
    const found = jest.fn();
    render(<MemoryRouter><HymnRow hymn={{ id: 'hymn', name: 'Hymn', displayName: 'Hymn', order: 1, formats: [{ id, name: 'Format', order: 1, variationCount: 0 }] }} seasonId="annual" serviceId="vespers" isAlternate={false} handleFoundFormat={found} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Hymn' })).toHaveAttribute('href', `/seasons/annual/services/vespers/hymns/hymn/formats/${id}`);
    expect(found).toHaveBeenCalledWith(id);
});

test('a hymn without formats remains readable without a dead title link', () => {
    render(<MemoryRouter><HymnRow hymn={{ id: 'hymn', name: 'Hymn', displayName: 'Hymn', order: 1 }} seasonId="annual" serviceId="vespers" isAlternate /></MemoryRouter>);
    expect(screen.getByText('Hymn')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Hymn' })).not.toBeInTheDocument();
});

test.each([['Windows 7', FontInstall7], ['Windows XP', FontInstallXP], ['Hazzat', UsingHazzatFont], ['Vertical Hazzat', UsingVerticalHazzatFont]] as const)('%s help page returns to browser history', (_name, Page) => {
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<MemoryRouter><Page /></MemoryRouter>);
    fireEvent.click(screen.getByRole('link', { name: strings.goBack }));
    expect(back).toHaveBeenCalledTimes(1);
});
