import AppHeader from "@/components/AppHeader";
import AddProductForm from "./AddProductForm";

export const dynamic = "force-dynamic";

// No redirect here — pressing "Add product" must never bounce you to login.
// The header reflects your real (server-side) login state, and the form handles
// any auth error inline instead of kicking you out.
export default function AddProductPage() {
  return (
    <>
      <AppHeader />
      <AddProductForm />
    </>
  );
}
