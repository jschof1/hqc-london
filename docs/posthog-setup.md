# High Quality Clean: PostHog analytics

This opt-in integration works with the existing HQC cookie banner on production and preview deployments. Existing Umami remains on production only.

## Before enabling

1. Create a **dedicated High Quality Clean PostHog project**, not the UK Trade Leads project.
2. Add these **public build environment variables** in the HQC hosting project (Cloudflare Pages, or Netlify for its Deploy Previews):
   - `PUBLIC_POSTHOG_PROJECT_TOKEN`: the public project token (never a personal API key).
   - `PUBLIC_POSTHOG_HOST`: the ingestion host from that project's settings, e.g. `https://eu.i.posthog.com` for an EU project.
3. For preview builds, set the same two HQC variables in the **Preview** deploy environment. Optionally set `PUBLIC_POSTHOG_PREVIEW_PROJECT_TOKEN` and `PUBLIC_POSTHOG_PREVIEW_HOST` as a pair to use a separate PostHog test project. Without the override, preview traffic goes to the dedicated HQC project labelled `site_environment=preview`.
4. Rebuild and deploy the website after setting those variables.
5. Review HQC's privacy policy to ensure PostHog and optional visitor consent are disclosed before enabling data collection.

If no complete token-and-host pair is configured for a deployment, no PostHog SDK is loaded. Both Cloudflare Pages and Netlify previews are supported, but **localhost stays disabled**. Previews retain `noindex` and do not load HQC's production Umami analytics. If using the same HQC PostHog project for both environments, exclude `site_environment=preview` from production dashboards and funnels.

## What is measured

- Pageviews after analytics consent, including Astro client-side navigation. Each event includes `site_environment` (`production` or `preview`).
- Telephone and WhatsApp clicks.
- Successful quote submissions and successful shared form submissions.
- Quote route selection, service selector results, and conversion prompt views.

Custom events do not forward form contents, names, phone numbers, email addresses, hrefs or URL query strings. Autocapture and session replay are disabled. Review SDK-added event metadata before going live.

## Test checklist

1. Open both the production site and a Netlify/Cloudflare preview in clean browser profiles and reject analytics: verify no PostHog network requests.
2. Accept analytics in the preview: verify one `$pageview` arrives in the dedicated HQC (or optional test) PostHog project with `site_environment=preview`.
3. Navigate to another page: verify a second pageview.
4. Click a phone link and submit a test enquiry successfully: confirm events without personal fields.
5. Disable analytics in cookie preferences without reloading: confirm captures stop.
6. Verify Umami runs on production only, and GHL routing and the existing forms still work in both environments.

## Why the wizard was not run

The requested `npx -y @posthog/wizard@latest` tool requires an interactive terminal and PostHog authentication. Its published build does not currently support headless `--ci` runs. This implementation uses PostHog's official JavaScript SDK snippet directly, avoiding changes to the npm lockfile.

See https://github.com/PostHog/wizard for the wizard's documented limitations.
