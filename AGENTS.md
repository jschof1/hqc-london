# AGENTS.md

## Cursor Cloud specific instructions

This is a static marketing website for **High Quality Clean Ltd** (HQC London), built with **Astro 5** and **Tailwind CSS 4**. There is no backend, database, or Docker — it is a purely static site.

### Running the dev server

```bash
npm run dev    # Starts Astro dev server at http://localhost:4321
```

See `README.md` for the full command table (`build`, `preview`, `generate:all`, etc.).

### Key caveats

- **`astro check` hangs** without `@astrojs/check` installed. It is not a listed dependency. Use `npx tsc --noEmit` for type-checking instead. There are pre-existing TS errors (Vite plugin type compatibility and a missing type declaration for `google-maps-review-scraper`) that do not block dev or build.
- **No ESLint or Prettier** is configured in this repo. There is no dedicated lint script.
- **Forms submit to external webhooks** (`services.leadconnectorhq.com`). They will fail in local dev — this is expected.
- The site uses the `@astrojs/cloudflare` adapter in `package.json` but `astro.config.mjs` does not import it, so the build output is `static` mode. This is intentional for local dev.
