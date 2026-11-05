import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HymnsDataProvider } from '../Providers/HymnsDataProvider/HymnsDataProvider';
import { IServiceInfo } from '../Providers/HymnsDataProvider/Models/IServiceInfo';
import ServiceContents from './ServiceContents';

jest.mock('axios', () => ({ create: jest.fn() }));
const service: IServiceInfo = { id: 'vespers', name: 'Vespers', displayName: 'Vespers', order: 1, verse: '', isDateSpecific: false, seasonId: 'annual' };
afterEach(() => jest.restoreAllMocks());
const menu = (serviceId = 'vespers') => <MemoryRouter><ServiceContents seasonId="annual" serviceId={serviceId} serviceName="Vespers" /></MemoryRouter>;

test('a missing service produces a retryable error and an empty valid service recovers', async () => {
    const load = jest.spyOn(HymnsDataProvider.prototype, 'getService').mockResolvedValueOnce(undefined).mockResolvedValueOnce(service);
    render(menu());
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('Vespers');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
});

test('a failed old service request cannot hide a newer service', async () => {
    let reject!: (reason: Error) => void;
    jest.spyOn(HymnsDataProvider.prototype, 'getService').mockImplementationOnce(() => new Promise((_res, rej) => { reject = rej; })).mockResolvedValueOnce(service);
    const { rerender } = render(menu('old'));
    rerender(menu('new'));
    await screen.findByText('Vespers');
    await act(async () => reject(new Error('Old request')));
    expect(screen.getByText('Vespers')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
