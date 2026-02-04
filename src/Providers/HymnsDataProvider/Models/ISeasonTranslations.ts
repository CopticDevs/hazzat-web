/*
 * Season Translations - Arabic translations for seasons and services
 */
export interface ISeasonTranslations {
    [seasonId: string]: {
        name: string;           // Arabic season name
        verse: string;          // Arabic verse
        services: {
            [serviceId: string]: string;  // Arabic service name
        };
    };
}
