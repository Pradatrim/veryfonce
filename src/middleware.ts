import { NextRequest, NextResponse } from "next/server";

// Canonical-host redirect.
// ----------------------------------------------------------------------------
// Vercel serves this app on many hostnames (the production domain plus long
// auto-generated preview/branch URLs). Login cookies are per-hostname, so a
// user who lands on a preview URL looks "logged out" even though they have an
// account — the #1 source of "it keeps signing me out" bugs.
//
// Fix: every request to a non-canonical *.vercel.app host is permanently
// redirected to the canonical host (path + query preserved). One domain, one
// session — it becomes impossible to land on a logged-out clone.
//
// Override the canonical host with CANONICAL_HOST or NEXT_PUBLIC_APP_URL when
// the real domain (e.g. fonce.com) is connected.
// ----------------------------------------------------------------------------

function canonicalHost(): string {
  if (process.env.CANONICAL_HOST) return process.env.CANONICAL_HOST;
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL).host;
    } catch {
      /* fall through */
    }
  }
  return "veryfonce.vercel.app";
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const canonical = canonicalHost();

  // Local dev and the canonical host pass straight through.
  if (
    host === canonical ||
    host.startsWith("localhost") ||
    host.startsWith("127.") ||
    host.endsWith(".local")
  ) {
    return NextResponse.next();
  }

  // Any other host (preview/branch deployment URLs) → canonical. 308 preserves
  // the method and body, so API calls redirect safely too.
  const url = req.nextUrl.clone();
  url.host = canonical;
  url.protocol = "https";
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Run on everything except Next.js static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
