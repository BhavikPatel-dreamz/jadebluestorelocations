# JadeBlue store locator progress

## Current task

Task 1 — Existing application audit. Complete.

## Status

Audit documented. Implementation has not started. Waiting for approval before Task 2.

## Completed work

- Read `AGENTS.md` (Next.js 16 agent notice). There was no `agent.md` before this task; this file is the progress log requested for the store locator.
- Inspected the Next.js app, routing, data layer, auth, APIs, and domain/deployment files.
- Confirmed there is no store data, Shopify client, database, or hostname routing in this repository.
- Wrote `docs/jadeblue-store-locator-audit.md`.

## Files created or modified

- `docs/jadeblue-store-locator-audit.md` (created)
- `agent.md` (created)

## Architecture decisions

- This app is Next.js 16.3.7 App Router. Hostname handling should use root `proxy.ts` (middleware is deprecated in this version), then a server-rendered page loads the store. Not implemented yet.
- No store table exists. A single stores model should be added later rather than duplicating one.
- Shopify `jadeblue.com` stays the commerce site. This app should own locator content once a database is chosen. Do not treat that as a source-of-truth change already made; no data was migrated.
- Do not point apex `jadeblue.com` at this app.

## Tests performed

None. This task was read-only inspection plus documentation. No runtime behavior was exercised as a feature test because no locator exists.

## Test results

Not applicable.

## Known issues

- The app is still the Create Next App template.
- No git remote, no Vercel (or other) project, no database, no admin auth, no map provider.
- Live Shopify locator content was not inspected via Admin API.

## Pending tasks

- Task 2 — Architecture and data model plan (`docs/jadeblue-store-locator-architecture.md`)
- Task 3 — Store data management
- Task 4 — Subdomain routing
- Task 5 — Store listing page
- Task 6 — Store detail page
- Task 7 — SEO, sitemap, and metadata
- Task 8 — Performance and cache validation
- Task 9 — Domain and production readiness (no DNS changes without explicit approval)

## Next recommended task

Task 2, after approval of this audit.
