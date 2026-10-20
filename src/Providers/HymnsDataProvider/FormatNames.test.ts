const ref = (contentId: string) => ({contentId, name: "Standard", nameAr: "المعتاد"});
import { FORMAT_NAMES_EN, FORMAT_NAMES_AR, formatDisplayName } from './FormatNames';
import { resolveSharedService, SHARED_TYPES, SharedService } from './SharedContent';
import { strings } from '../../l8n';

test('all seven format types have the canonical English and Arabic labels in the UI', () => {
    const keys = ['textFormatName', 'hazzatFormatName', 'verticalHazzatFormatName', 'musicFormatName', 'audioFormatName', 'videoFormatName', 'informationFormatName'] as const;
    const oldLanguage = strings.getLanguage();
    try {
        strings.setLanguage('en');
        expect(keys.map(key => strings[key])).toEqual(['Text', 'Hazzat', 'Vertical Hazzat', 'Musical Notes', 'Audio', 'Video', 'Information']);
        strings.setLanguage('ar');
        expect(keys.map(key => strings[key])).toEqual(['نص', 'هزّات', 'هزّات عمودية', 'نوتة موسيقية', 'صوتي', 'فيديو', 'معلومات']);
        for (let i = 0; i < 7; i++) {
            expect(formatDisplayName(String(i + 1))).toBe(FORMAT_NAMES_EN[i]);
            expect(formatDisplayName(String(i + 1), 'ar')).toBe(FORMAT_NAMES_AR[i]);
        }
    } finally { strings.setLanguage(oldLanguage); }
});

test('reader labels ignore saved aliases while keeping IDs, order, payloads and hymn titles', async () => {
    const service: SharedService = { schemaVersion: 5, id: 's', seasonId: 'annual', name: 'Service', order: 1, hymns: [{ hymnId: 'h', name: 'Context title', order: 2,
        formats: { '3': [ref('vertical')], '4': [ref('score')] }, formatMetadata: { '3': { name: 'Wrong vertical name', order: 2 }, '4': { name: 'Wrong score name', order: 1 } } }] };
    const before = JSON.parse(JSON.stringify(service));
    const result = await resolveSharedService(service, async id => ({ schemaVersion: 5, id, name: 'Identity title' }), async id => ({ schemaVersion: 5, id, name: 'Content', contentType: SHARED_TYPES[id === 'vertical' ? 2 : 3], content: id === 'vertical' ? { copticVerticalHazzat: 'saved payload' } : { musicXml: '<score-partwise />' } }), 'en');
    const hymn = result.hymns![0];
    expect(hymn.name).toBe('Context title');
    expect(hymn.formats!.map(f => [f.id, f.name, f.order, f.variations![0].id])).toEqual([['4', 'Musical Notes', 1, 'score'], ['3', 'Vertical Hazzat', 2, 'vertical']]);
    expect(hymn.formats![1].variations![0].content).toEqual({ copticVerticalHazzat: 'saved payload' });
    expect(service).toEqual(before);
});
test.each(['0', '8', '01', 'constructor'])('rejects invalid format %s', id => expect(() => formatDisplayName(id)).toThrow(/Unsupported format/));
