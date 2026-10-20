import { createContentPaths } from "./ContentPaths";

it("uses v4 even when an old deployment variable requests v3", () => {
    const previous = process.env.REACT_APP_HAZZAT_CONTENT_VERSION;
    process.env.REACT_APP_HAZZAT_CONTENT_VERSION = "v3";
    try {
        jest.isolateModules(() => {
            const { ContentPaths } = require("./ContentPaths");
            expect(ContentPaths.seasons()).toBe("/v5/metadata/seasons.json");
            expect(ContentPaths.service("annual", "basil")).toBe("/v5/seasons/annual/services/basil.json");
        });
    } finally {
        if (previous === undefined) delete process.env.REACT_APP_HAZZAT_CONTENT_VERSION;
        else process.env.REACT_APP_HAZZAT_CONTENT_VERSION = previous;
    }
});

it("rejects unsafe content identifiers", () => {
    expect(() => createContentPaths().content("../v3/file")).toThrow("Invalid Hazzat content ID");
});
