import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

// A car driving down a winding road, viewed from directly above. Scroll
// progress drives how far along the road the car has travelled; the camera
// tracks it, so the road streams past rather than the car crossing a fixed map.

const ROAD_LENGTH = 260 // world units of road, covering progress 0 -> 1
const ROAD_SAMPLES = 420 // ribbon resolution along the length
const ROAD_HALF_WIDTH = 4.4
const EDGE_INSET = 0.26 // how far the edge lines sit inside the tarmac
const EDGE_WIDTH = 0.13
const DASH_LENGTH = 2.1
const DASH_GAP = 2.9
const DASH_WIDTH = 0.16
const CAMERA_HEIGHT = 26

// Two sines of different periods, so the road never repeats a shape the eye can
// predict. A single sine reads as a mechanical zig-zag.
function roadX(z) {
  return Math.sin(z * 0.075) * 8.5 + Math.sin(z * 0.026) * 4.2
}

function pointAt(z, target) {
  return target.set(roadX(z), 0, -z)
}

// Unit tangent in the XZ plane, from a small step along the path.
function tangentAt(z, target) {
  const delta = 0.35
  const ahead = roadX(z + delta)
  const behind = roadX(z - delta)
  return target.set(ahead - behind, 0, -2 * delta).normalize()
}

// Perpendicular to the tangent, still flat. Rotating the tangent 90 degrees
// about Y gives the road's left-right axis.
function normalAt(z, target) {
  tangentAt(z, target)
  return target.set(-target.z, 0, target.x)
}

