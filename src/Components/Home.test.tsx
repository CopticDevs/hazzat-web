import { BrowserRouter } from "react-router-dom";
import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders seasons link', () => {
  render(<BrowserRouter >
    <Home />
  </BrowserRouter >
  );
  const linkElement = screen.getByText(/Seasons/i);
  expect(linkElement).toBeInTheDocument();
});
