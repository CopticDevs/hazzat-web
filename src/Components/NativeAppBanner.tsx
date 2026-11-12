import { useContext, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { strings } from "../l8n";
import { readPreference, savePreference } from "../sitePreferences";
import "./NativeAppBanner.css";

export const androidAppUrl = "https://play.google.com/store/apps/details?id=com.hazzat.hazzatandroidapp";
export const appBannerDismissedKey = "hazzat.android-app-banner-dismissed";

function shouldOfferAndroidApp(): boolean {
    // This is only a presentation hint. Do not probe whether the app is installed,
    // launch a custom URL scheme, or redirect someone away from the website.
    if (!/Android/i.test(navigator.userAgent)) return false;
    try {
        if (window.matchMedia("(display-mode: standalone)").matches) return false;
    } catch { /* A normal browser can still display the ordinary store link. */ }
    return readPreference(appBannerDismissedKey) !== "true";
}

export default function NativeAppBanner() {
    const { languageProperties } = useContext(LanguageContext);
    const [visible, setVisible] = useState(shouldOfferAndroidApp);
    if (!visible) return null;

    function dismiss() {
        savePreference(appBannerDismissedKey, "true");
        setVisible(false);
    }

    return (
        <aside className="native-app-banner" dir={languageProperties.isRtl ? "rtl" : "ltr"}
            aria-label={strings.downloadTheApp}>
            <div className="native-app-banner-content">
                <span className="native-app-banner-name">{strings.nativeAppName}</span>
                <a href={androidAppUrl}>{strings.nativeAppGooglePlay}</a>
                <button type="button" onClick={dismiss} aria-label={strings.nativeAppDismiss}>
                    <span aria-hidden="true">×</span>
                </button>
            </div>
        </aside>
    );
}
