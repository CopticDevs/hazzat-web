import { AxiosInstance } from "axios";

interface CachedResource { data: unknown; etag?: string; expires: number }
interface ResourceStore {
    cache: Map<string, CachedResource>;
    pending: Map<string, Promise<unknown>>;
    active: number;
    queue: Array<() => void>;
}

const stores = new Map<string, ResourceStore>();
const CACHE_TTL_MS = 60_000;
const MAX_RESOURCES = 512;

/** Raw resources are shared across providers/locales; projections never mutate them. */
export class ContentResourceClient {
    private readonly store: ResourceStore;

    constructor(private readonly http: AxiosInstance, baseUrl: string, private readonly useEtags = false) {
        const key = `${baseUrl.replace(/\/+$/, "")}|${useEtags}`;
        let store = stores.get(key);
        if (!store) {
            store = { cache: new Map(), pending: new Map(), active: 0, queue: [] };
            stores.set(key, store);
        }
        this.store = store;
    }

    async read<T>(path: string, validate: (value: unknown) => T): Promise<T> {
        const cached = this.store.cache.get(path);
        if (cached && cached.expires > Date.now()) return validate(cached.data);
        let pending = this.store.pending.get(path);
        if (!pending) {
            pending = this.fetch(path, cached, validate);
            this.store.pending.set(path, pending);
        }
        try { return validate(await pending); }
        finally { if (this.store.pending.get(path) === pending) this.store.pending.delete(path); }
    }

    private async fetch<T>(path: string, cached: CachedResource | undefined, validate: (value: unknown) => T): Promise<T> {
        await this.acquire();
        try {
            const response = this.useEtags && cached?.etag
                ? await this.http.get(path, { headers: { "If-None-Match": cached.etag }, validateStatus: status => (status >= 200 && status < 300) || status === 304 })
                : await this.http.get(path);
            const data: unknown = response.status === 304 ? cached?.data : response.data;
            const validated = validate(data);
            const etag = response.headers?.etag ?? cached?.etag;
            this.store.cache.delete(path);
            this.store.cache.set(path, { data: validated, etag, expires: Date.now() + CACHE_TTL_MS });
            if (this.store.cache.size > MAX_RESOURCES) this.store.cache.delete(this.store.cache.keys().next().value!);
            return validated;
        } finally {
            const next = this.store.queue.shift();
            if (next) next();
            else this.store.active--;
        }
    }

    private async acquire() {
        if (this.store.active < 4) { this.store.active++; return; }
        await new Promise<void>(resolve => this.store.queue.push(resolve));
    }

    invalidate() { this.store.cache.clear(); }

    /** Used to isolate tests and to discard data after changing feed configuration. */
    static clear() { stores.clear(); }
}
