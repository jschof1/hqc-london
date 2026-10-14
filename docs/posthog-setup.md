# High Quality Clean: PostHog analytics

This opt-in integration works with the existing HQC cookie banner and retains Umami.

## Before enabling

1. Create a **dedicated High Quality Clean PostHog project**, not the UK Trade Leads project.
2. Add these **build environment variables** in the Cloudflare Pages project for HQC:
   - `PUBLIC_POSTHOG_PROJECT_TOKEN`: the public project token (never a personal API key).
   - `PUBLIC_POSTHOG_HOST`: the ingestion host from that project's settings, e.g. `https://eu.i.posthog.com` for an EU project.
3. Rebuild and deploy the website after setting those variables.
4. Review and update HQC's privacy policy to disclose PostHog as an analytics provider before enabling production data collection.

If either value is missing, no PostHog SDK is loaded. PostHog is also disabled on localhost and Cloudflare Pages previews.

## What is measured

- Pageviews after analytics consent, including Astro client-side navigation.
- Telephone and WhatsApp clicks.
- Successful quote submissions and successful shared form submissions.
- Quote route selection, service selector results, and conversion prompt views.

Custom events do not forward form contents, names, phone numbers, email addresses, hrefs or URL query strings. Autocapture and session replay are disabled. Review SDK-added event metadata before going live.

## Test checklist

1. Open in a clean browser and reject analytics: verify no PostHog network requests.
2. Accept analytics: verify one `$pageview` arrives in the dedicated HQC project.
3. Navigate to another page: verify a second pageview.
4. Click a phone link and submit a test enquiry successfully: confirm events without personal fields.
5. Disable analytics in cookie preferences without reloading: confirm captures stop.
6. Verify Umami, GHL routing, and the existing forms still work.

## Why the wizard was not run

The requested `npx -y @posthog/wizard@latest` tool requires an interactive terminal and PostHog authentication. Its published build does not currently support headless `--ci` runs. This implementation uses PostHog's official JavaScript SDK snippet directly, avoiding changes to the npm lockfile.

See https://github.com/PostHog/wizard for the wizard's documented limitations.
