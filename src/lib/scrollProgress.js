// How far a container has travelled through the viewport, from 0 before it
// starts to 1 once it has finished. Kept free of the DOM so the maths can be
// tested directly — jsdom has no layout and reports every rect as zero.

function clamp(value) {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function computeProgress(rect, viewportHeight) {
  const travel = rect.height - viewportHeight

  // Taller than the viewport: progress is how far its top has scrolled past
  // the top of the screen, over the distance it has to cover.
  if (travel > 0) return clamp(-rect.top / travel)

  // Shorter than the viewport: it never scrolls through, so track it crossing
  // the screen instead. Without this the branch above divides by a negative.
  const span = rect.height + viewportHeight
  if (span <= 0) return 0
  return clamp((viewportHeight - rect.top) / span)
}
