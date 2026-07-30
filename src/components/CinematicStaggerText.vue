<template>
  <span ref="root" class="cinematic-stagger-text" :class="{ 'is-visible': isVisible }">
    <span
      v-for="(character, index) in characters"
      :key="`${character}-${index}`"
      class="cinematic-stagger-character"
      :style="{ '--character-delay': `${index * 0.07}s` }"
    >{{ character === ' ' ? '\u00a0' : character }}</span>
  </span>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const root = ref(null)
const isVisible = ref(false)
const characters = computed(() => Array.from(props.text))
let observer = null

onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      // Do not disconnect after the first reveal: copy should replay when it
      // leaves and later re-enters the viewport in either direction.
      isVisible.value = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.2)
    },
    { threshold: 0.2 }
  )

  observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.cinematic-stagger-text {
  display: inline-block;
}

.cinematic-stagger-character {
  display: inline-block;
  opacity: 0;
  transform: translate3d(0, 0.34em, 0);
  transition:
    opacity 720ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--character-delay);
}

.cinematic-stagger-text.is-visible .cinematic-stagger-character {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

@media (prefers-reduced-motion: reduce) {
  .cinematic-stagger-character {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
