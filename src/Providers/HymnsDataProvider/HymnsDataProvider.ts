import axios, { AxiosInstance } from "axios";
import { IHymnsDataProvider } from "./IHymnsDataProvider";
import { IFormatInfo } from "./Models/IFormatInfo";
import { IHymnInfo } from "./Models/IHymnInfo";
import { IReferenceIndex } from "./Models/IReferenceIndex";
import { ISeasonInfo } from "./Models/ISeasonInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { IHymnContent, IVariationInfo } from "./Models/IVariationInfo";
import { ISeasonTranslations } from "./Models/ISeasonTranslations";
import { createContentPaths } from "./ContentPaths";
import { ContentResourceClient } from "./ContentResourceClient";
import { assignmentTitle, localizedName, validateEnglishTitle, resolveSharedService, SharedService, validateIdentity, validateLibraryRecord, validateService } from "./SharedContent";

export class HymnsDataProvider implements IHymnsDataProvider {
    private cloudFrontClient: AxiosInstance;
    private language: string;
    private readonly paths: ReturnType<typeof createContentPaths>;
    private readonly resources: ContentResourceClient;
    private seasonTranslationsCache: ISeasonTranslations | null = null;

    constructor(language: string, _envBaseUrl: string, cloudFrontUrl: string, options: { useEtags?: boolean } = {}) {
        this.language = language;
        this.paths = createContentPaths();
        
        // CloudFront client for S3 content
        this.cloudFrontClient = axios.create({
            baseURL: cloudFrontUrl,
            headers: {
                "Accept-Language": language
            }
        });
        this.resources = new ContentResourceClient(this.cloudFrontClient, cloudFrontUrl,
            options.useEtags ?? process.env.REACT_APP_HAZZAT_CONTENT_ETAGS === "true");
    }

    private async read<T>(path: string, validate: (data: unknown) => T = data => data as T): Promise<T> {
        return this.resources.read(path, validate);
    }

    private async readSeasons(): Promise<ISeasonInfo[]> {
        return this.read(this.paths.seasons(), data => {
            if (!Array.isArray(data)) throw new Error("Invalid season metadata");
            for (const season of data) validateEnglishTitle(season?.name);
            return data as ISeasonInfo[];
        });
    }

    private async readSharedService(seasonId: string, serviceId: string): Promise<SharedService> {
        return this.read(this.paths.service(seasonId, serviceId), data => validateService(data, seasonId, serviceId));
    }

    public async getServiceSummary(seasonId: string, serviceId: string): Promise<IServiceInfo | undefined> {
        const { hymns, ...service } = await this.readSharedService(seasonId, serviceId);
        return this.mergeServiceTranslation({ ...service, verse: service.verse ?? "",
            isDateSpecific: service.isDateSpecific ?? false, displayName: service.name }, await this.getSeasonTranslations());
    }

    public async getServiceSummaryList(seasonId: string): Promise<IServiceInfo[]> {
        const season = (await this.readSeasons()).find(s => s.id === seasonId);
        const summaries = await Promise.all((season?.serviceIds ?? []).map(async serviceId => {
            const summary = await this.getServiceSummary(seasonId, serviceId);
            if (!summary) throw new Error("Service summary not found");
            return summary;
        }));
        return summaries.sort((a, b) => a.order - b.order);
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
            const translations = await this.read<ISeasonTranslations>(this.paths.seasonsArabic());
            this.seasonTranslationsCache = translations;
            return translations;
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
            
            return {
                ...season,
                nameAr,
                displayName: localizedName({ name: season.name, nameAr }, this.language)
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
        const nameAr = service.nameAr ?? seasonTranslation?.services[service.id];
        
        return {
            ...service,
            nameAr,
            displayName: localizedName({ name: service.name, nameAr }, this.language)
        };
    }

    public async getSeasonList(): Promise<ISeasonInfo[]> {
        try {
            const seasons = await this.readSeasons();
            
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
            const season = (await this.readSeasons()).find(s => s.id === seasonId);
            
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
        const season = (await this.readSeasons()).find(s => s.id === seasonId);
        if (!season) return [];
        // A failed dependency must stop booklet generation, never omit a service silently.
        const services = await Promise.all((season.serviceIds ?? []).map(async serviceId => {
            const service = await this.getService(seasonId, serviceId);
            if (!service) throw new Error(`Unable to load service: ${seasonId}/${serviceId}`);
            return service;
        }));
        return services.sort((a, b) => a.order - b.order);
    }

    public async getService(seasonId: string, serviceId: string): Promise<IServiceInfo | undefined> {
        try {
            const source = await this.readSharedService(seasonId, serviceId);
            const resolved = await resolveSharedService(source,
                id => this.read(this.paths.hymn(id), data => validateIdentity(data, id)),
                id => this.read(this.paths.content(id), data => validateLibraryRecord(data, id)), this.language);
            return this.mergeServiceTranslation(resolved, await this.getSeasonTranslations());
        } catch (error) {
            this.resources.invalidate();
            throw error;
        }
    }

    public async getReferenceIndex(): Promise<IReferenceIndex> {
        try {
            const source = await this.read<IReferenceIndex>(this.paths.hymnReferences());
            const index: IReferenceIndex = JSON.parse(JSON.stringify(source));
            for (const entry of Object.values(index)) entry.usages = [];
            // Existing v4 publishers contain only canonical names. Read thin assignments
            // to include contextual titles without fetching hymn or library payloads.
            const seasons = await this.readSeasons();
            const servicePaths = new Set([
                ...Object.values(index).flatMap(entry => entry.services),
                ...seasons.flatMap(season => (season.serviceIds ?? []).map(id => `${season.id}/${id}`))
            ]);
            await Promise.all(Array.from(servicePaths).map(async path => {
                const parts = path.split("/");
                if (parts.length !== 2) throw new Error("Invalid service reference");
                const [seasonId, serviceId] = parts;
                const service = await this.readSharedService(seasonId, serviceId);
                for (const binding of service.hymns) {
                    const entry = index[binding.hymnId];
                    if (!entry) throw new Error(`Missing hymn reference: ${binding.hymnId}`);
                    entry.usages!.push({ seasonId, serviceId, ...assignmentTitle(binding, entry) });
                }
            }));
            return index;
        } catch (ex) {
            this.resources.invalidate();
            throw ex;
        }
    }

    public async getServiceHymnList(seasonId: string, serviceId: string): Promise<IHymnInfo[]> {
        return (await this.getService(seasonId, serviceId))?.hymns ?? [];
    }

    public async getServiceHymn(seasonId: string, serviceId: string, hymnId: string): Promise<IHymnInfo> {
        const hymn = (await this.getServiceHymnList(seasonId, serviceId)).find(h => h.id === hymnId);
        if (!hymn) throw new Error("Hymn not found");
        return hymn;
    }

    public async getServiceHymnFormatList(seasonId: string, serviceId: string, hymnId: string): Promise<IFormatInfo[]> {
        return (await this.getServiceHymn(seasonId, serviceId, hymnId)).formats ?? [];
    }

    public async getServiceHymnFormat(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IFormatInfo | undefined> {
        return (await this.getServiceHymnFormatList(seasonId, serviceId, hymnId)).find(f => f.id === formatId);
    }

    public async getServiceHymnsFormatVariationList<T extends IHymnContent>(seasonId: string, serviceId: string, hymnId: string, formatId: string): Promise<IVariationInfo<T>[]> {
        return ((await this.getServiceHymnFormat(seasonId, serviceId, hymnId, formatId))?.variations ?? []) as IVariationInfo<T>[];
    }
}
