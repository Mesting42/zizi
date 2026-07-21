<template>
  <button
    class="ctrl-btn lyrics-btn"
    :class="{ active: showGlobalLyrics }"
    type="button"
    title="桌面歌词"
    aria-label="桌面歌词"
    :aria-pressed="showGlobalLyrics"
    @click.stop="toggleLyricsPanel"
  >
    <svg class="lyrics-window-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
      <rect x="3.25" y="3.5" width="17.5" height="14.5" rx="3.75" />
      <path d="M7 8.25h10M7 12.25h6.5" stroke-linecap="round" />
      <circle cx="16.8" cy="12.25" r="1.15" fill="currentColor" stroke="none" />
      <path d="M12 18v2.5M8.75 20.5h6.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>

<script setup>
import { Capacitor } from '@capacitor/core'
import { usePlayer } from '../composables/usePlayer'
import {
  applyNativeLyricsPreferences,
  loadNativeLyricsPreferences
} from '../utils/nativeLyricsOverlay'

const { showGlobalLyrics, toggleGlobalLyrics } = usePlayer()

const requestLyricsOverlay = () => {
  if (typeof window === 'undefined') return

  try {
    if (Capacitor.isNativePlatform()) {
      applyNativeLyricsPreferences(loadNativeLyricsPreferences())
      window.MestingLyricsOverlay?.show?.()
      return
    }

    if (!window.matchMedia?.('(max-width: 1100px)').matches) return
    window.Android?.requestLyricsOverlay?.()
    window.ReactNativeWebView?.postMessage?.(JSON.stringify({ type: 'request-lyrics-overlay' }))
    window.webkit?.messageHandlers?.lyricsOverlay?.postMessage?.({ type: 'request-permission' })
    window.dispatchEvent(new CustomEvent('music:request-lyrics-overlay'))
  } catch {
    // Browser fallback: the floating lyric panel remains available inside the page.
  }
}

const toggleLyricsPanel = () => {
  const nextVisible = !showGlobalLyrics.value
  if (nextVisible) {
    requestLyricsOverlay()
  } else if (Capacitor.isNativePlatform()) {
    window.MestingLyricsOverlay?.hide?.()
  }
  toggleGlobalLyrics()
}
</script>
