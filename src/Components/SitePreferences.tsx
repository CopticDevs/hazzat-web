import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
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
    return <div className="site-preferences" role="group" aria-label={strings.sitePreferences}>
        <div className="preference-switch language-switch" role="group" aria-label={strings.navigationLanguage} dir="ltr">
            {['en', 'ar'].map(locale => {
                const search = new URLSearchParams(location.search);
                search.set('lang', locale);
                return <MyNavLink key={locale} to={`${location.pathname}?${search}${location.hash}`} lang={locale}
                    aria-current={languageProperties.localeName === locale ? 'true' : false}
                    onClick={() => window.gtag?.('event', 'change_nav_lang', { event_category: 'Customization', event_label: `${locale} Language Selected` })}>
                    {locale === 'en' ? 'English' : 'العربية'}
                </MyNavLink>;
            })}
        </div>
        <div className="preference-switch theme-switch" role="group" aria-label={strings.appearance}>
            {(['light', 'dark'] as const).map(mode => <button key={mode} type="button" aria-pressed={theme === mode}
                aria-label={mode === 'light' ? strings.lightMode : strings.darkMode}
                title={mode === 'light' ? strings.lightMode : strings.darkMode} onClick={() => setTheme(mode)}>
                <FontAwesomeIcon icon={mode === 'light' ? faSun : faMoon} aria-hidden="true" />
                <span>{mode === 'light' ? strings.lightMode : strings.darkMode}</span>
            </button>)}
        </div>
    </div>;
}
