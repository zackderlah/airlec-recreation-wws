# Airlec Australia recreation report

Source: https://www.airlecaustralia.com.au/ (Weebly site by Working Websites). Date: 2026-10-12.
Scope of this pass: **home + one page of each template (8 of ~37 captured pages).** The remaining pages reuse the same
templates and still need content extraction (see "Not done").

## Pages recreated

| Template | Route |
|---|---|
| Home | `/` |
| Service (accordion) | `/solar-power-products.html` |
| Contact (3 forms) | `/contact.html` |
| About | `/about-will-campbell.html` |
| Listing | `/airlec-solar-installations.html`, `/solar-system-news.html` |
| Post | `/solar-system-news/which-solar-system-is-right-for-you`, `/airlec-solar-installations/on-grid-solar-system-for-commercial-turf-farm` |

## Match to the original site (pixel diff vs the captured source screenshots)

Desktop 1440 / tablet 1024 / mobile 390: Home 3.0 / 3.4 / 4.3 %, Products 1.6 / 3.1 / 4.3 %, About 1.6 / 3.4 / 5.3 %,
News 2.2 / 3.1 / 6.9 %, News post 1.6 / 3.1 / 7.1 %, Installation post 2.0 / 3.3 / 6.1 %, Installations list 8.6 / 10.1 / 9.9 %,
Contact 7.3 / 11.3 / 10.2 %. Full-page heights are within about 0-3 % except Contact (about 180px short) and mobile blog pages (80-270px short).

Known differences: Contact form cards (spacing; the live TradeHQ/Jotform iframes load external content that is blank in the offline
comparison), the Installations list tablet layout, Typekit "brandon-grotesque" nav font (licensed; Montserrat used), social share
widgets (Twitter/Facebook buttons) dropped.

## WWS ingestion (pipeline `npm run verify`, actual WWS renderer, tablet measured at the 640px editor column)

PASS on all checks: page heights exact for 8 pages x 3 devices; mean pixel diff 2.0 % (desktop 1.4, tablet 2.2, mobile 2.4; worst 3.7 %);
42 of 42 links preserved as WWS click actions; all images load; no horizontal overflow; all 6 nav items work (links, dropdown, hamburger).

Approximations the WWS canvas cannot express: contact forms render as WWS form objects (source styling ignored), inline SVG, box shadows,
per-run font size, content outside the 640px tablet column is shifted in. Full list: `recreation/layout/airlec/verify-report.md`.

## Not verified / not done

- 29 further pages (other service, product, case-study and news pages) are not yet recreated.
- Links inside content to pages not yet built (other posts, categories) point at routes that do not exist yet.
- Third-party embeds (Jotform testimonial slider, TradeHQ enquiry form) render only on the live site; test on a disposable WWS site.
- Form submission, hover/animation states, accordion open/close in the WWS preview, and the deployed WWS importer were not tested.
- Fonts: Montserrat/Roboto are self-hosted and must be registered in WWS; brandon-grotesque is an Adobe Fonts (Typekit) font and is not.
- Nothing has been published, pushed or imported into WWS.
