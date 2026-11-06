import { render, screen } from '@testing-library/react';
import { ContentType, IAudioContent, IMusicalNotesContent, IVariationInfo, IVideoContent, IHymnContent } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import ContentAudio from './ContentAudio';
import ContentVideo from './ContentVideo';
import ContentMusicalNotes from './ContentMusicalNotes';
import MusicXmlScore from './MusicXmlScore';

jest.mock('./MusicXmlScore', () => ({ __esModule: true, default: jest.fn(() => <div>Rendered score</div>) }));
beforeEach(() => (MusicXmlScore as jest.Mock).mockImplementation(() => <div>Rendered score</div>));
const variation = <T extends IHymnContent,>(id: string, content: T): IVariationInfo<T> => ({ id, name: id, displayName: `Version ${id}`, content });
const audio = (id: string, path: string) => variation<IAudioContent>(id, { contentType: ContentType.AudioContent, audioFilePath: path });
const video = (id: string, copticVideo = '', englishVideo = '', arabicVideo = '') => variation<IVideoContent>(id, { contentType: ContentType.VideoContent, copticVideo, englishVideo, arabicVideo });
const score = (id: string, musicXml: string) => variation<IMusicalNotesContent>(id, { contentType: ContentType.MusicalNotesContent, musicXml });

test('audio labels alternatives and opens valid recordings safely in another tab', () => {
    render(<ContentAudio hymnTitle="Alleluia" variations={[audio('cantor', '/recording.mp3'), audio('empty', '')]} />);
    expect(screen.getByText('Alleluia')).toBeInTheDocument();
    expect(screen.getByText('Version cantor')).toBeInTheDocument();
    expect(screen.getByText('Version empty')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/recording.mp3');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(screen.getByRole('img', { name: 'cantor' })).toBeInTheDocument();
});

test('a single audio variation does not repeat a variation heading', () => {
    render(<ContentAudio variations={[audio('cantor', '/recording.mp3')]} />);
    expect(screen.queryByText('Version cantor')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
});

test('video displays every available language in order and skips absent videos', () => {
    render(<ContentVideo hymnTitle="Alleluia" variations={[video('complete', 'cop', 'eng', 'ara'), video('empty')]} />);
    expect(screen.getByText('Alleluia')).toBeInTheDocument();
    expect(screen.getByText('Version complete')).toBeInTheDocument();
    expect(screen.getByText('Version empty')).toBeInTheDocument();
    expect(screen.getAllByTitle('YouTube video').map(frame => frame.getAttribute('src'))).toEqual([
        'https://www.youtube.com/embed/cop?autoplay=0', 'https://www.youtube.com/embed/eng?autoplay=0', 'https://www.youtube.com/embed/ara?autoplay=0'
    ]);
});

test('a single empty video variation has no player or repeated heading', () => {
    const { container } = render(<ContentVideo variations={[video('empty')]} />);
    expect(screen.queryByTitle('YouTube video')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
});

test('musical notes pass XML and the hymn title to the renderer, with headings for alternatives', () => {
    render(<ContentMusicalNotes hymnTitle="Alleluia" variations={[score('complete', '<score-partwise/>'), score('empty', '')]} />);
    expect(screen.getByText('Alleluia')).toBeInTheDocument();
    expect(screen.getByText('Version complete')).toBeInTheDocument();
    expect(screen.getByText('Version empty')).toBeInTheDocument();
    expect(screen.getAllByText('Rendered score')).toHaveLength(1);
    expect(MusicXmlScore).toHaveBeenCalledWith({ musicXml: '<score-partwise/>', hymnTitle: 'Alleluia' }, {});
});

test('a single empty score does not produce a heading or renderer', () => {
    const { container } = render(<ContentMusicalNotes variations={[score('empty', '')]} />);
    expect(container.textContent).toBe('');
});
