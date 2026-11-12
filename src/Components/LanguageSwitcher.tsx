import { trackAnalyticsEvent } from "../analytics";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AppSettings } from "../AppSettings";
import { LanguageContext } from "../LanguageContext";
import MyNavLink from "./MyNavLink";
import { validLanguage } from "../sitePreferences";

export default function LanguageSwitcher() {
    const location = useLocation();
    const { languageProperties, setNavigationLanguage } = useContext(LanguageContext);
    return <>{AppSettings.supportedLanguages.filter(lang => lang.localeName !== languageProperties.localeName).map(lang => {
        const search = new URLSearchParams(location.search);
        search.set("lang", lang.localeName);
        return <li key={lang.localeName}><MyNavLink to={`${location.pathname}?${search}${location.hash}`} lang={lang.localeName}
            onClick={() => {
                const language = validLanguage(lang.localeName);
                if (language) setNavigationLanguage?.(language);
                trackAnalyticsEvent("change_nav_lang", { event_category: "Customization", event_label: `${lang.localeName} Language Selected` });
            }}>
            {lang.friendlyName}
        </MyNavLink></li>;
    })}</>;
}
