import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

// Already logged in? Skip the signup form and go to the dashboard.
export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return (
    <>
      <AppHeader />
      <SignupForm />
    </>
  );
}
