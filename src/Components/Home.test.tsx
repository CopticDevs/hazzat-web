import { render, screen } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { AppSettings } from "../AppSettings";
import Home from './Home';

test('renders seasons link', () => {
  render(<BrowserRouter >
      <Home navItems={AppSettings.navigationMenuItems} />
  </BrowserRouter >
  );
  const linkElement = screen.getByText(/Seasons/i);
  expect(linkElement).toBeInTheDocument();
});
