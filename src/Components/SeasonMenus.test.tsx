import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HymnsDataProvider } from '../Providers/HymnsDataProvider/HymnsDataProvider';
import { ISeasonInfo } from '../Providers/HymnsDataProvider/Models/ISeasonInfo';
import BookletsMenu from './BookletsMenu';
import SeasonsMenu from './SeasonsMenu';

jest.mock('axios', () => ({ create: jest.fn() }));
const season = (id: string, order: number, isDateSpecific = false): ISeasonInfo => ({ id, name: id, displayName: `Season ${id}`, order, isDateSpecific });
const mount = (component: React.ReactElement) => render(<MemoryRouter>{component}</MemoryRouter>);

afterEach(() => jest.restoreAllMocks());

test('booklets load seasons in metadata order with navigable cards', async () => {
    let resolve!: (seasons: ISeasonInfo[]) => void;
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockImplementation(() => new Promise(r => { resolve = r; }));
    mount(<BookletsMenu />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(document.title).toBe('Booklets - hazzat.com');
    const seasons = [season('later', 20), season('first', 1)];
    await act(async () => resolve(seasons));
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual(['Season first', 'Season later']);
    expect(screen.getByRole('link', { name: 'Season first' })).toHaveAttribute('href', '/first');
    expect(seasons.map(s => s.id)).toEqual(['later', 'first']);
});

test('booklets show the empty collection message', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([]);
    mount(<BookletsMenu />);
    expect(await screen.findByText(/No booklets/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('seasons place Annual first, then date-specific seasons, then other services in metadata order', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([
        season('other-late', 9), season('feast-late', 8, true), season('ANNUAL', 100), season('other-first', 2), season('feast-first', 1, true)
    ]);
    mount(<SeasonsMenu />);
    await screen.findByRole('link', { name: /Season ANNUAL/ });
    expect(document.title).toBe('Seasons - hazzat.com');
    expect(screen.getAllByRole('link').map(link => link.textContent?.trim())).toEqual([
        'Season ANNUAL', 'Season feast-first', 'Season feast-late', 'Season other-first', 'Season other-late'
    ]);
    expect(screen.getByRole('link', { name: /Season feast-first/ })).toHaveAttribute('href', '/feast-first');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

test('seasons support feeds without an annual season', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockResolvedValue([season('feast', 1, true), season('service', 2)]);
    mount(<SeasonsMenu />);
    await screen.findByRole('link', { name: /Season feast/ });
    expect(screen.getAllByRole('link')).toHaveLength(2);
});

test.each([['booklets', BookletsMenu], ['seasons', SeasonsMenu]] as const)('%s ignores a request completed after unmount', async (_name, Menu) => {
    let resolve!: (seasons: ISeasonInfo[]) => void;
    jest.spyOn(HymnsDataProvider.prototype, 'getSeasonList').mockImplementation(() => new Promise(r => { resolve = r; }));
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = mount(<Menu />);
    unmount();
    await act(async () => resolve([season('annual', 1)]));
    expect(errors).not.toHaveBeenCalled();
});
