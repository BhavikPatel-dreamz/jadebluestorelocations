const APEX = "jadeblue.com";

export function rootDomain(host: string) {
  const [hostname, port] = host.toLowerCase().split(":");
  const suffix = port ? `:${port}` : "";
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return `localhost${suffix}`;
  }
  return `${APEX}${suffix}`;
}

export function storeUrl(subdomain: string, host: string) {
  const secure = !host.toLowerCase().includes("localhost");
  return `${secure ? "https" : "http"}://${subdomain}.${rootDomain(host)}`;
}

export function listingUrl(host: string) {
  const secure = !host.toLowerCase().includes("localhost");
  const protocol = secure ? "https" : "http";
  const root = rootDomain(host);
  if (root.startsWith("localhost")) return `${protocol}://${root}`;
  return `${protocol}://stores.${root}`;
}

/** One store label, or null when this host is the listing (or not ours). */
export function storeLabel(host: string) {
  const hostname = host.toLowerCase().split(":")[0];
  if (
    hostname === "localhost" ||
    hostname === "stores.localhost" ||
    hostname === `stores.${APEX}` ||
    hostname === APEX ||
    hostname === `www.${APEX}`
  ) {
    return null;
  }
  if (hostname.endsWith(".localhost")) {
    const label = hostname.slice(0, -".localhost".length);
    return label.includes(".") ? null : label;
  }
  if (hostname.endsWith(`.${APEX}`)) {
    const label = hostname.slice(0, -(`.${APEX}`.length));
    return label.includes(".") ? null : label;
  }
  return null;
}
