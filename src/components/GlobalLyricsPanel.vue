<template>
  <Transition name="global-lyrics-fade">
    <aside
      v-if="visible"
      ref="panelRef"
      class="global-lyrics-panel global-lyrics-glass"
      :class="[
        `ip-${activeLyricsIp}`,
        `preset-${settings.preset}`,
        {
          'is-dragging': isDragging,
          'is-locked': lyricsAppearance.locked
        }
      ]"
      :style="panelStyle"
      aria-label="桌面歌词"
      @mousedown="onDragStart"
      @touchstart.passive="onTouchDragStart"
    >
      <div
        v-if="settings.showShinchan"
        class="global-lyrics-peeker"
        :class="[
          `is-${peekerMood}`,
          `ip-${activeLyricsIp}`,
          { 'is-dizzy': isPeekerDizzy, 'is-rain-theme': isRainTheme && isShinchanLyricsTheme }
        ]"
        aria-hidden="true"
      >
        <div v-if="isShinchanLyricsTheme" class="global-lyrics-peeker-character">
          <i v-if="isRainTheme" class="global-lyrics-rain-handle" aria-hidden="true"></i>
          <img
            class="global-lyrics-peeker-frame global-lyrics-peeker-frame--open"
            src="/images/lyrics/shinchan-peek-open.png"
            alt=""
          >
          <img
            class="global-lyrics-peeker-frame global-lyrics-peeker-frame--blink"
            src="/images/lyrics/shinchan-peek-blink.png"
            alt=""
          >
          <span v-if="isRainTheme" class="global-lyrics-rain-gear" aria-hidden="true">
            <i class="global-lyrics-rain-umbrella"></i>
            <i class="global-lyrics-rain-drop"></i>
            <i class="global-lyrics-rain-drop"></i>
            <i class="global-lyrics-rain-drop"></i>
          </span>
          <span class="global-lyrics-peeker-eyes" :style="eyeLookStyle">
            <i class="global-lyrics-peeker-eye global-lyrics-peeker-eye--left">
              <span class="global-lyrics-peeker-eyeball"></span>
            </i>
            <i class="global-lyrics-peeker-eye global-lyrics-peeker-eye--right">
              <span class="global-lyrics-peeker-eyeball"></span>
            </i>
          </span>

          <span class="global-lyrics-sleep-scene">
            <i>Z</i><i>Z</i><i>Z</i>
            <b></b>
          </span>

          <span class="global-lyrics-happy-scene">
            <i>♪</i><i>♫</i><i>♥</i>
            <b></b><b></b>
          </span>

          <span class="global-lyrics-dizzy-scene">
            <i>★</i><i>★</i><i>★</i>
            <b>×</b><b>×</b>
          </span>
        </div>
        <div
          v-else
          class="global-lyrics-ip-peeker-stage"
          :class="`global-lyrics-ip-peeker-stage--${activeLyricsIp}`"
        >
          <img
            class="global-lyrics-ip-peeker"
            :class="`global-lyrics-ip-peeker--${activeLyricsIp}`"
            :src="activeLyricsPeekerSrc"
            alt=""
          >
          <span class="global-lyrics-ip-peeker-blink" aria-hidden="true"><i></i><i></i></span>
          <span class="global-lyrics-ip-peeker-mood" aria-hidden="true"><i></i><i></i><b></b></span>
        </div>
      </div>

      <div v-if="settings.showShinchan" class="global-lyrics-shinchan" aria-hidden="true">
        <span class="global-lyrics-shinchan-scene" :style="{ backgroundImage: `url('${activeDecor.image}')` }"></span>
        <span class="global-lyrics-shinchan-label">{{ activeDecor.label }}</span>
        <span class="global-lyrics-shinchan-dot global-lyrics-shinchan-dot--red"></span>
        <span class="global-lyrics-shinchan-dot global-lyrics-shinchan-dot--yellow"></span>
        <span class="global-lyrics-shinchan-crayon"></span>
      </div>

      <div ref="settingsRef" class="global-lyrics-settings">
        <button
          class="global-lyrics-settings-toggle"
          type="button"
          aria-label="桌面歌词显示设置"
          :aria-expanded="showAppearanceSettings"
          @mousedown.stop
          @touchstart.stop
          @click.stop="showAppearanceSettings = !showAppearanceSettings"
        >
          Aa
        </button>

        <Transition name="global-lyrics-settings-pop">
          <section
            v-if="showAppearanceSettings"
            class="global-lyrics-settings-popover"
            aria-label="桌面歌词显示设置"
            @mousedown.stop
            @touchstart.stop
            @click.stop
          >
            <header>
              <strong>歌词样式</strong>
              <button type="button" @click="resetLyricsAppearance">恢复默认</button>
            </header>

            <div class="global-lyrics-setting-field global-lyrics-font-field">
              <span>字体 <em>点击即可预览</em></span>
              <div class="global-lyrics-font-grid" role="radiogroup" aria-label="桌面歌词字体">
                <button
                  v-for="font in fontOptions"
                  :key="font.value"
                  type="button"
                  class="global-lyrics-font-option"
                  :class="{ active: lyricsAppearance.font === font.value }"
                  :style="{ fontFamily: FONT_STACKS[font.value] }"
                  role="radio"
                  :aria-checked="lyricsAppearance.font === font.value"
                  @click="lyricsAppearance.font = font.value"
                >
                  <span class="global-lyrics-font-sample">春 Aa</span>
                  <small>{{ font.label }}</small>
                  <i aria-hidden="true">✓</i>
                </button>
              </div>
            </div>

            <label class="global-lyrics-setting-field">
              <span>字号 <em>{{ lyricsAppearance.size }}px</em></span>
              <input v-model.number="lyricsAppearance.size" type="range" min="12" max="26" step="1">
            </label>

            <div class="global-lyrics-setting-field">
              <span>颜色</span>
              <div class="global-lyrics-color-row">
                <button
                  v-for="color in lyricColorPresets"
                  :key="color"
                  type="button"
                  class="global-lyrics-color-dot"
                  :class="{ active: lyricsAppearance.color === color }"
                  :style="{ background: color }"
                  :aria-label="`使用颜色 ${color}`"
                  @click="lyricsAppearance.color = color"
                ></button>
                <label class="global-lyrics-custom-color" aria-label="自定义歌词颜色">
                  <input
                    type="color"
                    :value="lyricsAppearance.color || '#e85d68'"
                    @input="lyricsAppearance.color = $event.target.value"
                  >
                </label>
                <button class="global-lyrics-follow-theme" type="button" @click="lyricsAppearance.color = ''">跟随主题</button>
              </div>
            </div>

            <label class="global-lyrics-lock-setting">
              <span>
                <strong>锁定位置</strong>
                <small>锁定后不会被误拖动</small>
              </span>
              <input v-model="lyricsAppearance.locked" type="checkbox">
              <i aria-hidden="true"></i>
            </label>
          </section>
        </Transition>
      </div>

      <button
        class="global-lyrics-close"
        type="button"
        aria-label="关闭桌面歌词"
        @mousedown.stop
        @touchstart.stop
        @click.stop="toggleGlobalLyrics"
      >
        ×
      </button>

      <div class="global-lyrics-body">
        <div v-if="isLyricsLoading" class="global-lyrics-status">
          歌词加载中...
        </div>
        <div v-else-if="!parsedLyrics.length" class="global-lyrics-status">
          {{ lyricsEmptyText }}
        </div>
        <div v-else-if="hasUnsyncedLyrics" class="global-lyrics-status">
          已找到普通文本歌词，请在歌词页面查看
        </div>
        <div v-else ref="viewportRef" class="global-lyrics-viewport">
          <div
            class="global-lyrics-track"
            :class="{ 'is-sliding': isSliding }"
            :style="trackStyle"
          >
            <p
              v-for="(line, slot) in trackLines"
              :key="`${slideKey}-${line.index}-${slot}`"
              class="global-lyrics-line is-clickable"
              :class="lineSlotClass(slot)"
              @click.stop="onLineClick(line)"
            >
              {{ line.text }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { usePlayer } from '../composables/usePlayer'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp } from '../config/musicThemeCatalog'
