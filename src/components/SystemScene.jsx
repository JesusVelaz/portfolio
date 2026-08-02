import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import {
  BLUEPRINT_EDGES,
  buildBlueprintNodes,
  nodeResolveProgress,
} from '../lib/systemBlueprint.js'

const VIEW_HEIGHT = 12
const VIEW_WIDTH = 15
const PULSE_EDGES = [0, 1, 3, 4, 7, 9]
const CAMERA_Y = -1.05

function readTheme() {
  const style = getComputedStyle(document.documentElement)
  const value = (name, fallback) => style.getPropertyValue(name).trim() || fallback

  return {
    primary: new THREE.Color(value('--foreground', '#fafafa')),
    secondary: new THREE.Color(value('--muted-foreground', '#a1a1aa')),
    line: new THREE.Color(value('--border-strong', '#3f3f46')),
    grid: new THREE.Color(value('--border', '#27272a')),
  }
}

function buildGrid() {
  const points = []
  for (let x = -7; x <= 7; x += 1) points.push(x, -5, -0.9, x, 5, -0.9)
  for (let y = -5; y <= 5; y += 1) points.push(-7, y, -0.9, 7, y, -0.9)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

function buildInterfaceGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.72, -0.56)
  shape.lineTo(0.72, -0.56)
  shape.lineTo(0.98, -0.3)
  shape.lineTo(0.98, 0.3)
  shape.lineTo(0.72, 0.56)
  shape.lineTo(-0.72, 0.56)
  shape.lineTo(-0.98, 0.3)
  shape.lineTo(-0.98, -0.3)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  })
  geometry.translate(0, 0, -0.14)
  return geometry
}

function writeSegment(positions, offset, ax, ay, az, bx, by, bz) {
  positions[offset] = ax
  positions[offset + 1] = ay
  positions[offset + 2] = az
  positions[offset + 3] = bx
  positions[offset + 4] = by
  positions[offset + 5] = bz
}

function pointOnCircuit(start, end, progress, target) {
  const middleX = (start.x + end.x) / 2
  const routeZ = (start.z + end.z) / 2
  const firstLength = Math.hypot(middleX - start.x, routeZ - start.z)
  const middleLength = Math.abs(end.y - start.y)
  const lastLength = Math.hypot(end.x - middleX, end.z - routeZ)
  const total = firstLength + middleLength + lastLength || 1
  let distance = progress * total

  if (distance <= firstLength) {
    const local = firstLength ? distance / firstLength : 1
    return target.set(
      THREE.MathUtils.lerp(start.x, middleX, local),
      start.y,
      THREE.MathUtils.lerp(start.z, routeZ, local)
    )
  }

  distance -= firstLength
  if (distance <= middleLength) {
    const local = middleLength ? distance / middleLength : 1
    return target.set(middleX, THREE.MathUtils.lerp(start.y, end.y, local), routeZ)
  }

  distance -= middleLength
  const local = lastLength ? Math.min(1, distance / lastLength) : 1
  return target.set(
    THREE.MathUtils.lerp(middleX, end.x, local),
    end.y,
    THREE.MathUtils.lerp(routeZ, end.z, local)
  )
}

function smoothstep(value, min, max) {
  const normalized = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return normalized * normalized * (3 - 2 * normalized)
}

