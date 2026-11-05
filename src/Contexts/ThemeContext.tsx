import { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from "react";
import { readPreference, savePreference, Theme, themeMediaQuery, themeStorageKey, validTheme } from "../sitePreferences";

export type { Theme } from "../sitePreferences";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({ theme: "light", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);
export function ThemeProvider({ children }: { children: ReactNode }) {
    // Preserve existing stored choices, including legacy first-visit light values.
    const [manualTheme, setManualTheme] = useState(() => validTheme(readPreference(themeStorageKey)));
    const [browserTheme, setBrowserTheme] = useState<Theme>(() => themeMediaQuery()?.matches ? "dark" : "light");
    const theme = manualTheme || browserTheme;
    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        const query = themeMediaQuery();
        const update = () => setBrowserTheme(query?.matches ? "dark" : "light");
        update();
        if (query?.addEventListener) query.addEventListener("change", update);
        else query?.addListener?.(update);
        const sync = (event: StorageEvent) => {
            if (event.storageArea && event.storageArea !== localStorage) return;
            if (event.key === themeStorageKey || event.key === null) {
                setManualTheme(validTheme(event.key === null ? null : event.newValue));
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
        setManualTheme(choice);
        savePreference(themeStorageKey, choice);
    };
    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
