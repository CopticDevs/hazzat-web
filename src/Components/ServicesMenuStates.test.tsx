import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HymnsDataProvider } from '../Providers/HymnsDataProvider/HymnsDataProvider';
import { IServiceInfo } from '../Providers/HymnsDataProvider/Models/IServiceInfo';
import ServicesMenu from './ServicesMenu';

jest.mock('axios', () => ({ create: jest.fn() }));
jest.mock('./ServiceContents', () => ({ __esModule: true, default: ({ serviceName }: { serviceName: string }) => <section aria-label={serviceName}>{serviceName}</section> }));
const service = (id: string, order = 1): IServiceInfo => ({ id, name: id, displayName: id, seasonId: 'annual', order, verse: '', isDateSpecific: false });
afterEach(() => jest.restoreAllMocks());
const menu = (seasonId = 'annual') => <MemoryRouter><ServicesMenu seasonId={seasonId} seasonName="Annual" /></MemoryRouter>;

test('service list failures can be retried and results use metadata order', async () => {
    const load = jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList').mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([service('Later', 2), service('First')]);
    render(menu());
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('First');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByRole('region').map(node => node.textContent)).toEqual(['First', 'Later']);
    expect(load).toHaveBeenCalledTimes(2);
});

test('an unknown service deep link displays invalid address instead of unrelated services', async () => {
    jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList').mockResolvedValue([service('Known')]);
    render(<MemoryRouter initialEntries={['/services/missing']}><Routes><Route path="/services/:serviceId" element={<ServicesMenu seasonId="annual" seasonName="Annual" />} /></Routes></MemoryRouter>);
    expect(await screen.findByText(/page you are looking for is not found/i)).toBeInTheDocument();
    expect(screen.queryByText('Known')).not.toBeInTheDocument();
});

test.each(['resolve', 'reject'])('old season requests that %s do not replace the new menu', async outcome => {
    let resolve!: (services: IServiceInfo[]) => void;
    let reject!: (reason: Error) => void;
    jest.spyOn(HymnsDataProvider.prototype, 'getServiceSummaryList').mockImplementationOnce(() => new Promise((res, rej) => { resolve = res; reject = rej; })).mockResolvedValueOnce([service('New service')]);
    const { rerender } = render(menu('old'));
    rerender(menu('new'));
    await screen.findByText('New service');
    await act(async () => outcome === 'resolve' ? resolve([service('Old service')]) : reject(new Error('Old request')));
    expect(screen.getByText('New service')).toBeInTheDocument();
    expect(screen.queryByText('Old service')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
