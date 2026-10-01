# JadeBlue store locator progress

## Current task

Store listing page from JSON. In progress / implemented locally.

## Status

Database plan dropped. Locations come from `data/stores.json` (the public Shopify `FINAL.json`, 41 stores). Listing page is the app home page. Subdomain routing is not built.

## Completed work

- Task 1 audit and Task 2 plan.
- Replaced the database plan with `data/stores.json` (41 stores from the public Shopify file used by jadeblue.com/pages/store-locator).
- Home page is a store locator: search, city filter, address, view-store link, directions, and the store photo from the JadeBlue CDN.

## Files created or modified

- `data/stores.json`
- `app/page.tsx`
- `app/store-locator.tsx`
- `docs/jadeblue-store-locator-architecture.md` (source of truth set to JSON)
- `agent.md`

## Architecture decisions

- No database. Store locations stay in JSON with the live fields: store name, address, city, state, page link, map link.
- Images stay on jadeblue.com (`Jadeblue_Store_Image.png`). This app does not host a copy.
- View store opens the existing Shopify store page (`page_link`). Directions open `map_link`.
- Subdomain-per-store routing is not implemented.

## Tests performed

- `tsc --noEmit`
- Dev server render of `/` checked for the heading, a real store city (Ahmedabad), and the CDN image URL.

## Test results

Typecheck passed. The HTML included the heading, Ahmedabad, and the store image URL.

## Known issues

- JSON has no phone, hours, coordinates, or per-store photos, so those sections are omitted.
- Search runs in the browser over the bundled list (no database).
- Subdomains are not wired.

## Pending tasks

- Per-store subdomains, if still wanted
- Richer fields only if they are added to the JSON
- Production DNS (not started)

## Next recommended task

Confirm this listing page, then decide whether store subdomains are still required.