// A flat ribbon following the path: two vertices per sample, triangulated into
// a strip. Used for the tarmac and for each painted edge line.
function buildRibbon(halfWidth, offset = 0, yLift = 0) {
  const positions = new Float32Array(ROAD_SAMPLES * 2 * 3)
  const indices = []
  const point = new THREE.Vector3()
  const normal = new THREE.Vector3()

  for (let i = 0; i < ROAD_SAMPLES; i += 1) {
    const z = (i / (ROAD_SAMPLES - 1)) * ROAD_LENGTH
    pointAt(z, point)
    normalAt(z, normal)

    const centreX = point.x + normal.x * offset
    const centreZ = point.z + normal.z * offset
    const base = i * 6

    positions[base] = centreX - normal.x * halfWidth
    positions[base + 1] = yLift
    positions[base + 2] = centreZ - normal.z * halfWidth
    positions[base + 3] = centreX + normal.x * halfWidth
    positions[base + 4] = yLift
    positions[base + 5] = centreZ + normal.z * halfWidth

    if (i < ROAD_SAMPLES - 1) {
      const v = i * 2
      indices.push(v, v + 1, v + 2, v + 1, v + 3, v + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  return geometry
}

function readTheme() {
  const style = getComputedStyle(document.documentElement)
  const value = (name, fallback) => style.getPropertyValue(name).trim() || fallback
  return {
    road: new THREE.Color(value('--card', '#18181b')),
    line: new THREE.Color(value('--border-strong', '#3f3f46')),
    car: new THREE.Color(value('--foreground', '#fafafa')),
  }
}

export default function RoadScene({ progressRef }) {
  const hostRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const theme = readTheme()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
    // Looking straight down, with -Z as "up" on screen, so the road runs
    // vertically and its curves read as left-right movement. Rotating the
    // camera to follow the tangent instead would spin the whole world.
    camera.up.set(0, 0, -1)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    host.appendChild(renderer.domElement)

    // Everything allocated that owns GPU memory, so cleanup cannot miss one.
    const disposables = []
    const track = (resource) => {
      disposables.push(resource)
      return resource
    }

    // Flat materials for the road surface and paint: seen from directly above,
    // shading adds nothing and only muddies the contrast against the page.
    const roadGeometry = track(buildRibbon(ROAD_HALF_WIDTH))
    const roadMaterial = track(new THREE.MeshBasicMaterial({ color: theme.road }))
    scene.add(new THREE.Mesh(roadGeometry, roadMaterial))

    const lineMaterial = track(new THREE.MeshBasicMaterial({ color: theme.line }))
    const edgeOffset = ROAD_HALF_WIDTH - EDGE_INSET
    for (const side of [-1, 1]) {
      const edge = track(buildRibbon(EDGE_WIDTH, side * edgeOffset, 0.01))
      scene.add(new THREE.Mesh(edge, lineMaterial))
    }

    // Centre dashes, one instanced mesh rather than a mesh per dash.
    const dashCount = Math.floor(ROAD_LENGTH / (DASH_LENGTH + DASH_GAP))
    const dashGeometry = track(new THREE.PlaneGeometry(DASH_WIDTH, DASH_LENGTH))
    const dashes = new THREE.InstancedMesh(dashGeometry, lineMaterial, dashCount)
    {
      const point = new THREE.Vector3()
      const tangent = new THREE.Vector3()
      const dummy = new THREE.Object3D()
      for (let i = 0; i < dashCount; i += 1) {
        const z = i * (DASH_LENGTH + DASH_GAP) + DASH_LENGTH
        pointAt(z, point)
        tangentAt(z, tangent)
        dummy.position.set(point.x, 0.01, point.z)
        dummy.rotation.set(-Math.PI / 2, 0, -Math.atan2(tangent.x, -tangent.z))
        dummy.updateMatrix()
        dashes.setMatrixAt(i, dummy.matrix)
      }
      dashes.instanceMatrix.needsUpdate = true
    }
    scene.add(dashes)

    // The car. Simple massing — a body and a cabin — because at this camera
    // distance anything finer is invisible.
    const car = new THREE.Group()
    const carMaterial = track(
      new THREE.MeshStandardMaterial({ color: theme.car, roughness: 0.42, metalness: 0.05 })
    )
    const bodyGeometry = track(new THREE.BoxGeometry(1.75, 0.42, 3.6))
    const cabinGeometry = track(new THREE.BoxGeometry(1.42, 0.34, 1.55))
    const body = new THREE.Mesh(bodyGeometry, carMaterial)
    body.position.y = 0.32
    const cabin = new THREE.Mesh(cabinGeometry, carMaterial)
    cabin.position.set(0, 0.66, -0.12)
    car.add(body, cabin)
    scene.add(car)

    scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(3, 8, 2)
    scene.add(key)

    const carPoint = new THREE.Vector3()
    const carTangent = new THREE.Vector3()

    function draw(progress) {
      // Keep the car off both ends so it never sits at the very edge of the
      // generated road, where there is nothing ahead of or behind it.
      const z = 12 + progress * (ROAD_LENGTH - 34)

      pointAt(z, carPoint)
      tangentAt(z, carTangent)
      car.position.set(carPoint.x, 0, carPoint.z)
      car.rotation.y = Math.atan2(carTangent.x, -carTangent.z) + Math.PI

      // Camera sits above the car, nudged so the car rides slightly below
      // centre and more of the road ahead is visible.
      camera.position.set(carPoint.x, CAMERA_HEIGHT, carPoint.z - 5)
      camera.lookAt(carPoint.x, 0, carPoint.z - 5)

      renderer.render(scene, camera)
    }

    function currentProgress() {
      return reduced ? 0.5 : progressRef.current
    }

    function resize() {
      // Measured rather than read off clientWidth, and never allowed to bail:
      // a silent return here leaves the canvas at its 300x300 default with
      // nothing scheduled to correct it.
      const rect = host.getBoundingClientRect()
      const parent = host.parentNode instanceof Element ? host.parentNode.getBoundingClientRect() : null
      const w = Math.round(rect.width || parent?.width || window.innerWidth)
      const h = Math.round(rect.height || parent?.height || window.innerHeight)

      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      draw(currentProgress())
    }

    resize()
    // One deferred retry, for the case where layout has not settled at mount.
    const retry = requestAnimationFrame(resize)

    let frame = null
    let visible = true

    function loop() {
      if (!visible || document.hidden) return
      draw(progressRef.current)
      frame = requestAnimationFrame(loop)
    }

    if (reduced) {
      draw(0.5)
    } else {
      frame = requestAnimationFrame(loop)
    }

    function restart() {
      if (frame) cancelAnimationFrame(frame)
      frame = null
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
            roadMaterial.color = next.road
            lineMaterial.color = next.line
            carMaterial.color = next.car
            draw(currentProgress())
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

      // Browsers cap concurrent WebGL contexts near 16 and this component
      // remounts on every navigation back to home. A leak here is silent until
      // the canvas simply stops rendering a dozen visits later.
      dashes.dispose()
      for (const resource of disposables) resource.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [progressRef, reduced])

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
}
