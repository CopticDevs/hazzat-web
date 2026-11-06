import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteNavigation from './SiteNavigation';

test('navigation stays open for inside clicks but closes when clicking outside', () => {
    render(<MemoryRouter><SiteNavigation id="main-menu" navItems={[{ id: 'home', location: '/' }]} /><button>Outside navigation</button></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('navigation'));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Outside navigation' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
