# JadeBlue store locator progress

## Current task

Task 2 — Architecture and data model plan. Complete as a document. Not implemented.

## Status

Waiting for approval of `docs/jadeblue-store-locator-architecture.md` before Task 3.

## Completed work

- Task 1 audit of the Next.js 16 template app.
- Task 2 plan: Postgres + Drizzle as the locator source of truth, `proxy.ts` hostname rewrites, public vs admin fields, cache tags, SEO, and DNS responsibilities.

## Files created or modified

- `docs/jadeblue-store-locator-audit.md` (Task 1)
- `docs/jadeblue-store-locator-architecture.md` (Task 2)
- `agent.md`

## Architecture decisions

- Locator data lives in one `stores` table in app Postgres. Shopify remains commerce on `jadeblue.com` and is not synced in this phase.
- ORM: Drizzle. Not installed yet.
- Routing: `proxy.ts` rewrites `stores.jadeblue.com` to `/stores` and `{label}.jadeblue.com` to `/s/{label}`. The page loads the row and 404s when missing or inactive. Proxy does not query the database.
- `store_name`, `store_slug`, `subdomain`, `city`, and address stay distinct. Subdomain is unique. Reserved labels cannot be stores.
- Cache tags: `store:<subdomain>` and `stores:index`.
- No production DNS or Shopify changes in the plan.

## Tests performed

None. Planning only. No schema, routes, or records were added.

## Test results

Not applicable.

## Known issues

- App is still the Create Next App template.
- No `DATABASE_URL`, auth, object storage, map key, or hosting project.
- Shopify Admin locations were not verified.

## Pending tasks

- Task 3 — Store data management (schema, validation, admin)
- Task 4 — Subdomain routing
- Task 5 — Store listing page
- Task 6 — Store detail page
- Task 7 — SEO, sitemap, and metadata
- Task 8 — Performance and cache validation
- Task 9 — Domain and production readiness (no DNS changes without explicit approval)

## Next recommended task

Task 3 after this architecture is approved.
