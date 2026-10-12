# Airlec Australia: WWS recreation

Recreation of https://www.airlecaustralia.com.au/ for import into Working Websites Studio from GitHub.
Plain static HTML + CSS (Astro cannot build on Node 20 here, and the WWS import contract allows plain HTML).

## Layout

- `index.html`, `<route>/index.html` generated pages at the repo root, one per URL, extensionless (`/contact`, `/solar-system-news/<post>`). The WWS importer derives page slugs from these paths. Committed: this is what WWS reads. The live site's `.html` URLs (`/contact.html`) need redirects in WWS.
- `src/cms/content.json` all copy, image paths and links, keyed by route. Edit this, not the HTML.
- `src/styles/site.css` one stylesheet. Breakpoints: desktop, tablet `601-820` (designed for WWS's 640px tablet column), mobile `<=600`.
- `public/assets`, `public/fonts` images and self-hosted Montserrat/Roboto (from the live site).
- `scripts/generate-pages.mjs` content.json + templates -> the root pages. `scripts/stage.mjs` -> `dist/` for local serving.

```bash
node scripts/generate-pages.mjs && node scripts/stage.mjs   # then serve dist/
```

Content is produced from the live site by the pipeline (`scripts/prepare-airlec.mjs`, `scripts/extract-blocks-live.mjs` in
wws-recreation-pipeline) and then hand-tuned. See `RECREATION_REPORT.md` for status.
