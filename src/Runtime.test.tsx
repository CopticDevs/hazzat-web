import React, { useContext } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EnvironmentProvider from './Contexts/Environment/EnvironmentProvider';
import { EnvironmentContext, devEnvProps, ppeEnvProps, prodEnvProps } from './Contexts/Environment/EnvironmentContext';
import reportWebVitals from './reportWebVitals';
import { stringFormat } from './stringFormat';
import * as vitals from 'web-vitals';

jest.mock('web-vitals', () => ({ getCLS: jest.fn(), getFID: jest.fn(), getFCP: jest.fn(), getLCP: jest.fn(), getTTFB: jest.fn() }));

function EnvironmentConsumer() {
    const { environmentProperties, setEnvironmentProperties } = useContext(EnvironmentContext);
    return <><output>{environmentProperties.baseUrl}</output><button onClick={() => setEnvironmentProperties?.(devEnvProps)}>Use development</button></>;
}

afterEach(() => { window.history.replaceState({}, '', '/'); jest.clearAllMocks(); });

it.each([
    ['', prodEnvProps], ['?env=', prodEnvProps], ['?env=invalid', prodEnvProps],
    ['?env=prod', prodEnvProps], ['?env=PpE', ppeEnvProps], ['?env=dev', devEnvProps]
])('selects the appropriate service environment for %s', (search, expected) => {
    window.history.replaceState({}, '', `/${search}`);
    render(<EnvironmentProvider><EnvironmentConsumer /></EnvironmentProvider>);
    expect(screen.getByRole('status')).toHaveTextContent(expected.baseUrl);
});

it('lets descendants change the selected environment', () => {
    render(<EnvironmentProvider><EnvironmentConsumer /></EnvironmentProvider>);
    expect(screen.getByRole('status')).toHaveTextContent(prodEnvProps.baseUrl);
    fireEvent.click(screen.getByRole('button', { name: 'Use development' }));
    expect(screen.getByRole('status')).toHaveTextContent(devEnvProps.baseUrl);
});

it('registers the supplied performance callback for all five web vitals', async () => {
    const report = () => undefined;
    reportWebVitals(report);
    await waitFor(() => expect(vitals.getCLS).toHaveBeenCalledWith(report));
    for (const register of [vitals.getCLS, vitals.getFID, vitals.getFCP, vitals.getLCP, vitals.getTTFB]) {
        expect(register).toHaveBeenCalledTimes(1);
        expect(register).toHaveBeenCalledWith(report);
    }
});

it('does not enable performance collection when no callback is supplied', async () => {
    reportWebVitals();
    await Promise.resolve();
    [vitals.getCLS, vitals.getFID, vitals.getFCP, vitals.getLCP, vitals.getTTFB].forEach(register => expect(register).not.toHaveBeenCalled());
});

it('formats positional substitutions, preserves literal templates, and handles empty text', () => {
    expect(stringFormat('{0} / {1} / {0}', 'English', 'العربية')).toBe('English / العربية / English');
    expect(stringFormat('Literal text')).toBe('Literal text');
    expect(stringFormat('')).toBe('');
});

it('exposes the configured analytics callback without requiring analytics to be installed', () => {
    const original = window.gtag;
    try {
        const analytics = jest.fn();
        window.gtag = analytics;
        jest.isolateModules(() => { expect(require('./ga').default).toBe(analytics); });
        delete window.gtag;
        jest.isolateModules(() => { expect(require('./ga').default).toBeUndefined(); });
    } finally { window.gtag = original; }
});
