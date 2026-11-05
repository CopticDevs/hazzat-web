// Display-name contract mirrored from HazzatApp/Server/shared/contentV4.ts.
// IDs and internal content types remain unchanged.
export const FORMAT_NAMES_EN = ['Text', 'Hazzat', 'Vertical Hazzat', 'Musical Notes', 'Audio', 'Video', 'Information'] as const;
export const FORMAT_NAMES_AR = ['نص', 'هزّات', 'هزّات عمودية', 'نوتة موسيقية', 'صوتي', 'فيديو', 'معلومات'] as const;

export function formatDisplayName(id: string, language = 'en'): string {
    if (!/^[1-7]$/.test(id)) throw new Error(`Unsupported format: ${id}`);
    return (language === 'ar' ? FORMAT_NAMES_AR : FORMAT_NAMES_EN)[Number(id) - 1];
}
