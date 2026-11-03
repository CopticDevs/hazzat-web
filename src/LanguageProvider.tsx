import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArabicLanguageProperties, EnglishLanguageProperties, strings } from "./l8n";
import { LanguageContext } from "./LanguageContext";
import { browserLanguage, initialLanguage, languageFromTag, languageStorageKey, NavigationLanguage, readPreference, savePreference, validLanguage } from "./sitePreferences";

function LanguageProvider({ children }: { children?: React.ReactNode }) {
    const { search } = useLocation();
    const [manualLanguage, setManualLanguage] = useState(() => validLanguage(readPreference(languageStorageKey)));
    const [preferredLanguage, setPreferredLanguage] = useState(browserLanguage);
    const language = languageFromTag(new URLSearchParams(search).get("lang")) || manualLanguage || preferredLanguage;
    const [appliedLanguage, setAppliedLanguage] = useState(() => {
        const initial = initialLanguage(search);
        strings.setLanguage(initial);
        return initial;
    });
    const languageProperties = appliedLanguage === "ar" ? ArabicLanguageProperties : EnglishLanguageProperties;
    useLayoutEffect(() => {
        strings.setLanguage(language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        setAppliedLanguage(language);
    }, [language]);
    useEffect(() => {
        const update = () => setPreferredLanguage(browserLanguage());
        const sync = (event: StorageEvent) => {
            if (event.storageArea && event.storageArea !== localStorage) return;
            if (event.key === languageStorageKey || event.key === null) {
                setManualLanguage(validLanguage(event.key === null ? null : event.newValue));
            }
        };
        window.addEventListener("languagechange", update);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("languagechange", update);
            window.removeEventListener("storage", sync);
        };
    }, []);
    const setNavigationLanguage = (choice: NavigationLanguage) => {
        setManualLanguage(choice);
        savePreference(languageStorageKey, choice);
    };
    return <LanguageContext.Provider value={{ languageProperties, setNavigationLanguage }}>
        {children}
    </LanguageContext.Provider>;
}
export default LanguageProvider;
