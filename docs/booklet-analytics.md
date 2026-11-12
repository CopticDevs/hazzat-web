# Booklet generation analytics

The public website uses the existing Google Analytics `window.gtag` integration
from `index.html` through the shared `trackAnalyticsEvent` helper in
`src/analytics.ts`. Successful booklet generation sends:

```js
trackAnalyticsEvent("booklet_generated", {
    event_category: "Engagement",
    event_label: "Booklet Generated"
});
```

## What is counted

`BookletDetails.reviewBooklet` emits the event once after PDF generation succeeds,
a PDF object URL has been created, and the still-mounted builder accepts the
result for its current route/content request and makes it available for preview
and download. The event is sent from that acceptance branch, not from a render,
an effect, the initial button click, or a preview/download link.

- Repeated clicks while generation is pending do not start another generation.
- Empty selections, generation/preview-URL failures, and results discarded after
  unmount or a route/content reload do not emit the event.
- Rerenders, opening the PDF, and downloading the same PDF do not emit it again.
- Each later successful regeneration emits one new event.
- Missing, blocked, or throwing analytics does not prevent preview or download.
  Events are not retried or backfilled when analytics later becomes available.

The custom payload contains only the two fixed strings above. It does not add
PDF contents, filenames, selected hymns, personal information, or identifiers.
Google Analytics may still collect its normal page/session metadata. This counts
accepted generations, not unique visitors or confirmed downloads; client-side
blocking can reduce the number of events received by Google Analytics.

## Validation

Automated component tests in `src/Components/BookletDetails.test.tsx` cover the
success boundary, pending/repeated clicks, failure and retry, empty selections,
rerenders under React Strict Mode, preview/download clicks, regeneration,
unmount, overlapping results across route changes, and unavailable analytics.
Run them with:

```sh
npm test -- --runInBand src/Components/BookletDetails.test.tsx
```

### Google Analytics receipt check (manual)

Use an approved test deployment with the change and a test Google Analytics
property/stream. Do not send synthetic checks to the production property. The
repository's `index.html` currently includes the site's measurement ID, so verify
the test deployment's destination before generating a test event.

1. Open the test site's booklet builder with analytics allowed. For DebugView,
   enable debug mode using Google Tag Assistant or the Google Analytics Debugger
   browser extension; otherwise use the test property's Realtime report.
2. Open the matching property's DebugView or Realtime report in Google Analytics.
3. Generate one booklet. Once its preview/download is available, verify one
   `booklet_generated` event with `event_category = Engagement` and
   `event_label = Booklet Generated`.
4. Open the preview, download the same PDF, and rerender/change unrelated UI.
   Confirm the count does not increase. Generate a new booklet and confirm one
   additional event.
5. Repeat a failed generation and a generation abandoned by navigation. Confirm
   neither adds a success event. Test blocked analytics separately and confirm
   PDF generation/download remain available.
6. Record the deployment/commit, test property/stream, verification time, and
   observed counts in the issue or PR, then turn off debug mode.

Automated tests verify the application calls the existing analytics integration;
they do not establish receipt by Google's servers. The manual receipt check must
be completed in an authorized test environment before closing that acceptance
criterion.
