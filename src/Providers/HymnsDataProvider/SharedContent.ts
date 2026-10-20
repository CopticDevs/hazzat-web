import { formatDisplayName } from './FormatNames';
import { safeContentId } from "./ContentPaths";
import { IHymnInfo } from "./Models/IHymnInfo";
import { IServiceInfo } from "./Models/IServiceInfo";
import { IHymnContent } from "./Models/IVariationInfo";

export const SHARED_TYPES = ["Text", "Hazzat", "VerticalHazzat", "MusicalNotes", "Audio", "Video", "Information"] as const;
export type SharedContentType = typeof SHARED_TYPES[number];

export interface SharedHymnIdentity {
    schemaVersion: 4;
    id: string;
    name: string;
    nameAr?: string;
}

export interface SharedLibraryRecord extends SharedHymnIdentity {
    contentType: SharedContentType;
    content: Record<string, unknown>;
}

export interface SharedHymnAssignment {
    hymnId: string;
    order: number;
    name?: string;
    nameAr?: string;
    formats: Record<string, string[]>;
    formatMetadata?: Record<string, { name: string; nameAr?: string; order: number; position?: number }>;
}

export interface SharedService {
    schemaVersion: 4;
    id: string;
    seasonId: string;
    name: string;
    nameAr?: string;
    order: number;
    verse?: string;
    isDateSpecific?: boolean;
    hymns: SharedHymnAssignment[];
}

function object(value: unknown): asserts value is Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid shared-content object");
}

export function validateEnglishTitle(value: unknown): asserts value is string {
    if (typeof value !== "string" || !value.trim()) throw new Error("Invalid shared-content name");
}

function optionalName(value: unknown) {
    // Optional translations may be blank; English titles are validated separately.
    if (value !== undefined && typeof value !== "string") throw new Error("Invalid shared-content name");
}

function order(value: unknown): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid shared-content order");
}

export function validateUuid(id: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        throw new Error("Invalid shared-content UUID");
    }
}

export function formatType(format: string): SharedContentType {
    if (!/^[1-7]$/.test(format)) throw new Error("Unknown shared-content format");
    return SHARED_TYPES[Number(format) - 1];
}

export function validateIdentity(value: unknown, id: string): SharedHymnIdentity {
    object(value);
    if (value.schemaVersion !== 4 || value.id !== id) throw new Error(`Hymn identity mismatch: ${id}`);
    safeContentId(id);
    validateEnglishTitle(value.name);
    optionalName(value.nameAr);
    return value as unknown as SharedHymnIdentity;
}

export function validateService(value: unknown, seasonId: string, serviceId: string): SharedService {
    object(value);
    if (value.schemaVersion !== 4 || value.id !== serviceId || value.seasonId !== seasonId || !Array.isArray(value.hymns)) {
        throw new Error(`Service identity mismatch: ${seasonId}/${serviceId}`);
    }
    safeContentId(seasonId);
    safeContentId(serviceId);
    validateEnglishTitle(value.name);
    optionalName(value.nameAr);
    order(value.order);
    if (value.verse !== undefined && typeof value.verse !== "string") throw new Error("Invalid service verse");
    if (value.isDateSpecific !== undefined && typeof value.isDateSpecific !== "boolean") throw new Error("Invalid service date flag");
    const seen = new Set<string>();
    for (const binding of value.hymns) {
        object(binding);
        if (typeof binding.hymnId !== "string" || seen.has(binding.hymnId)) throw new Error("Invalid or duplicate hymn assignment");
        safeContentId(binding.hymnId);
        seen.add(binding.hymnId);
        order(binding.order);
        if (binding.name !== undefined) validateEnglishTitle(binding.name);
        optionalName(binding.nameAr);
        object(binding.formats);
        for (const [format, ids] of Object.entries(binding.formats)) {
            formatType(format);
            if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw new Error("Invalid or duplicate content assignment");
            for (const id of ids) {
                if (typeof id !== "string") throw new Error("Invalid content reference");
                validateUuid(id);
            }
        }
        if (binding.formatMetadata !== undefined) {
            object(binding.formatMetadata);
            for (const [format, metadata] of Object.entries(binding.formatMetadata)) {
                formatType(format);
                object(metadata);
                validateEnglishTitle(metadata.name);
                optionalName(metadata.nameAr);
                order(metadata.order);
                if (metadata.position !== undefined && (typeof metadata.position !== "number" || !Number.isSafeInteger(metadata.position) || metadata.position < 0)) {
                    throw new Error("Invalid format position");
                }
            }
        }
    }
    return value as unknown as SharedService;
}

