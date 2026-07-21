<template>
  <div
    class="progress-walker"
    :class="[
      { walking: isPlaying, dragging, 'assets-ready': assetsReady },
      `weather-${weatherMode}`,
      `ip-${activeProgressCharacter}`,
      `preset-${backgroundSettings.preset}`
    ]"
    aria-hidden="true"
  >
    <span class="progress-walk-cycle">
      <span v-if="activeProgressCharacter === 'shinchan'" class="progress-weather" :class="`progress-weather--${weatherMode}`" aria-hidden="true">
        <template v-if="weatherMode === 'storm'">
          <span class="progress-rain-cloud"></span>
          <span class="progress-raindrops"><i></i><i></i><i></i></span>
          <span class="progress-lightning"><i></i><i></i></span>
        </template>
        <span v-else-if="weatherMode === 'sun' || weatherMode === 'sunset'" class="progress-theme-sun"><i></i></span>
        <span v-else-if="weatherMode === 'parade'" class="progress-theme-parade"><i></i><i></i><i></i><i></i><i></i></span>
        <span v-else-if="weatherMode === 'night'" class="progress-theme-night"><i></i><i></i><i></i></span>
        <span v-else-if="weatherMode === 'drizzle'" class="progress-theme-drizzle"><i></i><i></i><i></i><i></i></span>
        <span v-else class="progress-theme-breeze"><b>♪</b><i></i><i></i><i></i></span>
      </span>
      <template v-if="activeProgressCharacter === 'shinchan'">
        <img
          v-for="(src, index) in SHINCHAN_FRAMES"
          :key="src"
          :src="src"
          alt=""
          class="progress-walker-img"
          :class="index === 0
            ? 'progress-walker-img--stride'
            : index === SHINCHAN_FRAMES.length - 1
              ? 'progress-walker-img--pass'
              : 'progress-walker-img--mid'"
          width="120"
          height="68"
          decoding="async"
          draggable="false"
        />
      </template>
      <img
        v-else-if="activeProgressCharacter !== 'classic'"
        :src="ipCharacterSrc"
        alt=""
        class="progress-ip-character"
        :class="`progress-ip-character--${activeProgressCharacter}`"
        width="88"
        height="72"
        decoding="async"
        draggable="false"
      />
    </span>
    <!-- 经典主题的圆点是播放中的进度指示；暂停时不再停留在进度条末端。 -->
    <span v-if="activeProgressCharacter === 'classic' && isPlaying" class="progress-classic-bead" aria-hidden="true"></span>
    <span v-if="activeProgressCharacter === 'shinchan'" class="progress-shiro-leash" aria-hidden="true"></span>
    <span v-if="activeProgressCharacter === 'shinchan'" class="progress-shiro-cycle" aria-hidden="true">
      <img
        v-for="(src, index) in SHIRO_FRAMES"
        :key="src"
        :src="src"
        alt=""
        class="progress-shiro-frame"
        :class="index === 0
          ? 'progress-shiro-frame--stride'
          : index === SHIRO_FRAMES.length - 1
            ? 'progress-shiro-frame--pass'
            : 'progress-shiro-frame--mid'"
        width="96"
        height="64"
        decoding="async"
        draggable="false"
      />
    </span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp } from '../config/musicThemeCatalog'

const props = defineProps({
  isPlaying: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false }
})

const { settings: backgroundSettings } = useMusicBackground()
const WEATHER_BY_PRESET = {
  'kasukabe-sky': 'sun',
  'family-picnic': 'breeze',
  'sunset-road': 'sunset',
  'starry-radio': 'night',
  'crayon-room': 'breeze',
  'rainy-day': 'drizzle',
  'midnight-cinema': 'night',
  'motion-walk': 'sun',
  'motion-rain': 'storm',
  'motion-parade': 'parade',
  'hello-kitty-garden': 'breeze',
  'hello-kitty-midnight': 'night',
  'hello-kitty-dream': 'sunset',
  'hello-kitty-patisserie': 'breeze',
  'hello-kitty-ribbon-cinema': 'sunset',
  'hello-kitty-sakura-breeze': 'breeze',
  'hello-kitty-candy-carousel': 'sunset',
  'kuromi-neon': 'night',
  'kuromi-midnight': 'night',
  'kuromi-night-flight': 'night',
  'kuromi-arcade-noir': 'night',
  'kuromi-violet-library': 'night',
  'kuromi-sticker-storm': 'night',
  'kuromi-vinyl-rush': 'night'
}
const activeIp = computed(() => getMusicThemeIp(backgroundSettings.preset))
const activeProgressCharacter = computed(() => {
  const character = backgroundSettings.progressCharacter || 'theme'
  if (character !== 'theme') return character
  return backgroundSettings.mode === 'custom' ? 'classic' : activeIp.value
})
const weatherMode = computed(() => (
  backgroundSettings.mode === 'default'
    ? WEATHER_BY_PRESET[backgroundSettings.preset] || 'breeze'
    : 'breeze'
))

const SHINCHAN_FRAMES = [
  '/images/progress-shinchan-walk-stride.png',
  '/images/progress-shinchan-walk-mid.png',
  '/images/progress-shinchan-walk-pass.png'
]
const SHIRO_FRAMES = [
  '/images/progress-shiro-walk-stride.png',
  '/images/progress-shiro-walk-mid.png',
  '/images/progress-shiro-walk-pass.png'
]
const IP_PROGRESS_ASSETS = {
  'hello-kitty': '/images/ip-themes/hello-kitty-progress-head.png',
  kuromi: '/images/ip-themes/kuromi-progress-head.png'
}
const IP_PROGRESS_PRELOAD = Object.values(IP_PROGRESS_ASSETS)

const assetsReady = ref(false)
const ipCharacterSrc = computed(() => IP_PROGRESS_ASSETS[activeProgressCharacter.value] || IP_PROGRESS_ASSETS['hello-kitty'])
let disposed = false

const preloadFrame = (src) => new Promise((resolve) => {
  const image = new Image()
  let settled = false
  const finish = () => {
    if (settled) return
    settled = true
    resolve()
  }

  image.addEventListener('load', finish, { once: true })
  image.addEventListener('error', finish, { once: true })
  image.src = src
  if (image.complete) finish()
})

onMounted(async () => {
  await Promise.all([...SHINCHAN_FRAMES, ...SHIRO_FRAMES, ...IP_PROGRESS_PRELOAD].map(preloadFrame))
  if (disposed) return

  requestAnimationFrame(() => {
    if (disposed) return
    assetsReady.value = true
  })
})

onBeforeUnmount(() => {
  disposed = true
})
</script>
