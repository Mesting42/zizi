<template>
  <div
    ref="stage"
    class="avatar-follow-stage"
    :class="{
      'is-ready': isReady,
      'has-error': Boolean(errorMessage),
      'shows-pointer': showPointer && interactive
    }"
    @pointermove="handlePointerMove"
    @pointerenter="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <canvas ref="canvas" class="avatar-follow-canvas" aria-hidden="true"></canvas>

    <div v-if="showStatus && !isReady && !errorMessage" class="avatar-follow-loading" role="status">
      <span class="avatar-follow-loading-ring"></span>
      <span>Loading 3D Avatar</span>
      <small>{{ loadingProgress }}%</small>
    </div>

    <p v-if="showStatus && errorMessage" class="avatar-follow-error">{{ errorMessage }}</p>

    <span
      v-show="showPointer && isReady && isPointerInside"
      class="avatar-follow-pointer"
      :style="pointerIndicatorStyle"
      aria-hidden="true"
    ></span>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

const props = defineProps({
  modelUrl: {
    type: String,
    default: '/models/avatar/mesting-rodin-rebuild-optimized.glb'
  },
  maxYaw: {
    type: Number,
    default: 7
  },
  maxPitch: {
    type: Number,
    default: 3
  },
  showPointer: {
    type: Boolean,
    default: true
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  cameraZoom: {
    type: Number,
    default: 1
  },
  cameraTargetY: {
    type: Number,
    default: 0.08
  },
  trackViewport: {
    type: Boolean,
    default: false
  },
  maxPixelRatio: {
    type: Number,
    default: 1.5
  },
  maxFps: {
    type: Number,
    default: 60
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['ready', 'error'])

const stage = ref(null)
const canvas = ref(null)
const isReady = ref(false)
const isPointerInside = ref(false)
const loadingProgress = ref(0)
const errorMessage = ref('')
const pointerPixel = ref({ x: 0, y: 0 })

const pointerIndicatorStyle = computed(() => ({
  transform: `translate3d(${pointerPixel.value.x}px, ${pointerPixel.value.y}px, 0)`
}))

let renderer
let scene
let camera
let avatarPivot
let avatarScene
let headControl
let resizeObserver
let visibilityObserver
let animationFrame = 0
let lastFrameTime = 0
let disposed = false
let isStageVisible = false
let isUserScrolling = document.body.classList.contains('is-user-scrolling')
let rendererWarmupIdleHandle = 0
let rendererWarmupTimer = 0
let pointer = { x: 0, y: 0 }
let pointerTarget = { x: 0, y: 0 }
let headYaw = 0
let headPitch = 0
const headRestQuaternion = new THREE.Quaternion()
const headDeltaQuaternion = new THREE.Quaternion()
const headDeltaEuler = new THREE.Euler(0, 0, 0, 'YXZ')

const degToRad = (degrees) => degrees * (Math.PI / 180)

const handlePointerMove = (event) => {
  if (!props.interactive || !stage.value) return

  const bounds = props.trackViewport
    ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    : stage.value.getBoundingClientRect()
  const localX = event.clientX - bounds.left
  const localY = event.clientY - bounds.top

  pointerTarget.x = THREE.MathUtils.clamp((localX / bounds.width) * 2 - 1, -1, 1)
  pointerTarget.y = THREE.MathUtils.clamp(-((localY / bounds.height) * 2 - 1), -1, 1)
  // Homepage use keeps the decorative crosshair hidden. Avoid triggering a
  // Vue update for every pointer event when there is no indicator to paint.
  if (props.showPointer) {
    pointerPixel.value = { x: localX, y: localY }
    isPointerInside.value = true
  }

  startAnimationIfReady()
}

const resetPointer = () => {
  if (props.showPointer) isPointerInside.value = false
  pointerTarget = { x: 0, y: 0 }
  startAnimationIfReady()
}

const handlePointerLeave = () => {
  if (props.interactive && !props.trackViewport) resetPointer()
}

const resize = () => {
  if (!stage.value || !renderer || !camera) return

  const width = Math.max(1, stage.value.clientWidth)
  const height = Math.max(1, stage.value.clientHeight)
  const compactScreen = window.matchMedia('(max-width: 768px)').matches

  renderer.setPixelRatio(
    compactScreen ? Math.min(1, props.maxPixelRatio) : props.maxPixelRatio
  )
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.zoom = props.cameraZoom
  camera.updateProjectionMatrix()
}

const centerAvatarOnNeck = (model) => {
  const initialBounds = new THREE.Box3().setFromObject(model)
  const initialSize = initialBounds.getSize(new THREE.Vector3())
  const desiredHeight = 2.18
  const scale = desiredHeight / Math.max(initialSize.y, 0.001)

  model.scale.setScalar(scale)
  model.updateMatrixWorld(true)

  const bounds = new THREE.Box3().setFromObject(model)
  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())
  const neckY = bounds.min.y + size.y * 0.43

  model.position.x -= center.x
  model.position.y -= neckY
  model.position.z -= center.z
  avatarPivot.position.y = -0.17
}

const prepareMaterials = (model) => {
  model.traverse((object) => {
    if (!object.isMesh) return

    object.castShadow = false
    object.receiveShadow = false
    object.frustumCulled = true

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.filter(Boolean).forEach((material) => {
      material.side = THREE.FrontSide
      material.needsUpdate = true
    })
  })
}

const startAnimationIfReady = () => {
  if (
    isReady.value
    && isStageVisible
    && !document.hidden
    && !isUserScrolling
    && !animationFrame
    && !disposed
  ) {
    lastFrameTime = 0
    animationFrame = requestAnimationFrame(animate)
  }
}

const warmRendererBeforeReveal = () => {
  if (disposed || !renderer || !scene || !camera || !avatarScene) return

  if (isUserScrolling) {
    rendererWarmupTimer = window.setTimeout(warmRendererBeforeReveal, 120)
    return
  }

  // Compile shaders and upload textures while idle. Otherwise this first
  // render occurs exactly as the reader scrolls back to the card.
  renderer.compile(scene, camera)
  renderer.render(scene, camera)
  isReady.value = true
  loadingProgress.value = 100
  emit('ready')
  startAnimationIfReady()
}

const scheduleRendererWarmup = () => {
  if (disposed) return

  const beginWarmup = () => {
    rendererWarmupIdleHandle = 0
    warmRendererBeforeReveal()
  }

  if ('requestIdleCallback' in window) {
    rendererWarmupIdleHandle = window.requestIdleCallback(beginWarmup, { timeout: 900 })
  } else {
    rendererWarmupTimer = window.setTimeout(beginWarmup, 0)
  }
}

const findHeadControl = (model) => {
  let exactMatch = null
  let suffixedMatch = null

  model.traverse((object) => {
    if (object.name === 'Head_Control') exactMatch = object
    if (!suffixedMatch && /^Head_Control(?:\.\d+)?$/i.test(object.name)) {
      suffixedMatch = object
    }
  })

  return exactMatch ?? suffixedMatch
}

const loadAvatar = () => {
  const completeAvatarLoad = (model) => {
    avatarScene = model
    prepareMaterials(avatarScene)
    headControl = avatarScene.userData?.sculptRuntime?.headControl || findHeadControl(avatarScene) || avatarScene
    if (headControl) headRestQuaternion.copy(headControl.quaternion)
    headYaw = 0
    headPitch = 0
    centerAvatarOnNeck(avatarScene)
    avatarPivot.add(avatarScene)
    scheduleRendererWarmup()
  }

  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)

  loader.load(
    props.modelUrl,
    (gltf) => {
      if (disposed) {
        disposeObject(gltf.scene)
        return
      }

      completeAvatarLoad(gltf.scene)
    },
    (event) => {
      if (!event.total) return
      loadingProgress.value = Math.min(99, Math.round((event.loaded / event.total) * 100))
    },
    () => {
      if (disposed) return
      errorMessage.value = 'The 3D avatar could not be loaded. Please refresh and try again.'
      emit('error')
    }
  )
}

const animate = (time) => {
  if (disposed) return

  if (!isReady.value || !isStageVisible || document.hidden || isUserScrolling) {
    animationFrame = 0
    return
  }

  const frameInterval = 1000 / Math.max(1, props.maxFps)
  if (lastFrameTime && time - lastFrameTime < frameInterval) {
    animationFrame = requestAnimationFrame(animate)
    return
  }

  const delta = Math.min((time - lastFrameTime) / 1000 || 0.016, 0.05)
  lastFrameTime = time
  pointer.x = THREE.MathUtils.damp(pointer.x, pointerTarget.x, 11.5, delta)
  pointer.y = THREE.MathUtils.damp(pointer.y, pointerTarget.y, 11.5, delta)

  const targetYaw = pointer.x * degToRad(props.maxYaw)
  const targetPitch = -pointer.y * degToRad(props.maxPitch)
  headYaw = THREE.MathUtils.damp(headYaw, targetYaw, 11.5, delta)
  headPitch = THREE.MathUtils.damp(headPitch, targetPitch, 11.5, delta)

  if (headControl) {
    headDeltaEuler.set(headPitch, headYaw, 0, 'YXZ')
    headDeltaQuaternion.setFromEuler(headDeltaEuler)
    headControl.quaternion.copy(headRestQuaternion).multiply(headDeltaQuaternion)
  } else if (avatarPivot) {
    // Keep the preview usable if an older GLB without the control bone is loaded.
    avatarPivot.rotation.y = THREE.MathUtils.damp(
      avatarPivot.rotation.y,
      headYaw * 0.7,
      6.5,
      delta
    )
    avatarPivot.rotation.x = THREE.MathUtils.damp(
      avatarPivot.rotation.x,
      headPitch * 0.7,
      6.5,
      delta
    )
    avatarPivot.rotation.z = THREE.MathUtils.damp(avatarPivot.rotation.z, 0, 6.5, delta)
  }

  renderer?.render(scene, camera)

  // The model is visually static while the pointer is at rest. Continuing to
  // render it at 24 fps would consume GPU time without changing a pixel, and
  // makes it easier for unrelated scroll work to compete with the canvas.
  const motionIsSettled = (
    Math.abs(pointer.x - pointerTarget.x) < 0.0008
    && Math.abs(pointer.y - pointerTarget.y) < 0.0008
    && Math.abs(headYaw - targetYaw) < 0.0008
    && Math.abs(headPitch - targetPitch) < 0.0008
  )

  animationFrame = motionIsSettled ? 0 : requestAnimationFrame(animate)
}

const handleDocumentVisibility = () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
    return
  }
  startAnimationIfReady()
}

