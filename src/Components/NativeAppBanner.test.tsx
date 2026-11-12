import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageContext } from "../LanguageContext";
import { ArabicLanguageProperties, strings } from "../l8n";
import NativeAppBanner, { androidAppUrl, appBannerDismissedKey } from "./NativeAppBanner";

const originalMatchMedia = window.matchMedia;

function device(userAgent: string, standalone = false) {
    jest.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    window.matchMedia = jest.fn().mockReturnValue({ matches: standalone });
}

beforeEach(() => {
    localStorage.clear();
    strings.setLanguage("en");
});
afterEach(() => {
    jest.restoreAllMocks();
    window.matchMedia = originalMatchMedia;
    strings.setLanguage("en");
});

test.each(["iPhone Safari", "iPad Safari", "Macintosh Chrome", "Windows Chrome", ""])(
    "does not add a custom banner for %s (Safari owns the iOS banner)", userAgent => {
        device(userAgent);
        const { container } = render(<NativeAppBanner />);
        expect(container).toBeEmptyDOMElement();
    });

test("Android offers the verified HTTPS store link without claiming installation status", () => {
    device("Mozilla/5.0 (Linux; Android 16; Pixel 9) Chrome/145");
    render(<NativeAppBanner />);
    expect(screen.getByRole("link", { name: "Get it on Google Play" })).toHaveAttribute("href", androidAppUrl);
    expect(screen.queryByText("Open")).not.toBeInTheDocument();
});

test("dismissal persists across rerenders and later visits", () => {
    device("Android");
    const view = render(<NativeAppBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss app banner" }));
    expect(view.container).toBeEmptyDOMElement();
    view.rerender(<NativeAppBanner />);
    expect(view.container).toBeEmptyDOMElement();
    expect(localStorage.getItem(appBannerDismissedKey)).toBe("true");
    view.unmount();
    expect(render(<NativeAppBanner />).container).toBeEmptyDOMElement();
});

test("blocked storage still allows dismissal for the current visit", () => {
    device("Android");
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    const { container } = render(<NativeAppBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss app banner" }));
    expect(container).toBeEmptyDOMElement();
});

test("does not advertise a native app inside a standalone web app", () => {
    device("Android", true);
    expect(render(<NativeAppBanner />).container).toBeEmptyDOMElement();
});

test("throwing matchMedia does not break the page", () => {
    device("Android");
    window.matchMedia = jest.fn(() => { throw new Error("unsupported"); });
    render(<NativeAppBanner />);
    expect(screen.getByRole("link")).toHaveAttribute("href", androidAppUrl);
});

test("supports Arabic navigation and RTL without changing content languages", () => {
    device("Android");
    strings.setLanguage("ar");
    render(<LanguageContext.Provider value={{ languageProperties: ArabicLanguageProperties }}>
        <NativeAppBanner />
    </LanguageContext.Provider>);
    expect(screen.getByRole("complementary")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("link", { name: "احصل عليه من Google Play" })).toHaveAttribute("href", androidAppUrl);
    fireEvent.click(screen.getByRole("button", { name: "إخفاء شريط التطبيق" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
});
