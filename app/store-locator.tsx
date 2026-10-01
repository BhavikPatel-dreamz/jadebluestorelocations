"use client";

import { useMemo, useState } from "react";
import { storeUrl } from "@/lib/hosts";
import type { Store } from "@/lib/stores";

const STORE_IMAGE =
  "https://jadeblue.com/cdn/shop/files/Jadeblue_Store_Image.png?v=1782824152&width=1200";

const ALL = "All stores";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function StoreLocator({ stores, host }: { stores: Store[]; host: string }) {
  const data = stores;
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(ALL);

  const cities = useMemo(() => {
    const names = [...new Set(data.map((store) => store.city.trim()).filter(Boolean))];
    names.sort((a, b) => a.localeCompare(b));
    return [ALL, ...names];
  }, [data]);

  const results = useMemo(() => {
    const q = normalize(query);
    return data.filter((store) => {
      if (city !== ALL && normalize(store.city) !== normalize(city)) return false;
      if (!q) return true;
      return [store.store_name, store.city, store.state, store.address]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [city, data, query]);

  return (
    <div className="min-h-full bg-[#001c2e] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a href="https://jadeblue.com" className="text-lg tracking-[0.22em]">
            JADEBLUE
          </a>
          <a href="https://jadeblue.com" className="text-sm text-white/80 hover:text-white">
            Main website
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-12">
        <section>
          <h1 className="text-2xl font-medium tracking-wide sm:text-3xl">
            Find a JadeBlue store near you
          </h1>
          <label className="mt-6 block">
            <span className="sr-only">Search stores</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by city, area, pincode or store name"
              className="w-full rounded-full border border-white/20 bg-white px-5 py-3 text-base text-[#001c2e] outline-none"
            />
          </label>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {cities.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCity(name)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm ${
                  city === name ? "bg-white text-[#001c2e]" : "bg-white/10 text-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm text-white/70">
            {results.length} {results.length === 1 ? "store" : "stores"}
          </p>

          <ul className="mt-3 flex flex-col gap-3">
            {results.length === 0 ? (
              <li className="rounded-2xl border border-white/15 px-4 py-8 text-center">
                <p>No stores match that search.</p>
                <button
                  type="button"
                  className="mt-3 underline"
                  onClick={() => {
                    setQuery("");
                    setCity(ALL);
                  }}
                >
                  Reset search
                </button>
              </li>
            ) : (
              results.map((store) => (
                <li
                  key={`${store.store_name}-${store.address}`}
                  className="rounded-2xl bg-white p-4 text-[#001c2e]"
                >
                  <h2 className="text-lg font-medium">{store.store_name}</h2>
                  <p className="mt-1 text-sm text-[#001c2e]/70">
                    {store.city}, {store.state}
                  </p>
                  <p className="mt-2 text-sm leading-6">{store.address}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={storeUrl(store.subdomain, host)}
                      className="rounded-full bg-[#001c2e] px-4 py-2 text-sm text-white"
                    >
                      More details
                    </a>
                    <a
                      href={store.map_link}
                      className="rounded-full border border-[#001c2e] px-4 py-2 text-sm"
                    >
                      Get directions
                    </a>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <img
            src={STORE_IMAGE}
            alt="JadeBlue store"
            className="w-full rounded-2xl object-cover"
          />
        </aside>
      </main>
    </div>
  );
}
