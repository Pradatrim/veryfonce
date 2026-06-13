import { getSessionUser } from "@/lib/auth";
import HeaderClient from "@/components/HeaderClient";

// Server component: reads the session from the signed cookie (no DB) and hands
// the real auth state to the client nav — instant, correct, and immune to
// database hiccups. The client nav also re-verifies, so a stale cached page
// can never show the wrong (logged-out) header.
export default async function AppHeader() {
  const s = getSessionUser();
  return <HeaderClient loggedIn={Boolean(s)} role={s?.role} />;
}
