import { ILanguageProperties } from "../l8n";
import { INavMenuItem } from "./INavMenuItem";

export interface IAppSettings {
    navigationMenuItems: INavMenuItem[];
    supportedLanguages: ILanguageProperties[];
    defaultLanguage: ILanguageProperties;
    showMusicAudio: boolean;
}
