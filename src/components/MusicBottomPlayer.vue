<template>
  <footer
    class="player-bar player-bar-unified playlists-bottom-player"
    :class="{ 'playlist-detail-capsule-player': props.variant === 'capsule' }"
  >
    <PlayerShinchanDecor />
    <div
      class="player-progress playlists-player-progress"
      :class="{ dragging: isDragging }"
      @click="seek"
      @mousedown="startDragging"
      @mousemove="handleDragging"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
    >
      <div class="player-progress-bar">
        <div class="player-progress-now" :style="{ width: `${progress}%` }">
          <ProgressWalker :is-playing="isPlaying" :dragging="isDragging" />
        </div>
        <div class="player-progress-tooltip" :style="{ left: `${tooltipPosition}%` }">
          <span>{{ formatTime(isDragging ? dragCurrentTime : currentTime) }}</span>
          <span class="tooltip-time-sep">/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <div class="bar-song" role="button" tabindex="0" @click="goToPlayer" @keydown.enter="goToPlayer">
      <span class="bar-song-record" :class="{ 'is-spinning': isPlaying }" aria-hidden="true">
        <img :src="currentSong.cover" :alt="currentSong.title" class="song-cover" />
        <i class="bar-song-record-hole"></i>
      </span>
      <div class="song-text">
        <PlayerTitleMarquee :text="currentSong.title" />
        <p>{{ currentSong.artist }}</p>
      </div>
      <button
        class="like-btn"
        :class="{ liked: isLiked }"
        type="button"
        :aria-label="isLiked ? '取消收藏' : '收藏歌曲'"
        @click.stop="toggleLike"
      >
        <svg viewBox="0 0 24 24" :fill="isLiked ? '#e74c3c' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>

    <div class="bar-controls">
      <button class="ctrl-btn play-mode-btn" type="button" :class="playMode" :title="playModeTitle" @click="togglePlayMode">
        <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
        <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z" />
        </svg>
      </button>

      <div class="control-btns">
        <button class="ctrl-btn" type="button" title="上一首" @click="prev">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
        </button>
        <button
          class="ctrl-btn play-btn"
          type="button"
          :title="isPlaying ? '暂停' : '播放'"
          :style="{ '--mobile-play-progress': `${Math.min(100, Math.max(0, progress))}%` }"
          @click="togglePlay"
        >
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14Zm8-14v14h4V5h-4Z" /></svg>
        </button>
        <button class="ctrl-btn" type="button" title="下一首" @click="next">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="m6 18 8.5-6L6 6v12ZM16 6v12h2V6h-2Z" /></svg>
        </button>
        <button class="ctrl-btn list-btn" type="button" :title="queueButtonTitle" @click="openPlaylist">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2Zm0 4h2v-2H3v2Zm0-8h2V7H3v2Zm4 4h14v-2H7v2Zm0 4h14v-2H7v2ZM7 7v2h14V7H7Z" /></svg>
          <span v-if="playlist.length" class="list-count">{{ playlist.length }}</span>
        </button>
      </div>
    </div>

    <div class="bar-extra">
      <LyricsToggleButton />
      <div class="volume-wrap">
        <button class="vol-btn" type="button" :title="volume > 0 ? '静音' : '恢复音量'" @click="toggleMute">
          <svg v-if="volume > 0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z" />
          </svg>
        </button>
        <div
          ref="volumeBarRef"
          class="vol-bar"
          :class="{ 'is-dragging': isVolumeDragging }"
          :style="{ '--volume-position': `${volume * 100}%` }"
          role="slider"
          aria-label="音量"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(volume * 100)"
          tabindex="0"
          @pointerdown="startVolumeDragging"
          @pointermove="handleVolumeDragging"
          @pointerup="stopVolumeDragging"
          @pointercancel="cancelVolumeDragging"
          @lostpointercapture="cancelVolumeDragging"
          @keydown="handleVolumeKeydown"
        >
          <div class="vol-fill" :style="{ width: `${volume * 100}%` }"></div>
        </div>
      </div>
    </div>
  </footer>

  <Teleport to="body">
    <Transition name="playlists-drawer">
      <div
        v-if="showPlaylist"
        class="playlists-player-backdrop"
        @click.self="showPlaylist = false"
      >
        <section class="playlists-player-popup" role="dialog" aria-modal="true" aria-label="播放列表">
          <div class="playlists-popup-handle" aria-hidden="true"></div>
          <div class="playlists-popup-header">
            <div>
              <span>当前播放</span>
              <h3>播放列表</h3>
            </div>
            <strong class="playlists-popup-count">{{ playlist.length }} 首</strong>
            <button type="button" aria-label="关闭播放列表" @click="showPlaylist = false">×</button>
          </div>
          <div class="playlists-popup-list">
            <button
              v-for="(song, index) in playlist"
              :key="song.id || song.url || index"
              class="playlists-popup-item"
              :class="{ active: currentIndex === index }"
              type="button"
              @click="playQueueSong(index)"
            >
              <span class="playlists-popup-index">{{ index + 1 }}</span>
              <img :src="song.cover" :alt="song.title" />
              <span class="playlists-popup-copy">
                <strong>{{ song.title }}</strong>
                <small>{{ song.artist }}</small>
              </span>
              <span class="playlists-popup-duration">{{ song.duration }}</span>
            </button>
            <p v-if="!playlist.length" class="playlists-popup-empty">接下来没有待播放的歌曲</p>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayer } from '../composables/usePlayer'
