import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { storeLabel } from "@/lib/hosts";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const label = storeLabel(host);
  if (!label) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/s/${label}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
