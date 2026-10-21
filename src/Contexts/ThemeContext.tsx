import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark";
const storageKey = "hazzat.theme";
function initialTheme(): Theme {
    try { return localStorage.getItem(storageKey) === "dark" ? "dark" : "light"; }
    catch { return "light"; }
}
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({ theme: "light", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(initialTheme);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem(storageKey, theme); } catch { /* Theme switching works without storage. */ }
    }, [theme]);
    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
