# JadeBlue store locator — architecture and data model

Status: Task 2 plan only. Nothing in this document is implemented. DNS, Shopify, and production domains are unchanged.

Depends on: `docs/jadeblue-store-locator-audit.md`.

## Decisions

| Topic | Decision |
| --- | --- |
| Source of truth | JSON file in this app (`data/stores.json`), copied from the live Shopify file `FINAL.json`. No database. Shopify stays the commerce site. |
| ORM | None. Dropped after the request to keep locations in JSON. |
| Admin | New admin under this app, because none exists. Session auth before any store mutation. Public pages do not require auth. |
| Routing | Next.js 16 `proxy.ts` rewrites by hostname. Pages load the store on the server. |
| Hosting assumption | One Next.js deployment (Vercel when a project exists). Apex DNS stays on Shopify. |
| Images | Object storage later (Vercel Blob or S3-compatible). URLs stored on the store row. Task 3 may start with URL fields before uploads. |
| Maps | Google Maps links from real latitude/longitude. An embedded map is optional and only rendered when both coordinates exist. No invented coordinates. |
| Cache | Next.js fetch/data cache tags `store:<subdomain>` and `stores:index`. No new cache product. |

Shopify sync is out of scope until someone with Admin access confirms a maintained Locations or metaobject set. If that exists later, import once into Postgres and keep Postgres authoritative for subdomain, publish state, hours, and page content.

## Store schema

One table: `stores`. No second location table.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | uuid, PK | Generated. Not required on public pages. |
| `store_name` | text | Required. Display name. |
| `store_slug` | text | Required, unique, lowercase kebab-case. Not the hostname by itself. |
| `subdomain` | text | Required, unique, lowercase. Single DNS label. |
| `city` | text | Required. Not unique. |
| `state` | text | Required. |
| `country` | text | Default `India`. |
| `pincode` | text | Optional, indexed for search. |
| `area` | text | Optional locality, used by search. |
| `full_address` | text | Required. |
| `landmark` | text | Optional. |
| `latitude` | numeric | Optional. Both lat and lng required together. |
| `longitude` | numeric | Optional. |
| `phone` | text | Optional. Public. |
| `email` | text | Optional. Public. |
| `whatsapp` | text | Optional. Public. |
| `opening_hours` | text | Short public summary, optional. |
| `weekly_schedule` | jsonb | Optional structured days. Absent or invalid → hide “open now”. |
| `store_description` | text | Optional. |
| `store_images` | jsonb | Optional list of `{ url, alt }`. Public URLs only. |
| `cover_image` | text | Optional URL. |
| `logo` | text | Optional URL. |
| `services` | jsonb | Optional string list. |
| `facilities` | jsonb | Optional string list. |
| `announcement` | text | Optional. Empty → section hidden. |
| `is_active` | boolean | Default false. Public only when true. |
| `is_featured` | boolean | Default false. Listing sort only. |
| `seo_title` | text | Optional. Fallback: store name + city. |
| `seo_description` | text | Optional. Fallback from address/city, not invented copy. |
| `created_at` | timestamptz | Set on insert. |
| `updated_at` | timestamptz | Set on write. |

Internal-only columns, never returned to anonymous callers:

| Column | Purpose |
| --- | --- |
| `admin_notes` | Staff notes. |

Do not add credentials or Shopify tokens on this table.

### Identity rules

`store_name`, `store_slug`, `subdomain`, `city`, and `full_address` stay separate. City is not a key. Example shape (not a row to insert): Majura Gate can be slug `majura-gate`, subdomain `majura-gate`, city `Surat`.

Subdomain validation:

- Normalize to lowercase and trim.
- Allow `^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$` (one label, no dots).
- Reject reserved labels: `www`, `stores`, `admin`, `api`, `app`, `mail`, `support`, `ftp`, `smtp`, `imap`, `pop`, `ns1`, `ns2`, `cdn`, `static`, `assets`, `localhost`, `vercel`.
- Unique `subdomain` and unique `store_slug` at the database.
- Do not set `is_active` true when the subdomain fails validation.
- Slug uses the same character rule and the same reserved list so a slug cannot collide with a hostname label later.

## Public versus admin access

Public server code selects active stores and omits `admin_notes` and any draft body. Inactive and unknown subdomains use `notFound()` (HTTP 404), not a soft empty page and not a redirect to another store.

Admin routes live on a reserved host or path that is not a store rewrite (see routing). Mutations require a signed session. There is no public write API.

## Hostname routing

```text
Request host
    → proxy.ts (no database)
    → rewrite to an internal path
    → Server Component loads Postgres by subdomain
```

`proxy.ts` uses `request.nextUrl.hostname` (and port stripped). It does not trust a client-supplied `x-store` header. `x-forwarded-host` is not the store id. On Vercel, the platform host is the request host; do not prefer a forwarded host that the app did not configure.

