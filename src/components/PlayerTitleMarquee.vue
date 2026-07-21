<template>
  <h4
    ref="viewportRef"
    class="player-title-marquee"
    :class="{ 'is-overflowing': isOverflowing }"
    :title="text"
  >
    <span
      :key="`${text}-${isOverflowing}`"
      class="player-title-marquee-track"
      :style="{ '--marquee-duration': `${duration}s` }"
    >
      <span ref="textRef" class="player-title-marquee-copy">{{ text }}</span>
      <span v-if="isOverflowing" class="player-title-marquee-copy" aria-hidden="true">{{ text }}</span>
    </span>
  </h4>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  }
})

const viewportRef = ref(null)
const textRef = ref(null)
const isOverflowing = ref(false)
const duration = ref(9)
let resizeObserver = null
let measureFrame = 0

const measure = () => {
  cancelAnimationFrame(measureFrame)
  measureFrame = requestAnimationFrame(() => {
    const viewport = viewportRef.value
    const text = textRef.value
    if (!viewport || !text) return

    const textWidth = Math.ceil(text.scrollWidth)
    const viewportWidth = Math.floor(viewport.clientWidth)
    isOverflowing.value = textWidth > viewportWidth + 2
    duration.value = Math.max(8, Math.min(18, Number((textWidth / 30 + 3).toFixed(1))))
  })
}

const resetAndMeasure = async () => {
  isOverflowing.value = false
  await nextTick()
  measure()
}

watch(() => props.text, resetAndMeasure)

onMounted(() => {
  resizeObserver = new ResizeObserver(measure)
  if (viewportRef.value) resizeObserver.observe(viewportRef.value)
  resetAndMeasure()
  document.fonts?.ready?.then(measure)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(measureFrame)
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.player-title-marquee {
  display: block !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  text-overflow: clip !important;
}

.player-title-marquee-track {
  display: flex;
  width: max-content;
  min-width: 0;
  align-items: center;
  gap: 32px;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.player-title-marquee-copy {
  display: inline-block;
  flex: none;
  white-space: nowrap;
}

.player-title-marquee.is-overflowing .player-title-marquee-track {
  animation: player-title-marquee var(--marquee-duration, 9s) linear infinite;
}

@keyframes player-title-marquee {
  0%, 12% {
    transform: translate3d(0, 0, 0);
  }
  88%, 100% {
    transform: translate3d(calc(-50% - 16px), 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-title-marquee.is-overflowing .player-title-marquee-track {
    animation: none;
  }
}
</style>
