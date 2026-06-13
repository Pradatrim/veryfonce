// Theme + font system, ported from the prototype's applyTheme()/FONT_SETS.
import { THEME_PRESETS, FONT_SETS } from "./themeData";
export { THEME_PRESETS, FONT_SETS };
export type { ThemePreset, FontSet } from "./themeData";

export interface ThemeConfig {
  preset: string; // key in THEME_PRESETS, or "custom" | "ombre" | "image"
  font?: string; // key in FONT_SETS
  custom?: { bg: string; fg: string; accent: string };
  ombre?: { color1: string; color2: string; fg: string; accent: string };
  image?: { url: string; fg: string; accent: string; overlay?: number };
  textureColors?: { bg?: string; fg?: string; accent?: string };
  live?: boolean;
}

// Free vs VIP gating (8 free presets + 5 VIP textured; only "fonce" font free).
export function isPresetVip(key: string): boolean {
  if (key === "custom" || key === "ombre" || key === "image") return true;
  return Boolean(THEME_PRESETS[key]?.vip);
}
export function isFontVip(key: string): boolean {
  return key !== "fonce";
}

// Compute the full set of CSS custom properties for a theme. Shared by the
// client applier and the server-side <style> renderer.
export function computeThemeVars(theme: ThemeConfig): Record<string, string> {
  let bg: string, fg: string, accent: string, pageBg: string;

  if (theme.preset === "custom" && theme.custom) {
    bg = theme.custom.bg; fg = theme.custom.fg; accent = theme.custom.accent; pageBg = bg;
  } else if (theme.preset === "ombre" && theme.ombre) {
    const o = theme.ombre;
    bg = o.color1; fg = o.fg; accent = o.accent;
    pageBg = `linear-gradient(180deg, ${o.color1} 0%, ${o.color2} 100%)`;
  } else if (theme.preset === "image" && theme.image?.url) {
    const img = theme.image;
    bg = "#0a0a0a"; fg = img.fg; accent = img.accent;
    const ov = img.overlay != null ? img.overlay : 0.4;
    pageBg = `linear-gradient(rgba(0,0,0,${ov}), rgba(0,0,0,${ov})), url("${img.url.replace(/"/g, '\\"')}") center/cover fixed no-repeat`;
  } else {
    const presetData = THEME_PRESETS[theme.preset] || THEME_PRESETS.fonce;
    const tc = presetData.texture && theme.textureColors ? theme.textureColors : {};
    bg = tc.bg || presetData.bg;
    fg = tc.fg || presetData.fg;
    accent = tc.accent || presetData.accent;
    pageBg = presetData.texture ? `url("${presetData.texture}") repeat, ${bg}` : bg;
  }

  const fontKey = theme.font || "fonce";
  const fontSet = FONT_SETS[fontKey] || FONT_SETS.fonce;

  return {
    "--bg": bg,
    "--fg": fg,
    "--accent": accent,
    "--bg-elevated": `color-mix(in srgb, ${bg} 92%, ${fg} 8%)`,
    "--bg-soft": `color-mix(in srgb, ${bg} 85%, ${fg} 15%)`,
    "--border": `color-mix(in srgb, ${accent} 18%, transparent)`,
    "--border-strong": `color-mix(in srgb, ${accent} 35%, transparent)`,
    "--fg-muted": `color-mix(in srgb, ${fg} 55%, ${bg} 45%)`,
    "--fg-dim": `color-mix(in srgb, ${fg} 30%, ${bg} 70%)`,
    "--accent-deep": `color-mix(in srgb, ${accent} 60%, ${bg} 40%)`,
    "--accent-bright": `color-mix(in srgb, ${accent} 78%, white 22%)`,
    "--page-bg": pageBg,
    "--serif": `'${fontSet.serif}', Georgia, serif`,
    "--sans": `'${fontSet.sans}', system-ui, sans-serif`,
    "--font-variation": fontSet.opsz,
  };
}

// Server-side: a `:root{...}` CSS string to inject so the theme applies on the
// very first paint (no dependency on client JS or save timing).
export function themeToCss(theme: ThemeConfig): string {
  const vars = computeThemeVars(theme);
  const body = Object.entries(vars).map(([k, v]) => `${k}:${v};`).join("");
  return `:root{${body}}`;
}

// Apply a theme by setting CSS custom properties on <html>. Client-only.
export function applyTheme(theme: ThemeConfig | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  if (!theme) {
    Object.keys(computeThemeVars({ preset: "fonce" })).forEach((p) => root.removeProperty(p));
    document.body.removeAttribute("data-font");
    return;
  }
  const vars = computeThemeVars(theme);
  for (const [k, v] of Object.entries(vars)) root.setProperty(k, v);
  document.body.setAttribute("data-font", theme.font || "fonce");
}

// Parse the stored themeCustom JSON into a ThemeConfig.
export function buildThemeConfig(user: {
  themePreset: string;
  themeFont: string;
  themeCustom: string | null;
}): ThemeConfig {
  let extra: Partial<ThemeConfig> = {};
  if (user.themeCustom) {
    try { extra = JSON.parse(user.themeCustom); } catch { /* ignore */ }
  }
  return { preset: user.themePreset, font: user.themeFont, ...extra };
}
