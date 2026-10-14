import fs from "fs";
import path from "path";
import axios from "axios";
import { ContentResourceClient } from "./ContentResourceClient";
import { HymnsDataProvider } from "./HymnsDataProvider";
import { IServiceInfo } from "./Models/IServiceInfo";

jest.mock("axios", () => ({ create: jest.fn() }));
const dataset = process.env.HAZZAT_V4_DATASET;
const originals = process.env.HAZZAT_V3_DATASET;
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
    const provider = new HymnsDataProvider("en", "https://unused.example", "https://dataset.example", { version: "v4" });
    let services = 0;
    // Inspect retained files too: two legacy services are absent from the
    // existing metadata list, and the preservation migration keeps them.
    for (const seasonId of fs.readdirSync(path.join(root, "v4/seasons"))) {
        for (const file of fs.readdirSync(path.join(root, "v4/seasons", seasonId, "services"))) {
            const id = file.replace(/\.json$/, "");
            const actual = await provider.getService(seasonId, id);
            const original = JSON.parse(fs.readFileSync(path.join(originals!, "v3/seasons", seasonId, "services", file), "utf8"));
            expect(readerShape(actual!)).toEqual(readerShape(original));
            services++;
        }
    }
    expect(services).toBe(84);
}, 60_000);

datasetTest("includes every retained service use in contextual search without downloading payloads", async () => {
    ContentResourceClient.clear();
    const get = jest.fn(async (url: string) => ({ data: JSON.parse(fs.readFileSync(path.join(dataset!, url.replace(/^\/+/, "")), "utf8")) }));
    (axios.create as jest.Mock).mockReturnValue({ get });
    const provider = new HymnsDataProvider("en", "https://unused.example", "https://dataset-search.example", { version: "v4" });
    const index = await provider.getReferenceIndex();
    const uses = Object.values(index).flatMap(entry => entry.usages ?? []);
    for (const seasonId of fs.readdirSync(path.join(dataset!, "v4/seasons"))) {
        for (const file of fs.readdirSync(path.join(dataset!, "v4/seasons", seasonId, "services"))) {
            const service = JSON.parse(fs.readFileSync(path.join(dataset!, "v4/seasons", seasonId, "services", file), "utf8"));
            expect(uses.filter(use => use.seasonId === seasonId && use.serviceId === service.id)).toHaveLength(service.hymns.length);
        }
    }
    expect(get.mock.calls.some(([url]) => url.includes("/content/") || url.includes("/hymns/"))).toBe(false);
}, 60_000);
