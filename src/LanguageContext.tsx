import { createContext } from 'react';
import { AppSettings } from './AppSettings';
import { ILanguageProperties } from './l8n';
import { NavigationLanguage } from './sitePreferences';

interface ILanguageContext {
    languageProperties: ILanguageProperties;
    setLanguageProperties?: (targetLanguageProperties: ILanguageProperties) => void;
    setNavigationLanguage?: (language: NavigationLanguage) => void;
}

const defaultState: ILanguageContext = {
    languageProperties: AppSettings.defaultLanguage
};

export const LanguageContext = createContext<ILanguageContext>(defaultState);
