import { AxiosInstance } from "axios";
import { ContentResourceClient } from "./ContentResourceClient";

describe("shared browser resource cache", () => {
    beforeEach(() => { ContentResourceClient.clear(); jest.useFakeTimers(); });
    afterEach(() => jest.useRealTimers());
    const validate = (data: unknown): { value: number } => {
        if (!data || typeof (data as any).value !== "number") throw new Error("Invalid resource");
        return data as { value: number };
    };

    it("revalidates expired resources with ETags and accepts 304 only with cached content", async () => {
        const get = jest.fn().mockResolvedValueOnce({ data: { value: 1 }, headers: { etag: '"one"' }, status: 200 })
            .mockResolvedValueOnce({ status: 304, headers: {} });
        const client = new ContentResourceClient({ get } as unknown as AxiosInstance, "https://etag.example", true);
        expect(await client.read("/v4/content.json", validate)).toEqual({ value: 1 });
        jest.advanceTimersByTime(60_001);
        expect(await client.read("/v4/content.json", validate)).toEqual({ value: 1 });
        expect(get).toHaveBeenLastCalledWith("/v4/content.json", expect.objectContaining({ headers: { "If-None-Match": '"one"' } }));
    });

    it("does not send conditional headers unless explicitly enabled and retries failed refreshes", async () => {
        const get = jest.fn().mockResolvedValueOnce({ data: { value: 1 }, headers: { etag: '"one"' } })
            .mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValueOnce({ data: { value: 2 } });
        const client = new ContentResourceClient({ get } as unknown as AxiosInstance, "https://plain.example");
        await client.read("/v4/content.json", validate);
        jest.advanceTimersByTime(60_001);
        await expect(client.read("/v4/content.json", validate)).rejects.toThrow("offline");
        expect(await client.read("/v4/content.json", validate)).toEqual({ value: 2 });
        expect(get.mock.calls.every(call => call.length === 1)).toBe(true);
    });

    it("bounds concurrent requests across providers and deduplicates in-flight reads", async () => {
        let active = 0, peak = 0;
        const get = jest.fn(async () => {
            peak = Math.max(peak, ++active);
            await new Promise(resolve => setTimeout(resolve, 10));
            active--;
            return { data: { value: 1 } };
        });
        const a = new ContentResourceClient({ get } as unknown as AxiosInstance, "https://limited.example");
        const b = new ContentResourceClient({ get } as unknown as AxiosInstance, "https://limited.example");
        const calls = [a.read("/v4/0", validate), b.read("/v4/0", validate), ...Array.from({ length: 8 }, (_, i) => a.read(`/v4/${i + 1}`, validate))];
        for (let i = 0; i < 6; i++) { await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(10); }
        await Promise.all(calls);
        expect(peak).toBe(4);
        expect(get).toHaveBeenCalledTimes(9);
    });
});
