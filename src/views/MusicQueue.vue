<template>
  <section class="mobile-queue-page" :class="[`ip-${activeThemeIp}`, `preset-${musicBackgroundSettings.preset}`]">
    <MusicPageBackground :playing="isPlaying" />

    <main class="mobile-queue-content">
      <header class="mobile-queue-header">
        <button class="mobile-queue-back" type="button" aria-label="返回音乐页面" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m14 6-6 6 6 6" />
          </svg>
          <span>返回音乐</span>
        </button>
        <span class="mobile-queue-eyebrow">NOW PLAYING</span>
      </header>

      <section class="mobile-queue-card" aria-labelledby="mobile-queue-title">
        <div class="mobile-queue-title-row">
          <div>
            <p>播放队列</p>
            <h1 id="mobile-queue-title">播放列表</h1>
          </div>
          <span class="mobile-queue-count">{{ playlist.length }} 首</span>
        </div>

        <div v-if="playlist.length" class="mobile-queue-list">
          <button
            v-for="(song, index) in playlist"
            :key="song.id || song.url || index"
            type="button"
            class="mobile-queue-item"
            :class="{ active: currentIndex === index }"
            @click="playQueueSong(index)"
          >
            <span class="mobile-queue-index">{{ currentIndex === index ? '▶' : index + 1 }}</span>
            <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
            <span class="mobile-queue-copy">
              <strong>{{ song.title }}</strong>
              <small>{{ song.artist }}</small>
            </span>
            <span class="mobile-queue-duration">{{ song.duration }}</span>
          </button>
        </div>

        <div v-else class="mobile-queue-empty">
          <span aria-hidden="true">♫</span>
          <h2>接下来没有待播放的歌曲</h2>
          <p>歌曲开始播放后会自动从这里移除。</p>
        </div>
      </section>
    </main>

    <MusicBottomPlayer />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MusicBottomPlayer from '../components/MusicBottomPlayer.vue'
import MusicPageBackground from '../components/MusicPageBackground.vue'
import { useMusicBackground } from '../composables/useMusicBackground'
import { usePlayer } from '../composables/usePlayer'
import { getMusicThemeIp } from '../config/musicThemeCatalog'

const route = useRoute()
const router = useRouter()
const { settings: musicBackgroundSettings } = useMusicBackground()
const { playlist, currentIndex, isPlaying, playByIndex } = usePlayer()

const activeThemeIp = computed(() => getMusicThemeIp(musicBackgroundSettings.preset))

const goBack = () => {
  const from = typeof route.query.from === 'string' ? route.query.from : '/music'
  router.replace(from.startsWith('/music') ? from : '/music')
}

const playQueueSong = (index) => {
  playByIndex(index)
}
</script>

<style scoped>
.mobile-queue-page {
  position: relative;
  min-height: 100dvh;
  padding: 94px 20px calc(104px + env(safe-area-inset-bottom, 0px));
  overflow: clip;
  color: var(--queue-text, #20324d);
}

.mobile-queue-content {
  position: relative;
  z-index: 2;
  width: min(100%, 620px);
  margin: 0 auto;
}

.mobile-queue-header,
.mobile-queue-title-row,
.mobile-queue-item {
  display: flex;
  align-items: center;
}

.mobile-queue-header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.mobile-queue-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 12px 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.64);
  color: inherit;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(39, 55, 92, 0.1);
  backdrop-filter: blur(14px);
}

.mobile-queue-back svg { width: 20px; height: 20px; }

