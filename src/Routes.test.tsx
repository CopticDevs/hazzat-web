import { render, screen } from '@testing-library/react';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';

describe('Route Redirects - Deprecated Routes', () => {
  it('should redirect /Types to /Seasons', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/Types']}>
        <Routes>
          <Route path="/Seasons" element={<div>Seasons Page</div>} />
          <Route path="/Types/*" element={<Navigate to="/Seasons" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Seasons Page')).toBeInTheDocument();
  });

  it('should redirect /Tunes to /Seasons', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/Tunes']}>
        <Routes>
          <Route path="/Seasons" element={<div>Seasons Page</div>} />
          <Route path="/Tunes/*" element={<Navigate to="/Seasons" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Seasons Page')).toBeInTheDocument();
  });

  it('should redirect /Types/any-path to /Seasons', () => {
    render(
      <MemoryRouter initialEntries={['/Types/some-type/some-season']}>
        <Routes>
          <Route path="/Seasons" element={<div>Seasons Page</div>} />
          <Route path="/Types/*" element={<Navigate to="/Seasons" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Seasons Page')).toBeInTheDocument();
  });

  it('should redirect /Tunes/any-path to /Seasons', () => {
    render(
      <MemoryRouter initialEntries={['/Tunes/some-tune/some-season']}>
        <Routes>
          <Route path="/Seasons" element={<div>Seasons Page</div>} />
          <Route path="/Tunes/*" element={<Navigate to="/Seasons" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Seasons Page')).toBeInTheDocument();
  });

  it('should not redirect valid Seasons route', () => {
    render(
      <MemoryRouter initialEntries={['/Seasons']}>
        <Routes>
          <Route path="/Seasons" element={<div>Seasons Page</div>} />
          <Route path="/Types/*" element={<Navigate to="/Seasons" replace />} />
          <Route path="/Tunes/*" element={<Navigate to="/Seasons" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Seasons Page')).toBeInTheDocument();
  });

  it('should not redirect Booklets route', () => {
    render(
      <MemoryRouter initialEntries={['/Booklets']}>
        <Routes>
          <Route path="/Booklets" element={<div>Booklets Page</div>} />
          <Route path="/Types/*" element={<Navigate to="/Seasons" replace />} />
          <Route path="/Tunes/*" element={<Navigate to="/Seasons" replace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Booklets Page')).toBeInTheDocument();
  });
});
