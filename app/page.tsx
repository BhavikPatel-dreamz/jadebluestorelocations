import type { Metadata } from "next";
import { headers } from "next/headers";
import { stores } from "@/lib/stores";
import { StoreLocator } from "./store-locator";

export const metadata: Metadata = {
  title: "Store locator | JadeBlue",
  description: "Find a JadeBlue store by city, area, pincode, or store name.",
};

export default async function Home() {
  const host = (await headers()).get("host") ?? "localhost:3000";
  return <StoreLocator stores={stores} host={host} />;
}
