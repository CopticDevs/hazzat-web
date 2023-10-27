import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AppSettings } from "../AppSettings";
import { LanguageContext } from "../LanguageContext";
import MyNavLink from "./MyNavLink";

function LanguageSwitcher() {
    const location = useLocation();
    const { languageProperties } = useContext(LanguageContext);

    // Get the current language from the query parameters
    const searchParams = new URLSearchParams(location.search);

    const collectLangChangeAnalytics = (langCode: string) => {
        // Track Language change
        window.gtag('event', `change_nav_lang`, {
            event_category: 'Customization',
            event_label: `${langCode} Language Selected`,
        });
    };

    // Update the lang query parameter in the URL with the new language code
    const handleLanguageClick = (langCode: string) => {
        searchParams.set('lang', langCode);
        const url = `${location.pathname}?${searchParams.toString()}`;
        window.location.href = url;
        collectLangChangeAnalytics(langCode);
    };
    
    return (
        <>
            {
                AppSettings.supportedLanguages.map((langProps) => {
                    return languageProperties.localeName !== langProps.localeName ?
                        <li key={langProps.localeName}><MyNavLink to="#" onClick={() => handleLanguageClick(langProps.localeName)}>{langProps.friendlyName}</MyNavLink></li> : null
                })
            }
        </>
    );
}

export default LanguageSwitcher;
