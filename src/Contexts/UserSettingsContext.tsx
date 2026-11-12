import React, { createContext, useEffect, useRef, useState } from "react";
import { AppSettings } from "../AppSettings";
import { ContentLanguage } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { contentLanguages, normalizeContentLanguages, serializeContentLanguages } from "../ContentLanguages";
import { trackAnalyticsEvent } from "../analytics";
import { readPreference, savePreference } from "../sitePreferences";

export function readerColor(color: string): string {
    const variables: Record<string, string> = { BLACK: "--reader-black", MAROON: "--reader-maroon", NAVY: "--reader-navy" };
    return variables[color] ? `var(${variables[color]}, ${color})` : color;
}

type UserSettings = { contentFontColor: string; hazzatFontColor: string; arabicFontSize: string; englishFontSize: string; contentLanguages: ContentLanguage[] };
const defaults: UserSettings = { contentFontColor: "BLACK", hazzatFontColor: "BLACK", arabicFontSize: "22px", englishFontSize: "18px", contentLanguages: [...contentLanguages] };
const storageKey = "hazzat.reader-settings";
const colors = ["BLACK", "MAROON", "NAVY"];
function parseSettings(raw: string | null): UserSettings {
    try {
        const saved = JSON.parse(raw || "null");
        if (!saved || typeof saved !== "object") return defaults;
        const size = Number(saved.size);
        return {
            contentLanguages: normalizeContentLanguages(saved.contentLanguages),
            contentFontColor: colors.includes(saved.contentFontColor) ? saved.contentFontColor : defaults.contentFontColor,
            hazzatFontColor: colors.includes(saved.hazzatFontColor) ? saved.hazzatFontColor : defaults.hazzatFontColor,
            englishFontSize: Number.isFinite(size) && size >= AppSettings.minContentTextSize && size <= AppSettings.maxContentTextSize ? `${size}px` : defaults.englishFontSize,
            arabicFontSize: Number.isFinite(size) && size >= AppSettings.minContentTextSize && size <= AppSettings.maxContentTextSize ? `${size + 4}px` : defaults.arabicFontSize
        };
    } catch { return defaults; }
}
type SettingsContext = {
    userSettings: UserSettings;
    setContentFontColor: (color: string) => void;
    setHazzatFontColor: (color: string) => void;
    setContentFontSize: (size: number) => void;
    setContentLanguages: (languages: ContentLanguage[]) => void;
};
export const UserSettingsContext = createContext<SettingsContext>({ userSettings: defaults, setContentFontColor: () => {}, setHazzatFontColor: () => {}, setContentFontSize: () => {}, setContentLanguages: () => {} });
export const UserSettingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [userSettings, setSettings] = useState(() => parseSettings(readPreference(storageKey)));
    // Read the latest edit even before React flushes a batch or from a retained callback.
    const currentSettings = useRef(userSettings);
    useEffect(() => {
        const sync = (event: StorageEvent) => {
            if (event.storageArea && event.storageArea !== localStorage) return;
            if (event.key === storageKey || event.key === null) {
                const next = parseSettings(event.key === null ? null : event.newValue);
                currentSettings.current = next;
                setSettings(next);
            }
        };
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);
    // Persist only user edits; loading another tab's values must not write them back.
    const updateSettings = (change: Partial<UserSettings>) => {
        const next = { ...currentSettings.current, ...change };
        currentSettings.current = next;
        setSettings(next);
        savePreference(storageKey, JSON.stringify({ ...next, size: parseFloat(next.englishFontSize) }));
    };
    const colorChange = (field: 'contentFontColor' | 'hazzatFontColor', color: string) => {
        if (!colors.includes(color)) return;
        updateSettings({ [field]: color });
        trackAnalyticsEvent(field === 'contentFontColor' ? 'change_text_color' : 'change_hazzat_color', { event_category: 'Customization', event_label: `${color} Color Selected` });
    };
    return <UserSettingsContext.Provider value={{ userSettings,
        setContentLanguages: languages => {
            const next = normalizeContentLanguages(languages);
            const previous = serializeContentLanguages(currentSettings.current.contentLanguages);
            const selected = serializeContentLanguages(next);
            if (previous === selected) return;
            updateSettings({ contentLanguages: next });
            trackAnalyticsEvent("change_content_languages", {
                event_category: "Customization",
                previous_content_languages: previous,
                content_languages: selected
            });
        },
        setContentFontColor: color => colorChange('contentFontColor', color),
        setHazzatFontColor: color => colorChange('hazzatFontColor', color),
        setContentFontSize: size => {
            if (!Number.isFinite(size)) return;
            const bounded = Math.min(AppSettings.maxContentTextSize, Math.max(AppSettings.minContentTextSize, size));
            updateSettings({ englishFontSize: `${bounded}px`, arabicFontSize: `${bounded + 4}px` });
            trackAnalyticsEvent('change_text_size', { event_category: 'Customization', event_label: `${bounded} Size Selected` });
        }
    }}>{children}</UserSettingsContext.Provider>;
};
