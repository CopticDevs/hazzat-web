import { ArabicLanguageProperties, EnglishLanguageProperties } from "./l8n";
import { IAppSettings } from "./Types/IAppSettings";

export const AppSettings: IAppSettings = {
    navigationMenuItems: [
        { id: "home", location: "/" },
        { id: "seasons", location: "/Seasons" },
        { id: "types", location: "/Types" },
        { id: "tunes", location: "/Tunes" },
        { id: "booklets", location: "/Booklets" },
        { id: "fonts", location: "/Fonts" },
        { id: "help", location: "/Help", disabled: true },
        { id: "contactUs", location: "/ContactUs", disabled: true }
    ],
    supportedLanguages: [EnglishLanguageProperties, ArabicLanguageProperties],
    defaultLanguage: EnglishLanguageProperties,
    showMusicAudio: false,
    autoPlayVideo: false
};
