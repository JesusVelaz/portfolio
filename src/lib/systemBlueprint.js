const ROWS = [3.6, 1.2, -1.2, -3.6]

const NODE_SPECS = [
  ...ROWS.map((y, index) => ({ id: `interface-${index}`, kind: 'interface', resolved: [-4.8, y, 0] })),
  ...ROWS.map((y, index) => ({ id: `service-${index}`, kind: 'service', resolved: [0, y, 0] })),
  { id: 'data-0', kind: 'data', resolved: [4.8, 2.8, 0] },
  { id: 'data-1', kind: 'data', resolved: [4.8, 0, 0] },
  { id: 'data-2', kind: 'data', resolved: [4.8, -2.8, 0] },
]

export const BLUEPRINT_EDGES = [
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 9],
  [6, 10],
  [7, 10],
  [4, 5],
  [5, 6],
  [6, 7],
]

function mulberry32(seed) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function buildBlueprintNodes() {
  const random = mulberry32(20260802)

  return NODE_SPECS.map((node, index) => ({
    ...node,
    scattered: [(random() - 0.5) * 13, (random() - 0.5) * 10, (random() - 0.5) * 5],
    rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
    delay: 0.04 + (index % 4) * 0.055 + Math.floor(index / 4) * 0.035,
  }))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function nodeResolveProgress(progress, delay) {
  const local = clamp((progress - delay) / 0.62, 0, 1)
  return 1 - (1 - local) ** 3
}
