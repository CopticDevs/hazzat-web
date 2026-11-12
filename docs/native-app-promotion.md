# Native app promotion

The website promotes the existing native Hazzat apps. This is **not** PWA installation and does not automatically download or launch an app.

## iPhone and iPad Safari

The initial `index.html` contains Apple's Smart App Banner metadata:

```html
<meta name="apple-itunes-app" content="app-id=6753879416" />
```

Safari renders and controls the native banner, including store details, install/open behavior, eligibility and dismissal. The website does not detect installation. Other iOS browsers need not display this Safari feature; the existing menu's App Store link remains available.

No `app-argument` is supplied: opening a matching hymn in the app would require separately verified deep-link support. The shared SPA document supplies the same app ID on all routes.

Verified store listing: https://apps.apple.com/us/app/hazzat/id6753879416
Apple reference: https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners

## Android

`NativeAppBanner` offers an ordinary Google Play HTTPS link on Android browsers. It is site UI, not a native browser installation prompt, and does not claim to know if the app is installed. The user agent is used locally only as a presentation hint; no fingerprint, install probing, automatic redirect or new analytics event is introduced.

Verified store listing: https://play.google.com/store/apps/details?id=com.hazzat.hazzatandroidapp

The banner supports English/Arabic navigation, RTL, and light/dark themes. It is in document flow, not an overlay. Closing it persists `hazzat.android-app-banner-dismissed=true` in local storage; clearing site storage resets this preference. If storage is unavailable, dismissal still lasts for the mounted visit. Standalone web-app windows and printed pages do not show it. Existing menu store links remain available after dismissal and on desktop.

## Validation

- Jest covers platform selection, the store destination, persistent dismissal, blocked storage, standalone display, unavailable media queries and Arabic/RTL.
- The HTML contract test verifies the initial Safari metadata and app ID.
- Run `npm test -- --runInBand`, `npm run test-tooling`, `npm run lint`, and `npm run build`.
- Check Android light/dark, English/Arabic and narrow-screen layout; close and reload to verify dismissal.
- Native Safari rendering **requires a real iPhone/iPad**. Apple states Smart App Banners do not display in the iOS simulator or frames. Test the deployed site in Safari with the app installed and not installed, accounting for previous banner dismissal and store-region availability. A successful build cannot prove Apple's native banner appeared.
- Do not create synthetic analytics traffic on production while testing. Use isolated local fixtures with analytics blocked.