import { useProgressBar } from '../composables/useProgressBar'
import { useVolumeSlider } from '../composables/useVolumeSlider'
import LyricsToggleButton from './LyricsToggleButton.vue'
import ProgressWalker from './ProgressWalker.vue'
import PlayerShinchanDecor from './PlayerShinchanDecor.vue'
import PlayerTitleMarquee from './PlayerTitleMarquee.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  },
  queueMode: {
    type: String,
    default: 'page',
    validator: (value) => ['page', 'drawer'].includes(value)
  }
})

const router = useRouter()
const route = useRoute()
const showPlaylist = ref(false)
const isCompactViewport = ref(false)
let compactViewportQuery = null

const syncCompactViewport = () => {
  isCompactViewport.value = Boolean(compactViewportQuery?.matches)
}

const queueButtonTitle = computed(() => (
  route.name === 'MusicQueue' ? '返回音乐页面' : '播放列表'
))

const openPlaylist = () => {
  if (props.queueMode === 'drawer') {
    showPlaylist.value = !showPlaylist.value
    return
  }

  // 手机与 iPad 都使用独立的播放列表页面，避免列表被底部播放器遮住。
  if (isCompactViewport.value) {
    showPlaylist.value = false
    if (route.name === 'MusicQueue') {
      router.back()
    } else {
      router.push({ name: 'MusicQueue', query: { from: route.fullPath } })
    }
    return
  }

  showPlaylist.value = !showPlaylist.value
}

const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isLiked,
  playMode,
  playlist,
  currentIndex,
  initAudio,
  togglePlay,
  seek: globalSeek,
  next,
  prev,
  playByIndex,
  setVolume,
  toggleLike,
  cyclePlayMode
} = usePlayer()

const {
  progress,
  tooltipPosition,
  isDragging,
  dragCurrentTime,
  formatTime,
  seek,
  startDragging,
  handleDragging,
  stopDragging
} = useProgressBar({
  currentTime,
  duration,
  progressSelector: '.playlists-player-progress',
  onSeek: (percent) => globalSeek(percent * duration.value)
})

const previousVolume = ref(volume.value || 0.7)
const {
  volumeBarRef,
  isVolumeDragging,
  startVolumeDragging,
  handleVolumeDragging,
  stopVolumeDragging,
  cancelVolumeDragging,
  handleVolumeKeydown
} = useVolumeSlider({
  volume,
  onChange: (nextVolume) => {
    if (nextVolume > 0) previousVolume.value = nextVolume
    setVolume(nextVolume)
  }
})

const playModeTitle = computed(() => ({
  list: '顺序播放',
  single: '单曲循环',
  random: '随机播放'
}[playMode.value] || '播放模式'))

const togglePlayMode = () => cyclePlayMode()

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    setVolume(0)
  } else {
    setVolume(previousVolume.value || 0.7)
  }
}

const playQueueSong = (index) => {
  playByIndex(index)
  showPlaylist.value = false
}

const goToPlayer = () => router.push('/music-player')

onMounted(() => {
  initAudio()
  compactViewportQuery = window.matchMedia('(max-width: 1024px)')
  syncCompactViewport()
  compactViewportQuery.addEventListener('change', syncCompactViewport)
})

