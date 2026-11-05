import fs from "fs";
import path from "path";
import axios from "axios";
import { ContentResourceClient } from "./ContentResourceClient";
import { HymnsDataProvider } from "./HymnsDataProvider";
import { IServiceInfo } from "./Models/IServiceInfo";

jest.mock("axios", () => ({ create: jest.fn() }));
const dataset = process.env.HAZZAT_V5_DATASET;
const originals = process.env.HAZZAT_V4_DATASET;
const datasetTest = dataset && originals ? it : it.skip;

function readerShape(service: IServiceInfo) {
    return (service.hymns ?? []).map(hymn => ({ id: hymn.id, name: hymn.name, order: hymn.order,
        formats: (hymn.formats ?? []).filter(f => (f.variations ?? []).length > 0).map(format => ({ id: format.id, name: format.name, order: format.order,
            variations: (format.variations ?? []).map(variation => ({ name: variation.name, content: variation.content })) })) }));
}

datasetTest("preserves all 84 migrated services' titles, content, hymn order, and variation order", async () => {
    ContentResourceClient.clear();
    const root = dataset!;
    const get = jest.fn(async (url: string) => ({ data: JSON.parse(fs.readFileSync(path.join(root, url.replace(/^\/+/, "")), "utf8")) }));
    (axios.create as jest.Mock).mockReturnValue({ get });
    const provider = new HymnsDataProvider("en", "https://unused.example", "https://dataset.example", {});
    let services = 0;
    // Inspect retained files too: two legacy services are absent from the
    // existing metadata list, and the preservation migration keeps them.
    for (const seasonId of fs.readdirSync(path.join(root, "v5/seasons"))) {
        for (const file of fs.readdirSync(path.join(root, "v5/seasons", seasonId, "services"))) {
            const id = file.replace(/\.json$/, "");
            const actual = await provider.getService(seasonId, id);
            const original = JSON.parse(fs.readFileSync(path.join(originals!, "v4/seasons", seasonId, "services", file), "utf8"));
            const expected = {hymns: original.hymns.map((binding: any) => {
                const identity = JSON.parse(fs.readFileSync(path.join(originals!, 'v4/hymns', binding.hymnId, 'hymn.json'), 'utf8'));
                return {id: identity.id, name: binding.name ?? identity.name, order: binding.order,
                    formats: Object.entries(binding.formats).filter(([, ids]) => (ids as string[]).length).map(([formatId, ids]) => ({
                        id: formatId, name: ['Text', 'Hazzat', 'Vertical Hazzat', 'Musical Notes', 'Audio', 'Video', 'Information'][Number(formatId)-1], order: Number(formatId),
                        variations: (ids as string[]).map(id => JSON.parse(fs.readFileSync(path.join(originals!, 'v4/content', id+'.json'), 'utf8')))
                    })).sort((a, b) => Number(a.id)-Number(b.id))};
            }).sort((a: any, b: any) => a.order-b.order)};
            expect(readerShape(actual!)).toEqual(readerShape(expected as IServiceInfo));
            services++;
        }
    }
    expect(services).toBe(84);
}, 60_000);

datasetTest("includes every retained service use in contextual search without downloading payloads", async () => {
    ContentResourceClient.clear();
    const get = jest.fn(async (url: string) => ({ data: JSON.parse(fs.readFileSync(path.join(dataset!, url.replace(/^\/+/, "")), "utf8")) }));
    (axios.create as jest.Mock).mockReturnValue({ get });
    const provider = new HymnsDataProvider("en", "https://unused.example", "https://dataset-search.example", {});
    const index = await provider.getReferenceIndex();
    const uses = Object.values(index).flatMap(entry => entry.usages ?? []);
    for (const seasonId of fs.readdirSync(path.join(dataset!, "v5/seasons"))) {
        for (const file of fs.readdirSync(path.join(dataset!, "v5/seasons", seasonId, "services"))) {
            const service = JSON.parse(fs.readFileSync(path.join(dataset!, "v5/seasons", seasonId, "services", file), "utf8"));
            if (!service.archived) expect(uses.filter(use => use.seasonId === seasonId && use.serviceId === service.id)).toHaveLength(service.hymns.length);
        }
    }
    expect(get.mock.calls.some(([url]) => url.includes("/content/") || url.includes("/hymns/"))).toBe(false);
}, 60_000);
