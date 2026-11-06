import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppSettings } from '../AppSettings';
import { LanguageContext } from '../LanguageContext';
import { ContentType } from '../Providers/HymnsDataProvider/Models/IVariationInfo';
import ContentInformation from './ContentInformation';
import ContentVerticalHazzat from './ContentVerticalHazzat';
import ContentLoadError from './ContentLoadError';
import FormatOptionMenuItem from './FormatOptionMenuItem';
import BreadCrumb from './BreadCrumb';
import YouTube from './YoutubeVideo';

const arabic = { ...AppSettings.defaultLanguage, localeName: 'ar', isRtl: true };

test('information alternatives render only the supplied languages with independent headings', () => {
    const { container } = render(<ContentInformation hymnTitle="Hymn history" variations={[
        { id: 'en', name: 'en', displayName: 'English history', content: { contentType: ContentType.InformationContent, englishInformation: '<strong>English details</strong>', arabicInformation: '' } },
        { id: 'ar', name: 'ar', displayName: 'Arabic history', content: { contentType: ContentType.InformationContent, englishInformation: '', arabicInformation: 'Arabic details' } }
    ]} />);
    expect(screen.getByText('English history')).toBeInTheDocument();
    expect(screen.getByText('Arabic history')).toBeInTheDocument();
    expect(screen.getByText('Hymn history')).toBeInTheDocument();
    // Language columns are layout elements, without a semantic role.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.information-language')).toHaveLength(2);
    expect(screen.getByText('Arabic details')).toHaveAttribute('lang', 'ar');
    expect(screen.getByText('Arabic details')).toHaveStyle({ direction: 'rtl' });
});

test('vertical notation keeps multilingual alternatives and their labels separate', () => {
    render(<ContentVerticalHazzat hymnTitle="Hymn" variations={[
        { id: 'full', name: 'full', displayName: 'Full notation', content: { contentType: ContentType.VerticalHazzatContent, englishVerticalHazzat: 'English notation', copticVerticalHazzat: 'Coptic notation', arabicVerticalHazzat: 'Arabic notation' } },
        { id: 'empty', name: 'empty', displayName: 'Empty notation', content: { contentType: ContentType.VerticalHazzatContent, englishVerticalHazzat: '', copticVerticalHazzat: '', arabicVerticalHazzat: '' } }
    ]} />);
    ['Hymn', 'Full notation', 'Empty notation', 'English notation', 'Coptic notation', 'Arabic notation'].forEach(text => expect(screen.getByText(text)).toBeInTheDocument());
});

test('Arabic load errors expose a localized retry action', () => {
    const retry = jest.fn();
    render(<LanguageContext.Provider value={{ languageProperties: arabic }}><ContentLoadError retry={retry} /></LanguageContext.Provider>);
    expect(screen.getByRole('alert')).toHaveTextContent('تعذر تحميل المحتوى بالكامل');
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(retry).toHaveBeenCalledTimes(1);
});

test('Arabic format icons mirror and preserve an emphasized active label', () => {
    const { container } = render(<LanguageContext.Provider value={{ languageProperties: arabic }}><FormatOptionMenuItem formatId="1" fullFormatId="1" title="Hymn" isActive /></LanguageContext.Provider>);
    // Decorative SVG icons are intentionally hidden from accessible queries.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.flipRtl')).toHaveLength(2);
    expect(screen.getByText('نص')).toHaveProperty('tagName', 'STRONG');
});

test('breadcrumbs identify the current linked page even with case differences', () => {
    render(<MemoryRouter initialEntries={['/SEASONS']}><BreadCrumb items={[{ title: 'Seasons', path: '/Seasons' }, { title: 'Home', path: '/' }]} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Seasons' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
});

test('YouTube honors configured autoplay and escapes the video identifier', () => {
    const original = AppSettings.autoPlayVideo;
    AppSettings.autoPlayVideo = true;
    try {
        render(<YouTube videoId="video?extra=value" />);
        expect(screen.getByTitle('YouTube video')).toHaveAttribute('src', 'https://www.youtube.com/embed/video%3Fextra%3Dvalue?autoplay=1');
    } finally { AppSettings.autoPlayVideo = original; }
});
