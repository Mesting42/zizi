<template>
  <div :class="['app-shell', `page-${currentPage}`, { 'is-native-app': isNativeApp }]">
    <AuroraBackground v-if="showAurora" />
    <Header v-if="!isLyricsPlayerPage && !isNativeApp" />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition :name="routeTransitionName" @after-enter="scheduleModuleEntrance">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer v-if="!isMusicPage" />

    <GlobalLyricsPanel />
    <NativeLyricsSettings :show-trigger="false" listen-for-native-open />
    <PlayerModeToast />

    <div
      v-if="edgeSwipeBack.visible"
      class="edge-swipe-back-indicator"
      :class="{ ready: edgeSwipeBack.ready }"
      :style="{ '--edge-swipe-progress': edgeSwipeBack.progress }"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <button
      v-if="isPlaying && !isMusicPage"
      class="floating-music-btn is-playing"
      type="button"
      aria-label="打开音乐播放器"
      @click="goToMusicPlayer"
    >
      <span class="floating-music-btn-ring" aria-hidden="true"></span>
      <svg class="floating-music-btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { preloadMusicRoutes } from './router'
import AuroraBackground from './components/AuroraBackground.vue'
import GlobalLyricsPanel from './components/GlobalLyricsPanel.vue'
import NativeLyricsSettings from './components/NativeLyricsSettings.vue'
import PlayerModeToast from './components/PlayerModeToast.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { usePlayer } from './composables/usePlayer'
import { useMusicBackground } from './composables/useMusicBackground'
import { getMusicThemeIp, MUSIC_THEME_PRESETS } from './config/musicThemeCatalog'
import { devicePerformanceProfile } from './utils/devicePerformance'

const route = useRoute()
const router = useRouter()
const isNativeApp = Capacitor.isNativePlatform()
const isMobilePerformance = devicePerformanceProfile.isMobilePerformance
const {
  isPlaying,
  togglePlay,
  currentSong,
  parsedLyrics,
  currentLyricIndex,
  showGlobalLyrics,
  setGlobalLyricsVisible
} = usePlayer()
const { settings: musicBackgroundSettings } = useMusicBackground()

if (isNativeApp) {
  document.documentElement.classList.add('native-music-app')
  document.body.classList.add('native-music-app')
}

const currentPage = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path === '/about') return 'about'
  if (path.startsWith('/articles') || path.startsWith('/category')) return 'articles'
  if (path.startsWith('/article')) return 'article'
  if (path.startsWith('/music') || path === '/music-player') return 'music'
  if (path.startsWith('/vivo-case') || path.startsWith('/foreign-case')) return 'case'
  return 'home'
})

const isLyricsPlayerPage = computed(() => route.path === '/music-player')
const isMusicPage = computed(() => route.path.startsWith('/music') || isLyricsPlayerPage.value)
const edgeSwipeBack = ref({
  visible: false,
  progress: 0,
  ready: false
})

let edgeSwipeTracking = false
let edgeSwipeLocked = false
let edgeSwipeStartX = 0
let edgeSwipeStartY = 0
let edgeSwipeLastX = 0

const isEdgeSwipeDevice = () => {
  if (isNativeApp) return true

  const isTabletOrPhoneWidth = window.matchMedia('(max-width: 1024px)').matches
  const isCoarseTablet = window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1366
  return isTabletOrPhoneWidth || isCoarseTablet
}

// 手机上的音乐 App 使用固定画布。拦截双指缩放，但不拦截单指滚动、横滑或组件拖动。
const preventNativePinchZoom = (event) => {
  if (!isNativeApp || event.touches?.length < 2) return
  event.preventDefault()
}

const preventNativeGestureZoom = (event) => {
  if (!isNativeApp) return
  event.preventDefault()
}

const hasEdgeSwipeDestination = () => {
  if (document.querySelector('.playlist-popup-layer')) return true
  if (route.path === '/music-player' && route.query.view === 'lyrics') return true
  if (route.path === '/music' || route.path === '/') return false
  return true
}

