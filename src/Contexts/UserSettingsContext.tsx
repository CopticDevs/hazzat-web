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

    const setContentFontColor = (newColor: string) => {
        setUserSettings({ ...userSettings, contentFontColor: newColor });
    };

    const setHazzatFontColor = (newColor: string) => {
        setUserSettings({ ...userSettings, hazzatFontColor: newColor });
    };

    const setContentFontSize = (newSize: number) => {
        setUserSettings({
            ...userSettings,
            englishFontSize: `${newSize}px`,
            arabicFontSize: `${newSize + 4}px`
        });
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
