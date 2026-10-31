import React, { createContext, useEffect, useState } from "react";
import { AppSettings } from "../AppSettings";
import { ContentLanguage } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { contentLanguages, normalizeContentLanguages } from "../ContentLanguages";

export function readerColor(color: string): string {
    const variables: Record<string, string> = { BLACK: "--reader-black", MAROON: "--reader-maroon", NAVY: "--reader-navy" };
    return variables[color] ? `var(${variables[color]}, ${color})` : color;
}

type UserSettings = { contentFontColor: string; hazzatFontColor: string; arabicFontSize: string; englishFontSize: string; contentLanguages: ContentLanguage[] };
const defaults: UserSettings = { contentFontColor: "BLACK", hazzatFontColor: "BLACK", arabicFontSize: "22px", englishFontSize: "18px", contentLanguages: [...contentLanguages] };
const storageKey = "hazzat.reader-settings";
const colors = ["BLACK", "MAROON", "NAVY"];
function loadSettings(): UserSettings {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
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
export const UserSettingProvider: React.FC = ({ children }) => {
    const [userSettings, setSettings] = useState(loadSettings);
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify({ ...userSettings, size: parseFloat(userSettings.englishFontSize) })); } catch { /* Reading still works if storage is unavailable. */ }
    }, [userSettings]);
    const colorChange = (field: 'contentFontColor' | 'hazzatFontColor', color: string) => {
        if (!colors.includes(color)) return;
        setSettings(previous => ({ ...previous, [field]: color }));
        window.gtag?.("event", field === 'contentFontColor' ? 'change_text_color' : 'change_hazzat_color', { event_category: 'Customization', event_label: `${color} Color Selected` });
    };
    return <UserSettingsContext.Provider value={{ userSettings,
        setContentLanguages: languages => setSettings(previous => ({ ...previous, contentLanguages: normalizeContentLanguages(languages) })),
        setContentFontColor: color => colorChange('contentFontColor', color),
        setHazzatFontColor: color => colorChange('hazzatFontColor', color),
        setContentFontSize: size => {
            if (!Number.isFinite(size)) return;
            const bounded = Math.min(AppSettings.maxContentTextSize, Math.max(AppSettings.minContentTextSize, size));
            setSettings(previous => ({ ...previous, englishFontSize: `${bounded}px`, arabicFontSize: `${bounded + 4}px` }));
            window.gtag?.('event', 'change_text_size', { event_category: 'Customization', event_label: `${bounded} Size Selected` });
        }
    }}>{children}</UserSettingsContext.Provider>;
};
