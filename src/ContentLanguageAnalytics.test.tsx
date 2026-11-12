import React, { useContext } from "react";
import { act, render, screen } from "@testing-library/react";
import { serializeContentLanguages } from "./ContentLanguages";
import { UserSettingProvider, UserSettingsContext } from "./Contexts/UserSettingsContext";
import { ContentLanguage } from "./Providers/HymnsDataProvider/Models/IVariationInfo";

const { English, Coptic, Arabic } = ContentLanguage;
const storageKey = "hazzat.reader-settings";
let settings: React.ContextType<typeof UserSettingsContext>;
function Consumer() {
    settings = useContext(UserSettingsContext);
    return <output>{serializeContentLanguages(settings.userSettings.contentLanguages)}</output>;
}
function mount() {
    return render(<React.StrictMode><UserSettingProvider><Consumer /></UserSettingProvider></React.StrictMode>);
}
const originalGtag = window.gtag;
beforeEach(() => { localStorage.clear(); window.gtag = jest.fn(); });
afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); window.gtag = originalGtag; });

it.each([
    [[], "none"], [[English], "en"], [[Coptic], "cop"], [[Arabic], "ar"],
    [[English, Coptic], "en+cop"], [[English, Arabic], "en+ar"],
    [[Coptic, Arabic], "cop+ar"], [[English, Coptic, Arabic], "en+cop+ar"]
])("serializes selection %j as %s", (selection, expected) => {
    expect(serializeContentLanguages(selection)).toBe(expected);
});

it("normalizes unordered duplicate labels, malformed defaults and empty selection", () => {
    expect(serializeContentLanguages(["arabic", " English ", "Arabic", "coptic"])).toBe("en+cop+ar");
    expect(serializeContentLanguages(["Arabic", "unknown", "english"])).toBe("en+ar");
    for (const value of [undefined, null, {}, "English", ["unknown"], [42]]) {
        expect(serializeContentLanguages(value)).toBe("en+cop+ar");
    }
    expect(serializeContentLanguages([])).toBe("none");
});

it.each([undefined, [English], []])("does not emit or persist on default or saved initialization: %j", selection => {
    if (selection) localStorage.setItem(storageKey, JSON.stringify({ contentLanguages: selection }));
    const save = jest.spyOn(Storage.prototype, "setItem");
    mount();
    expect(screen.getByRole("status")).toHaveTextContent(serializeContentLanguages(selection));
    expect(window.gtag).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
});

it("emits one manual change with previous and new values and persists the selection", () => {
    localStorage.setItem(storageKey, JSON.stringify({ contentLanguages: [Arabic] }));
    mount();
    act(() => settings.setContentLanguages([Coptic, English]));
    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith("event", "change_content_languages", {
        event_category: "Customization", previous_content_languages: "ar", content_languages: "en+cop"
    });
    expect(screen.getByRole("status")).toHaveTextContent("en+cop");
    expect(JSON.parse(localStorage.getItem(storageKey)!).contentLanguages).toEqual([English, Coptic]);
});

it("ignores repeated, order-only and normalized no-op selections", () => {
    mount();
    act(() => {
        settings.setContentLanguages([Arabic, Coptic, English, English]);
        settings.setContentLanguages(["english", "coptic", "arabic"] as unknown as ContentLanguage[]);
    });
    expect(window.gtag).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBeNull();
});

it("tracks same-tick changes accurately with a retained callback and preserves other settings", () => {
    mount();
    const change = settings.setContentLanguages;
    act(() => {
        change([English]);
        change([English]);
        settings.setContentFontSize(24);
        change([]);
        change([Arabic]);
    });
    const languageEvents = (window.gtag as jest.Mock).mock.calls.filter(call => call[1] === "change_content_languages");
    expect(languageEvents.map(call => [call[2].previous_content_languages, call[2].content_languages])).toEqual([
        ["en+cop+ar", "en"], ["en", "none"], ["none", "ar"]
    ]);
    expect(settings.userSettings.englishFontSize).toBe("24px");
    expect(JSON.parse(localStorage.getItem(storageKey)!).size).toBe(24);
});

it("syncs cross-tab changes and resets silently, using the synced choice for the next manual edit", () => {
    mount();
    const change = settings.setContentLanguages;
    const save = jest.spyOn(Storage.prototype, "setItem");
    act(() => window.dispatchEvent(new StorageEvent("storage", {
        key: storageKey, newValue: JSON.stringify({ contentLanguages: [Coptic] }), storageArea: localStorage
    })));
    expect(screen.getByRole("status")).toHaveTextContent("cop");
    expect(window.gtag).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    act(() => change([English]));
    expect(window.gtag).toHaveBeenLastCalledWith("event", "change_content_languages", {
        event_category: "Customization", previous_content_languages: "cop", content_languages: "en"
    });
    (window.gtag as jest.Mock).mockClear(); save.mockClear();
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage })));
    expect(screen.getByRole("status")).toHaveTextContent("en+cop+ar");
    expect(window.gtag).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
});

it.each([undefined, null, {}, () => { throw new Error("Analytics blocked"); }])(
    "keeps language updates working with unavailable or blocked analytics: %p", analytics => {
        window.gtag = analytics as typeof window.gtag;
        mount();
        act(() => settings.setContentLanguages([English]));
        expect(screen.getByRole("status")).toHaveTextContent("en");
        expect(JSON.parse(localStorage.getItem(storageKey)!).contentLanguages).toEqual([English]);
    }
);

it("continues updating and tracking when preference storage is blocked", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    mount();
    act(() => settings.setContentLanguages([]));
    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(window.gtag).toHaveBeenCalledTimes(1);
});
