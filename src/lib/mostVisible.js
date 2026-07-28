export function mostVisible(entries) {
  let best = null
  for (const e of entries) {
    if (!e.isIntersecting) continue
    if (!best || e.intersectionRatio > best.intersectionRatio) best = e
  }
  return best ? best.target.id : null
}