onUnmounted(() => {
  compactViewportQuery?.removeEventListener('change', syncCompactViewport)
})
</script>

<style>
.playlists-bottom-player .bar-song {
  cursor: pointer;
}

/* Keep the desktop mini record round all the way to its edge.  The old image
   element could retain a pale square canvas beneath the circular artwork. */
.playlists-bottom-player .bar-song-record {
  position: relative;
  display: grid;
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  place-items: center;
  overflow: hidden;
  border: 0 !important;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, transparent 0 9%, rgba(255,255,255,.13) 9.5% 10.5%, transparent 11% 21%, rgba(255,255,255,.08) 21.5% 22.5%, transparent 23% 33%, rgba(255,255,255,.06) 33.5% 34.5%, transparent 35%),
    radial-gradient(circle at 36% 31%, #4a4650, #17161b 54%, #07070a 100%) !important;
  box-shadow: 0 5px 14px rgba(7,9,15,.36), inset 0 0 0 1px rgba(255,255,255,.12);
  animation: playlistsPlayerSpin 5.6s linear infinite;
  animation-play-state: paused;
}

.playlists-bottom-player .bar-song-record.is-spinning {
  animation-play-state: running;
}

.playlists-bottom-player .bar-song-record .song-cover {
  position: relative;
  z-index: 1;
  display: block !important;
  width: 31px !important;
  height: 31px !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  background: transparent !important;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,.42) !important;
}

.playlists-bottom-player .bar-song-record-hole {
  position: absolute;
  z-index: 2;
  width: 5px;
  height: 5px;
  border: 1px solid rgba(255,255,255,.5);
  border-radius: 50%;
  background: #17151a;
  box-shadow: 0 0 0 1px rgba(0,0,0,.3);
}

.playlists-bottom-player .player-progress-tooltip {
  position: absolute;
  top: -46px;
  min-width: 76px;
  padding: 6px 9px;
  border-radius: 8px;
  background: rgba(18, 24, 38, 0.88);
  color: #fff;
  font-size: 0.72rem;
  text-align: center;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(-50%);
  transition: opacity 0.15s ease;
}

.playlists-bottom-player .player-progress:hover .player-progress-tooltip,
.playlists-bottom-player .player-progress.dragging .player-progress-tooltip {
  opacity: 1;
  visibility: visible;
}

.playlists-player-backdrop {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: transparent;
}

.playlists-player-popup {
  position: fixed;
  right: 20px;
  bottom: 78px;
  z-index: 1;
  width: min(360px, calc(100vw - 28px));
  max-height: 430px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 55px rgba(35, 45, 75, 0.2);
  backdrop-filter: blur(28px) saturate(170%);
  -webkit-backdrop-filter: blur(28px) saturate(170%);
}

.playlists-popup-handle {
  display: none;
}

.playlists-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.playlists-popup-header > div {
  min-width: 0;
}

.playlists-popup-header span {
  display: block;
  margin-bottom: 2px;
  color: var(--music-progress-fill, #ec4141);
  font-size: .68rem;
  font-weight: 800;
  letter-spacing: .08em;
}

.playlists-popup-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1rem;
}

.playlists-popup-count {
  margin-left: auto;
  padding: 5px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--music-progress-fill, #ec4141) 12%, transparent);
  color: var(--music-progress-fill, #ec4141);
  font-size: .72rem;
  white-space: nowrap;
}

.playlists-popup-header button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
}

.playlists-popup-header button:hover {
  background: rgba(236, 65, 65, 0.08);
  color: #ec4141;
}

.playlists-popup-list {
  max-height: 365px;
  overflow-y: auto;
  padding: 6px;
}

.playlists-popup-item {
  display: grid;
  grid-template-columns: 26px 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #334155;
  text-align: left;
  cursor: pointer;
}

.playlists-popup-item:hover,
.playlists-popup-item.active {
  background: rgba(236, 65, 65, 0.08);
}

.playlists-popup-item img {
  width: 42px;
  height: 42px;
  border-radius: 9px;
  object-fit: cover;
}

.playlists-popup-index,
.playlists-popup-duration {
  color: #94a3b8;
  font-size: 0.72rem;
}

.playlists-popup-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.playlists-popup-copy strong,
.playlists-popup-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlists-popup-copy strong {
  font-size: 0.82rem;
  font-weight: 700;
}

.playlists-popup-copy small {
  color: #94a3b8;
  font-size: 0.72rem;
}