const isEdgeSwipeBlockedTarget = (target) => {
  if (!(target instanceof Element)) return false
  if (target.closest('.playlist-popup-layer')) return false

  return Boolean(target.closest([
    'input',
    'textarea',
    'select',
    '[contenteditable="true"]',
    '[role="slider"]',
    '[aria-modal="true"]',
    '.music-settings-overlay',
    '.search-results-popup'
  ].join(',')))
}

const resetEdgeSwipe = () => {
  edgeSwipeTracking = false
  edgeSwipeLocked = false
  edgeSwipeBack.value = {
    visible: false,
    progress: 0,
    ready: false
  }
}

const requestScopedBack = (source) => {
  const detail = { source, handled: false }
  window.dispatchEvent(new CustomEvent('mesting:request-back', { detail }))
  return detail.handled
}

const navigateBack = (source = 'button') => {
  if (requestScopedBack(source)) return true

  const fallback = (() => {
    if (route.path === '/music-player') return '/music'
    if (route.path === '/music/playlists') return '/music'
    if (route.path === '/music/queue') {
      const from = typeof route.query.from === 'string' ? route.query.from : ''
      return from.startsWith('/music') ? from : '/music'
    }
    if (route.path.startsWith('/music/playlist/')) return '/music'
    if (route.path.startsWith('/article/')) return '/articles'
    if (route.path.startsWith('/category/')) return '/articles'
    return '/'
  })()

  if (route.path === '/music' || route.path === '/') {
    return false
  }

  if (source !== 'native' && window.history.state?.back) {
    router.back()
  } else {
    router.replace(fallback)
  }
  return true
}

const requestNativeAppExit = () => {
  try {
    window.MestingNativeNavigation?.exitApp?.()
  } catch {
    // Web preview has no native bridge.
  }
}

const handleNativeBack = () => {
  if (!navigateBack('native')) {
    requestNativeAppExit()
  }
}

const syncNativeLyricsOverlay = () => {
  if (!isNativeApp || !window.MestingLyricsOverlay) return

  const index = currentLyricIndex.value
  const currentLine = index >= 0
    ? parsedLyrics.value[index]?.text
    : parsedLyrics.value[0]?.text
  const nextLine = index >= 0
    ? parsedLyrics.value[index + 1]?.text
    : parsedLyrics.value[1]?.text

  window.MestingLyricsOverlay.update?.(
    currentLine || '暂无同步歌词',
    nextLine || '',
    [currentSong.value?.title, currentSong.value?.artist].filter(Boolean).join(' · ')
  )
}

const handleNativeLyricsOverlayClosed = () => {
  setGlobalLyricsVisible(false)
}

const handleEdgeTouchStart = (event) => {
  if (!isEdgeSwipeDevice() || !hasEdgeSwipeDestination()) return
  if (event.touches.length !== 1 || isEdgeSwipeBlockedTarget(event.target)) return

  const touch = event.touches[0]
  if (touch.clientX > 28) return

  edgeSwipeTracking = true
  edgeSwipeLocked = false
  edgeSwipeStartX = touch.clientX
  edgeSwipeStartY = touch.clientY
  edgeSwipeLastX = touch.clientX
}

const handleEdgeTouchMove = (event) => {
  if (!edgeSwipeTracking || event.touches.length !== 1) return

  const touch = event.touches[0]
  const deltaX = Math.max(0, touch.clientX - edgeSwipeStartX)
  const deltaY = Math.abs(touch.clientY - edgeSwipeStartY)
  edgeSwipeLastX = touch.clientX

  if (!edgeSwipeLocked) {
    if (deltaY > 18 && deltaY > deltaX) {
      resetEdgeSwipe()
      return
    }
    if (deltaX < 10 || deltaX < deltaY * 1.25) return
    edgeSwipeLocked = true
  }

  event.preventDefault()
  const progress = Math.min(1, deltaX / 112)
  edgeSwipeBack.value = {
    visible: true,
    progress,
    ready: deltaX >= 76 && deltaY <= 68
  }
}