| Host | Rewrite |
| --- | --- |
| `stores.jadeblue.com` | `/stores` listing. Path and query preserved under that tree if we add listing subpaths. |
| `{label}.jadeblue.com` | `/s/{label}` plus original path/query. |
| `jadeblue.com`, `www.jadeblue.com` | Not a tenant. If the app receives them, respond 404. DNS should not send them here. |
| Anything else (other registrable domain) | 404. |
| `localhost` / dev root host | Listing, so local dev works without DNS. Dev store hosts: `{label}.localhost`. |

Reserved labels that are not stores (`admin`, `api`, …) are not rewritten to `/s/...`. `admin.jadeblue.com` can serve `/admin` later. `stores` is only the listing.

Matcher excludes `api`, `_next/static`, `_next/image`, and common static extensions so assets are not rewritten.

The rewrite is internal (`NextResponse.rewrite`). The visible URL stays on the store host. Query strings are copied from `nextUrl`. No redirect from store host to store host (avoids loops).

Direct `/s/[subdomain]` and `/stores` on a store host should not become a way to read another store’s private data. Those internal paths are only reached by rewrite. A request whose host is `surat.jadeblue.com` and whose rewritten label is `surat` may only load `surat`. If path and host ever disagree, render 404.

Unknown label: still rewrite to `/s/{label}` and let the page 404 after the lookup, so the proxy stays free of database calls (Next.js proxy runs apart from the app bundle).

## App routes (internal)

| Path | Role |
| --- | --- |
| `app/stores/page.tsx` | Listing UI. |
| `app/s/[subdomain]/page.tsx` | Detail UI. `params.subdomain` must equal the host label. |
| `app/admin/stores/...` | CRUD. Not public. |
| `app/sitemap.ts` | Active stores only, canonical host per store. |
| `app/not-found.tsx` | Unknown and inactive. |

`generateMetadata` on the detail page uses that store’s `seo_title` / `seo_description`, canonical `https://{subdomain}.jadeblue.com`, and Open Graph. Sitemap lists `https://stores.jadeblue.com` and each active `https://{subdomain}.jadeblue.com`. No sitemap entry for inactive rows. Listing copy must not duplicate full store descriptions.

Structured data (`ClothingStore` or `Store`) only from stored name, address, phone, and coordinates. Skip a field when it is null.

## Domain configuration (later, Task 9)

Not applied in this task.

1. Leave `jadeblue.com` and `www` on Shopify.
2. Create a Vercel (or chosen host) project for this repo.
3. Add `stores.jadeblue.com` and `*.jadeblue.com` to that project and issue the wildcard certificate.
4. DNS: CNAME or A for `stores` and the wildcard to the host. Do not change apex nameservers onto the app if that would remove Shopify.
5. Reserved names never get a store row, so they cannot shadow `stores` or `www`.

Who must act: DNS provider for records, hosting for domains and TLS, Shopify only for an optional outbound link from the existing locator page. Registrar only if DNS is edited there.

Local development does not need production DNS. Use `stores.localhost` and `{label}.localhost` (ports allowed).

## SEO

- One indexable URL per active store: the subdomain root.
- Canonical is that URL. Listing cards link to it with the store name as the anchor.
- `robots` allows listing and active stores. Inactive and unknown are 404 and omitted from the sitemap.
- No generated marketing text that is not in the database.

## Cache

Use Next.js cache tags, not a second cache:

- Detail: tag `store:{subdomain}`. Revalidate that tag on admin save of that row.
- Listing: tag `stores:index`. Revalidate on any store create, publish, unpublish, or field that appears on cards.
- `is_active = false` is not cached as a successful public document.
- Image component for cover and gallery (`next/image` remotePatterns once the storage host is known). Gallery and map load lazily.
- Do not cache a response under a tag that omits the subdomain.

## Security

- Hostname allowlist: suffix `jadeblue.com` with exactly one label, or approved dev hosts.
- DB uniqueness plus reserved-word check.
- Public DTO is an explicit column list.
- Admin mutations validate with the same subdomain schema (Zod or equivalent).
- Image URLs must be `https` and, once storage is chosen, limited to that host.
- No store-to-store private reads: queries are `where subdomain = hostLabel and is_active`.

## What Task 3 should build

1. Drizzle schema, migration, and db client from `DATABASE_URL`.
2. Subdomain/slug validators and reserved list, with tests for duplicate, reserved, inactive, and missing optional fields.
3. Admin create/edit/publish UI or server actions, uniqueness errors surfaced, public URL preview, no auto-publish on conflict.
4. No fake production stores. Seed only if a fixture is clearly non-production.

Stop after this plan until it is approved. Task 4 is hostname routing. Listing and detail UI are Tasks 5 and 6.
