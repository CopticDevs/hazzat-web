import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import EnvironmentProvider from './Contexts/Environment/EnvironmentProvider';
import { UserSettingProvider } from './Contexts/UserSettingsContext';
import LanguageProvider from './LanguageProvider';
import reportWebVitals from './reportWebVitals';
import './css/theme.css';
import './css/print.css';
import { ThemeProvider } from './Contexts/ThemeContext';

const container = document.getElementById('root');
if (!container) throw new Error('Missing application root');
export const root = createRoot(container);
root.render(
    <React.StrictMode>
        <ThemeProvider>
        <BrowserRouter>
        <EnvironmentProvider>
            <LanguageProvider>
                <UserSettingProvider>
                    <App />
                </UserSettingProvider>
            </LanguageProvider>
        </EnvironmentProvider>
        </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
