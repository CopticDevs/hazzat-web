import axios, { AxiosInstance } from "axios";
import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { IFormatInfo } from "./Models/IFormatInfo";
import { IHymnInfo } from "./Models/IHymnInfo";
import { IReferenceIndex } from "./Models/IReferenceIndex";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { IHymnContent, IVariationInfo } from "./Models/IVariationInfo";
import { ISeasonTranslations } from "./Models/ISeasonTranslations";
import { ContentPaths } from "./ContentPaths";

export class HymnsDataProvider implements IHymnsDataProvider {
    private httpClient: AxiosInstance;
    private cloudFrontClient: AxiosInstance;
    private language: string;
    private seasonTranslationsCache: ISeasonTranslations | null = null;

    constructor(language: string, envBaseUrl: string, cloudFrontUrl: string) {
        this.language = language;
        
        // Legacy Azure API client for endpoints not yet served from S3.
        this.httpClient = axios.create({
            baseURL: envBaseUrl,
            headers: {
                "Accept-Language": language
            }
        });

        // CloudFront client for S3 content
        this.cloudFrontClient = axios.create({
            baseURL: cloudFrontUrl,
            headers: {
                "Accept-Language": language
            }
        });
    }

    private async getSeasonTranslations(): Promise<ISeasonTranslations> {
        // Return cached translations if available
        if (this.seasonTranslationsCache !== null) {
            return this.seasonTranslationsCache;
        }

        // Only load Arabic translations if language is Arabic
        if (this.language !== 'ar') {
            this.seasonTranslationsCache = {};
            return this.seasonTranslationsCache;
        }

        try {
            const response = await this.cloudFrontClient.get<ISeasonTranslations>(ContentPaths.seasonsArabic());
            this.seasonTranslationsCache = response.data;
            return response.data;
        } catch (ex) {
            console.log('Failed to load Arabic translations:', ex);
            this.seasonTranslationsCache = {};
            return {};
        }
    }

    private mergeSeasonTranslations(seasons: ISeasonInfo[], translations: ISeasonTranslations): ISeasonInfo[] {
        return seasons.map(season => {
            const translation = translations[season.id];
            const nameAr = translation?.name;
            const verseAr = translation?.verse;
            
            return {
                ...season,
                nameAr,
                verseAr,
                displayName: this.language === 'ar' && nameAr ? nameAr : season.name,
                displayVerse: this.language === 'ar' && verseAr ? verseAr : season.verse
            };
        });
    }

    private mergeServiceTranslation(service: IServiceInfo, translations: ISeasonTranslations): IServiceInfo {
        if (!service.seasonId) {
            return {
                ...service,
                displayName: service.name
            };
        }

        const seasonTranslation = translations[service.seasonId];
        const nameAr = seasonTranslation?.services[service.id];
        
        return {
            ...service,
            nameAr,
            displayName: this.language === 'ar' && nameAr ? nameAr : service.name
        };
    }

