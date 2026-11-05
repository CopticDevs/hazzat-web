import { fireEvent, render, screen } from '@testing-library/react';
import ToTopButton from './ToTopButton';

const originalMatchMedia = window.matchMedia;
const originalScrollTo = window.scrollTo;
const originalGtag = window.gtag;
afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.scrollTo = originalScrollTo;
    window.gtag = originalGtag;
});

test.each([true, false, undefined])('scrolls to the top respecting reduced motion preference %s', (reducedMotion) => {
    window.scrollTo = jest.fn();
    window.matchMedia = reducedMotion === undefined ? undefined as any : jest.fn().mockReturnValue({ matches: reducedMotion });
    window.gtag = jest.fn();
    render(<ToTopButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'button_click', { event_category: 'Engagement', event_label: 'ToTop Button Clicked' });
});

test('scrolls when analytics are unavailable', () => {
    window.scrollTo = jest.fn();
    window.gtag = undefined as any;
    render(<ToTopButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
});
