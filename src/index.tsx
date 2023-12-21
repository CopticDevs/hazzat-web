import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import EnvironmentProvider from './Contexts/Environment/EnvironmentProvider';
import { UserSettingProvider } from './Contexts/UserSettingsContext';
import LanguageProvider from './LanguageProvider';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <EnvironmentProvider>
            <LanguageProvider>
                <UserSettingProvider>
                    <App />
                </UserSettingProvider>
            </LanguageProvider>
        </EnvironmentProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
