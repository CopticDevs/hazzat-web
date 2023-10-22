import React, { createContext, useState } from "react";

type UserSettings = {
    contentFontColor: string;
    hazzatFontColor: string;
    arabicFontSize: string;
    englishFontSize: string;
};

const defaultUserSettings: UserSettings = {
    contentFontColor: "BLACK",
    hazzatFontColor: "BLACK",
    arabicFontSize: "22px",
    englishFontSize: "18px"
};

type UserSettingContextType = {
    userSettings: UserSettings;
    setContentFontColor: (newColor: string) => void;
    setHazzatFontColor: (newColor: string) => void;
    setContentFontSize: (newSize: number) => void;
};

export const UserSettingsContext = createContext<UserSettingContextType>({
    userSettings: defaultUserSettings,
    setContentFontColor: () => { },
    setHazzatFontColor: () => { },
    setContentFontSize: () => { },
});

interface IProps {
    children?: React.ReactNode;
}

export const UserSettingProvider: React.FC = (props: IProps) => {
    const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);

    const collectColorChangeAnalytics = (fontType: string, newColor: string) => {
        // Track Hazzat color change
        window.gtag('event', `change_${fontType}_color`, {
            event_category: 'Customization',
            event_label: `${newColor} Color Selected`,
        });
    };

    const collectFontSizeChangeAnalytics = (newSize: number) => {
        // Track Text size change
        window.gtag('event', `change_text_size`, {
            event_category: 'Customization',
            event_label: `${newSize} Size Selected`,
        });
    };

    const setContentFontColor = (newColor: string) => {
        setUserSettings({ ...userSettings, contentFontColor: newColor });
        collectColorChangeAnalytics("text", newColor);
    };

    const setHazzatFontColor = (newColor: string) => {
        setUserSettings({ ...userSettings, hazzatFontColor: newColor });
        collectColorChangeAnalytics("hazzat", newColor);
    };

    const setContentFontSize = (newSize: number) => {
        setUserSettings({
            ...userSettings,
            englishFontSize: `${newSize}px`,
            arabicFontSize: `${newSize + 4}px`
        });
        collectFontSizeChangeAnalytics(newSize);
    };

    const contextValue: UserSettingContextType = {
        userSettings,
        setContentFontColor,
        setHazzatFontColor,
        setContentFontSize
    };

    return (
        <UserSettingsContext.Provider value={contextValue}>
            {props.children}
        </UserSettingsContext.Provider>
    );
};
