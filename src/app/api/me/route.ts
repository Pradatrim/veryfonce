import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// Never cache. Reads login state from the signed cookie ONLY (no DB), so it's
// fast and can never falsely report logged-out due to a database hiccup.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const s = getSessionUser();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { role: s.role, username: s.username } });
}
