import { getCurrentUser } from "@/lib/auth";
import HeaderClient from "@/components/HeaderClient";

// Server component: reads the session during render and hands the real auth
// state to the client nav. Because it's server-rendered, the nav (the 3-line
// menu, Dashboard, Log out) is always correct and instant — no /api/me fetch.
export default async function AppHeader() {
  const user = await getCurrentUser();
  return <HeaderClient loggedIn={Boolean(user)} role={user?.role} />;
}
