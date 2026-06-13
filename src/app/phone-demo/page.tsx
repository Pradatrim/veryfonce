import AppHeader from "@/components/AppHeader";
import PhoneDemoClient from "./PhoneDemoClient";

export const dynamic = "force-dynamic";

export default function PhoneDemoPage() {
  return (
    <>
      <AppHeader />
      <PhoneDemoClient />
    </>
  );
}
