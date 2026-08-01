// simple-icons ships each mark at its official brand hex, tuned for white
// backgrounds. Some marks vanish against our dark surface (Angular's #0F0F11)
// and others against our light one (React's #61DAFB), so lift or darken any
// colour that misses the 3:1 non-text contrast minimum for the surface it is
// actually being drawn on.

export const DARK_SURFACE_LUMINANCE = 0.0092 // --card on dark, #18181b
export const LIGHT_SURFACE_LUMINANCE = 1 // --card on light, #ffffff

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

function luminance(rgb) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

// Which of the two is lighter depends on the surface now, so the ratio has to
// be ordered rather than assuming the mark is the brighter of the pair.
function contrast(rgb, surfaceLuminance) {
  const mark = luminance(rgb)
  const lighter = Math.max(mark, surfaceLuminance)
  const darker = Math.min(mark, surfaceLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

export function legibleBrandColor(hex, surfaceLuminance = DARK_SURFACE_LUMINANCE) {
  const rgb = toRgb(hex)
  if (contrast(rgb, surfaceLuminance) >= MIN_CONTRAST) return toHex(rgb)

  // Move away from the surface: toward white on a dark one, toward black on a light one.
  const target = surfaceLuminance < 0.5 ? 255 : 0
  for (let mix = 0.05; mix < 1; mix += 0.05) {
    const shifted = rgb.map((c) => c + (target - c) * mix)
    if (contrast(shifted, surfaceLuminance) >= MIN_CONTRAST) return toHex(shifted)
  }
  return target === 255 ? '#ffffff' : '#000000'
}
