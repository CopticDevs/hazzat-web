/*
 * Season Translations - Arabic translations for seasons and services
 */
export interface ISeasonTranslations {
    [seasonId: string]: {
        name: string;           // Arabic season name
        services: {
            [serviceId: string]: string;  // Arabic service name
        };
    };
}
