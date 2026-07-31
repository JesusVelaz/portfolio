// simple-icons ships each mark at its official brand hex, tuned for white
// backgrounds. A few of them (Angular's #0F0F11) disappear against our dark
// surface, so lift any colour that misses the 3:1 non-text contrast minimum.

const SURFACE_LUMINANCE = 0.0086 // --surface, #12151c
const MIN_CONTRAST = 3

function toRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function channel(value) {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function contrast(rgb) {
  const luminance = 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
  return (luminance + 0.05) / (SURFACE_LUMINANCE + 0.05)
}

export function legibleBrandColor(hex) {
  const rgb = toRgb(hex)
  if (contrast(rgb) >= MIN_CONTRAST) return toHex(rgb)

  for (let mix = 0.05; mix < 1; mix += 0.05) {
    const lifted = rgb.map((c) => c + (255 - c) * mix)
    if (contrast(lifted) >= MIN_CONTRAST) return toHex(lifted)
  }
  return '#ffffff'
}
