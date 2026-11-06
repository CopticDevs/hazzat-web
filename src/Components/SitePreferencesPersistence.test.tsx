import { act, fireEvent, render, screen } from "@testing-library/react";
import { useContext } from "react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { ThemeProvider } from "../Contexts/ThemeContext";
import { UserSettingProvider, UserSettingsContext } from "../Contexts/UserSettingsContext";
import LanguageProvider from "../LanguageProvider";
import { LanguageContext } from "../LanguageContext";
import { ContentLanguage } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { browserLanguage, languageFromTag } from "../sitePreferences";
import { strings } from "../l8n";
import SitePreferences from "./SitePreferences";

let dark = false;
let languages = ["en-US"];
let listeners: Set<() => void>;
const originalMatchMedia = window.matchMedia;
beforeEach(() => {
    localStorage.clear(); dark = false; languages = ["en-US"]; listeners = new Set();
    jest.spyOn(navigator, "languages", "get").mockImplementation(() => languages);
    window.matchMedia = jest.fn(() => ({
        get matches() { return dark; },
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn)
    } as unknown as MediaQueryList));
});
afterEach(() => { jest.restoreAllMocks(); window.matchMedia = originalMatchMedia; strings.setLanguage("en"); });
const systemTheme = (value: boolean) => act(() => { dark = value; listeners.forEach(fn => fn()); });
const systemLanguage = (value: string[]) => act(() => { languages = value; window.dispatchEvent(new Event("languagechange")); });
const storage = (key: string | null, newValue: string | null) => act(() => {
    if (key === null) localStorage.clear();
    else if (newValue === null) localStorage.removeItem(key);
    else localStorage.setItem(key, newValue);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
});
function State() {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings, setContentFontSize, setContentFontColor, setHazzatFontColor, setContentLanguages } = useContext(UserSettingsContext);
    const location = useLocation();
    return <>
        <output data-testid="language">{languageProperties.localeName}</output>
        <output data-testid="url">{location.pathname}{location.search}{location.hash}</output>
        <output data-testid="reader">{JSON.stringify(userSettings)}</output>
        <Link to="/clean">Clean URL</Link>
        <button onClick={() => setContentFontSize(24)}>Size 24</button>
        <button onClick={() => setContentFontColor("MAROON")}>Text maroon</button>
        <button onClick={() => setHazzatFontColor("NAVY")}>Notes navy</button>
        <button onClick={() => setContentLanguages([ContentLanguage.Coptic])}>Coptic only</button>
    </>;
}
function Preview({ url = "/" }: { url?: string }) {
    return <ThemeProvider><MemoryRouter initialEntries={[url]}><LanguageProvider>
        <UserSettingProvider><SitePreferences /><State /></UserSettingProvider>
    </LanguageProvider></MemoryRouter></ThemeProvider>;
}
test("fresh preferences follow browser changes without saving detected defaults", () => {
    dark = true; languages = ["fr-FR", "ar-EG", "en-US"];
    const view = render(<Preview />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("reader")).toHaveTextContent('"englishFontSize":"18px"');
    expect(screen.getByTestId("reader")).toHaveTextContent('"arabicFontSize":"22px"');
    expect(screen.getByTestId("reader")).toHaveTextContent('"contentLanguages":["English","Coptic","Arabic"]');
    systemTheme(false); systemLanguage(["en-GB", "ar"]);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(localStorage.length).toBe(0);
    view.unmount(); expect(listeners.size).toBe(0);
});
test.each(["light", "dark"])("preserves legacy saved %s regardless of the browser", theme => {
    dark = theme === "light"; localStorage.setItem("hazzat.theme", theme);
    render(<Preview />); systemTheme(!dark);
    expect(document.documentElement).toHaveAttribute("data-theme", theme);
});
test("manual choices survive remount and override later browser changes", () => {
    const view = render(<Preview />);
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    fireEvent.click(screen.getByRole("link", { name: "Switch to Arabic" }));
    for (const name of ["Size 24", "Text maroon", "Notes navy", "Coptic only"]) fireEvent.click(screen.getByRole("button", { name }));
    expect(localStorage.getItem("hazzat.theme")).toBe("dark");
    expect(localStorage.getItem("hazzat.navigation-language")).toBe("ar");
    systemTheme(true); systemTheme(false); systemLanguage(["en"]);
    view.unmount(); render(<Preview />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    const settings = JSON.parse(screen.getByTestId("reader").textContent!);
    expect(settings).toMatchObject({ englishFontSize: "24px", arabicFontSize: "28px", contentFontColor: "MAROON", hazzatFontColor: "NAVY", contentLanguages: ["Coptic"] });
});
test("a temporary URL overrides saved language without replacing it, and clean navigation restores it", () => {
    localStorage.setItem("hazzat.navigation-language", "en");
    render(<Preview url="/Seasons/annual?lang=ar-EG&env=PPE&source=friend#hymn" />);
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    systemLanguage(["ar"]);
    expect(localStorage.getItem("hazzat.navigation-language")).toBe("en");
    fireEvent.click(screen.getByRole("link", { name: "Clean URL" }));
    expect(document.documentElement).toHaveAttribute("lang", "en");
});
test("manual language selection replaces an explicit URL and preserves all other URL parts", () => {
    render(<Preview url="/Seasons/annual?lang=ar&env=PPE&source=friend#hymn" />);
    fireEvent.click(screen.getByRole("link", { name: strings.switchToEnglish }));
    expect(screen.getByTestId("url")).toHaveTextContent("/Seasons/annual?lang=en&env=PPE&source=friend#hymn");
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(localStorage.getItem("hazzat.navigation-language")).toBe("en");
});
test("cross-tab updates sync all preferences without echo writes, while a URL language still wins", () => {
    render(<Preview url="/?lang=ar" />);
    const write = jest.spyOn(Storage.prototype, "setItem");
    storage("hazzat.theme", "dark");
    storage("hazzat.navigation-language", "en");
    storage("hazzat.reader-settings", JSON.stringify({ size: 20, contentFontColor: "NAVY", hazzatFontColor: "MAROON", contentLanguages: [] }));
    expect(write).toHaveBeenCalledTimes(3);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(screen.getByTestId("reader")).toHaveTextContent('"contentLanguages":[]');
    expect(screen.getByTestId("reader")).toHaveTextContent('"englishFontSize":"20px"');
    fireEvent.click(screen.getByRole("link", { name: "Clean URL" }));
    expect(document.documentElement).toHaveAttribute("lang", "en");
    systemTheme(true); systemLanguage(["ar-EG"]); storage(null, null);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(screen.getByTestId("reader")).toHaveTextContent('"englishFontSize":"18px"');
});
test("invalid stored fields and URL languages fall back independently", () => {
    dark = true; languages = ["fr", "ar-SA"];
    localStorage.setItem("hazzat.theme", "invalid"); localStorage.setItem("hazzat.navigation-language", "xx");
    localStorage.setItem("hazzat.reader-settings", JSON.stringify({ size: 999, contentFontColor: "NAVY", hazzatFontColor: "bad", contentLanguages: ["arabic", "invalid"] }));
    render(<Preview url="/?lang=garbage" />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(JSON.parse(screen.getByTestId("reader").textContent!)).toMatchObject({ englishFontSize: "18px", contentFontColor: "NAVY", hazzatFontColor: "BLACK", contentLanguages: ["Arabic"] });
});
test("blocked storage still permits in-memory theme, language and reading changes", () => {
    dark = true;
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<Preview />);
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    fireEvent.click(screen.getByRole("link", { name: "Switch to Arabic" }));
    fireEvent.click(screen.getByRole("button", { name: "Size 24" }));
    systemTheme(false); systemTheme(true);
    fireEvent.click(screen.getByRole("link", { name: "Clean URL" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(screen.getByTestId("reader")).toHaveTextContent('"englishFontSize":"24px"');
});
test("unavailable browser signals use light and English, with navigator.language as a language fallback", () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    languages = ["fr-FR", "de"];
    render(<Preview />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute("lang", "en");
    languages = []; jest.spyOn(navigator, "language", "get").mockReturnValue("ar-EG");
    expect(browserLanguage()).toBe("ar");
    expect(languageFromTag("arabic")).toBeNull();
});
test("the early bootstrap applies browser or saved themes before React without persisting them", () => {
    const html = require("fs").readFileSync(require("path").join(process.cwd(), "index.html"), "utf8");
    const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    dark = true; languages = ["fr", "ar-EG"];
    window.eval(bootstrap);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(localStorage.length).toBe(0);
    localStorage.setItem("hazzat.theme", "light"); localStorage.setItem("hazzat.navigation-language", "en");
    window.eval(bootstrap);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement).toHaveAttribute("lang", "en");
});
