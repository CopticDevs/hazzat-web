import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import RouteScroll from './RouteScroll';

function Navigation() {
    const navigate = useNavigate();
    return <><main id="main-content" tabIndex={-1}>Reader</main><button onClick={() => navigate('/next')}>Next</button><button onClick={() => navigate(-1)}>Back</button></>;
}
const originalObserver = window.ResizeObserver;
const originalRestoration = window.history.scrollRestoration;
let onResize: ResizeObserverCallback;
const disconnect = jest.fn();
const observe = jest.fn();
beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => window.setTimeout(() => callback(0), 1));
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => window.clearTimeout(id));
    window.ResizeObserver = jest.fn().mockImplementation(callback => {
        onResize = callback;
        return { observe, disconnect };
    });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
});
afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    window.ResizeObserver = originalObserver;
    window.history.scrollRestoration = originalRestoration;
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
});
const tick = () => act(() => { jest.advanceTimersByTime(1); });

test('back restores saved reading position as content grows and disconnects when it fits', () => {
    const height = jest.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(100);
    const { unmount } = render(<MemoryRouter><RouteScroll /><Navigation /></MemoryRouter>);
    expect(window.history.scrollRestoration).toBe('manual');
    tick();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 400 });
    fireEvent.scroll(window);
    fireEvent.click(screen.getByText('Next'));
    tick();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });
    fireEvent.click(screen.getByText('Back'));
    tick();
    expect(observe).toHaveBeenCalledWith(document.body);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 400, behavior: 'auto' });
    expect(disconnect).not.toHaveBeenCalled();
    height.mockReturnValue(3000);
    act(() => onResize([], {} as ResizeObserver));
    expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(window.history.scrollRestoration).toBe(originalRestoration);
});

test.each(['wheel', 'touchstart', 'keydown'])('%s cancels pending scroll restoration', eventName => {
    render(<MemoryRouter><RouteScroll /><Navigation /></MemoryRouter>);
    fireEvent(window, new Event(eventName));
    tick();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
});

test('hash navigation leaves anchor positioning to the browser', () => {
    render(<MemoryRouter initialEntries={['/reader#verse']}><RouteScroll /><Navigation /></MemoryRouter>);
    tick();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
});
