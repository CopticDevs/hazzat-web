import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import { AppSettings } from "../AppSettings";
import Home from './Home';
import { LanguageContext } from '../LanguageContext';
import { EnvironmentContext, prodEnvProps } from '../Contexts/Environment/EnvironmentContext';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn()
  }))
}));

const mockLanguageContext = {
  languageProperties: {
    localeName: 'en',
    friendlyName: 'English',
    isRtl: false,
    getString: (key: string) => key
  },
  setLanguageProperties: jest.fn()
};

const mockEnvironmentContext = {
  environmentProperties: prodEnvProps,
  setEnvironmentProperties: jest.fn()
};

test('renders current and upcoming seasons sections', async () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockGet = jest.fn().mockResolvedValue({ data: [] });
  mockedAxios.create = jest.fn(() => ({ get: mockGet } as any));

  render(
    <BrowserRouter>
      <LanguageContext.Provider value={mockLanguageContext}>
        <EnvironmentContext.Provider value={mockEnvironmentContext}>
          <Home navItems={AppSettings.navigationMenuItems} />
        </EnvironmentContext.Provider>
      </LanguageContext.Provider>
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Current Season/i)).toBeInTheDocument();
  });
});
