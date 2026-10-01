# JadeBlue store locator — existing application audit

Status: Task 1 complete (audit only). No store locator was implemented. Production DNS, Shopify, and hosting domains were not changed.

Date: 2026-10-01

## Current application architecture

This repository is a new Next.js App Router project created with `create-next-app`. It is not yet a storefront, admin, or locator.

| Area | What is actually in the repo |
| --- | --- |
| Framework | Next.js `16.3.7` (App Router), React `19.2.8`, TypeScript |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` |
| Package manager | pnpm `12.6.0` (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) |
| App files | `app/layout.tsx`, `app/page.tsx`, `app/globals.css` |
| Config | `next.config.ts` is empty of custom options |
| Public assets | Default Next/Vercel SVGs in `public/` |
| Database / ORM | None. No Prisma, Drizzle, SQL, or schema files |
| Authentication / admin | None |
| API routes | None (`app/api` does not exist) |
| Shopify SDK or env | None. No `.env` files |
| Caching layer | None beyond Next.js defaults. No `revalidate`, `unstable_cache`, or CDN config |
| Maps | None |
| Tests | None |
| Git remote | None (`git remote` is empty). One commit: “Initial commit from Create Next App” |
| Deployment files | No `vercel.json`, Dockerfile, CI workflow, or hosting project link |

The home page is the default Create Next App screen. Metadata title is still “Create Next App”.

`AGENTS.md` is the Next.js-generated agent notice for this version. Project progress for this work is tracked in `agent.md`, which did not exist before this audit.

## Routing structure

Only the App Router root exists:

- `/` → `app/page.tsx`
- Root layout → `app/layout.tsx` (`LayoutProps<"/">`)

There is no `middleware.ts`. In Next.js 16 the request-interception file is `proxy.ts` at the project root (same level as `app/`). The `middleware` filename is deprecated in the installed docs (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).

There is no multi-domain or subdomain handling. Hostname is unused. Static files, `/_next/*`, and future API routes are not excluded by any matcher because no proxy exists yet.

## Existing store data

No store, location, branch, or city data exists in this application. There is no table to extend and no duplicate-table risk yet.

The public Shopify site `https://jadeblue.com` and the page `https://jadeblue.com/pages/store-locator` are outside this repository. This audit did not call Shopify Admin, did not read metafields or metaobjects, and did not change that storefront. Whether the live locator is a Shopify page, an embedded app, or a third-party widget is not visible from this codebase.

Source of truth today, inside this repo: none.

Recommended direction for the architecture task (not implemented): make an application database the source of truth for locator fields (subdomain, coordinates, hours, images, publish state). Shopify remains the commerce storefront on `jadeblue.com`. Sync from Shopify only if a later check of Admin shows a maintained Locations or metaobject dataset worth importing. Do not copy unverified store rows into the database during planning.

## Deployment and domains

Nothing in the repo is deployed. README mentions Vercel as the usual Next.js host; that is template text, not a confirmed project.

Intended split (proposal only):

| Hostname | Intended target |
| --- | --- |
| `jadeblue.com`, `www.jadeblue.com` | Existing Shopify storefront. This app must not claim the apex |
| `stores.jadeblue.com` | This Next.js app, store listing |
| `*.jadeblue.com` (store subdomains) | Same Next.js deployment |
| Reserved labels (`www`, `stores`, `admin`, `api`, `app`, `mail`, `support`, plus platform names) | Not assignable to a store |

Wildcard certificates and DNS are a hosting and DNS task. Vercel supports a wildcard domain (`*.jadeblue.com`) when the DNS provider can create the required records; apex `jadeblue.com` can stay pointed at Shopify while specific hosts point at Vercel. That requires registrar/DNS and Vercel project access. It was not configured here.

Changes that need external access later:

- Domain registrar / DNS: `stores` A/CNAME and wildcard record, without moving apex off Shopify
- Hosting (likely Vercel, once a project exists): attach `stores.jadeblue.com` and `*.jadeblue.com`, issue certificates
- Shopify admin: only if product/location data must be read or the existing locator page should link out. Not required to keep `jadeblue.com` working

## Recommended subdomain resolution (Next.js 16)

Resolve the store on the server. Do not use client-only hostname checks.

1. `proxy.ts` reads the request URL hostname (the host the platform presents on the request). Compare it to an allowlist rooted at `jadeblue.com` (and a dev host such as `localhost`). Ignore spoofable custom headers as the identity of the store. If the platform sets `x-forwarded-host`, trust it only when the deployment is known to overwrite that header (document this when the host is chosen).
2. Parse one label: `stores` → listing rewrite; a store label → rewrite to an internal path such as `/s/[subdomain]`; apex / `www` should not be served by this app in production.
3. Matcher must skip `/_next/static`, `/_next/image`, `/api`, and public files so assets are not rewritten.
4. The page (or a server loader) loads the store by subdomain from the database. Unknown or inactive subdomains call `notFound()`.
5. Do not put the subdomain only in a cache key that omits host. Use the resolved subdomain in the data cache key (`store:<subdomain>`) and do not cache inactive stores as public pages.
6. Internal rewrite keeps the browser URL on the store host (direct load, refresh, and deep links). Query strings stay on `request.nextUrl`.

`jadeblue.com` isolation is primarily DNS: the apex never reaches this app. The app should still refuse to treat `jadeblue.com` and `www.jadeblue.com` as store tenants if a request arrives with those hosts.

## Database and API work required later

Not present, so Task 3 would add them. Suggested shape (planning only):

- One `stores` table with separate `store_name`, `store_slug`, `subdomain`, `city`, and address fields
- Unique indexes on `subdomain` and `store_slug`
- Reserved-subdomain check before insert/update
- `is_active` for publish state
- Optional child tables only if images, services, or weekly hours do not fit cleanly in columns/JSON
- Public read API or server-only queries that return public fields only
- Admin mutations behind auth that does not exist yet (auth approach is an open decision)

No ORM is installed. Pick one when implementing (for example Drizzle or Prisma) and match it with a hosted Postgres. Do not add a second store table later if this one covers the fields in the brief.

## Listing and detail pages (implementation plan)

After architecture approval:

- `stores.jadeblue.com` → listing: search (city, area, pincode, name) without a full reload, cards (name, city, address, phone, hours, image, directions, view store), filters only for fields that exist, map only when lat/lng exist, empty state with reset
- `{subdomain}.jadeblue.com` → detail: hero, contacts, hours, description, services, gallery, map/directions, hide empty sections, link to `https://stores.jadeblue.com`
- View Store links use `https://{subdomain}.jadeblue.com`
- JadeBlue branding; do not copy Raymond assets
- SEO: per-store title, description, canonical, Open Graph, structured data from real fields, sitemap of active stores, 404 for unknown/inactive
- Admin: create/edit/publish, subdomain validation, public URL preview. Build this because none exists

## Risks and open questions

- No production host is linked. Wildcard DNS steps stay conditional until the team confirms Vercel (or another host).
- Shopify may already store locations for the current locator page. Importing them needs Admin access and a sync decision. This audit did not verify that.
- Admin auth, image storage, and map provider are undecided. No Google Maps (or other) key exists in the repo.
- Opening-hours “open now” should wait until hours are structured and reliable.
- Multiple stores can share a city. City must not be used as the subdomain.
- Caching one store’s HTML under another host is a real failure mode once ISR or a shared cache is added. Cache keys must include subdomain; inactive stores must not be public.
- `proxy.ts` runs separately from render code. Database lookups belong in the page/loader, not in a shared module imported for tenant data inside the proxy, unless the chosen host supports it. The proxy should rewrite by hostname label; the page should load the row.

## Files created or modified in this task

- Created `docs/jadeblue-store-locator-audit.md`
- Created `agent.md`

No application routes, config, DNS, or Shopify settings were changed.