export default function SystemScene({ progressRef }) {
  const hostRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const theme = readTheme()
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60)
    // Shift the viewport down relative to the artwork, which raises the system
    // to the same visual level as the H1 without changing the sticky layout.
    camera.position.set(0, CAMERA_Y, 18)
    camera.lookAt(0, CAMERA_Y, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    const disposables = []
    const track = (resource) => {
      disposables.push(resource)
      return resource
    }

    // A faint drafting grid anchors the scene in the visual language of a
    // system diagram rather than a floating abstract object.
    const gridGeometry = track(buildGrid())
    const gridMaterial = track(
      new THREE.LineBasicMaterial({ color: theme.grid, transparent: true, opacity: 0.1 })
    )
    scene.add(new THREE.LineSegments(gridGeometry, gridMaterial))

    const frameGeometry = track(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-6.6, 4.7, -0.7),
        new THREE.Vector3(6.6, 4.7, -0.7),
        new THREE.Vector3(6.6, -4.7, -0.7),
        new THREE.Vector3(-6.6, -4.7, -0.7),
      ])
    )
    const frameMaterial = track(
      new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: 0.35 })
    )
    scene.add(new THREE.LineLoop(frameGeometry, frameMaterial))

    const nodes = buildBlueprintNodes()
    const currentPositions = nodes.map(() => new THREE.Vector3())
    const scatteredPositions = nodes.map((node) => new THREE.Vector3(...node.scattered))
    const resolvedPositions = nodes.map((node) => new THREE.Vector3(...node.resolved))

    const interfaceNodes = nodes.filter((node) => node.kind === 'interface')
    const serviceNodes = nodes.filter((node) => node.kind === 'service')
    const dataNodes = nodes.filter((node) => node.kind === 'data')

    // Each layer has its own visual language: clipped product surfaces,
    // faceted processing cores, and open data rings.
    const interfaceGeometry = track(buildInterfaceGeometry())
    const serviceGeometry = track(new THREE.IcosahedronGeometry(0.72, 1))
    const dataGeometry = track(new THREE.TorusGeometry(0.58, 0.17, 10, 28))

    const interfaceMaterial = track(
      new THREE.MeshStandardMaterial({
        color: theme.secondary,
        roughness: 0.48,
        metalness: 0.04,
        transparent: true,
        opacity: 0.84,
      })
    )
    const serviceMaterial = track(
      new THREE.MeshStandardMaterial({ color: theme.primary, roughness: 0.4, metalness: 0.08 })
    )
    const dataMaterial = track(
      new THREE.MeshStandardMaterial({
        color: theme.secondary,
        roughness: 0.4,
        metalness: 0.08,
        transparent: true,
        opacity: 0.9,
      })
    )

    const interfaceMesh = new THREE.InstancedMesh(
      interfaceGeometry,
      interfaceMaterial,
      interfaceNodes.length
    )
    const serviceMesh = new THREE.InstancedMesh(serviceGeometry, serviceMaterial, serviceNodes.length)
    const dataMesh = new THREE.InstancedMesh(dataGeometry, dataMaterial, dataNodes.length)
    scene.add(interfaceMesh, serviceMesh, dataMesh)

    // Three segments per edge make routed, circuit-like connectors rather than
    // generic straight lines.
    const connectionPositions = new Float32Array(BLUEPRINT_EDGES.length * 18)
    const connectionGeometry = track(new THREE.BufferGeometry())
    connectionGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(connectionPositions, 3)
    )
    const connectionMaterial = track(
      new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: 0 })
    )
    const connections = new THREE.LineSegments(connectionGeometry, connectionMaterial)
    connections.renderOrder = -1
    scene.add(connections)

    const pulseGeometry = track(new THREE.SphereGeometry(0.11, 12, 8))
    const pulseMaterial = track(new THREE.MeshBasicMaterial({ color: theme.primary }))
    const pulses = new THREE.InstancedMesh(pulseGeometry, pulseMaterial, PULSE_EDGES.length)
    pulses.frustumCulled = false
    scene.add(pulses)

    scene.add(new THREE.AmbientLight(0xffffff, 1.25))
    const key = new THREE.DirectionalLight(0xffffff, 1.55)
    key.position.set(3, 6, 10)
    scene.add(key)

    const kindCounters = { interface: 0, service: 0, data: 0 }
    const localIndices = nodes.map((node) => kindCounters[node.kind]++)
    const meshes = { interface: interfaceMesh, service: serviceMesh, data: dataMesh }
    const dummy = new THREE.Object3D()
    const pulseDummy = new THREE.Object3D()
    const pulsePoint = new THREE.Vector3()

    function draw(progress, time) {
      const seconds = time * 0.001
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index]
        const local = nodeResolveProgress(progress, node.delay)
        const unsettled = 1 - local
        const position = currentPositions[index]
        position.lerpVectors(scatteredPositions[index], resolvedPositions[index], local)

        // Unconnected pieces orbit gently in place. The movement fades to zero
        // as each piece finds its slot, so the final architecture is precise.
        position.x += Math.sin(seconds * node.floatSpeed + node.floatPhase) * node.floatRadius * unsettled
        position.y +=
          Math.cos(seconds * node.floatSpeed * 0.74 + node.floatPhase) *
          node.floatRadius *
          0.8 *
          unsettled
        position.z +=
          Math.sin(seconds * node.floatSpeed * 0.52 + node.floatPhase * 1.7) * 0.22 * unsettled

        dummy.position.copy(position)
        dummy.rotation.set(
          node.rotation[0] * unsettled + seconds * 0.08 * unsettled,
          node.rotation[1] * unsettled + seconds * 0.11 * unsettled,
          node.rotation[2] * unsettled + seconds * 0.065 * unsettled
        )
        const scale = 0.72 + local * 0.28
        dummy.scale.setScalar(scale)
        dummy.updateMatrix()
        meshes[node.kind].setMatrixAt(localIndices[index], dummy.matrix)
      }

      interfaceMesh.instanceMatrix.needsUpdate = true
      serviceMesh.instanceMatrix.needsUpdate = true
      dataMesh.instanceMatrix.needsUpdate = true

      for (let index = 0; index < BLUEPRINT_EDGES.length; index += 1) {
        const [from, to] = BLUEPRINT_EDGES[index]
        const start = currentPositions[from]
        const end = currentPositions[to]
        const base = index * 18
        const middleX = (start.x + end.x) / 2
        const routeZ = (start.z + end.z) / 2 - 0.22
        writeSegment(
          connectionPositions,
          base,
          start.x,
          start.y,
          start.z - 0.22,
          middleX,
          start.y,
          routeZ
        )
        writeSegment(
          connectionPositions,
          base + 6,
          middleX,
          start.y,
          routeZ,
          middleX,
          end.y,
          routeZ
        )
        writeSegment(
          connectionPositions,
          base + 12,
          middleX,
          end.y,
          routeZ,
          end.x,
          end.y,
          end.z - 0.22
        )
      }
      connectionGeometry.attributes.position.needsUpdate = true
      connectionMaterial.opacity = smoothstep(progress, 0.38, 0.82) * 0.68

      const pulseVisibility = smoothstep(progress, 0.72, 0.94)
      pulses.visible = pulseVisibility > 0
      for (let index = 0; index < PULSE_EDGES.length; index += 1) {
        const [from, to] = BLUEPRINT_EDGES[PULSE_EDGES[index]]
        const phase = (time * 0.00016 + index / PULSE_EDGES.length) % 1
        pointOnCircuit(currentPositions[from], currentPositions[to], phase, pulsePoint)
        pulseDummy.position.set(pulsePoint.x, pulsePoint.y, pulsePoint.z + 0.34)
        pulseDummy.scale.setScalar(pulseVisibility)
        pulseDummy.updateMatrix()
        pulses.setMatrixAt(index, pulseDummy.matrix)
      }
      pulses.instanceMatrix.needsUpdate = true

      gridMaterial.opacity = 0.065 + smoothstep(progress, 0.35, 0.9) * 0.055
      renderer.render(scene, camera)
    }

    function currentProgress() {
      return reduced ? 1 : progressRef.current
    }

    function resize() {
      const rect = host.getBoundingClientRect()
      const parent = host.parentNode instanceof Element ? host.parentNode.getBoundingClientRect() : null
      const width = Math.round(rect.width || parent?.width || window.innerWidth)
      const height = Math.round(rect.height || parent?.height || window.innerHeight)
      const aspect = width / height
      const viewHeight = Math.max(VIEW_HEIGHT, VIEW_WIDTH / aspect)
      const viewWidth = viewHeight * aspect

      renderer.setSize(width, height)
      camera.left = -viewWidth / 2
      camera.right = viewWidth / 2
      camera.top = viewHeight / 2
      camera.bottom = -viewHeight / 2
      camera.updateProjectionMatrix()
      draw(currentProgress(), reduced ? 9000 : performance.now())
    }

    resize()
    const retry = requestAnimationFrame(resize)

    let frame = null
    let visible = true
    let visualProgress = currentProgress()
    let previousTime = performance.now()

    function loop(time) {
      if (!visible || document.hidden) return
      const elapsed = Math.min(0.1, Math.max(0, (time - previousTime) / 1000))
      previousTime = time
      visualProgress += (progressRef.current - visualProgress) * (1 - Math.exp(-elapsed * 10))
      draw(visualProgress, time)
      frame = requestAnimationFrame(loop)
    }

    if (reduced) draw(1, 9000)
    else frame = requestAnimationFrame(loop)

    function restart() {
      if (frame) cancelAnimationFrame(frame)
      frame = null
      previousTime = performance.now()
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(loop)
    }

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            restart()
          })
    observer?.observe(host)

    document.addEventListener('visibilitychange', restart)
    window.addEventListener('resize', resize)

    const themeObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            const next = readTheme()
            interfaceMaterial.color.copy(next.secondary)
            serviceMaterial.color.copy(next.primary)
            dataMaterial.color.copy(next.secondary)
            connectionMaterial.color.copy(next.line)
            frameMaterial.color.copy(next.line)
            gridMaterial.color.copy(next.grid)
            pulseMaterial.color.copy(next.primary)
            draw(currentProgress(), reduced ? 9000 : performance.now())
          })
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    resizeObserver?.observe(host)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      cancelAnimationFrame(retry)
      observer?.disconnect()
      themeObserver?.disconnect()
      resizeObserver?.disconnect()
      document.removeEventListener('visibilitychange', restart)
      window.removeEventListener('resize', resize)

      interfaceMesh.dispose()
      serviceMesh.dispose()
      dataMesh.dispose()
      pulses.dispose()
      for (const resource of disposables) resource.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [progressRef, reduced])

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
}
