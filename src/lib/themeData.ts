// AUTO-GENERATED from the prototype's TEXTURES + THEME_PRESETS + FONT_SETS.
export interface ThemePreset { name: string; bg: string; fg: string; accent: string; texture?: string; vip?: boolean; live?: boolean; }
export interface FontSet { name: string; serif: string; sans: string; opsz: string; weight?: number; }
export const THEME_PRESETS: Record<string, ThemePreset> = {
  "fonce": {
    "name": "Fonce",
    "bg": "#0a0a0a",
    "fg": "#f5efe4",
    "accent": "#d4af37"
  },
  "sage": {
    "name": "Sage",
    "bg": "#e8dcc4",
    "fg": "#2f2a1f",
    "accent": "#7a8b6e"
  },
  "cream": {
    "name": "Cream",
    "bg": "#f4ede0",
    "fg": "#2a1f15",
    "accent": "#c45a3a"
  },
  "mono": {
    "name": "Mono",
    "bg": "#0a0a0a",
    "fg": "#fafafa",
    "accent": "#9a9a9a"
  },
  "noir": {
    "name": "Noir",
    "bg": "#000000",
    "fg": "#fafafa",
    "accent": "#ff3366"
  },
  "cyber": {
    "name": "Cyber",
    "bg": "#0a0e1a",
    "fg": "#e0e6ff",
    "accent": "#00d9ff"
  },
  "bloom": {
    "name": "Bloom",
    "bg": "#fdf3f0",
    "fg": "#2d1820",
    "accent": "#b04060"
  },
  "forest": {
    "name": "Forest",
    "bg": "#0d1410",
    "fg": "#e8efe0",
    "accent": "#7a9a4f"
  },
  "cement": {
    "name": "Cement",
    "bg": "#b5b8b3",
    "fg": "#1a1814",
    "accent": "#7a6a4f",
    "texture": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cdefs%3E%3Cfilter%20id%3D%22g1%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%223.2%22%20numOctaves%3D%222%22%20seed%3D%2211%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%200%20%20%200%200%200%200%200%20%20%200%200%200%200%200%20%20%200%200%200%200.08%200%22%2F%3E%3C%2Ffilter%3E%3Cfilter%20id%3D%22g2%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%222%22%20numOctaves%3D%222%22%20seed%3D%225%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%201%20%20%200%200%200%200%201%20%20%200%200%200%200%201%20%20%201.3%200%200%200%20-0.85%22%2F%3E%3C%2Ffilter%3E%3Cfilter%20id%3D%22g3%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%222%22%20numOctaves%3D%222%22%20seed%3D%225%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%200%20%20%200%200%200%200%200%20%20%200%200%200%200%200%20%20%20-1.3%200%200%200%200.85%22%2F%3E%3C%2Ffilter%3E%3Cfilter%20id%3D%22sw%22%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.006%200.025%22%20numOctaves%3D%222%22%20seed%3D%223%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%200%20%20%200%200%200%200%200%20%20%200%200%200%200%200%20%20%20-0.5%200%200%200%200.25%22%2F%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20filter%3D%22url(%23sw)%22%20opacity%3D%220.13%22%2F%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20filter%3D%22url(%23g2)%22%20opacity%3D%220.07%22%2F%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20filter%3D%22url(%23g3)%22%20opacity%3D%220.11%22%2F%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20filter%3D%22url(%23g1)%22%2F%3E%3C%2Fsvg%3E",
    "vip": true
  },
  "starry": {
    "name": "Starry",
    "bg": "#0a1428",
    "fg": "#e8eaf0",
    "accent": "#9eaecf",
    "texture": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Ccircle%20cx%3D%2242%22%20cy%3D%2271%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%22118%22%20cy%3D%2235%22%20r%3D%221.4%22%20fill%3D%22%23fff%22%20opacity%3D%220.85%22%2F%3E%3Ccircle%20cx%3D%22203%22%20cy%3D%2292%22%20r%3D%220.7%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22287%22%20cy%3D%2248%22%20r%3D%221.1%22%20fill%3D%22%23fff%22%20opacity%3D%220.75%22%2F%3E%3Ccircle%20cx%3D%22361%22%20cy%3D%22118%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22445%22%20cy%3D%2262%22%20r%3D%221.3%22%20fill%3D%22%23fff%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22528%22%20cy%3D%22103%22%20r%3D%220.6%22%20fill%3D%22%23fff%22%20opacity%3D%220.5%22%2F%3E%3Ccircle%20cx%3D%22611%22%20cy%3D%2238%22%20r%3D%221%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%22695%22%20cy%3D%2284%22%20r%3D%221.5%22%20fill%3D%22%23fff%22%20opacity%3D%220.85%22%2F%3E%3Ccircle%20cx%3D%22769%22%20cy%3D%22156%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%2258%22%20cy%3D%22178%22%20r%3D%221.2%22%20fill%3D%22%23fff%22%20opacity%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%22148%22%20cy%3D%22225%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22234%22%20cy%3D%22195%22%20r%3D%220.6%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22318%22%20cy%3D%22241%22%20r%3D%221.4%22%20fill%3D%22%23fff%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22402%22%20cy%3D%22208%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22486%22%20cy%3D%22265%22%20r%3D%221%22%20fill%3D%22%23fff%22%20opacity%3D%220.75%22%2F%3E%3Ccircle%20cx%3D%22571%22%20cy%3D%22218%22%20r%3D%220.7%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22654%22%20cy%3D%22251%22%20r%3D%221.3%22%20fill%3D%22%23fff%22%20opacity%3D%220.85%22%2F%3E%3Ccircle%20cx%3D%22738%22%20cy%3D%22195%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%2229%22%20cy%3D%22298%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22105%22%20cy%3D%22345%22%20r%3D%221.1%22%20fill%3D%22%23fff%22%20opacity%3D%220.75%22%2F%3E%3Ccircle%20cx%3D%22192%22%20cy%3D%22318%22%20r%3D%220.6%22%20fill%3D%22%23fff%22%20opacity%3D%220.5%22%2F%3E%3Ccircle%20cx%3D%22278%22%20cy%3D%22372%22%20r%3D%221.4%22%20fill%3D%22%23fff%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22365%22%20cy%3D%22338%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22451%22%20cy%3D%22385%22%20r%3D%220.7%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22538%22%20cy%3D%22312%22%20r%3D%221.2%22%20fill%3D%22%23fff%22%20opacity%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%22622%22%20cy%3D%22368%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22708%22%20cy%3D%22335%22%20r%3D%221%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%22788%22%20cy%3D%22392%22%20r%3D%221.3%22%20fill%3D%22%23fff%22%20opacity%3D%220.85%22%2F%3E%3Ccircle%20cx%3D%2268%22%20cy%3D%22438%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%22475%22%20r%3D%221.5%22%20fill%3D%22%23fff%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22242%22%20cy%3D%22442%22%20r%3D%220.6%22%20fill%3D%22%23fff%22%20opacity%3D%220.5%22%2F%3E%3Ccircle%20cx%3D%22328%22%20cy%3D%22495%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22412%22%20cy%3D%22458%22%20r%3D%221.1%22%20fill%3D%22%23fff%22%20opacity%3D%220.75%22%2F%3E%3Ccircle%20cx%3D%22498%22%20cy%3D%22502%22%20r%3D%220.7%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22582%22%20cy%3D%22465%22%20r%3D%221.4%22%20fill%3D%22%23fff%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22668%22%20cy%3D%22518%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22752%22%20cy%3D%22478%22%20r%3D%221%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%22558%22%20r%3D%221.2%22%20fill%3D%22%23fff%22%20opacity%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%22121%22%20cy%3D%22595%22%20r%3D%220.7%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22208%22%20cy%3D%22565%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22295%22%20cy%3D%22618%22%20r%3D%221.3%22%20fill%3D%22%23fff%22%20opacity%3D%220.85%22%2F%3E%3Ccircle%20cx%3D%22381%22%20cy%3D%22582%22%20r%3D%220.6%22%20fill%3D%22%23fff%22%20opacity%3D%220.5%22%2F%3E%3Ccircle%20cx%3D%22468%22%20cy%3D%22635%22%20r%3D%221.1%22%20fill%3D%22%23fff%22%20opacity%3D%220.75%22%2F%3E%3Ccircle%20cx%3D%22552%22%20cy%3D%22598%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22638%22%20cy%3D%22652%22%20r%3D%221%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%22722%22%20cy%3D%22615%22%20r%3D%221.4%22%20fill%3D%22%23fff%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2248%22%20cy%3D%22705%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22138%22%20cy%3D%22678%22%20r%3D%220.7%22%20fill%3D%22%23fff%22%20opacity%3D%220.55%22%2F%3E%3Ccircle%20cx%3D%22225%22%20cy%3D%22725%22%20r%3D%221.2%22%20fill%3D%22%23fff%22%20opacity%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%22312%22%20cy%3D%22688%22%20r%3D%220.6%22%20fill%3D%22%23fff%22%20opacity%3D%220.5%22%2F%3E%3Ccircle%20cx%3D%22398%22%20cy%3D%22745%22%20r%3D%221%22%20fill%3D%22%23fff%22%20opacity%3D%220.7%22%2F%3E%3Ccircle%20cx%3D%22485%22%20cy%3D%22708%22%20r%3D%221.3%22%20fill%3D%22%23fff%22%20opacity%3D%220.85%22%2F%3E%3Ccircle%20cx%3D%22568%22%20cy%3D%22755%22%20r%3D%220.8%22%20fill%3D%22%23fff%22%20opacity%3D%220.6%22%2F%3E%3Ccircle%20cx%3D%22655%22%20cy%3D%22722%22%20r%3D%220.9%22%20fill%3D%22%23fff%22%20opacity%3D%220.65%22%2F%3E%3Ccircle%20cx%3D%22745%22%20cy%3D%22768%22%20r%3D%221.1%22%20fill%3D%22%23fff%22%20opacity%3D%220.75%22%2F%3E%3C%2Fsvg%3E",
    "vip": true,
    "live": true
  },
  "marble": {
    "name": "Marble",
    "bg": "#f0ece4",
    "fg": "#1a1814",
    "accent": "#8a7a5c",
    "texture": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%3E%3Cfilter%20id%3D%22m%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.012%22%20numOctaves%3D%223%22%20seed%3D%227%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%200.55%20%200%200%200%200%200.5%20%200%200%200%200%200.42%20%200%200%200%200.18%200%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20filter%3D%22url(%23m)%22%2F%3E%3C%2Fsvg%3E",
    "vip": true
  },
  "velvet": {
    "name": "Velvet",
    "bg": "#2a0e1e",
    "fg": "#f0d4b8",
    "accent": "#c87654",
    "texture": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%3E%3Cfilter%20id%3D%22v%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%222.5%22%20numOctaves%3D%221%22%20seed%3D%222%22%2F%3E%3CfeColorMatrix%20values%3D%220%200%200%200%201%20%200%200%200%200%200.85%20%200%200%200%200%200.75%20%200%200%200%200.07%200%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20filter%3D%22url(%23v)%22%2F%3E%3C%2Fsvg%3E",
    "vip": true,
    "live": true
  },
  "linen": {
    "name": "Linen",
    "bg": "#e8dcc4",
    "fg": "#3d2f1f",
    "accent": "#7a6a4f",
    "texture": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cline%20x1%3D%220%22%20y1%3D%226%22%20x2%3D%2212%22%20y2%3D%226%22%20stroke%3D%22rgba(0%2C0%2C0%2C0.07)%22%20stroke-width%3D%220.5%22%2F%3E%3Cline%20x1%3D%226%22%20y1%3D%220%22%20x2%3D%226%22%20y2%3D%2212%22%20stroke%3D%22rgba(0%2C0%2C0%2C0.07)%22%20stroke-width%3D%220.5%22%2F%3E%3Cline%20x1%3D%223%22%20y1%3D%220%22%20x2%3D%223%22%20y2%3D%2212%22%20stroke%3D%22rgba(0%2C0%2C0%2C0.04)%22%20stroke-width%3D%220.4%22%2F%3E%3Cline%20x1%3D%229%22%20y1%3D%220%22%20x2%3D%229%22%20y2%3D%2212%22%20stroke%3D%22rgba(0%2C0%2C0%2C0.04)%22%20stroke-width%3D%220.4%22%2F%3E%3C%2Fsvg%3E",
    "vip": true
  }
};
export const FONT_SETS: Record<string, FontSet> = {
  "fonce": {
    "name": "Fonce",
    "serif": "Fraunces",
    "sans": "DM Sans",
    "opsz": "\"opsz\" 144, \"SOFT\" 50"
  },
  "editorial": {
    "name": "Editorial",
    "serif": "Playfair Display",
    "sans": "Inter",
    "opsz": "normal"
  },
  "modern": {
    "name": "Modern",
    "serif": "Space Grotesk",
    "sans": "Space Grotesk",
    "opsz": "normal"
  },
  "classic": {
    "name": "Classic",
    "serif": "Cormorant Garamond",
    "sans": "Manrope",
    "opsz": "normal"
  },
  "minimal": {
    "name": "Minimal",
    "serif": "Instrument Serif",
    "sans": "Inter",
    "opsz": "normal"
  },
  "bold": {
    "name": "Bold",
    "serif": "Bricolage Grotesque",
    "sans": "Inter",
    "opsz": "normal"
  },
  "montserrat": {
    "name": "Montserrat",
    "serif": "Montserrat",
    "sans": "Montserrat",
    "opsz": "normal"
  },
  "atelier": {
    "name": "Atelier",
    "serif": "Bodoni Moda",
    "sans": "Inter",
    "opsz": "normal",
    "weight": 600
  },
  "riviera": {
    "name": "Riviera",
    "serif": "Marcellus",
    "sans": "Outfit",
    "opsz": "normal"
  },
  "couture": {
    "name": "Couture",
    "serif": "Italiana",
    "sans": "Manrope",
    "opsz": "normal"
  },
  "avant": {
    "name": "Avant",
    "serif": "Syne",
    "sans": "Syne",
    "opsz": "normal"
  },
  "studio": {
    "name": "Studio",
    "serif": "DM Serif Display",
    "sans": "Outfit",
    "opsz": "normal"
  }
};
