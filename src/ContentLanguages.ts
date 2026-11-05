import { ContentLanguage, IHymnContent, ITextContent, normalizeContentLanguage } from "./Providers/HymnsDataProvider/Models/IVariationInfo";

export const contentLanguages = [ContentLanguage.English, ContentLanguage.Coptic, ContentLanguage.Arabic];

export function normalizeContentLanguages(value: unknown): ContentLanguage[] {
    if (!Array.isArray(value)) return [...contentLanguages];
    const included = contentLanguages.filter(language => value.some(item => typeof item === "string" && normalizeContentLanguage(item) === language));
    return value.length && !included.length ? [...contentLanguages] : included;
}

/** Filter structured language blocks without modifying shared published content. */
export function filterContentLanguages<T extends IHymnContent>(content: T, included: ContentLanguage[]): T {
    if (!content) return content;
    if ("paragraphs" in content) return { ...content, paragraphs: (content as ITextContent).paragraphs.map(paragraph => ({
        ...paragraph, columns: paragraph.columns.filter(column => included.includes(normalizeContentLanguage(column.language)!))
    })).filter(paragraph => paragraph.columns.some(column => column.content?.trim())) };
    const filtered = { ...content };
    Object.keys(filtered).forEach(key => {
        const language = contentLanguages.find(value => key.startsWith(value.toLowerCase()));
        if (language && !included.includes(language)) (filtered as unknown as Record<string, unknown>)[key] = "";
    });
    return filtered;
}

export function hasLanguageContent(content: IHymnContent): boolean {
    if (!content) return false;
    if ("paragraphs" in content) return content.paragraphs.some(paragraph => paragraph.columns.some(column => column.content?.trim()));
    const blocks = Object.entries(content).filter(([key]) => contentLanguages.some(language => key.startsWith(language.toLowerCase())));
    return !blocks.length || blocks.some(([, value]) => typeof value === "string" && value.trim());
}
