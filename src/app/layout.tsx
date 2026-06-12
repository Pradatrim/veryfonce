import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FONCÉ — Showcase what you sell",
  description:
    "Link-in-bio dropshipping storefronts for creators. Import products, set your price, and sell.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