const handleScrollState = (event) => {
  isUserScrolling = Boolean(event.detail?.scrolling)
  if (isUserScrolling) {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = 0
    return
  }

  startAnimationIfReady()
}

const disposeObject = (object) => {
  const disposedSkeletons = new Set()

  object?.traverse((child) => {
    if (!child.isMesh) return
    child.geometry?.dispose()
    if (child.isSkinnedMesh && child.skeleton && !disposedSkeletons.has(child.skeleton)) {
      child.skeleton.dispose()
      disposedSkeletons.add(child.skeleton)
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.filter(Boolean).forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose()
      })
      material.dispose()
    })
  })
}

onMounted(async () => {
  await nextTick()
  if (!canvas.value || !stage.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, props.cameraTargetY, 4.1)
  camera.zoom = props.cameraZoom
  camera.lookAt(0, props.cameraTargetY, 0)

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    })
  } catch (error) {
    console.warn('Avatar preview could not create a WebGL context.', error)
    errorMessage.value = 'This browser cannot start the live 3D preview.'
    emit('error')
    return
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08

  scene.add(new THREE.HemisphereLight(0xf3f0e8, 0x18181b, 2.5))

  const keyLight = new THREE.DirectionalLight(0xffeee3, 3.2)
  keyLight.position.set(-2.5, 3.5, 4.5)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x91b9ff, 1.25)
  fillLight.position.set(3, 1.2, 2)
  scene.add(fillLight)

  avatarPivot = new THREE.Group()
  scene.add(avatarPivot)

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage.value)
  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isStageVisible = entry?.isIntersecting ?? true
        if (isStageVisible) {
          startAnimationIfReady()
        }
      },
      { rootMargin: '160px' }
    )
    visibilityObserver.observe(stage.value)
  }
  if (props.trackViewport && props.interactive) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', resetPointer)
  }
  resize()
  loadAvatar()
  document.addEventListener('visibilitychange', handleDocumentVisibility)
  document.addEventListener('mesting:scroll-state', handleScrollState)
  startAnimationIfReady()
})

