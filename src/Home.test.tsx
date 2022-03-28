import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders seasons link', () => {
  render(<Home />);
  const linkElement = screen.getByText(/Seasons/i);
  expect(linkElement).toBeInTheDocument();
});
