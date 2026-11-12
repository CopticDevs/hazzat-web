import { createContext, useContext, useEffect, useLayoutEffect, useState, useRef, ReactNode } from "react";
import { readPreference, savePreference, Theme, themeMediaQuery, themeStorageKey, validTheme } from "../sitePreferences";

import { trackAnalyticsEvent } from "../analytics";

export type { Theme } from "../sitePreferences";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({ theme: "light", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);
export function ThemeProvider({ children }: { children: ReactNode }) {
    // Preserve existing stored choices, including legacy first-visit light values.
    const [manualTheme, setManualTheme] = useState(() => validTheme(readPreference(themeStorageKey)));
    const [browserTheme, setBrowserTheme] = useState<Theme>(() => themeMediaQuery()?.matches ? "dark" : "light");
    const manualThemeRef = useRef(manualTheme);
    const browserThemeRef = useRef(browserTheme);
    const theme = manualTheme || browserTheme;
    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        const query = themeMediaQuery();
        const update = () => {
            browserThemeRef.current = query?.matches ? "dark" : "light";
            setBrowserTheme(browserThemeRef.current);
        };
        update();
        if (query?.addEventListener) query.addEventListener("change", update);
        else query?.addListener?.(update);
        const sync = (event: StorageEvent) => {
            if (event.storageArea && event.storageArea !== localStorage) return;
            if (event.key === themeStorageKey || event.key === null) {
                manualThemeRef.current = validTheme(event.key === null ? null : event.newValue);
                setManualTheme(manualThemeRef.current);
            }
        };
        window.addEventListener("storage", sync);
        return () => {
            if (query?.removeEventListener) query.removeEventListener("change", update);
            else query?.removeListener?.(update);
            window.removeEventListener("storage", sync);
        };
    }, []);
    const setTheme = (choice: Theme) => {
        const previousTheme = manualThemeRef.current || browserThemeRef.current;
        // Update synchronously so repeated calls and retained callbacks see the latest choice.
        manualThemeRef.current = choice;
        setManualTheme(choice);
        savePreference(themeStorageKey, choice);
        if (choice !== previousTheme) {
            trackAnalyticsEvent('change_theme', {
                event_category: 'Customization', previous_theme: previousTheme, theme: choice
            });
        }
    };
    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
