import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { listingUrl, storeUrl } from "@/lib/hosts";
import {
  formatClock,
  getStore,
  storeEmails,
  storePhones,
  storesInCity,
} from "@/lib/stores";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const store = getStore(subdomain);
  if (!store) return { title: "Store not found" };
  const city = store.city
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    title: `${store.store_name} | JadeBlue`,
    description: `JadeBlue store in ${city}. ${store.street || store.address}`,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const store = getStore(subdomain);
  if (!store) notFound();

  const host = (await headers()).get("host") ?? "localhost:3000";
  const phones = storePhones(store);
  const emails = storeEmails(store);
  const nearby = storesInCity(store);
  const opens = formatClock(store.opening?.opens);
  const closes = formatClock(store.opening?.closes);
  const days = store.opening?.dayOfWeek ?? [];
  const hoursLine = opens && closes ? `${opens} - ${closes}` : "";
  const city = store.city.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  const state = store.state.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  const latitude = store.geo?.latitude;
  const longitude = store.geo?.longitude;
  const mapEmbed =
    latitude != null && longitude != null
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
      : null;
  const primaryPhone = phones[0];

  return (
    <div className="min-h-full bg-[#f6f4f1] text-[#1c1c1c]">
      <header className="bg-[#001c2e] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a href={listingUrl(host)} className="text-lg tracking-[0.22em]">
            JADEBLUE
          </a>
          <div className="text-right text-sm">
            <p>
              {city}, {state}
            </p>
            {primaryPhone ? (
              <a href={`tel:${primaryPhone}`} className="text-white/80">
                {primaryPhone}
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-10">
          <div>
            {store.image ? (
              <img
                src={store.image}
                alt={store.store_name}
                className="aspect-[16/10] w-full rounded-2xl object-cover"
              />
            ) : null}
            <p className="mt-5 text-sm text-[#5c6570]">
              {city}, {state}
              {store.postal ? ` - ${store.postal}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-medium sm:text-4xl">{store.store_name}</h1>
            <p className="mt-4 max-w-xl text-base leading-7">{store.street || store.address}</p>
            {hoursLine ? (
              <p className="mt-4 text-sm">
                <span className="font-medium">{hoursLine}</span>
                <span className="text-[#5c6570]"> · Open today</span>
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {primaryPhone ? (
                <a
                  href={`tel:${primaryPhone}`}
                  className="rounded-full bg-[#001c2e] px-5 py-3 text-sm text-white"
                >
                  Call store
                </a>
              ) : null}
              <a
                href={store.map_link}
                className="rounded-full border border-[#001c2e] px-5 py-3 text-sm"
              >
                Get directions
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {mapEmbed ? (
              <iframe title={`Map of ${store.store_name}`} src={mapEmbed} className="h-72 w-full" />
            ) : null}
            <div className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-medium tracking-wide text-[#5c6570]">Address</h2>
                <p className="mt-1 leading-6">{store.address}</p>
              </div>
              {phones.length > 0 ? (
                <div>
                  <h2 className="text-sm font-medium tracking-wide text-[#5c6570]">Phone</h2>
                  <ul className="mt-1">
                    {phones.map((phone) => (
                      <li key={phone}>
                        <a href={`tel:${phone}`} className="underline">
                          {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {emails.length > 0 ? (
                <div>
                  <h2 className="text-sm font-medium tracking-wide text-[#5c6570]">Email</h2>
                  <ul className="mt-1">
                    {emails.map((email) => (
                      <li key={email}>
                        <a href={`mailto:${email}`} className="underline">
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {days.length > 0 && hoursLine ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-medium">Business hours</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {days.map((day) => (
              <li key={day} className="flex justify-between rounded-xl bg-white px-4 py-3 text-sm">
                <span>{day}</span>
                <span>{hoursLine}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-medium">JadeBlue</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#3c4450]">
            With a legacy of 45 years, JadeBlue has been synonymous with crafting premium menswear.
            Visit this store for Modi jackets, shirts, ethnic wear, denims, and more.
          </p>
        </div>
      </section>

      {store.image ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-medium">Gallery</h2>
          <img
            src={store.image}
            alt=""
            className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        </section>
      ) : null}

      {nearby.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-medium">More JadeBlue stores in {city}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {nearby.map((item) => (
              <li key={item.subdomain} className="rounded-2xl bg-white p-4">
                <h3 className="font-medium">{item.store_name}</h3>
                <p className="mt-1 text-sm leading-6 text-[#5c6570]">{item.address}</p>
                <a href={storeUrl(item.subdomain, host)} className="mt-3 inline-block text-sm underline">
                  More details
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-medium">Questions</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium">Where is this JadeBlue store?</h3>
              <p className="mt-1 leading-7 text-[#3c4450]">{store.address}</p>
            </div>
            {hoursLine ? (
              <div>
                <h3 className="font-medium">What are the store hours?</h3>
                <p className="mt-1 leading-7 text-[#3c4450]">
                  {hoursLine}
                  {days.length ? `, ${days[0]} to ${days[days.length - 1]}` : ""}.
                </p>
              </div>
            ) : null}
            {primaryPhone ? (
              <div>
                <h3 className="font-medium">How can I contact this store?</h3>
                <p className="mt-1 leading-7 text-[#3c4450]">Call {primaryPhone}.</p>
              </div>
            ) : null}
            <div>
              <h3 className="font-medium">How do I get directions?</h3>
              <p className="mt-1 leading-7 text-[#3c4450]">
                Use Get directions on this page to open the store in Google Maps.
              </p>
            </div>
          </div>
          <a href={listingUrl(host)} className="mt-8 inline-block text-sm underline">
            View all JadeBlue stores
          </a>
        </div>
      </section>
    </div>
  );
}
