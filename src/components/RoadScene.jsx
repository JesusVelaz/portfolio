import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { ROAD_LENGTH, carYaw, driftAt, roadX, roadZAtProgress } from '../lib/roadMotion.js'

// A car driving down a winding road, viewed from directly above. Scroll
// progress drives how far along the road the car has travelled. The camera is
// fixed over the full route, so the road never changes underneath it.

const ROAD_SAMPLES = 240 // ribbon resolution along the fixed route
const ROAD_HALF_WIDTH = 4.4
const EDGE_INSET = 0.26 // how far the edge lines sit inside the tarmac
const EDGE_WIDTH = 0.13
const DASH_LENGTH = 2.1
const DASH_GAP = 2.9
const DASH_WIDTH = 0.16
const CAMERA_HEIGHT = 120
const VIEW_PADDING = 10
const TRACK_HALF_SPAN = 17
const SKID_SAMPLES = 44
const SKID_TRAIL = 17
const SMOKE_COUNT = 10

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
    road: new THREE.Color(value('--card-raised', '#27272a')),
    line: new THREE.Color(value('--muted-foreground', '#a1a1aa')),
    car: new THREE.Color(value('--foreground', '#fafafa')),
    glass: new THREE.Color(value('--background', '#09090b')),
    skid: new THREE.Color(value('--background', '#09090b')),
    smoke: new THREE.Color(value('--foreground', '#fafafa')),
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
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 240)
    // The route runs toward world -Z. Using +Z as screen-up makes increasing
    // progress travel from the top of the canvas to the bottom.
    camera.up.set(0, 0, 1)
    camera.position.set(0, CAMERA_HEIGHT, -ROAD_LENGTH / 2)
    camera.lookAt(0, 0, -ROAD_LENGTH / 2)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.display = 'block'
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

    const lineMaterial = track(
      new THREE.MeshBasicMaterial({ color: theme.line, transparent: true, opacity: 0.72 })
    )
    const edgeOffset = ROAD_HALF_WIDTH - EDGE_INSET
    for (const side of [-1, 1]) {
      const edge = track(buildRibbon(EDGE_WIDTH, side * edgeOffset, 0.01))
      scene.add(new THREE.Mesh(edge, lineMaterial))
    }

    // Centre dashes, one instanced mesh rather than a mesh per dash.
    const dashCount = Math.floor(ROAD_LENGTH / (DASH_LENGTH + DASH_GAP))
    const dashGeometry = track(new THREE.PlaneGeometry(DASH_WIDTH, DASH_LENGTH))
    dashGeometry.rotateX(-Math.PI / 2)
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
        dummy.rotation.set(0, carYaw(tangent.x, tangent.z), 0)
        dummy.updateMatrix()
        dashes.setMatrixAt(i, dummy.matrix)
      }
      dashes.instanceMatrix.needsUpdate = true
    }
    scene.add(dashes)

    // Tire marks make the slip legible even while the camera follows the car.
    // They are dynamic lines rather than permanent road decoration: each frame
    // reconstructs only the short trail immediately behind the rear wheels.
    const skidMaterial = track(
      new THREE.LineBasicMaterial({ color: theme.skid, transparent: true, opacity: 0.38 })
    )
    const skidTrails = [-1, 1].map(() => {
      const positions = new Float32Array(SKID_SAMPLES * 3)
      const geometry = track(new THREE.BufferGeometry())
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const line = new THREE.Line(geometry, skidMaterial)
      line.frustumCulled = false
      scene.add(line)
      return { geometry, positions }
    })

    const smokeMaterial = track(
      new THREE.MeshBasicMaterial({
        color: theme.smoke,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      })
    )
    const smokeGeometry = track(new THREE.CircleGeometry(0.52, 12))
    const smoke = new THREE.InstancedMesh(smokeGeometry, smokeMaterial, SMOKE_COUNT)
    smoke.frustumCulled = false
    smoke.renderOrder = 2
    scene.add(smoke)

    // The car. Simple massing — a body and a cabin — because at this camera
    // distance anything finer is invisible.
    const car = new THREE.Group()
    const carMaterial = track(
      new THREE.MeshStandardMaterial({ color: theme.car, roughness: 0.42, metalness: 0.05 })
    )
    const glassMaterial = track(
      new THREE.MeshStandardMaterial({ color: theme.glass, roughness: 0.18, metalness: 0.12 })
    )
    const bodyGeometry = track(new THREE.BoxGeometry(1.75, 0.42, 3.6))
    const cabinGeometry = track(new THREE.BoxGeometry(1.42, 0.34, 1.55))
    const glassGeometry = track(new THREE.BoxGeometry(1.18, 0.04, 0.72))
    const body = new THREE.Mesh(bodyGeometry, carMaterial)
    body.position.y = 0.32
    const cabin = new THREE.Mesh(cabinGeometry, carMaterial)
    cabin.position.set(0, 0.66, -0.22)
    const glass = new THREE.Mesh(glassGeometry, glassMaterial)
    glass.position.set(0, 0.85, -0.5)
    car.add(body, cabin, glass)
    scene.add(car)

    scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(3, 8, 2)
    scene.add(key)

    const carPoint = new THREE.Vector3()
    const carTangent = new THREE.Vector3()
    const carNormal = new THREE.Vector3()
    const trailPoint = new THREE.Vector3()
    const trailTangent = new THREE.Vector3()
    const trailNormal = new THREE.Vector3()
    const smokeDummy = new THREE.Object3D()

    function poseAt(z, point, tangent, normal) {
      pointAt(z, point)
      tangentAt(z, tangent)
      normal.set(-tangent.z, 0, tangent.x)
      const drift = driftAt(z)
      point.addScaledVector(normal, drift.lateral)
      return { ...drift, yaw: carYaw(tangent.x, tangent.z, drift.slip) }
    }

    function updateTrail(z, activeDrift) {
      let strongestDrift = Math.abs(activeDrift)

      for (let i = 0; i < SKID_SAMPLES; i += 1) {
        const amount = i / (SKID_SAMPLES - 1)
        const sampleZ = Math.max(0, z - SKID_TRAIL + amount * (SKID_TRAIL - 1.25))
        const pose = poseAt(sampleZ, trailPoint, trailTangent, trailNormal)
        strongestDrift = Math.max(strongestDrift, Math.abs(pose.curvature))

        // Rear axle and its two wheels in world space. Local forward is -Z,
        // so the rear sits opposite the tangent.
        const rearX = trailPoint.x - trailTangent.x * 1.24
        const rearZ = trailPoint.z - trailTangent.z * 1.24
        const rightX = Math.cos(pose.yaw)
        const rightZ = -Math.sin(pose.yaw)

        for (let side = 0; side < skidTrails.length; side += 1) {
          const wheelSide = side === 0 ? -0.68 : 0.68
          const base = i * 3
          skidTrails[side].positions[base] = rearX + rightX * wheelSide
          skidTrails[side].positions[base + 1] = 0.035
          skidTrails[side].positions[base + 2] = rearZ + rightZ * wheelSide
        }
      }

      for (const trail of skidTrails) {
        trail.geometry.attributes.position.needsUpdate = true
        trail.geometry.computeBoundingSphere()
      }

      const intensity = THREE.MathUtils.smoothstep(strongestDrift, 0.006, 0.04)
      skidMaterial.opacity = 0.12 + intensity * 0.34
      smokeMaterial.opacity = 0.025 + intensity * 0.1
      smoke.visible = intensity > 0.08

      for (let i = 0; i < SMOKE_COUNT; i += 1) {
        const age = (i + 1) / SMOKE_COUNT
        const sampleZ = Math.max(0, z - 1.2 - age * 7.5)
        const pose = poseAt(sampleZ, trailPoint, trailTangent, trailNormal)
        const rearX = trailPoint.x - trailTangent.x * 1.45
        const rearZ = trailPoint.z - trailTangent.z * 1.45
        const side = i % 2 === 0 ? -0.62 : 0.62

        smokeDummy.position.set(
          rearX + Math.cos(pose.yaw) * side,
          0.055,
          rearZ - Math.sin(pose.yaw) * side
        )
        smokeDummy.rotation.set(-Math.PI / 2, 0, i * 1.7)
        smokeDummy.scale.setScalar(0.45 + age * 1.35)
        smokeDummy.updateMatrix()
        smoke.setMatrixAt(i, smokeDummy.matrix)
      }
      smoke.instanceMatrix.needsUpdate = true
    }

    function draw(progress) {
      // Keep the car off both ends so it never sits at the very edge of the
      // generated road, where there is nothing ahead of or behind it.
      const z = roadZAtProgress(progress)

      const pose = poseAt(z, carPoint, carTangent, carNormal)
      car.position.set(carPoint.x, 0, carPoint.z)
      car.rotation.y = pose.yaw
      updateTrail(z, pose.curvature)

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
      const aspect = w / h
      const viewHeight = Math.max(ROAD_LENGTH + VIEW_PADDING, (TRACK_HALF_SPAN * 2) / aspect)
      const viewWidth = viewHeight * aspect
      camera.left = -viewWidth / 2
      camera.right = viewWidth / 2
      camera.top = viewHeight / 2
      camera.bottom = -viewHeight / 2
      camera.updateProjectionMatrix()
      draw(currentProgress())
    }

    resize()
    // One deferred retry, for the case where layout has not settled at mount.
    const retry = requestAnimationFrame(resize)

    let frame = null
    let visible = true
    let visualProgress = currentProgress()
    let previousTime = performance.now()

    function loop(time) {
      if (!visible || document.hidden) return
      const elapsed = Math.min(0.1, Math.max(0, (time - previousTime) / 1000))
      previousTime = time
      const blend = 1 - Math.exp(-elapsed * 11)
      visualProgress += (progressRef.current - visualProgress) * blend
      draw(visualProgress)
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
            roadMaterial.color = next.road
            lineMaterial.color = next.line
            carMaterial.color = next.car
            glassMaterial.color = next.glass
            skidMaterial.color = next.skid
            smokeMaterial.color = next.smoke
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