export function validateLibraryRecord(value: unknown, id: string): SharedLibraryRecord {
    validateUuid(id);
    const identity = validateIdentity(value, id);
    const record = identity as SharedLibraryRecord;
    if (!SHARED_TYPES.includes(record.contentType)) throw new Error(`Unknown content type: ${id}`);
    object(record.content);
    if (record.contentType === "Text") {
        if (!Array.isArray(record.content.paragraphs)) throw new Error("Invalid text paragraphs");
        for (const paragraph of record.content.paragraphs) {
            object(paragraph);
            if (!Array.isArray(paragraph.columns)) throw new Error("Invalid text columns");
            if (paragraph.isComment !== undefined && typeof paragraph.isComment !== "boolean") throw new Error("Invalid text comment");
            for (const column of paragraph.columns) {
                object(column);
                if (typeof column.language !== "string" || typeof column.content !== "string") throw new Error("Invalid text column");
            }
        }
    } else {
        const fields: Record<Exclude<SharedContentType, "Text">, string[]> = {
            Hazzat: ["englishHazzat", "copticHazzat", "arabicHazzat"],
            VerticalHazzat: ["englishVerticalHazzat", "copticVerticalHazzat", "arabicVerticalHazzat"],
            MusicalNotes: ["musicXml"], Audio: ["audioFilePath"],
            Video: ["englishVideo", "copticVideo", "arabicVideo"],
            Information: ["englishInformation", "arabicInformation"]
        };
        const payloadFields = fields[record.contentType];
        if (!payloadFields.some(field => field in record.content)) throw new Error("Missing content payload");
        for (const field of payloadFields) {
            const fieldValue = record.content[field];
            if (field in record.content && !(typeof fieldValue === "string" || (fieldValue === null && record.contentType !== "MusicalNotes"))) {
                throw new Error(`Invalid content payload: ${field}`);
            }
        }
    }
    return record;
}

export function assignmentTitle(binding: SharedHymnAssignment, identity: Pick<SharedHymnIdentity, "name" | "nameAr">) {
    return {
        name: binding.name ?? identity.name,
        // An English contextual title without its own translation stays contextual in Arabic too.
        nameAr: binding.nameAr ?? (binding.name !== undefined ? undefined : identity.nameAr)
    };
}

export function localizedName(value: { name: string; nameAr?: string }, language: string) {
    return language === "ar" && value.nameAr?.trim() ? value.nameAr : value.name;
}

export async function resolveSharedService(
    service: SharedService,
    readIdentity: (id: string) => Promise<SharedHymnIdentity>,
    readContent: (id: string) => Promise<SharedLibraryRecord>,
    language: string
): Promise<IServiceInfo> {
    const hymns: IHymnInfo[] = await Promise.all(service.hymns.map(async binding => {
        const identity = await readIdentity(binding.hymnId);
        const title = assignmentTitle(binding, identity);
        const formats = await Promise.all(Object.entries(binding.formats).filter(([, ids]) => ids.length > 0).map(async ([id, ids]) => {
            const metadata = binding.formatMetadata?.[id];
            const variations = await Promise.all(ids.map(async (contentId, index) => {
                const record = await readContent(contentId);
                if (record.contentType !== formatType(id)) throw new Error(`Content type mismatch: ${contentId}`);
                return {
                    id: contentId, name: record.name, nameAr: record.nameAr,
                    displayName: localizedName(record, language), order: index + 1,
                    content: JSON.parse(JSON.stringify(record.content)) as IHymnContent
                };
            }));
            return { id, name: formatDisplayName(id), order: metadata?.order ?? Number(id), variationCount: variations.length, variations };
        }));
        formats.sort((a, b) => a.order - b.order ||
            (binding.formatMetadata?.[a.id]?.position ?? Number(a.id)) - (binding.formatMetadata?.[b.id]?.position ?? Number(b.id)) || Number(a.id) - Number(b.id));
        return { id: identity.id, ...title, displayName: localizedName(title, language), order: binding.order, formats };
    }));
    return { ...service, verse: service.verse ?? "", isDateSpecific: service.isDateSpecific ?? false,
        displayName: localizedName(service, language), hymns: hymns.sort((a, b) => a.order - b.order) };
}
