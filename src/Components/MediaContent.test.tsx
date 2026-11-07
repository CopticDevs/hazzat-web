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

test('audio labels supported alternatives in order and skips empty recordings', () => {
    render(<ContentAudio hymnTitle="Alleluia" variations={[
        audio('cantor', 'https://soundcloud.com/hazzat/first'), audio('empty', ''),
        audio('choir', 'https://soundcloud.com/hazzat/second'),
    ]} />);
    expect(screen.getByText('Alleluia')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual(['Version cantor', 'Version choir']);
    expect(screen.queryByText('Version empty')).not.toBeInTheDocument();
    expect(screen.getAllByTitle(/^SoundCloud player:/).map(frame => frame.getAttribute('title'))).toEqual([
        'SoundCloud player: Version cantor', 'SoundCloud player: Version choir',
    ]);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('a single supported audio variation does not repeat a variation heading', () => {
    render(<ContentAudio variations={[audio('cantor', 'https://soundcloud.com/hazzat/first')]} />);
    expect(screen.queryByText('Version cantor')).not.toBeInTheDocument();
    expect(screen.getAllByTitle(/^SoundCloud player:/)).toHaveLength(1);
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