import '../css/GlobalLyrics.css'

const POSITION_KEY = 'music-global-lyrics-position'
const APPEARANCE_KEY = 'music-global-lyrics-appearance'
const SLIDE_MS = 380
const DEFAULT_APPEARANCE = { font: 'system', size: 18, color: '', locked: false }

const route = useRoute()
const { settings } = useMusicBackground()
const panelRef = ref(null)
const settingsRef = ref(null)
const viewportRef = ref(null)
const position = ref(loadPosition())
const isDragging = ref(false)
const trackLines = ref([])
const isSliding = ref(false)
const trackOffset = ref(0)
const lineHeightPx = ref(36)
const slideKey = ref(0)
const lyricsAppearance = ref(loadLyricsAppearance())
const showAppearanceSettings = ref(false)
const eyeOffset = ref({ x: 0, y: 0 })
const peekerMood = ref('watching')
const isPeekerDizzy = ref(false)
const activeLyricsIp = computed(() => getMusicThemeIp(settings.preset))
const isShinchanLyricsTheme = computed(() => activeLyricsIp.value === 'shinchan')
const activeLyricsPeekerSrc = computed(() => ({
  'hello-kitty': '/images/ip-themes/hello-kitty-progress-head.png',
  kuromi: '/images/ip-themes/kuromi-progress-head.png'
}[activeLyricsIp.value] || '/images/lyrics/shinchan-peek-open.png'))
const isRainTheme = computed(() => (
  isShinchanLyricsTheme.value
  && settings.mode === 'default'
  && settings.preset === 'motion-rain'
))