.playlists-popup-empty {
  margin: 0;
  padding: 42px 20px;
  color: #94a3b8;
  text-align: center;
}

body:is(.dark-mode, .music-theme-dark) .playlists-player-popup {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(21, 27, 41, 0.94);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.38);
}

body:is(.dark-mode, .music-theme-dark) .playlists-popup-header h3,
body:is(.dark-mode, .music-theme-dark) .playlists-popup-item {
  color: #f1f5f9;
}

body:is(.dark-mode, .music-theme-dark) .playlists-popup-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

@keyframes playlistsPlayerSpin {
  to { transform: rotate(360deg); }
}

.playlists-drawer-enter-active,
.playlists-drawer-leave-active {
  transition: background .22s ease;
}

.playlists-drawer-enter-active .playlists-player-popup,
.playlists-drawer-leave-active .playlists-player-popup {
  transition: transform .28s cubic-bezier(.22, .72, .2, 1), opacity .22s ease;
}

.playlists-drawer-enter-from,
.playlists-drawer-leave-to {
  background: transparent !important;
}

.playlists-drawer-enter-from .playlists-player-popup,
.playlists-drawer-leave-to .playlists-player-popup {
  opacity: 0;
  transform: translateY(100%);
}

/* 在线歌单在手机与平板内使用当前页面的底部抽屉，不再跳去独立队列页。 */
@media (max-width: 1024px) {
  .playlists-player-backdrop {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-top: max(64px, env(safe-area-inset-top, 0px));
    background: rgba(19, 27, 43, .46);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .playlists-player-popup {
    position: relative;
    inset: auto !important;
    width: min(100%, 620px) !important;
    max-width: none !important;
    max-height: min(72dvh, 680px);
    padding-bottom: max(10px, env(safe-area-inset-bottom, 0px));
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 26px 26px 0 0;
    background: rgba(249, 251, 255, .97);
    box-shadow: 0 -22px 56px rgba(22, 31, 55, .24);
  }

  .playlists-popup-handle {
    display: block;
    width: 42px;
    height: 5px;
    margin: 9px auto 2px;
    border-radius: 999px;
    background: rgba(119, 130, 151, .28);
  }

  .playlists-popup-header {
    padding: 12px 20px 14px;
  }

  .playlists-popup-header h3 {
    font-size: 1.22rem;
  }

  .playlists-popup-list {
    max-height: min(54dvh, 560px);
    overscroll-behavior: contain;
    padding: 8px 12px;
  }

  .playlists-popup-item {
    min-height: 60px;
    grid-template-columns: 26px 46px minmax(0, 1fr) auto;
    border-radius: 15px;
  }

  .playlists-popup-item img {
    width: 46px;
    height: 46px;
    border-radius: 12px;
  }
}

/* 音乐首页的播放列表也随 IP 主题切换，而不是保持通用蓝灰色。 */
body.music-ip-hello-kitty .playlists-player-popup {
  border-color: rgba(218, 73, 120, 0.32);
  background: rgba(255, 248, 251, 0.95);
  box-shadow: 0 20px 55px rgba(160, 39, 84, 0.23);
}

body.music-ip-hello-kitty .playlists-popup-header { border-bottom-color: rgba(218, 73, 120, 0.16); }
body.music-ip-hello-kitty .playlists-popup-header h3,
body.music-ip-hello-kitty .playlists-popup-item { color: #642a39; }
body.music-ip-hello-kitty .playlists-popup-item:hover,
body.music-ip-hello-kitty .playlists-popup-item.active { background: rgba(222, 68, 116, 0.1); }

body.music-ip-kuromi .playlists-player-popup {
  border-color: rgba(241, 80, 177, 0.34);
  background: rgba(24, 13, 35, 0.96);
  box-shadow: 0 20px 55px rgba(19, 5, 29, 0.5), 0 0 24px rgba(236, 66, 163, 0.14);
}

body.music-ip-kuromi .playlists-popup-header { border-bottom-color: rgba(241, 80, 177, 0.18); }
body.music-ip-kuromi .playlists-popup-header h3,
body.music-ip-kuromi .playlists-popup-item { color: #fff1fb; }
body.music-ip-kuromi .playlists-popup-item:hover,
body.music-ip-kuromi .playlists-popup-item.active { background: rgba(239, 60, 164, 0.16); }
</style>