const handleEdgeTouchEnd = () => {
  if (!edgeSwipeTracking) return

  const shouldNavigate = edgeSwipeLocked
    && edgeSwipeBack.value.ready
    && edgeSwipeLastX - edgeSwipeStartX >= 76

  resetEdgeSwipe()
  if (shouldNavigate) navigateBack('edge-swipe')
}
// 音乐模块内部的页面共享同一张全屏主题背景。这里不再把旧页淡出到站点底色，
// 避免“全部歌单 → 音乐首页”时短暂露出白底，造成闪白。
const routeTransitionName = computed(() => (
  isMusicPage.value
    ? 'music-route-seamless'
    : (isMobilePerformance ? 'mobile-route-fast' : 'page-fade')
))
const showAurora = computed(() => !isMusicPage.value && !isMobilePerformance)
const MUSIC_DARK_PRESETS = new Set(['midnight-cinema', 'hello-kitty-midnight', 'kuromi-midnight'])
const MUSIC_THEME_BODY_CLASSES = [
  'music-ip-classic',
  'music-ip-shinchan',
  'music-ip-hello-kitty',
  'music-ip-kuromi',
  ...MUSIC_THEME_PRESETS.map(theme => `music-preset-${theme.id}`),
  'music-progress-style-classic',
  'music-progress-style-shinchan',
  'music-progress-style-hello-kitty',
  'music-progress-style-kuromi',
  'music-appearance-sunny',
  'music-appearance-dark'
]

const clearThemeTransitionLayers = () => {
  document.body.classList.remove('theme-transitioning')
}

let musicRouteHandoffTimer = 0
let wasMusicPage = false

const startMusicRouteHandoff = () => {
  if (isMobilePerformance) {
    document.body.classList.remove('music-route-handoff')
    return
  }

  if (musicRouteHandoffTimer) {
    window.clearTimeout(musicRouteHandoffTimer)
  }

  // 音乐页没有站点明暗开关；离开时先把目标页的站点配色接上，
  // 再让导航与页面底色自然过渡，避免出现灰色快照或突然跳色。
  document.body.classList.remove('music-route-handoff')
  // Force the handoff class to restart even when the user changes routes quickly.
  document.body.classList.remove('music-route-handoff')
  void document.body.offsetWidth
  document.body.classList.add('music-route-handoff')

  musicRouteHandoffTimer = window.setTimeout(() => {
    document.body.classList.remove('music-route-handoff')
    musicRouteHandoffTimer = 0
  }, 520)
}

const syncMusicColorMode = () => {
  const nowOnMusicPage = isMusicPage.value
  const isLeavingMusicPage = wasMusicPage && !nowOnMusicPage

  if (isLeavingMusicPage) startMusicRouteHandoff()

  document.body.classList.remove(...MUSIC_THEME_BODY_CLASSES)

  const activePreset = musicBackgroundSettings.preset || 'kasukabe-sky'
  const activeIp = getMusicThemeIp(activePreset)
  const requestedMusicAppearance = musicBackgroundSettings.customAppearance || 'auto'
  const usesClassicTheme = musicBackgroundSettings.mode === 'custom' || activePreset === 'classic'
  const activeMusicAppearance = usesClassicTheme
    ? (requestedMusicAppearance === 'auto' ? 'sunny' : requestedMusicAppearance)
    : 'auto'
  // Every Kuromi preset uses a dark canvas. Treat the whole IP family as dark
  // so teleported surfaces (search) and sibling routes (all playlists) do not
  // fall back to the site's light glass controls.
  const shouldUseMusicDarkTheme = usesClassicTheme
    ? activeMusicAppearance === 'dark'
    : activeIp === 'kuromi' || MUSIC_DARK_PRESETS.has(activePreset)
  const useMusicDarkTheme = nowOnMusicPage
    && shouldUseMusicDarkTheme

  if (nowOnMusicPage && musicBackgroundSettings.mode === 'default') {
    document.body.classList.add(`music-ip-${activeIp}`, `music-preset-${activePreset}`)
  } else if (nowOnMusicPage && usesClassicTheme) {
    document.body.classList.add('music-ip-classic', 'music-preset-classic')
  }

  if (nowOnMusicPage) {
    if (usesClassicTheme && (activeMusicAppearance === 'sunny' || activeMusicAppearance === 'dark')) {
      document.body.classList.add(`music-appearance-${activeMusicAppearance}`)
    }

    const selectedProgressStyle = musicBackgroundSettings.progressStyle || 'theme'
    const resolvedProgressStyle = selectedProgressStyle === 'theme'
      ? (usesClassicTheme ? 'classic' : '')
      : selectedProgressStyle

    if (resolvedProgressStyle) {
      document.body.classList.add(`music-progress-style-${resolvedProgressStyle}`)
    }
  }

  document.body.classList.toggle('music-theme-dark', useMusicDarkTheme)

  if (nowOnMusicPage) {
    // A quick return to music should not inherit the outgoing site-page handoff.
    document.body.classList.remove('music-route-handoff')
    document.body.classList.remove('dark-mode', 'theme-transitioning')
    document.documentElement.style.colorScheme = useMusicDarkTheme ? 'dark' : 'light'
    clearThemeTransitionLayers()
    requestAnimationFrame(clearThemeTransitionLayers)
    wasMusicPage = true
    return
  }

  const useSiteDarkMode = localStorage.getItem('darkMode') === 'true'
  document.body.classList.remove('music-theme-dark')
  document.body.classList.toggle('dark-mode', useSiteDarkMode)
  document.documentElement.style.colorScheme = useSiteDarkMode ? 'dark' : 'light'
  wasMusicPage = false
}

