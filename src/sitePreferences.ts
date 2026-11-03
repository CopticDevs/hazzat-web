export type Theme = "light" | "dark";
export type NavigationLanguage = "en" | "ar";
export const themeStorageKey = "hazzat.theme";
export const languageStorageKey = "hazzat.navigation-language";

export function readPreference(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
}
export function savePreference(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* Keep the in-memory choice when storage is unavailable. */ }
}
export function validTheme(value: string | null): Theme | null {
    return value === "light" || value === "dark" ? value : null;
}
export function validLanguage(value: string | null): NavigationLanguage | null {
    return value === "en" || value === "ar" ? value : null;
}
export function languageFromTag(value: string | null): NavigationLanguage | null {
    if (!value || !/^(en|ar)(-[a-z0-9]{1,8})*$/i.test(value)) return null;
    return value.split("-")[0].toLowerCase() as NavigationLanguage;
}
export function browserLanguage(): NavigationLanguage {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const language of languages) {
        const supported = languageFromTag(language);
        if (supported) return supported;
    }
    return "en";
}
export function themeMediaQuery(): MediaQueryList | null {
    try { return window.matchMedia("(prefers-color-scheme: dark)"); } catch { return null; }
}
export function initialLanguage(search: string): NavigationLanguage {
    return languageFromTag(new URLSearchParams(search).get("lang"))
        || validLanguage(readPreference(languageStorageKey)) || browserLanguage();
}