const fontOptions = [
  { label: '系统黑体', value: 'system' },
  { label: '圆润字体', value: 'rounded' },
  { label: '宋体', value: 'serif' },
  { label: '等宽字体', value: 'mono' }
]

const lyricColorPresets = ['#e85d68', '#d59a32', '#2f967c', '#3c7fa6', '#8a5f45']

const FONT_STACKS = {
  system: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
  rounded: '"Arial Rounded MT Bold", "PingFang SC", "Microsoft YaHei", sans-serif',
  serif: '"Songti SC", SimSun, Georgia, serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
}

const LYRICS_THEME_PALETTES = {
  'kasukabe-sky': { accent: '#d49a45', surface: 'rgba(255, 252, 239, 0.96)', text: '#4d5360', muted: '#817867' },
  'family-picnic': { accent: '#6f9f62', surface: 'rgba(245, 252, 239, 0.96)', text: '#3e5542', muted: '#718072' },
  'sunset-road': { accent: '#d67c68', surface: 'rgba(255, 245, 238, 0.96)', text: '#624b4a', muted: '#8d716d' },
  'starry-radio': { accent: '#c3a45f', surface: 'rgba(28, 38, 66, 0.96)', text: '#f5ecda', muted: '#b9b9c7' },
  'crayon-room': { accent: '#c47f4f', surface: 'rgba(255, 248, 233, 0.96)', text: '#5a4b3e', muted: '#897767' },
  'rainy-day': { accent: '#4e8eae', surface: 'rgba(239, 248, 252, 0.96)', text: '#3f5667', muted: '#748797' },
  'midnight-cinema': { accent: '#c79a57', surface: 'rgba(27, 25, 29, 0.97)', text: '#f4eadc', muted: '#b9afa4' },
  'motion-walk': { accent: '#6fa35f', surface: 'rgba(247, 252, 237, 0.96)', text: '#475841', muted: '#788372' },
  'motion-rain': { accent: '#4388aa', surface: 'rgba(235, 246, 251, 0.97)', text: '#385469', muted: '#708899' },
  'motion-parade': { accent: '#d17963', surface: 'rgba(255, 247, 235, 0.96)', text: '#5e4c48', muted: '#8b7670' },
  'hello-kitty-garden': { accent: '#c93252', surface: 'rgba(255, 250, 244, 0.97)', text: '#642a39', muted: '#9a7180' },
  'hello-kitty-dream': { accent: '#d65378', surface: 'rgba(255, 246, 251, 0.97)', text: '#603449', muted: '#9b7b8c' },
  'hello-kitty-midnight': { accent: '#d7ad62', surface: 'rgba(45, 10, 21, 0.98)', text: '#f7e4c8', muted: '#c5a88f' },
  'hello-kitty-patisserie': { accent: '#df6c7f', surface: 'rgba(255, 250, 240, 0.97)', text: '#6c3944', muted: '#a9787d' },
  'hello-kitty-ribbon-cinema': { accent: '#ef9d7b', surface: 'rgba(53, 11, 26, 0.98)', text: '#fff0d9', muted: '#e5bcae' },
  'hello-kitty-sakura-breeze': { accent: '#df729a', surface: 'rgba(255, 248, 251, 0.97)', text: '#68394d', muted: '#a87a8c' },
  'hello-kitty-candy-carousel': { accent: '#d86695', surface: 'rgba(255, 248, 250, 0.97)', text: '#71384f', muted: '#a77d8d' },
  'kuromi-neon': { accent: '#e84f9c', surface: 'rgba(33, 20, 40, 0.97)', text: '#fff2fb', muted: '#c8afcf' },
  'kuromi-night-flight': { accent: '#f062aa', surface: 'rgba(25, 18, 46, 0.97)', text: '#f8ecff', muted: '#c5b7d6' },
  'kuromi-midnight': { accent: '#ff4ca3', surface: 'rgba(7, 5, 10, 0.98)', text: '#fff1fa', muted: '#bda7c5' },
  'kuromi-arcade-noir': { accent: '#f178c1', surface: 'rgba(16, 8, 31, 0.98)', text: '#fff1fb', muted: '#cfb7df' },
  'kuromi-violet-library': { accent: '#b995ee', surface: 'rgba(26, 18, 45, 0.98)', text: '#f5eeff', muted: '#c2b4d9' },
  'kuromi-sticker-storm': { accent: '#f777c1', surface: 'rgba(36, 12, 45, 0.98)', text: '#fff1fa', muted: '#d5b4cd' },
  'kuromi-vinyl-rush': { accent: '#dd67ad', surface: 'rgba(23, 8, 31, 0.98)', text: '#fff1fb', muted: '#c9afcf' }
}

