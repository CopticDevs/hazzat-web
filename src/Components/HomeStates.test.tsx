import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { HymnsDataProvider } from '../Providers/HymnsDataProvider/HymnsDataProvider';
import * as dates from '../Utils/SeasonDateUtils';
import { LanguageContext } from '../LanguageContext';
import { AppSettings } from '../AppSettings';

jest.mock('axios', () => ({ create: jest.fn() }));
afterEach(() => jest.restoreAllMocks());
const season = (id: string, withDates = false) => ({ id, name: id, displayName: id, order: 1, isDateSpecific: withDates, ...(withDates ? { dateStart: '2026-01-01', dateEnd: '2026-01-02' } : {}) });

test('home renders current and upcoming cards, localized dates and enabled other links', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([]);
    jest.spyOn(dates, 'getCurrentSeasons').mockReturnValue([season('Annual'), season('Current feast', true)]);
    jest.spyOn(dates, 'getUpcomingSeasons').mockReturnValue([season('Next feast', true), season('Undated feast')]);
    const format = jest.spyOn(dates, 'formatDateRange').mockReturnValue('January 1–2');
    const navItems = [...AppSettings.navigationMenuItems, { id: 'help' as const, location: '/hidden', disabled: true }];
    const { container } = render(<MemoryRouter><LanguageContext.Provider value={{ languageProperties: { ...AppSettings.defaultLanguage, isRtl: true } }}><Home navItems={navItems} /></LanguageContext.Provider></MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'Current feast January 1–2' })).toHaveAttribute('href', '/Seasons/Current feast');
    expect(screen.getByRole('link', { name: 'Next feast January 1–2' })).toHaveAttribute('href', '/Seasons/Next feast');
    expect(screen.getByRole('link', { name: 'Undated feast' })).toBeInTheDocument();
    expect(screen.getByText('Current Seasons')).toBeInTheDocument();
    expect(format).toHaveBeenCalledWith('2026-01-01', '2026-01-02', AppSettings.defaultLanguage.localeName);
    // The page wrapper's direction class has no accessible role.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.dirRtl.home-page')).toBeInTheDocument();
    expect(screen.getAllByRole('link').every(link => link.getAttribute('href') !== '/hidden')).toBe(true);
    expect(document.title).toBe('hazzat.com');
});

test('home stops loading and keeps navigation usable when seasons fail', async () => {
    const error = new Error('Offline');
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockRejectedValue(error);
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<MemoryRouter><Home navItems={AppSettings.navigationMenuItems} /></MemoryRouter>);
    await screen.findByText('Current Season');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Booklets' })).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith('Error loading seasons:', error);
});
