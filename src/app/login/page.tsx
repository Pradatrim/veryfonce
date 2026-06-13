import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

// Already logged in? Don't show a login form (that's what felt like a logout) —
// send them straight to where they belong.
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return (
    <>
      <AppHeader />
      <LoginForm />
    </>
  );
}