let slideTimer = null
let dragPointer = null
let dragFrame = 0
let pendingDragPosition = null
let peekerMoodTimer = null
let peekerMoodIndex = 0
let peekerDizzyTimer = null
let peekerPointerIdleTimer = null
const isPeekerPointerActive = ref(false)

const DIZZY_SPEED_THRESHOLD = 0.82
const DIZZY_SUSTAIN_DURATION = 420
const DIZZY_RECOVERY_DURATION = 1050

const PEEKER_MOOD_SEQUENCE = [
  { mood: 'watching', duration: 9500 },
  { mood: 'sleepy', duration: 6200 },
  { mood: 'watching', duration: 4800 },
  { mood: 'watching', duration: 5200 },
  { mood: 'happy', duration: 5600 }
]

const DESKTOP_LYRICS_DECOR = {
  'kasukabe-sky': { label: '春日部晴空', image: '/images/shinchan-playlists/cover-09.jpg' },
  'family-picnic': { label: '野原家野餐', image: '/images/shinchan-playlists/cover-03.jpg' },
  'sunset-road': { label: '放学晚霞', image: '/images/shinchan-playlists/cover-15.jpg' },
  'starry-radio': { label: '春日部夜电台', image: '/images/shinchan-playlists/cover-10.jpg' },
  'crayon-room': { label: '蜡笔涂鸦屋', image: '/images/shinchan-playlists/cover-07.jpg' },
  'rainy-day': { label: '小新雨天', image: '/images/shinchan-playlists/cover-01.jpg' },
  'midnight-cinema': { label: '春日部深夜影院', image: '/images/shinchan-playlists/cover-02.jpg' },
  'motion-walk': { label: '放学晴空', image: '/images/music-themes/motion-walk-scene.png' },
  'motion-rain': { label: '雷雨夜行', image: '/images/music-themes/motion-rain-scene.png' },
  'motion-parade': { label: '春日部庆典巡游', image: '/images/music-themes/motion-parade-scene.png' },
  'hello-kitty-garden': { label: 'Kitty 草莓花园', image: '/images/ip-themes/hello-kitty-main.png' },
  'hello-kitty-dream': { label: 'Kitty 云端梦游', image: '/images/ip-themes/hello-kitty-angel.png' },
  'hello-kitty-midnight': { label: 'Kitty 红丝绒夜宴', image: '/images/ip-themes/hello-kitty-friends.png' },
  'hello-kitty-patisserie': { label: 'Kitty 草莓甜品屋', image: '/images/music-themes/kitty-strawberry-patisserie.png' },
  'hello-kitty-ribbon-cinema': { label: 'Kitty 缎带影院', image: '/images/music-themes/kitty-ribbon-cinema.png' },
  'hello-kitty-sakura-breeze': { label: 'Kitty 樱花纸笺', image: '/images/music-themes/kitty-sakura-letter.png' },
  'hello-kitty-candy-carousel': { label: 'Kitty 月光旋转木马', image: '/images/music-themes/kitty-carousel-sunrise.png' },
  'kuromi-neon': { label: '库洛米霓虹卧室', image: '/images/ip-themes/kuromi-main.png' },
  'kuromi-night-flight': { label: '库洛米午夜飞行', image: '/images/ip-themes/kuromi-melody.png' },
  'kuromi-midnight': { label: '库洛米暗夜舞台', image: '/images/music-themes/kuromi-midnight-stage.png' },
  'kuromi-arcade-noir': { label: '库洛米月光街机厅', image: '/images/music-themes/kuromi-arcade-noir.png' },
  'kuromi-violet-library': { label: '库洛米紫夜书房', image: '/images/music-themes/kuromi-violet-library.png' },
  'kuromi-sticker-storm': { label: '库洛米贴纸风暴', image: '/images/music-themes/kuromi-sticker-storm.png' },
  'kuromi-vinyl-rush': { label: '库洛米黑胶夜行', image: '/images/music-themes/kuromi-vinyl-night.png' }
}