onBeforeUnmount(() => {
  disposed = true
  document.removeEventListener('visibilitychange', handleDocumentVisibility)
  document.removeEventListener('mesting:scroll-state', handleScrollState)
  cancelAnimationFrame(animationFrame)
  if (rendererWarmupIdleHandle && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(rendererWarmupIdleHandle)
  }
  if (rendererWarmupTimer) window.clearTimeout(rendererWarmupTimer)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  if (props.trackViewport && props.interactive) {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('blur', resetPointer)
  }
  disposeObject(avatarScene)
  headControl = null
  avatarScene = null
  scene?.clear()
  renderer?.dispose()
  renderer?.forceContextLoss()
})
</script>

<style scoped>
.avatar-follow-stage {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  cursor: default;
  isolation: isolate;
}

.avatar-follow-stage.shows-pointer {
  cursor: crosshair;
}

.avatar-follow-canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 800ms ease;
}

.avatar-follow-stage.is-ready .avatar-follow-canvas {
  opacity: 1;
}

.avatar-follow-loading,
.avatar-follow-error {
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  gap: 10px;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  letter-spacing: 0.13em;
  transform: translate(-50%, -50%);
}

.avatar-follow-loading small {
  color: rgba(255, 255, 255, 0.4);
}

.avatar-follow-loading-ring {
  width: 26px;
  height: 26px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-top-color: rgba(255, 255, 255, 0.78);
  border-radius: 50%;
  animation: avatar-loading-spin 900ms linear infinite;
}

.avatar-follow-pointer {
  position: absolute;
  top: -11px;
  left: -11px;
  z-index: 3;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(185, 214, 255, 0.22);
  pointer-events: none;
}

.avatar-follow-pointer::before,
.avatar-follow-pointer::after {
  position: absolute;
  top: 50%;
  left: 50%;
  content: '';
  background: rgba(255, 255, 255, 0.42);
  transform: translate(-50%, -50%);
}

.avatar-follow-pointer::before {
  width: 5px;
  height: 1px;
}

.avatar-follow-pointer::after {
  width: 1px;
  height: 5px;
}

@keyframes avatar-loading-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .avatar-follow-stage {
    min-height: 360px;
    cursor: default;
  }

  .avatar-follow-pointer {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .avatar-follow-canvas {
    transition: none;
  }
}
</style>
