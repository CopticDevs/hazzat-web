/*
 * Reference Index - Maps hymn IDs to hymn metadata with service paths
 * V2 Schema: Enhanced with hymn names in English and Arabic
 */

export interface IHymnFormat {
    name: string;
    nameAr?: string;
    variations: {
        [variationId: string]: {
            name: string;
            nameAr?: string;
        };
    };
}

export interface IHymnReference {
    name: string;              // English hymn name
    nameAr?: string;           // Arabic hymn name (optional)
    services: string[];        // List of service paths using this hymn
    formats: {
        [formatId: string]: IHymnFormat;
    };
}

export interface IReferenceIndex {
    [hymnId: string]: IHymnReference;
}
