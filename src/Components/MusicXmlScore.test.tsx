import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import MusicXmlScore from "./MusicXmlScore";
import UserSettingsChanger from "./UserSettingsChanger";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";

const mockInstances: any[] = [];
let mockLoad: (() => Promise<void>) | undefined;
jest.mock("opensheetmusicdisplay", () => ({
    OpenSheetMusicDisplay: class { constructor(container: HTMLDivElement, options: unknown) {
        const score = { container, options, Zoom: 0, Sheet: { TitleString: "MusicXML score title", SubtitleString: "Source subtitle" },
            load: jest.fn(() => mockLoad ? mockLoad() : Promise.resolve()), render: jest.fn(), clear: jest.fn() };
        mockInstances.push(score);
        return score;
    } }
}));

let width = 320;
let resized: () => void;
const disconnect = jest.fn();
const sizeSetter = jest.fn();
const value = (size: number) => ({ userSettings: { englishFontSize: `${size}px`, arabicFontSize: `${size + 4}px`, contentFontColor: "BLACK", hazzatFontColor: "BLACK" }, setContentFontSize: sizeSetter, setContentFontColor: jest.fn(), setHazzatFontColor: jest.fn() });
const score = (size = 18, xml = "<score-partwise />") => <UserSettingsContext.Provider value={value(size)}><MusicXmlScore musicXml={xml} /></UserSettingsContext.Provider>;

beforeEach(() => {
    width = 320; mockInstances.length = 0; mockLoad = undefined; disconnect.mockClear(); sizeSetter.mockClear();
    jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => window.setTimeout(() => callback(0), 0));
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(id => window.clearTimeout(id));
    window.ResizeObserver = class { constructor(callback: ResizeObserverCallback) { resized = () => callback([], this); } observe() {} unobserve() {} disconnect = disconnect; };
});
afterEach(() => { cleanup(); jest.restoreAllMocks(); });

test('mobile notes use smaller engraving and size changes redraw without reloading XML', async () => {
    const view = render(score());
    await waitFor(() => expect(mockInstances[0].render).toHaveBeenCalled());
    const instance = mockInstances[0];
    expect(instance.Zoom).toBeCloseTo(0.5);
    expect(instance.options).toMatchObject({ autoResize: false, drawTitle: false, drawSubtitle: false });
    expect(screen.getByRole('heading', { name: 'MusicXML score title' })).toBeInTheDocument();
    expect(screen.getByText('Source subtitle')).toBeInTheDocument();
    view.rerender(score(26));
    await waitFor(() => expect(instance.Zoom).toBeCloseTo(0.5 * 26 / 18));
    expect(view.container.querySelector('.musicXmlScoreWrap')).toHaveStyle({ fontSize: '26px' });
    view.rerender(score(12));
    await waitFor(() => expect(instance.Zoom).toBeCloseTo(0.5 * 12 / 18));
    expect(instance.load).toHaveBeenCalledTimes(1);
    expect(instance.clear).not.toHaveBeenCalled();
});

test('width changes reflow the existing score and do not reload its payload', async () => {
    render(score());
    await waitFor(() => expect(mockInstances[0].render).toHaveBeenCalled());
    const instance = mockInstances[0];
    width = 900; act(() => resized());
    await waitFor(() => expect(instance.Zoom).toBeCloseTo(0.9));
    width = 480; act(() => resized());
    await waitFor(() => expect(instance.Zoom).toBeCloseTo(0.6));
    expect(instance.load).toHaveBeenCalledTimes(1);
});

test('a score loaded while hidden renders when its container becomes visible', async () => {
    width = 0; render(score());
    await screen.findByRole('heading', { name: 'MusicXML score title' });
    expect(mockInstances[0].render).not.toHaveBeenCalled();
    width = 360; act(() => resized());
    await waitFor(() => expect(mockInstances[0].render).toHaveBeenCalled());
});

test('uses the latest size when loading finishes and cancels observers on unmount', async () => {
    let finish!: () => void; mockLoad = () => new Promise<void>(resolve => { finish = resolve; });
    const view = render(score());
    view.rerender(score(24));
    await act(async () => finish());
    await waitFor(() => expect(mockInstances[0].render).toHaveBeenCalled());
    expect(mockInstances[0].Zoom).toBeCloseTo(0.5 * 24 / 18);
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(mockInstances[0].clear).toHaveBeenCalledTimes(1);
});

test('a stale XML load cannot render or clear the replacement score', async () => {
    let finish!: () => void; mockLoad = () => new Promise<void>(resolve => { finish = resolve; });
    const view = render(score());
    const old = mockInstances[0]; mockLoad = undefined;
    view.rerender(score(18, '<score-partwise version="4.0" />'));
    await waitFor(() => expect(mockInstances[1].render).toHaveBeenCalled());
    await act(async () => finish());
    expect(old.render).not.toHaveBeenCalled();
    expect(old.clear).toHaveBeenCalledTimes(1);
    expect(mockInstances[1].clear).not.toHaveBeenCalled();
});

test('reports a renderer load failure instead of leaving an empty score', async () => {
    mockLoad = () => Promise.reject(new Error('Invalid score'));
    render(score());
    expect(await screen.findByText('Invalid score')).toBeInTheDocument();
    expect(mockInstances[0].render).not.toHaveBeenCalled();
});

test('settings controls start from the current size rather than resetting to 18', () => {
    window.gtag = jest.fn();
    const view = render(<UserSettingsContext.Provider value={value(22)}><UserSettingsChanger /></UserSettingsContext.Provider>);
    fireEvent.click(view.container.querySelector('button')!);
    fireEvent.click(document.querySelectorAll('.size-button')[1]);
    expect(sizeSetter).toHaveBeenLastCalledWith(24);
    view.rerender(<UserSettingsContext.Provider value={value(24)}><UserSettingsChanger /></UserSettingsContext.Provider>);
    fireEvent.click(document.querySelectorAll('.size-button')[0]);
    expect(sizeSetter).toHaveBeenLastCalledWith(22);
});


test('an identical hymn heading is not repeated but distinct score titles and subtitles remain', async () => {
    const view = render(<MusicXmlScore musicXml="<score-partwise />" hymnTitle="MusicXML score title" />);
    await screen.findByText('Source subtitle');
    expect(screen.queryByRole('heading', { name: 'MusicXML score title' })).not.toBeInTheDocument();
    view.rerender(<MusicXmlScore musicXml="<score-partwise />" hymnTitle="A different hymn title" />);
    expect(screen.getByRole('heading', { name: 'MusicXML score title' })).toBeInTheDocument();
});