const activeDecor = computed(() => (
  DESKTOP_LYRICS_DECOR[settings.preset] || DESKTOP_LYRICS_DECOR['kasukabe-sky']
))

const activeLyricsPalette = computed(() => (
  LYRICS_THEME_PALETTES[settings.preset] || LYRICS_THEME_PALETTES['kasukabe-sky']
))

const {
  currentSong,
  parsedLyrics,
  currentLyricIndex,
  isLyricsLoading,
  showGlobalLyrics,
  toggleGlobalLyrics,
  seek
} = usePlayer()

const lyricsEmptyText = computed(() => {
  if (currentSong.value?.isPreview || currentSong.value?.source === 'online') {
    return '试听片段无法与完整版歌词准确同步'
  }
  if (currentSong.value?.source === 'audius') {
    if (currentSong.value?.isInstrumental) {
      return '作者已标注这首在线歌曲为纯音乐'
    }
    return '该在线歌曲暂无匹配歌词'
  }
  return '暂无歌词'
})

const hasUnsyncedLyrics = computed(() => parsedLyrics.value.some(line => line.unsynced))

const visible = computed(() => {
  if (!showGlobalLyrics.value) return false
  if (Capacitor.isNativePlatform()) return false

  const compactPlayer = window.matchMedia(
    '(max-width: 1180px), (max-width: 1366px) and (pointer: coarse)'
  ).matches
  if (compactPlayer) return false
  if (!route.path.startsWith('/music-player')) return true

  // 全屏播放器在桌面端仍应显示悬浮歌词；手机和 iPad 使用自己的
  // 唱片页 / 歌词页，避免悬浮卡片遮住触控区域。
  return true
})

function getLyricsCardMetrics() {
  const fontSize = Math.min(26, Math.max(12, Number(lyricsAppearance.value.size) || 16))
  const enlargement = Math.max(0, fontSize - 16)
  return {
    width: 300 + enlargement * 12,
    lineHeight: Math.max(34, Math.round(fontSize * 2.25))
  }
}

const panelStyle = computed(() => {
  const cardMetrics = getLyricsCardMetrics()
  const palette = activeLyricsPalette.value
  const style = {
    '--desktop-lyrics-font': FONT_STACKS[lyricsAppearance.value.font] || FONT_STACKS.system,
    '--desktop-lyrics-size': `${lyricsAppearance.value.size}px`,
    '--desktop-lyrics-color': lyricsAppearance.value.color || palette.text,
    '--global-lyrics-panel-width': `${cardMetrics.width}px`,
    '--global-lyrics-line-height': `${cardMetrics.lineHeight}px`,
    '--lyrics-settings-accent': palette.accent,
    '--lyrics-settings-surface': palette.surface,
    '--lyrics-settings-text': palette.text,
    '--lyrics-settings-muted': palette.muted,
    '--lyrics-panel-accent': palette.accent,
    '--lyrics-panel-surface': palette.surface,
    '--lyrics-panel-text': palette.text,
    '--lyrics-panel-muted': palette.muted
  }
  if (!position.value) return style
  return Object.assign(style, {
    top: `${position.value.y}px`,
    left: `${position.value.x}px`,
    right: 'auto',
    bottom: 'auto'
  })
})

const eyeLookStyle = computed(() => ({
  '--eye-look-x': `${eyeOffset.value.x}px`,
  '--eye-look-y': `${eyeOffset.value.y}px`
}))