const goToMusicPlayer = () => {
  router.push('/music-player')
}

const isSpaceShortcutBlocked = (target) => {
  if (!(target instanceof Element)) return false

  return Boolean(target.closest([
    'input',
    'textarea',
    'select',
    '[contenteditable="true"]',
    '[role="slider"]',
    '[role="dialog"]',
    '.player-progress',
    '.vol-bar',
    '.lyrics-content',
    '.search-results-popup'
  ].join(',')))
}

const handleMusicSpaceShortcut = (event) => {
  if (!isMusicPage.value) return
  if (event.code !== 'Space' && event.key !== ' ' && event.key !== 'Spacebar') return
  if (event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return
  if (isSpaceShortcutBlocked(event.target)) return

  event.preventDefault()
  event.stopPropagation()
  if (document.querySelector('[aria-modal="true"], .create-playlist-modal, .music-settings-overlay')) return
  togglePlay()
}

const pageClassNames = ['page-home', 'page-about', 'page-articles', 'page-article', 'page-music', 'page-case']

const syncPageClass = (page) => {
  const pageClass = `page-${page}`
  pageClassNames.forEach((className) => {
    document.body.classList.remove(className)
    document.documentElement.classList.remove(className)
  })
  document.body.classList.add(pageClass)
  document.documentElement.classList.add(pageClass)

  if (page === 'music') {
    document.body.classList.remove('theme-transitioning')
  }
}

let moduleObserver = null
let mutationObserver = null
let mutationDebounceTimer = 0
let entranceFrame = 0
let entranceSettleTimer = 0
let entranceOrder = 0
let entranceScheduled = false

const moduleSelectors = [
  '.nav',
  '.hero',
  '.hero-panel',
  '.section-block',
  '.side-card',
  '.article-card',
  '.project-card-item',
  '.tech-item',
  '.quick-links a',
  '.contact-links a',
  '.page-header',
  '.filters',
  '.article-item',
  '.empty-state',
  '.article-container',
  '.article-content',
  '.article-header',
  '.article-body',
  '.breadcrumb',
  '.category-header',
  '.category-content',
  '.category-card',
  '.music-hero',
  '.music-tabs',
  '.content-section',
  '.section-header',
  '.playlist-card',
  '.song-card',
  '.song-item',
  '.recommend-banner',
  '.song-table',
  '.detail-header',
  '.detail-main',
  '.songs-header',
  '.add-form',
  '.player-container',
  '.vinyl-section',
  '.lyrics-section',
  '.case-header',
  '.case-content',
  '.case-iframe-container',
  '.case-info',
  '.info-item',
  '.case-actions',
  '.about-container',
  '.profile-section',
  '.glass-card',
  '.interest-card',
  '.footer-glass',
  '.footer-brand',
  '.footer-section',
  '.footer-bottom'
]

const skipEntranceSelectors = [
  '.home',
  '.player-bar',
  '.player-bar-unified',
  '.playlist-popup',
  '.search-results-popup',
  '.create-playlist-modal',
  '.floating-toolbar',
  '.floating-music-btn'
]

const getEntranceModules = () => {
  const root = document.querySelector('.app-shell') || document.querySelector('#app')
  if (!root) return []

  const modules = Array.from(root.querySelectorAll(moduleSelectors.join(',')))
    .filter((element) => !skipEntranceSelectors.some((selector) => element.closest(selector)))

  return [...new Set(modules)]
}

const isElementInEntranceViewport = (element) => {
  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth

  return rect.width > 0
    && rect.height > 0
    && rect.bottom > 0
    && rect.right > 0
    && rect.top < viewportHeight
    && rect.left < viewportWidth
}

const revealVisibleEntranceModule = (element) => {
  if (element.classList.contains('module-entered')) return
  if (!isElementInEntranceViewport(element)) return

  element.classList.add('module-entered')
}

const applyModuleEntrance = () => {
  if (isMobilePerformance) return

  const modules = getEntranceModules()
  if (!modules.length) return

  if (!moduleObserver) {
    moduleObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('module-entered')
            } else if (!isElementInEntranceViewport(entry.target)) {
              entry.target.classList.remove('module-entered')
            }
          })
        },
        { threshold: 0.04, rootMargin: '0px 0px -4% 0px' }
      )
    : null
  }

  modules.forEach((element, index) => {
    if (!element.classList.contains('module-enter')) {
      element.classList.add('module-enter')
      element.style.setProperty('--enter-delay', `${Math.min(entranceOrder + index, 10) * 35}ms`)
    }

    if (!moduleObserver) {
      element.classList.add('module-entered')
    } else {
      moduleObserver.observe(element)
    }

    if (isElementInEntranceViewport(element)) {
      revealVisibleEntranceModule(element)
    }
  })

  entranceOrder = Math.min(entranceOrder + modules.length, 10)
}

