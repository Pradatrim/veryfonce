import AppHeader from "@/components/AppHeader";
import CartClient from "./CartClient";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <>
      <AppHeader />
      <CartClient />
    </>
  );
}
