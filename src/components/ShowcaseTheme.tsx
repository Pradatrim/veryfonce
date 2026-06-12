"use client";

import { useEffect } from "react";
import { applyTheme, buildThemeConfig } from "@/lib/themes";

// Applies a creator's saved theme to the public storefront (sets CSS vars on
// <html>, so the page recolors), and resets it when leaving. Also records a
// showcase visit for insights.
export default function ShowcaseTheme({
  username,
  themePreset,
  themeFont,
  themeCustom,
}: {
  username: string;
  themePreset: string;
  themeFont: string;
  themeCustom: string | null;
}) {
  useEffect(() => {
    applyTheme(buildThemeConfig({ themePreset, themeFont, themeCustom }));
    // Count the visit (fire-and-forget).
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit", username }),
      keepalive: true,
    }).catch(() => {});
    return () => applyTheme(null); // reset to Fonce branding on navigation away
  }, [username, themePreset, themeFont, themeCustom]);

  return null;
}