const shouldReactToMutation = (mutations) => mutations.some((mutation) => {
  if (mutation.type === 'childList') {
    return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0
  }

  if (mutation.type !== 'attributes') return false

  const target = mutation.target
  if (!(target instanceof Element)) return false
  if (mutation.attributeName === 'class') {
    return !target.classList.contains('module-enter')
      && !target.classList.contains('module-entered')
  }

  return mutation.attributeName !== 'style'
})

const bindModuleMutationObserver = () => {
  if (isMobilePerformance) return

  const root = document.querySelector('.app-main')
  if (!root || mutationObserver) return

  mutationObserver = new MutationObserver((mutations) => {
    if (!shouldReactToMutation(mutations)) return

    if (mutationDebounceTimer) {
      clearTimeout(mutationDebounceTimer)
    }

    mutationDebounceTimer = window.setTimeout(() => {
      mutationDebounceTimer = 0
      runModuleEntrance()
    }, 120)
  })

  mutationObserver.observe(root, { childList: true, subtree: true })
}

const runModuleEntrance = () => {
  if (isMobilePerformance) return

  if (entranceScheduled) return
  entranceScheduled = true

  if (entranceFrame) {
    cancelAnimationFrame(entranceFrame)
  }

  entranceFrame = requestAnimationFrame(() => {
    entranceFrame = 0
    entranceScheduled = false
    applyModuleEntrance()
  })
}

const scheduleModuleEntrance = async () => {
  if (isMobilePerformance) return

  await nextTick()
  runModuleEntrance()

  if (entranceSettleTimer) {
    clearTimeout(entranceSettleTimer)
  }

  entranceSettleTimer = window.setTimeout(() => {
    entranceSettleTimer = 0
    runModuleEntrance()
  }, 180)
}

watch(
  currentPage,
  (newPage) => {
    syncPageClass(newPage)
    scheduleModuleEntrance()
  },
  { immediate: true, flush: 'sync' }
)

watch(
  () => route.fullPath,
  () => {
    scheduleModuleEntrance()
  }
)

watch(
  [isMusicPage, () => musicBackgroundSettings.preset, () => musicBackgroundSettings.mode, () => musicBackgroundSettings.customAppearance],
  syncMusicColorMode,
  { immediate: true }
)

