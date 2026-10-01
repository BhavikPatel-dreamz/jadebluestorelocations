import rawStores from "@/data/store-details.json";

export type Store = {
  store_name: string;
  address: string;
  page_link: string;
  city: string;
  state: string;
  map_link: string;
  subdomain: string;
  image?: string | null;
  telephone?: string | null;
  phones?: string[];
  emails?: string[];
  geo?: { latitude?: number; longitude?: number } | null;
  opening?: { opens?: string; closes?: string; dayOfWeek?: string[] } | null;
  street?: string | null;
  postal?: string | null;
};

const RESERVED = new Set([
  "www",
  "stores",
  "admin",
  "api",
  "app",
  "mail",
  "support",
  "localhost",
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

function subdomainFromStore(store: { store_name: string; page_link: string }) {
  try {
    const segment = new URL(store.page_link).pathname.split("/").filter(Boolean).pop() ?? "";
    const fromPage = segment.replace(/^jadeblue-/, "");
    if (/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(fromPage) && !RESERVED.has(fromPage)) {
      return fromPage;
    }
  } catch {
    /* use the store name */
  }
  return slugify(store.store_name);
}

function withUniqueSubdomains(
  stores: Omit<Store, "subdomain">[],
): Store[] {
  const used = new Set<string>();
  return stores.map((store) => {
    const base = subdomainFromStore(store) || "store";
    let subdomain = RESERVED.has(base) ? `${base}-store` : base;
    let n = 2;
    while (used.has(subdomain) || RESERVED.has(subdomain)) {
      subdomain = `${base}-${n}`;
      n += 1;
    }
    used.add(subdomain);
    return { ...store, subdomain };
  });
}

export const stores: Store[] = withUniqueSubdomains(rawStores);

export function getStore(subdomain: string) {
  return stores.find((store) => store.subdomain === subdomain.toLowerCase());
}

const SHARED_EMAILS = new Set(["estore.support@jadeblue.com", "customercare@jadeblue.com"]);

function digits(value: string) {
  return decodeURIComponent(value).replace(/\D/g, "");
}

export function storePhones(store: Store) {
  const values = [store.telephone, ...(store.phones ?? [])].filter(Boolean) as string[];
  const seen = new Set<string>();
  const phones: string[] = [];
  for (const value of values) {
    const key = digits(value);
    if (!key || key.endsWith("9898032852") || seen.has(key)) continue;
    seen.add(key);
    phones.push(decodeURIComponent(value).replace(/^\+/, ""));
  }
  return phones;
}

export function storeEmails(store: Store) {
  return (store.emails ?? []).filter((email) => !SHARED_EMAILS.has(email.toLowerCase()));
}

export function formatClock(value?: string) {
  if (!value) return "";
  const [hourText, minuteText = "00"] = value.split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteText} ${suffix}`;
}

export function storesInCity(store: Store) {
  return stores.filter(
    (item) => item.city === store.city && item.subdomain !== store.subdomain,
  );
}
