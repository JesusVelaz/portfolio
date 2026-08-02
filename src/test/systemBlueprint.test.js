import {
  BLUEPRINT_EDGES,
  buildBlueprintNodes,
  nodeResolveProgress,
} from '../lib/systemBlueprint.js'

test('builds a deterministic interface-to-services-to-data system', () => {
  const first = buildBlueprintNodes()
  const second = buildBlueprintNodes()

  expect(first).toEqual(second)
  expect(first.filter((node) => node.kind === 'interface')).toHaveLength(4)
  expect(first.filter((node) => node.kind === 'service')).toHaveLength(4)
  expect(first.filter((node) => node.kind === 'data')).toHaveLength(3)
})

test('keeps every connection attached to a real node', () => {
  const nodes = buildBlueprintNodes()
  for (const [from, to] of BLUEPRINT_EDGES) {
    expect(nodes[from]).toBeDefined()
    expect(nodes[to]).toBeDefined()
  }
})

test('resolves nodes gradually and clamps both endpoints', () => {
  expect(nodeResolveProgress(-1, 0.2)).toBe(0)
  expect(nodeResolveProgress(0.5, 0.2)).toBeGreaterThan(0)
  expect(nodeResolveProgress(2, 0.2)).toBe(1)
})