watch(
  [currentSong, parsedLyrics, currentLyricIndex, showGlobalLyrics],
  () => {
    if (!isNativeApp) return
    syncNativeLyricsOverlay()
    if (!showGlobalLyrics.value) {
      window.MestingLyricsOverlay?.hide?.()
    }
  },
  { deep: false }
)

let musicPreloadIdleHandle = 0
let musicPreloadTimer = 0

onMounted(() => {
  window.addEventListener('keydown', handleMusicSpaceShortcut, { capture: true })
  window.addEventListener('mesting:native-back', handleNativeBack)
  window.addEventListener('mesting:lyrics-overlay-closed', handleNativeLyricsOverlayClosed)
  document.addEventListener('touchstart', preventNativePinchZoom, { capture: true, passive: false })
  document.addEventListener('touchmove', preventNativePinchZoom, { capture: true, passive: false })
  document.addEventListener('gesturestart', preventNativeGestureZoom, { passive: false })
  document.addEventListener('dblclick', preventNativeGestureZoom, { passive: false })
  window.addEventListener('touchstart', handleEdgeTouchStart, { passive: true })
  window.addEventListener('touchmove', handleEdgeTouchMove, { passive: false })
  window.addEventListener('touchend', handleEdgeTouchEnd, { passive: true })
  window.addEventListener('touchcancel', resetEdgeSwipe, { passive: true })
  if (!isMobilePerformance) {
    bindModuleMutationObserver()
    scheduleModuleEntrance()
  }

  const warmMusicPages = () => {
    musicPreloadIdleHandle = 0
    musicPreloadTimer = 0
    preloadMusicRoutes()
  }

  if ('requestIdleCallback' in window) {
    musicPreloadIdleHandle = window.requestIdleCallback(warmMusicPages, { timeout: 1400 })
  } else {
    musicPreloadTimer = window.setTimeout(warmMusicPages, 650)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleMusicSpaceShortcut, true)
  window.removeEventListener('mesting:native-back', handleNativeBack)
  window.removeEventListener('mesting:lyrics-overlay-closed', handleNativeLyricsOverlayClosed)
  document.removeEventListener('touchstart', preventNativePinchZoom, true)
  document.removeEventListener('touchmove', preventNativePinchZoom, true)
  document.removeEventListener('gesturestart', preventNativeGestureZoom)
  document.removeEventListener('dblclick', preventNativeGestureZoom)
  window.removeEventListener('touchstart', handleEdgeTouchStart)
  window.removeEventListener('touchmove', handleEdgeTouchMove)
  window.removeEventListener('touchend', handleEdgeTouchEnd)
  window.removeEventListener('touchcancel', resetEdgeSwipe)
  document.body.classList.remove('music-theme-dark', 'music-route-handoff', ...MUSIC_THEME_BODY_CLASSES)
  if (musicRouteHandoffTimer) {
    clearTimeout(musicRouteHandoffTimer)
  }
  if (moduleObserver) {
    moduleObserver.disconnect()
  }
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
  if (entranceFrame) {
    cancelAnimationFrame(entranceFrame)
  }
  if (entranceSettleTimer) {
    clearTimeout(entranceSettleTimer)
  }
  if (mutationDebounceTimer) {
    clearTimeout(mutationDebounceTimer)
  }
  if (musicPreloadIdleHandle && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(musicPreloadIdleHandle)
  }
  if (musicPreloadTimer) {
    clearTimeout(musicPreloadTimer)
  }
})
</script>

<style>
* { box-sizing: border-box; }

html {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

body {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(91, 108, 255, 0.14) 1px, transparent 1px),
    radial-gradient(circle, rgba(14, 165, 233, 0.08) 1.5px, transparent 1.5px);
  background-size: 52px 52px, 104px 104px;
  background-position: 0 0, 26px 26px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent 75%);
}

body.dark-mode::before {
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    radial-gradient(circle, rgba(131, 181, 165, 0.025) 1.5px, transparent 1.5px);
}

/*
 * 仅用透明度做页面级淡入淡出，刻意不使用 transform。
 * 一旦过渡元素带上 transform，其内部 position: fixed + backdrop-filter
 * 的全屏玻璃层（如 .music-page::before）会在切换瞬间错误采样整屏，
 * 糊成一片紫色毛玻璃。页面内各模块自带入场动画，观感依旧。
 */