.mobile-queue-eyebrow {
  color: var(--queue-accent, #ef4f5e);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.mobile-queue-card {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 58px rgba(38, 48, 84, 0.17);
  backdrop-filter: blur(24px) saturate(155%);
}

.mobile-queue-title-row {
  justify-content: space-between;
  padding: 22px 20px 16px;
  border-bottom: 1px solid rgba(131, 148, 178, 0.15);
}

.mobile-queue-title-row p,
.mobile-queue-title-row h1 { margin: 0; }
.mobile-queue-title-row p { color: var(--queue-accent, #ef4f5e); font-size: 0.74rem; font-weight: 800; letter-spacing: 0.1em; }
.mobile-queue-title-row h1 { margin-top: 4px; font-size: clamp(1.4rem, 5vw, 1.85rem); }

.mobile-queue-count {
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--queue-accent, #ef4f5e) 12%, transparent);
  color: var(--queue-accent, #ef4f5e);
  font-size: 0.76rem;
  font-weight: 800;
}

.mobile-queue-list { padding: 8px; }

.mobile-queue-item {
  width: 100%;
  gap: 11px;
  padding: 10px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.mobile-queue-item + .mobile-queue-item { margin-top: 2px; }
.mobile-queue-item.active { background: color-mix(in srgb, var(--queue-accent, #ef4f5e) 13%, transparent); }

.mobile-queue-index {
  flex: 0 0 20px;
  color: var(--queue-muted, #8b98ad);
  font-size: 0.78rem;
  text-align: center;
}

.mobile-queue-item.active .mobile-queue-index { color: var(--queue-accent, #ef4f5e); font-size: 0.68rem; }

.mobile-queue-item img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
}

.mobile-queue-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.mobile-queue-copy strong,
.mobile-queue-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-queue-copy strong { font-size: 0.92rem; }
.mobile-queue-copy small,
.mobile-queue-duration { color: var(--queue-muted, #8b98ad); font-size: 0.74rem; }
.mobile-queue-duration { flex: 0 0 auto; }

.mobile-queue-empty { padding: 76px 24px; color: var(--queue-muted, #8b98ad); text-align: center; }
.mobile-queue-empty span { color: var(--queue-accent, #ef4f5e); font-size: 2.4rem; }
.mobile-queue-empty h2 { margin: 12px 0 6px; color: inherit; font-size: 1.1rem; }
.mobile-queue-empty p { margin: 0; font-size: 0.84rem; }

.ip-hello-kitty { --queue-text: #642a39; --queue-muted: #9d7480; --queue-accent: #df4776; }
.ip-kuromi { --queue-text: #fff1fb; --queue-muted: #cab6d7; --queue-accent: #f052b3; }
.ip-kuromi .mobile-queue-back,
.ip-kuromi .mobile-queue-card { border-color: rgba(239, 90, 183, 0.3); background: rgba(25, 12, 39, 0.8); box-shadow: 0 24px 58px rgba(12, 3, 22, 0.45); }
.ip-kuromi .mobile-queue-title-row { border-bottom-color: rgba(239, 90, 183, 0.2); }
.ip-kuromi .mobile-queue-count,
.ip-kuromi .mobile-queue-item.active { background: rgba(239, 82, 179, 0.16); }

@media (min-width: 1025px) {
  .mobile-queue-page { padding-top: 116px; }
}

@media (min-width: 680px) and (max-width: 1024px) {
  .mobile-queue-page {
    display: flex;
    height: calc(100dvh - var(--header-offset, 92px));
    min-height: calc(100dvh - var(--header-offset, 92px));
    padding: 18px clamp(16px, 2.4vw, 24px) calc(76px + env(safe-area-inset-bottom, 0px));
    overflow: hidden;
  }

  .mobile-queue-content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    width: 100%;
  }

  .mobile-queue-header {
    flex: 0 0 auto;
    margin-bottom: 12px;
  }

  .mobile-queue-card {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    height: auto;
  }

  .mobile-queue-list,
  .mobile-queue-empty {
    flex: 1 1 auto;
    min-height: 0;
  }

  .mobile-queue-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }

  .mobile-queue-list::-webkit-scrollbar { display: none; }

  .mobile-queue-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 679px) {
  .mobile-queue-page {
    display: flex;
    height: 100dvh;
    min-height: 100dvh;
    padding: 8px 14px 0;
    overflow: hidden;
  }

  .mobile-queue-content {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
  }

  .mobile-queue-header {
    display: flex;
    flex: 0 0 auto;
    min-height: 40px;
    margin: 0 2px 8px;
  }

  .mobile-queue-back {
    min-height: 36px;
    padding-right: 10px;
    padding-left: 6px;
    border-radius: 11px;
    font-size: 0.78rem;
  }

  .mobile-queue-eyebrow {
    font-size: 0.62rem;
  }

  .mobile-queue-card {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    border-radius: 0 0 20px 20px;
  }

  .mobile-queue-title-row { padding: 18px 16px 14px; }

  .mobile-queue-list,
  .mobile-queue-empty {
    flex: 1 1 auto;
    min-height: 0;
    padding-bottom: calc(112px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-queue-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }

  .mobile-queue-list::-webkit-scrollbar { display: none; }

  .mobile-queue-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 24px;
  }
}
</style>
