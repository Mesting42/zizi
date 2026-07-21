<template>
  <component
    :is="tag"
    ref="cardRef"
    class="border-glow-card"
    :class="className"
    :style="cardStyle"
    v-bind="$attrs"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <span class="edge-light" aria-hidden="true" />
    <div class="border-glow-inner" :class="innerClass">
      <slot />
    </div>
  </component>
</template>

<script setup>
import { ref, computed } from 'vue'
import '../css/BorderGlow.css'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  tag: {
    type: String,
    default: 'div'
  },
  className: {
    type: String,
    default: ''
  },
  innerClass: {
    type: String,
    default: ''
  },
  edgeSensitivity: {
    type: Number,
    default: 30
  },
  glowColor: {
    type: String,
    default: '199 85 48'
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  },
  borderRadius: {
    type: Number,
    default: 28
  },
  glowRadius: {
    type: Number,
    default: 40
  },
  glowIntensity: {
    type: Number,
    default: 1
  },
  coneSpread: {
    type: Number,
    default: 25
  },
  colors: {
    type: Array,
    default: () => ['#22d3ee', '#5b6cff', '#67e8f9']
  },
  fillOpacity: {
    type: Number,
    default: 0.5
  }
})

const cardRef = ref(null)
let pointerFrame = 0
let pendingPointer = null

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven'
]
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 234, s: 89, l: 88 }
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) }
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['--glow-color', '--glow-color-60', '--glow-color-50', '--glow-color-40', '--glow-color-30', '--glow-color-20', '--glow-color-10']
  const vars = {}
  for (let i = 0; i < opacities.length; i++) {
    vars[keys[i]] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`
  }
  return vars
}

function buildGradientVars(colors) {
  const vars = {}
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)]
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`
  return vars
}

const cardStyle = computed(() => {
  const style = {
    '--edge-sensitivity': props.edgeSensitivity,
    '--border-radius': `${props.borderRadius}px`,
    '--glow-padding': `${props.glowRadius}px`,
    '--cone-spread': props.coneSpread,
    '--fill-opacity': props.fillOpacity,
    ...buildGlowVars(props.glowColor, props.glowIntensity),
    ...buildGradientVars(props.colors)
  }
  if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    style['--card-bg'] = props.backgroundColor
  }
  return style
})

function getCenterOfElement(el) {
  const { width, height } = el.getBoundingClientRect()
  return [width / 2, height / 2]
}

function getEdgeProximity(el, x, y) {
  const [cx, cy] = getCenterOfElement(el)
  const dx = x - cx
  const dy = y - cy
  let kx = Infinity
  let ky = Infinity
  if (dx !== 0) kx = cx / Math.abs(dx)
  if (dy !== 0) ky = cy / Math.abs(dy)
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
}

function getCursorAngle(el, x, y) {
  const [cx, cy] = getCenterOfElement(el)
  const dx = x - cx
  const dy = y - cy
  if (dx === 0 && dy === 0) return 0
  const radians = Math.atan2(dy, dx)
  let degrees = radians * (180 / Math.PI) + 90
  if (degrees < 0) degrees += 360
  return degrees
}

function applyPointerPosition(x, y) {
  const card = cardRef.value
  if (!card) return

  const edge = getEdgeProximity(card, x, y)
  const angle = getCursorAngle(card, x, y)

  card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`)
  card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`)
}

function handlePointerMove(event) {
  const card = cardRef.value
  if (!card) return

  const rect = card.getBoundingClientRect()
  pendingPointer = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  if (pointerFrame) return

  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0
    if (!pendingPointer) return
    applyPointerPosition(pendingPointer.x, pendingPointer.y)
    pendingPointer = null
  })
}

function handlePointerLeave() {
  const card = cardRef.value
  if (!card) return
  card.style.setProperty('--edge-proximity', '0')
}
</script>