const trackStyle = computed(() => ({
  transform: `translate3d(0, ${-trackOffset.value * lineHeightPx.value}px, 0)`
}))

function toLine(entry, index) {
  return { text: entry.text, time: entry.time, index }
}

function buildRestLines(idx) {
  const lyrics = parsedLyrics.value
  if (!lyrics.length) return []

  if (idx < 0) {
    return [lyrics[0], lyrics[1]].filter(Boolean).map((line, i) => toLine(line, i))
  }

  const lines = [lyrics[idx]]
  if (lyrics[idx + 1]) lines.push(lyrics[idx + 1])
  return lines.map((line, offset) => toLine(line, idx + offset))
}

function resetTrack(idx = currentLyricIndex.value) {
  trackLines.value = buildRestLines(idx)
  trackOffset.value = 0
  isSliding.value = false
}

function lineSlotClass(slot) {
  if (!isSliding.value) {
    return slot === 0 ? 'active' : 'next'
  }
  if (trackOffset.value === 0) {
    if (slot === 0) return 'outgoing'
    if (slot === 1) return 'active incoming'
    if (slot === 2) return 'next entering'
    return ''
  }
  if (slot === 1) return 'active'
  if (slot === 2) return 'next'
  return 'passed'
}

function measureLineHeight() {
  const viewport = viewportRef.value
  if (!viewport) return
  const sample = viewport.querySelector('.global-lyrics-line')
  if (sample) {
    lineHeightPx.value = Math.round(sample.getBoundingClientRect().height)
  }
}

function clearSlideTimer() {
  if (slideTimer) {
    clearTimeout(slideTimer)
    slideTimer = null
  }
}

function runSlide(oldIdx, newIdx) {
  const lyrics = parsedLyrics.value
  const prev = lyrics[oldIdx]
  const curr = lyrics[newIdx]
  const next = lyrics[newIdx + 1]
  if (!prev || !curr) {
    resetTrack(newIdx)
    return
  }

  clearSlideTimer()
  isSliding.value = false
  trackOffset.value = 0
  trackLines.value = [
    toLine(prev, oldIdx),
    toLine(curr, newIdx),
    next ? toLine(next, newIdx + 1) : null
  ].filter(Boolean)
  slideKey.value += 1

  nextTick(() => {
    measureLineHeight()
    requestAnimationFrame(() => {
      isSliding.value = true
      requestAnimationFrame(() => {
        trackOffset.value = 1
      })
    })
  })

  slideTimer = setTimeout(() => {
    resetTrack(newIdx)
    slideTimer = null
  }, SLIDE_MS)
}

function loadPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return parsed
    }
  } catch {
    /* ignore */
  }
  return null
}

function savePosition() {
  if (!position.value) return
  localStorage.setItem(POSITION_KEY, JSON.stringify(position.value))
}

function clampPosition(x, y) {
  const panel = panelRef.value
  if (!panel) return { x, y }
  const minY = settings.showShinchan ? 112 : 8
  const targetWidth = Math.min(getLyricsCardMetrics().width, window.innerWidth - 24)
  const maxX = Math.max(8, window.innerWidth - Math.max(panel.offsetWidth, targetWidth) - 8)
  const maxY = Math.max(minY, window.innerHeight - panel.offsetHeight - 8)
  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(minY, y), maxY)
  }
}

function loadLyricsAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(APPEARANCE_KEY) || '{}')
    return { ...DEFAULT_APPEARANCE, ...saved }
  } catch {
    return { ...DEFAULT_APPEARANCE }
  }
}

function resetLyricsAppearance() {
  lyricsAppearance.value = { ...DEFAULT_APPEARANCE }
}

function clearPeekerMoodTimer() {
  if (!peekerMoodTimer) return
  clearTimeout(peekerMoodTimer)
  peekerMoodTimer = null
}

function clearPeekerPointerIdleTimer() {
  if (!peekerPointerIdleTimer) return
  clearTimeout(peekerPointerIdleTimer)
  peekerPointerIdleTimer = null
}

function canRunPeekerMoods() {
  return settings.showShinchan && visible.value
}

function schedulePeekerMood() {
  if (!canRunPeekerMoods() || isPeekerPointerActive.value) return
  clearPeekerMoodTimer()
  const state = PEEKER_MOOD_SEQUENCE[peekerMoodIndex]
  peekerMood.value = state.mood
  peekerMoodTimer = setTimeout(() => {
    peekerMoodIndex = (peekerMoodIndex + 1) % PEEKER_MOOD_SEQUENCE.length
    schedulePeekerMood()
  }, state.duration)
}

