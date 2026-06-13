import { NextRequest, NextResponse } from "next/server";

// Canonical-host redirect.
// ----------------------------------------------------------------------------
// Vercel serves this app on several *.vercel.app hostnames: the canonical
// production domain PLUS long auto-generated preview/branch URLs. Login cookies
// are per-hostname, so a user who lands on a preview URL looks "logged out"
// even though they have an account — the #1 source of "it keeps signing me out".
//
// Fix: redirect any NON-canonical *.vercel.app host to the canonical one
// (preserving path + query). One domain, one session. Custom domains (e.g.
// fonce.com) and localhost are never touched, so this is safe.
//
// Canonical host = CANONICAL_HOST, else the host from NEXT_PUBLIC_APP_URL,
// else the default below.
// ----------------------------------------------------------------------------

const DEFAULT_CANONICAL = "veryfonce.vercel.app";

function canonicalHost(): string {
  if (process.env.CANONICAL_HOST) return process.env.CANONICAL_HOST;
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL).host;
    } catch {
      /* ignore */
    }
  }
  return DEFAULT_CANONICAL;
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const canonical = canonicalHost();

  // Only ever touch *.vercel.app hosts that aren't the canonical one. Anything
  // else (custom domain, localhost, the canonical host itself) passes through.
  if (!host.endsWith(".vercel.app") || host === canonical) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.host = canonical;
  url.protocol = "https";
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
