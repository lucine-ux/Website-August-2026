# Back to Breath website

backtobreath.net.au, hosted on Cloudflare Pages.

## What's where
- `*.html` pages, `style.css` plus a stylesheet per page
- `brand.css` the 2026 brand (cream and lilac). Loaded last on every page, so colour and font changes go here.
- `audit.html` The Nervous System Audit
- `images/` photos and videos
- `worker/waitlist-worker.js` the Cloudflare Worker that sends forms and audit results to Flodesk and the Google Sheet (deployed separately in Cloudflare, not part of the site)
- `scripts/audit-sheet-script.gs` the Google Apps Script that logs audit answers to the private results sheet

## Secrets
Never put the Flodesk API key or segment IDs in this repo. They live in Cloudflare under the worker's Settings > Variables.
