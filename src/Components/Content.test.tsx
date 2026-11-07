import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Content from './Content';
import { soundCloudEmbedUrl } from './SoundCloudUrl';
import { ContentType } from '../Providers/HymnsDataProvider/Models/IVariationInfo';

const track = 'https://soundcloud.com/coptichazzat/meghalo';
const audio = [{ id: 'a', name: 'Recording', displayName: 'Recording', content: { contentType: ContentType.AudioContent, audioFilePath: track } }];

test('failed content can be retried and replaces the alert with loaded content', async () => {
    const load = jest.fn().mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce(audio);
    render(<Content formatId="5" hymnTitle="Hymn" variationsCallback={load} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTitle('SoundCloud player: Recording')).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
});

test.each(['resolve', 'reject'])('stale requests that %s cannot overwrite new content', async outcome => {
    let resolve!: (value: typeof audio) => void;
    let reject!: (reason: Error) => void;
    const oldLoad = () => new Promise<typeof audio>((res, rej) => { resolve = res; reject = rej; });
    const { rerender } = render(<Content formatId="5" variationsCallback={oldLoad} />);
    const newLoad = jest.fn().mockResolvedValue(audio);
    rerender(<Content formatId="5" variationsCallback={newLoad} />);
    await screen.findByTitle('SoundCloud player: Recording');
    await act(async () => outcome === 'resolve' ? resolve([]) : reject(new Error('Old request')));
    expect(screen.getByTitle('SoundCloud player: Recording')).toHaveAttribute('src', soundCloudEmbedUrl(track));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test.each(['1', '2', '3', '4', '5', '6', '7'])('format %s supports an empty result and retains its hymn title', async formatId => {
    render(<Content formatId={formatId} hymnTitle="Empty hymn" variationsCallback={async () => []} />);
    expect(await screen.findByText('Empty hymn')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

test('unknown format finishes loading without choosing the wrong renderer', async () => {
    const { container } = render(<Content formatId="unknown" variationsCallback={async () => []} />);
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(container.textContent).toBe('');
});
