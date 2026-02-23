import { ISeasonInfo } from "./ISeasonInfo";

/*
 * Search Result Types
 */
export interface ISearchResult {
    type: 'season' | 'hymn';
    season?: ISeasonInfo;
    hymn?: IHymnSearchResult;
}

export interface IHymnSearchResult {
    id: string;
    name: string;
    references: IHymnReference[];
}

export interface IHymnReference {
    seasonId: string;
    seasonName: string;
    serviceId: string;
    serviceName: string;
}
