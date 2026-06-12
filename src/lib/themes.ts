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

// Apply a theme by setting CSS custom properties on <html>. Client-only.
export function applyTheme(theme: ThemeConfig | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  const props = [
    "--bg", "--fg", "--accent", "--bg-elevated", "--bg-soft", "--border",
    "--border-strong", "--fg-muted", "--fg-dim", "--accent-deep",
    "--accent-bright", "--page-bg", "--serif", "--sans", "--font-variation",
  ];
  if (!theme) {
    props.forEach((p) => root.removeProperty(p));
    document.body.removeAttribute("data-font");
    return;
  }

  let bg: string, fg: string, accent: string, pageBg: string;
  let presetData = null as null | (typeof THEME_PRESETS)[string];

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
    presetData = THEME_PRESETS[theme.preset] || THEME_PRESETS.fonce;
    const tc = presetData.texture && theme.textureColors ? theme.textureColors : {};
    bg = tc.bg || presetData.bg;
    fg = tc.fg || presetData.fg;
    accent = tc.accent || presetData.accent;
    pageBg = presetData.texture ? `url("${presetData.texture}") repeat, ${bg}` : bg;
  }

  root.setProperty("--bg", bg);
  root.setProperty("--fg", fg);
  root.setProperty("--accent", accent);
  root.setProperty("--bg-elevated", `color-mix(in srgb, ${bg} 92%, ${fg} 8%)`);
  root.setProperty("--bg-soft", `color-mix(in srgb, ${bg} 85%, ${fg} 15%)`);
  root.setProperty("--border", `color-mix(in srgb, ${accent} 18%, transparent)`);
  root.setProperty("--border-strong", `color-mix(in srgb, ${accent} 35%, transparent)`);
  root.setProperty("--fg-muted", `color-mix(in srgb, ${fg} 55%, ${bg} 45%)`);
  root.setProperty("--fg-dim", `color-mix(in srgb, ${fg} 30%, ${bg} 70%)`);
  root.setProperty("--accent-deep", `color-mix(in srgb, ${accent} 60%, ${bg} 40%)`);
  root.setProperty("--accent-bright", `color-mix(in srgb, ${accent} 78%, white 22%)`);
  root.setProperty("--page-bg", pageBg);

  const fontKey = theme.font || "fonce";
  const fontSet = FONT_SETS[fontKey] || FONT_SETS.fonce;
  root.setProperty("--serif", `'${fontSet.serif}', Georgia, serif`);
  root.setProperty("--sans", `'${fontSet.sans}', system-ui, sans-serif`);
  root.setProperty("--font-variation", fontSet.opsz);
  document.body.setAttribute("data-font", fontKey);
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