function startPeekerMoods() {
  if (!canRunPeekerMoods() || isPeekerPointerActive.value) return
  peekerMoodIndex = 0
  schedulePeekerMood()
}

function stopPeekerMoods() {
  clearPeekerMoodTimer()
  peekerMood.value = 'watching'
}

function holdPeekerWatchingForPointer() {
  if (!isShinchanLyricsTheme.value) return

  isPeekerPointerActive.value = true
  clearPeekerMoodTimer()
  peekerMood.value = 'watching'
  clearPeekerPointerIdleTimer()
  peekerPointerIdleTimer = setTimeout(() => {
    peekerPointerIdleTimer = null
    isPeekerPointerActive.value = false
    startPeekerMoods()
  }, 900)
}

function closeAppearanceSettingsOnOutside(event) {
  if (!showAppearanceSettings.value) return
  if (settingsRef.value?.contains(event.target)) return
  showAppearanceSettings.value = false
}

function onEyePointerMove(event) {
  const panel = panelRef.value
  if (!panel || !settings.showShinchan || !isShinchanLyricsTheme.value) return
  const eyeLayer = panel.querySelector('.global-lyrics-peeker-eyes')
  const rect = eyeLayer?.getBoundingClientRect() || panel.getBoundingClientRect()
  const eyeCenterX = rect.left + rect.width / 2
  const eyeCenterY = eyeLayer ? rect.top + 61 : rect.top - 52
  const dx = event.clientX - eyeCenterX
  const dy = event.clientY - eyeCenterY
  const distance = Math.hypot(dx, dy)

  if (distance > 430) {
    eyeOffset.value = { x: 0, y: 0 }
    return
  }

  // 鼠标靠近时，小新只专注看向鼠标；不与瞌睡、开心等定时表情抢动作。
  holdPeekerWatchingForPointer()

  const directionX = distance ? dx / distance : 0
  const directionY = distance ? dy / distance : 0
  const strength = Math.min(1, distance / 145)

  eyeOffset.value = {
    x: directionX * 4.8 * strength,
    y: directionY * 3.5 * strength
  }
}

function resolvePanelOrigin() {
  const panel = panelRef.value
  if (!panel) return { x: 0, y: 0 }
  const rect = panel.getBoundingClientRect()
  return { x: rect.left, y: rect.top }
}

function onDragMove(clientX, clientY) {
  if (!dragPointer) return
  const now = performance.now()
  const elapsed = Math.max(16, now - dragPointer.lastAt)
  const distance = Math.hypot(clientX - dragPointer.lastX, clientY - dragPointer.lastY)
  const speed = distance / elapsed
  dragPointer.smoothedSpeed = dragPointer.smoothedSpeed * 0.58 + speed * 0.42

  if (dragPointer.smoothedSpeed >= DIZZY_SPEED_THRESHOLD && distance >= 3) {
    dragPointer.fastDragDuration = Math.min(
      DIZZY_SUSTAIN_DURATION + 180,
      dragPointer.fastDragDuration + elapsed
    )
  } else {
    dragPointer.fastDragDuration = Math.max(0, dragPointer.fastDragDuration - elapsed * 1.8)
  }

  if (dragPointer.fastDragDuration >= DIZZY_SUSTAIN_DURATION) {
    isPeekerDizzy.value = true
    if (peekerDizzyTimer) clearTimeout(peekerDizzyTimer)
    peekerDizzyTimer = setTimeout(() => {
      isPeekerDizzy.value = false
      peekerDizzyTimer = null
    }, DIZZY_RECOVERY_DURATION)
  }

  dragPointer.lastX = clientX
  dragPointer.lastY = clientY
  dragPointer.lastAt = now
  const deltaX = clientX - dragPointer.startX
  const deltaY = clientY - dragPointer.startY
  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    dragPointer.moved = true
  }
  pendingDragPosition = clampPosition(
    dragPointer.originX + deltaX,
    dragPointer.originY + deltaY
  )
  if (!dragFrame) {
    dragFrame = requestAnimationFrame(() => {
      dragFrame = 0
      if (!pendingDragPosition) return
      position.value = pendingDragPosition
      pendingDragPosition = null
    })
  }
}