.page-fade-enter-active {
  position: relative;
  z-index: 1;
  transition: opacity 0.36s var(--ease-spring);
}

.page-fade-leave-active {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  pointer-events: none;
  transition: opacity 0.28s ease;
}

.page-fade-enter-from {
  opacity: 0;
}

.page-fade-leave-to {
  opacity: 0;
}

/* Lyrics closes like a downward sheet.  The incoming music route is mounted
 * immediately underneath, so the home page is revealed continuously rather
 * than after the lyric stage has finished disappearing. */
.music-route-seamless-leave-active.music-player-page {
  position: fixed !important;
  inset: 0;
  z-index: 900 !important;
  pointer-events: none;
  will-change: transform;
  transition: transform 420ms cubic-bezier(.22, .8, .25, 1) !important;
}

.music-route-seamless-leave-to.music-player-page {
  transform: translateY(104%);
}

/*
 * 离开音乐页时，音乐主题与站点阳光/暗黑配色不是硬切换。
 * 这里只过渡真实颜色和材质，不使用 opacity 覆盖层，避免页面再次被洗成灰白色。
 */
body.music-route-handoff .nav,
body.music-route-handoff .app-main,
body.music-route-handoff .home-v2,
body.music-route-handoff .home-hero,
body.music-route-handoff .home-content,
body.music-route-handoff .about-container,
body.music-route-handoff .article-list,
body.music-route-handoff .article-container,
body.music-route-handoff .aurora-background {
  transition:
    background 520ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 520ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 420ms ease,
    box-shadow 520ms ease,
    color 360ms ease,
    filter 520ms ease;
}

body.dark-mode .app-shell .module-enter,
body.dark-mode .app-shell .module-enter.module-entered {
  filter: none;
}

.app-shell .module-enter {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.52s var(--ease-spring),
    transform 0.56s var(--ease-spring);
  transition-delay: var(--enter-delay, 0ms);
}

.app-shell .module-enter.module-entered {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active,
  .app-shell .module-enter,
  .app-shell .module-enter.module-entered {
    animation: none !important;
    transition: none !important;
  }

  .app-shell .module-enter {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>

<style scoped>
.app-shell {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  padding: calc(var(--header-offset) + 18px) 0 0;
  overflow-x: hidden;
}

.app-shell.is-native-app .app-main {
  padding-top: 0;
}

.edge-swipe-back-indicator {
  --edge-swipe-progress: 0;
  position: fixed;
  top: 50%;
  left: max(6px, env(safe-area-inset-left));
  z-index: 12000;
  display: grid;
  width: 46px;
  height: 58px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.44);
  border-radius: 0 22px 22px 0;
  color: #ffffff;
  background: rgba(32, 35, 52, 0.72);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.2);
  opacity: calc(0.34 + var(--edge-swipe-progress) * 0.66);
  pointer-events: none;
  transform: translate3d(calc(-48px + var(--edge-swipe-progress) * 48px), -50%, 0)
    scale(calc(0.86 + var(--edge-swipe-progress) * 0.14));
  transition: color 120ms ease, background 120ms ease;
}

.edge-swipe-back-indicator.ready {
  color: #fff;
  background: rgba(236, 65, 65, 0.9);
}

.edge-swipe-back-indicator svg {
  width: 25px;
  height: 25px;
}

:deep(.header) {
  z-index: 1000;
}

:deep(.footer) {
  position: relative;
  z-index: 2;
}

body.page-music .app-main {
  padding-top: var(--header-offset);
}

body.page-home .app-main {
  /* 首页首屏从视口顶部开始，固定导航悬浮在首屏之上。
     不再留下与首屏脱节的浅色预留带。 */
  padding-top: 0;
}

@media (max-width: 768px) {
  :root {
    --header-offset: 74px;
  }

  .app-main { padding-top: calc(var(--header-offset) + 10px); }

  body.page-music .app-main {
    padding-top: var(--header-offset);
  }

  body.page-home .app-main {
    padding-top: 0;
  }
}
</style>
