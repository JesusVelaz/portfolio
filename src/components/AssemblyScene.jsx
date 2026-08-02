import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

const GRID = 5 // 5x5x5, hollow -> 125 - 27 = 98 instances
const SPACING = 1.15
const SCATTER_RADIUS = 7
const CUBE = 0.42

// Deterministic RNG so the scattered arrangement is identical on every load
// and between theme changes. Math.random would reshuffle on remount.
function mulberry32(seed) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Each instance gets where it starts and where it belongs. Progress moves it
// between the two.
function buildInstances() {
  const random = mulberry32(20260802)
  const half = (GRID - 1) / 2
  const instances = []

  for (let x = 0; x < GRID; x += 1) {
    for (let y = 0; y < GRID; y += 1) {
      for (let z = 0; z < GRID; z += 1) {
        const isShell = x === 0 || x === GRID - 1 || y === 0 || y === GRID - 1 || z === 0 || z === GRID - 1
        if (!isShell) continue // hollow: a solid block reads as a lump

        const theta = random() * Math.PI * 2
        const phi = Math.acos(2 * random() - 1)
        const radius = SCATTER_RADIUS * (0.55 + random() * 0.45)

        instances.push({
          resolved: new THREE.Vector3((x - half) * SPACING, (y - half) * SPACING, (z - half) * SPACING),
          scattered: new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          ),
          spin: new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
          // Staggered so the lattice settles in waves instead of snapping.
          offset: random() * 0.45,
        })
      }
    }
  }

  return instances
}

function readColor() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
  return new THREE.Color(value || '#fafafa')
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function AssemblyScene({ progressRef }) {
  const hostRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 13)

    // alpha: true lets the page background show through, so a theme change only
    // has to recolour the material — there is no clear colour to keep in sync.
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    host.appendChild(renderer.domElement)

    const instances = buildInstances()
    const geometry = new THREE.BoxGeometry(CUBE, CUBE, CUBE)
    const material = new THREE.MeshStandardMaterial({
      color: readColor(),
      roughness: 0.45,
      metalness: 0.05,
    })
    const mesh = new THREE.InstancedMesh(geometry, material, instances.length)
    scene.add(mesh)

    // Without lights every face renders at the same value and the lattice reads
    // as a flat silhouette rather than an object.
    scene.add(new THREE.AmbientLight(0xffffff, 1.15))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 6, 8)
    scene.add(key)

    const group = new THREE.Object3D()
    const dummy = new THREE.Object3D()

    function draw(progress, time) {
      for (let i = 0; i < instances.length; i += 1) {
        const item = instances[i]
        const local = easeOut(
          Math.min(1, Math.max(0, (progress - item.offset) / (1 - item.offset || 1)))
        )

        dummy.position.lerpVectors(item.scattered, item.resolved, local)
        dummy.rotation.set(
          item.spin.x * (1 - local),
          item.spin.y * (1 - local),
          item.spin.z * (1 - local)
        )
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true

      // Ambient yaw, independent of progress, so it is alive at both ends.
      mesh.rotation.y = time * 0.00008
      mesh.rotation.x = Math.sin(time * 0.00005) * 0.12

      renderer.render(scene, camera)
    }

    function resize() {
      const { clientWidth: w, clientHeight: h } = host
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      draw(progressRef.current, performance.now())
    }

    resize()

    let frame = null
    let visible = true

    function loop(time) {
      if (!visible || document.hidden) return
      draw(progressRef.current, time)
      frame = requestAnimationFrame(loop)
    }

    if (reduced) {
      // Reduce motion, not content: one frame, fully assembled, no loop.
      draw(1, 0)
    } else {
      frame = requestAnimationFrame(loop)
    }

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (frame) cancelAnimationFrame(frame)
            if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(loop)
          })
    observer?.observe(host)

    function onVisibility() {
      if (frame) cancelAnimationFrame(frame)
      if (!document.hidden && visible && !reduced) frame = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVisibility)

    const themeObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            material.color = readColor()
            draw(progressRef.current, performance.now())
          })
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    resizeObserver?.observe(host)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer?.disconnect()
      themeObserver?.disconnect()
      resizeObserver?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)

      // Mandatory. Browsers cap concurrent WebGL contexts near 16, and this
      // component remounts on every navigation back to home. A leak here shows
      // no error — the canvas simply stops rendering a dozen visits later.
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [progressRef, reduced])

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
}
