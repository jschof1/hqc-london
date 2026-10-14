# HQC analytics

PostHog Wizard 2.82.0 ran on 14 October 2026 and connected EU project **305883**.

- Dashboard: https://eu.posthog.com/project/305883/dashboard/1023988
- Original wizard report: https://eu.posthog.com/project/305883/notebooks/6005175aa3ed
- Astro setup: https://posthog.com/tutorials/astro-analytics

The reviewed implementation replaces the wizard's immediate initialization with
an SDK download after Analytics consent. Consent withdrawal stops capture and
clears PostHog persistence. Existing Umami and dataLayer event contracts remain
unchanged. The server SDK, browser logs, error capture, automatic capture,
session replay, surveys, feature flags and person profiles are not enabled.
The original wizard report describes its generated draft, before these changes.

## Build configuration

Cloudflare Pages production and preview builds need both public variables:

```
PUBLIC_POSTHOG_PROJECT_TOKEN=<HQC public project token>
PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

These are build-time settings; a new deployment is required after changing them.
Personal API keys must never appear in public settings. Only the canonical HQC
hosts and this project's Pages previews can collect events. Localhost is disabled.
Previews retain noindex, disable production Umami, and label all PostHog events
`site_environment=preview`. Production reports should filter
`site_environment=production` and `tracking_version=hqc-posthog-v1`.

## Events and limits

Pageviews, phone/WhatsApp clicks, CTA clicks, service selection, quote route
selection and successful API responses for quote, contact, quick enquiry,
introductory offer and feedback forms are measured. Rating and Google review
clicks describe the existing feedback journey; they do not prove a posted review.
An accepted form response does not prove CRM delivery or a completed booking.

Only allowlisted technical properties and fixed categories are sent. Query
strings, fragments, referrers, campaign identifiers, person properties and form
contents are removed before transmission. No events are queued before consent.

## Verification and rollback

Run `npm run test:forms`, `npm run test:analytics`, and `npm run build`.
Browser checks cover initial/rejected consent, accept/withdraw/reaccept, navigation,
duplicate capture, URL/property filtering, previews, SDK failure and form success.
Use mocked form endpoints for tests; do not create real customer enquiries.

To disable collection, remove the public token from both Pages build environments
and deploy again, or revert the integration commit. Existing form webhooks and
Umami do not depend on PostHog.
