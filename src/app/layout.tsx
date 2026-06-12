import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FONCÉ — Showcase what you sell.",
  description:
    "Link-in-bio storefronts for creators. Bring in products, set your price, get paid.",
};

// Exact font set from the prototype (Fraunces + DM Sans, plus the VIP families).
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,0..100&family=DM+Sans:opsz,wght@9..40,400..700&family=Playfair+Display:wght@400..900&family=Inter:wght@300..700&family=Space+Grotesk:wght@300..700&family=Cormorant+Garamond:wght@300..700&family=Manrope:wght@300..700&family=Instrument+Serif&family=Bricolage+Grotesque:wght@300..800&family=Montserrat:wght@300..800&family=Bodoni+Moda:opsz,wght@6..96,400..900&family=Outfit:wght@300..700&family=Italiana&family=Marcellus&family=Syne:wght@400..800&family=DM+Serif+Display&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