    public async getSeasonList(): Promise<ISeasonInfo[]> {
        try {
            const response = await this.cloudFrontClient.get<ISeasonInfo[]>(ContentPaths.seasons());
            const seasons = response.data;
            
            // Load and merge Arabic translations if language is Arabic
            const translations = await this.getSeasonTranslations();
            return this.mergeSeasonTranslations(seasons, translations);
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getSeason(seasonId: string): Promise<ISeasonInfo | undefined> {
        try {
            const response = await this.cloudFrontClient.get<ISeasonInfo[]>(ContentPaths.seasons());
            const season = response.data.find(s => s.id === seasonId);
            
            if (!season) {
                return undefined;
            }
            
            // Load and merge Arabic translations if language is Arabic
            const translations = await this.getSeasonTranslations();
            const mergedSeasons = this.mergeSeasonTranslations([season], translations);
            return mergedSeasons[0];
        } catch (ex) {
            console.log(ex);
            return undefined;
        }
    }

    public async getServiceList(seasonId: string): Promise<IServiceInfo[]> {
        try {
            const seasons = await this.cloudFrontClient.get<ISeasonInfo[]>(ContentPaths.seasons());
            const season = seasons.data.find(s => s.id === seasonId);
            
            if (!season || !season.serviceIds || season.serviceIds.length === 0) {
                return [];
            }
            
            const servicePromises = season.serviceIds.map(async (serviceId) => {
                try {
                    const response = await this.cloudFrontClient.get<IServiceInfo>(ContentPaths.service(seasonId, serviceId));
                    return response.data;
                } catch (error) {
                    console.log(`Error fetching service ${serviceId}:`, error);
                    return null;
                }
            });
            
            const services = await Promise.all(servicePromises);
            const validServices = services.filter((s): s is IServiceInfo => s !== null);
            
            // Load and merge Arabic translations if language is Arabic
            const translations = await this.getSeasonTranslations();
            return validServices.map(service => this.mergeServiceTranslation(service, translations));
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getService(seasonId: string, serviceId: string): Promise<IServiceInfo | undefined> {
        try {
            const response = await this.cloudFrontClient.get<IServiceInfo>(ContentPaths.service(seasonId, serviceId));
            const service = response.data;
            
            // Load and merge Arabic translations for service name
            const translations = await this.getSeasonTranslations();
            const serviceWithTranslation = this.mergeServiceTranslation(service, translations);
            
            // Load hymn-references.json to get Arabic hymn names
            if (serviceWithTranslation.hymns && serviceWithTranslation.hymns.length > 0) {
                const refIndex = await this.getReferenceIndex();
                serviceWithTranslation.hymns = serviceWithTranslation.hymns.map(hymn => {
                    const hymnRef = refIndex[hymn.id];
                    const nameAr = hymnRef?.nameAr;
                    
                    // Merge variation names from hymn-references
                    const updatedFormats = hymn.formats?.map(format => {
                        const formatRef = hymnRef?.formats?.[format.id];
                        const updatedVariations = format.variations?.map(variation => {
                            const variationRef = formatRef?.variations?.[variation.id];
                            const variationNameAr = variationRef?.nameAr;
                            
                            return {
                                ...variation,
                                nameAr: variationNameAr,
                                displayName: this.language === 'ar' && variationNameAr ? variationNameAr : variation.name
                            };
                        });
                        
                        return {
                            ...format,
                            variations: updatedVariations
                        };
                    });
                    
                    return {
                        ...hymn,
                        nameAr,
                        displayName: this.language === 'ar' && nameAr ? nameAr : hymn.name,
                        formats: updatedFormats
                    };
                });
            }
            
            return serviceWithTranslation;
        } catch (ex) {
            console.log(ex);
            return undefined;
        }
    }

    public async getReferenceIndex(): Promise<IReferenceIndex> {
        try {
            const response = await this.cloudFrontClient.get<IReferenceIndex>(ContentPaths.hymnReferences());
            return response.data;
        } catch (ex) {
            console.log(ex);
            return {};
        }
    }

    public async getServiceHymnList(seasonId: string, serviceId: string): Promise<IHymnInfo[]> {
        try {
            const response = await this.httpClient.get<IHymnInfo[]>(`/seasons/${seasonId}/services/${serviceId}/hymns`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getServiceHymn(seasonId: string, serviceId: string, hymnId: string): Promise<IHymnInfo> {
        try {
            const response = await this.httpClient.get<IHymnInfo>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    public async getServiceHymnFormatList(seasonId: string, serviceId: string, hymnId: string): Promise<IFormatInfo[]> {
        try {
            const response = await this.httpClient.get<IFormatInfo[]>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

    public async getServiceHymnFormat(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IFormatInfo | undefined> {
        try {
            const response = await this.httpClient.get<IFormatInfo>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return undefined;
        }
    }

    public async getServiceHymnsFormatVariationList<T extends IHymnContent>(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]> {
        try {
            const response = await this.httpClient.get<IVariationInfo<T>[]>(`/seasons/${seasonId}/services/${serviceId}/hymns/${hymnId}/formats/${formatId}/variations`);
            return response.data;
        } catch (ex) {
            console.log(ex);
            return [];
        }
    }

}
