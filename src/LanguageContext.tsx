import { createContext } from 'react';

interface ILanguageContext {
    language: string;
    setLanguage?: (targetLanguage: string) => void;
}

const defaultState: ILanguageContext = {
    language: "en"
};

export const LanguageContext = createContext<ILanguageContext>(defaultState);
