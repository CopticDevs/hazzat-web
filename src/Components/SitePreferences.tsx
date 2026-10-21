import { faGlobe, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import { useTheme } from "../Contexts/ThemeContext";
import { strings } from "../l8n";
import MyNavLink from "./MyNavLink";
import "./SitePreferences.css";

export default function SitePreferences() {
    const { theme, setTheme } = useTheme();
    const { languageProperties } = useContext(LanguageContext);
    const location = useLocation();
    const nextLanguage = languageProperties.localeName === 'en' ? 'ar' : 'en';
    const search = new URLSearchParams(location.search);
    search.set('lang', nextLanguage);
    const languageAction = nextLanguage === 'ar' ? strings.switchToArabic : strings.switchToEnglish;
    const themeAction = theme === 'light' ? strings.switchToDark : strings.switchToLight;
    return <div className="site-preferences" role="group" aria-label={strings.sitePreferences}>
        <MyNavLink className="preference-toggle language-toggle" to={`${location.pathname}?${search}${location.hash}`}
            aria-label={languageAction} title={languageAction}
            onClick={() => window.gtag?.('event', 'change_nav_lang', { event_category: 'Customization', event_label: `${nextLanguage} Language Selected` })}>
            <FontAwesomeIcon icon={faGlobe} aria-hidden="true" />
            <span lang={languageProperties.localeName} aria-hidden="true">{languageProperties.localeName === 'en' ? 'EN' : 'ع'}</span>
        </MyNavLink>
        <button type="button" className="preference-toggle theme-toggle" aria-label={strings.darkMode}
            aria-pressed={theme === 'dark'} title={themeAction} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <svg className="theme-sun-icon" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 1v2M12 21v2M1 12h2M21 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg> : <FontAwesomeIcon icon={faMoon} aria-hidden="true" />}
        </button>
    </div>;
}