function onMouseMove(event) {
  onDragMove(event.clientX, event.clientY)
}

function onTouchMove(event) {
  if (!dragPointer) return
  event.preventDefault()
  onDragMove(event.touches[0].clientX, event.touches[0].clientY)
}

function stopDragging() {
  if (dragFrame) {
    cancelAnimationFrame(dragFrame)
    dragFrame = 0
  }
  if (pendingDragPosition) {
    position.value = pendingDragPosition
    pendingDragPosition = null
  }
  isDragging.value = false
  if (dragPointer?.moved) savePosition()
  dragPointer = null
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopDragging)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', stopDragging)
}

function startDragging(clientX, clientY) {
  const origin = position.value || resolvePanelOrigin()
  if (!position.value) position.value = origin

  if (peekerDizzyTimer) {
    clearTimeout(peekerDizzyTimer)
    peekerDizzyTimer = null
  }
  isPeekerDizzy.value = false

  dragPointer = {
    startX: clientX,
    startY: clientY,
    originX: origin.x,
    originY: origin.y,
    lastX: clientX,
    lastY: clientY,
    lastAt: performance.now(),
    smoothedSpeed: 0,
    fastDragDuration: 0,
    moved: false
  }
  isDragging.value = true
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopDragging)
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('touchend', stopDragging)
}

function onDragStart(event) {
  if (lyricsAppearance.value.locked) return
  if (window.matchMedia('(max-width: 768px)').matches) return
  if (event.button !== 0 || event.target.closest('.global-lyrics-close, .global-lyrics-settings')) return
  event.preventDefault()
  startDragging(event.clientX, event.clientY)
}

function onTouchDragStart(event) {
  if (lyricsAppearance.value.locked) return
  if (window.matchMedia('(max-width: 768px)').matches) return
  if (event.target.closest('.global-lyrics-close, .global-lyrics-settings')) return
  startDragging(event.touches[0].clientX, event.touches[0].clientY)
}

function onLineClick(line) {
  if (typeof line?.time !== 'number') return
  seek(line.time)
}

watch(currentLyricIndex, (newIdx, oldIdx) => {
  if (oldIdx < 0 || newIdx <= oldIdx) {
    clearSlideTimer()
    resetTrack(newIdx)
    return
  }
  runSlide(oldIdx, newIdx)
})

watch(
  () => parsedLyrics.value.length,
  () => {
    clearSlideTimer()
    resetTrack()
    nextTick(measureLineHeight)
  }
)

watch(lyricsAppearance, (appearance) => {
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance))
  nextTick(() => {
    measureLineHeight()
    if (position.value) {
      position.value = clampPosition(position.value.x, position.value.y)
      savePosition()
    }
  })
}, { deep: true })

watch(showAppearanceSettings, (show) => {
  if (show) {
    document.addEventListener('pointerdown', closeAppearanceSettingsOnOutside)
    return
  }
  document.removeEventListener('pointerdown', closeAppearanceSettingsOnOutside)
})

watch([() => settings.showShinchan, activeLyricsIp], ([show, ip]) => {
  if (show && ip && visible.value) {
    startPeekerMoods()
    return
  }
  isPeekerPointerActive.value = false
  clearPeekerPointerIdleTimer()
  stopPeekerMoods()
})

watch(visible, (show) => {
  if (show) {
    window.addEventListener('mousemove', onEyePointerMove, { passive: true })
    if (settings.showShinchan) startPeekerMoods()
    resetTrack()
    nextTick(() => {
      measureLineHeight()
      if (position.value) {
        position.value = clampPosition(position.value.x, position.value.y)
      }
    })
    return
  }
  window.removeEventListener('mousemove', onEyePointerMove)
  isPeekerPointerActive.value = false
  clearPeekerPointerIdleTimer()
  stopPeekerMoods()
  showAppearanceSettings.value = false
  eyeOffset.value = { x: 0, y: 0 }
  stopDragging()
}, { immediate: true })

onUnmounted(() => {
  clearSlideTimer()
  clearPeekerMoodTimer()
  clearPeekerPointerIdleTimer()
  if (peekerDizzyTimer) clearTimeout(peekerDizzyTimer)
  window.removeEventListener('mousemove', onEyePointerMove)
  document.removeEventListener('pointerdown', closeAppearanceSettingsOnOutside)
  stopDragging()
})
</script>
