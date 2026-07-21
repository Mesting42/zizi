<template>
  <div
    class="music-player-page"
    :class="[
      `ip-${activeMusicIp}`,
      `preset-${musicSettings.preset}`,
      {
        'dark-theme': isDarkMode,
        'is-playing': isPlaying,
        'is-returning': isReturning,
        'is-compact-player': isCompactPlayer,
        'mobile-vinyl-view': isCompactPlayer && !isMobileLyricsView,
        'mobile-lyrics-view': isCompactPlayer && isMobileLyricsView
      }
    ]"
  >
    <MusicPageBackground variant="lyrics" :playing="isPlaying" />
    <button
      class="close-btn"
      type="button"
      :aria-label="isMobileLyricsView ? '返回唱片页面' : '返回音乐页'"
      @click="goBack"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="m15 18-6-6 6-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div class="mobile-player-heading">
      <strong>{{ currentSong.title }}</strong>
      <span>{{ currentSong.artist }}</span>
    </div>

    <div class="player-container">
      <div class="vinyl-section">
        <div
          class="vinyl-wrapper"
          role="button"
          tabindex="0"
          aria-label="打开歌词页面"
          @click="openMobileLyrics"
          @keydown.enter.prevent="openMobileLyrics"
          @keydown.space.prevent="openMobileLyrics"
        >
          <div class="vinyl-record">
            <div class="vinyl-base" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }">
              <img :src="currentSong.cover" alt="" class="vinyl-cover" @error="handleImageError" />
              <div class="vinyl-label">
                <div class="label-center"></div>
              </div>
              <div class="vinyl-grooves"></div>
            </div>
          </div>
          <div class="tonearm-container">
            <div class="tonearm" :class="{ playing: isPlaying }">
              <!-- 唱臂整体 -->
              <div class="tonearm-main">
                <!-- 枢轴底座（在左上角，唱片外） -->
                <div class="arm-pivot"></div>
                <!-- 唱臂杆 -->
                <div class="arm-rod"></div>
                <!-- 唱头（在右下角，接触唱片） -->
                <div class="arm-cartridge">
                  <div class="progress-indicator"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="light-effect" v-if="isPlaying"></div>
        </div>

        <div class="mobile-record-song-info">
          <h1>{{ currentSong.title }}</h1>
          <div class="mobile-record-artist-line">
            <p>{{ currentSong.artist }}</p>
          </div>
          <button
            class="mobile-record-favorite"
            :class="{ liked: isLiked }"
            type="button"
            :aria-label="isLiked ? '取消收藏' : '收藏歌曲'"
            :title="isLiked ? '取消收藏' : '收藏歌曲'"
            @click.stop="toggleLike"
          >
            <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          <span class="mobile-record-lyrics-hint">点击唱片查看歌词</span>
        </div>
      </div>

      <div class="lyrics-section">
        <div class="current-song-info">
          <h1 class="song-title">{{ currentSong.title }}</h1>
          <p class="song-artist">{{ currentSong.artist }}</p>
        </div>
        <div class="lyrics-header">
          <!-- 移除歌词标题 -->
        </div>
        <div
          class="lyrics-content"
          ref="lyricsRef"
          :class="{ 'is-dragging': isLyricsDragging }"
          @mousedown="onLyricsMouseDown"
          @touchstart.passive="onLyricsTouchStart"
          @wheel="onLyricsWheel"
        >
          <div class="lyrics-scroll-inner">
            <template v-if="parsedLyrics.length > 0">
              <div v-if="hasUnsyncedLyrics" class="lyrics-plain-note">
                已找到普通文本歌词（无逐句时间轴）
              </div>
              <div
                v-for="(line, index) in parsedLyrics"
                :key="index"
                class="lyrics-line"
                :class="{ active: index === currentLyricIndex, 'is-unsynced': line.unsynced }"
                @click="onLyricLineClick(line)"
              >
                <span v-if="!line.unsynced" class="lyrics-line-time">{{ formatTime(line.time) }}</span>
                <span class="lyrics-line-text">{{ line.text }}</span>
              </div>
            </template>
            <div v-else-if="isLyricsLoading" class="lyrics-line lyrics-loading">
              歌词加载中...
            </div>
            <div v-else class="lyrics-line" :class="{ active: currentTime > 0 }">
              {{ lyricsEmptyText }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <footer v-if="!isCompactPlayer" class="player-bar player-bar-unified">
      <PlayerShinchanDecor />
      <!-- 顶部进度条 -->
      <div 
        class="player-progress" 
        :class="{ dragging: isDragging }"
        @click="seek"
        @mousedown="startDragging"
        @mousemove="handleDragging"
        @mouseup="stopDragging"
        @mouseleave="stopDragging"
      >
        <div class="player-progress-bar">
          <div class="player-progress-now" :style="{ width: progress + '%' }">
            <ProgressWalker :is-playing="isPlaying" :dragging="isDragging" />
          </div>
          <div 
            class="player-progress-tooltip" 
            :style="{ left: tooltipPosition + '%' }"
          >
            <span class="tooltip-time-current">{{ formatTime(isDragging ? dragCurrentTime : currentTime) }}</span>
            <span class="tooltip-time-sep">/</span>
            <span class="tooltip-time-duration">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      
      <div class="bar-song">
        <img :src="currentSong.cover" class="song-cover spinning" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }" @error="handleImageError" />
        <div class="song-text">
          <PlayerTitleMarquee :text="currentSong.title" />
          <p>{{ currentSong.artist }}</p>
        </div>
      </div>

      <div class="bar-controls">
        <button class="ctrl-btn play-mode-btn" :class="playMode" :title="playMode === 'list' ? '顺序播放' : playMode === 'single' ? '单曲循环' : '随机播放'" @click="togglePlayMode">
          <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z"/>
          </svg>
        </button>
        <div class="control-btns">
          <button class="ctrl-btn" title="上一首" @click="prevSong">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="ctrl-btn play-btn" @click="togglePlay">
            <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          <button class="ctrl-btn" title="下一首" @click="nextSong">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="ctrl-btn list-btn" @click="handlePlaylistClick" title="播放列表">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
            <span v-if="playlist.length > 0" class="list-count">{{ playlist.length }}</span>
          </button>
        </div>
      </div>

      <div class="bar-extra">
        <LyricsToggleButton />
        <div class="volume-wrap">
          <button class="vol-btn" @click="toggleMute">
            <svg v-if="volume > 0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <div
            ref="volumeBarRef"
            class="vol-bar"
            :class="{ 'is-dragging': isVolumeDragging }"
            :style="{ '--volume-position': (volume * 100) + '%' }"
            role="slider"
            aria-label="音量"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="Math.round(volume * 100)"
            :aria-valuetext="`${Math.round(volume * 100)}%`"
            tabindex="0"
            @pointerdown="startVolumeDragging"
            @pointermove="handleVolumeDragging"
            @pointerup="stopVolumeDragging"
            @pointercancel="cancelVolumeDragging"
            @lostpointercapture="cancelVolumeDragging"
            @keydown="handleVolumeKeydown"
          >
            <div class="vol-line"></div>
            <div class="vol-now" :style="{ width: (volume * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </footer>

    <!-- 手机与 iPad 使用独立控制区，避免继承桌面播放器的白色底板和歌曲信息 -->
    <nav v-else class="mobile-player-dock" aria-label="移动端播放器">
      <button
        v-if="isMobileLyricsView"
        class="mobile-lyrics-favorite"
        :class="{ liked: isLiked }"
        type="button"
        :aria-label="isLiked ? '取消收藏' : '收藏歌曲'"
        :title="isLiked ? '取消收藏' : '收藏歌曲'"
        @click.stop="toggleLike"
      >
        <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <div
        class="mobile-player-timeline"
        :class="{ dragging: isDragging }"
        @click="seek"
        @mousedown="startDragging"
        @mousemove="handleDragging"
        @mouseup="stopDragging"
        @mouseleave="stopDragging"
      >
        <div class="mobile-player-timeline-track">
          <div class="mobile-player-timeline-fill" :style="{ width: progress + '%' }">
            <span class="mobile-player-timeline-thumb"></span>
            <ProgressWalker class="mobile-progress-character" :is-playing="isPlaying" :dragging="isDragging" />
          </div>
        </div>
        <div class="mobile-player-timeline-meta">
          <span>{{ formatTime(isDragging ? dragCurrentTime : currentTime) }}</span>
          <span>高音质</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="mobile-transport-controls" aria-label="播放控制">
        <button class="mobile-transport-btn" :class="playMode" :title="playMode === 'list' ? '顺序播放' : playMode === 'single' ? '单曲循环' : '随机播放'" @click="togglePlayMode">
          <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z"/>
          </svg>
        </button>
        <button class="mobile-transport-btn" type="button" title="上一首" @click="prevSong">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        <button class="mobile-transport-btn mobile-transport-play" type="button" :title="isPlaying ? '暂停' : '播放'" @click="togglePlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="mobile-transport-btn" type="button" title="下一首" @click="nextSong">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
        <button class="mobile-transport-btn" type="button" title="播放列表" @click="handlePlaylistClick">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- 播放列表：手机 / iPad 为底部抽屉，桌面保留右下浮层。 -->
    <Transition name="playlist-drawer">
      <div
        v-if="showPlaylist"
        class="playlist-popup-layer"
        :class="{ 'is-drawer': isCompactPlayer }"
        @click.self="closePlaylist"
      >
        <section
          class="playlist-popup"
          :style="{ '--playlist-drawer-drag': `${playlistDrawerDragY}px` }"
          role="dialog"
          aria-modal="true"
          aria-label="播放列表"
        >
          <div
            v-if="isCompactPlayer"
            class="playlist-drawer-grab"
            aria-hidden="true"
            @touchstart.passive="startPlaylistDrawerDrag"
            @touchmove.prevent="movePlaylistDrawerDrag"
            @touchend="endPlaylistDrawerDrag"
            @touchcancel="cancelPlaylistDrawerDrag"
          >
            <span></span>
          </div>
          <div class="popup-header">
            <div>
              <h3>播放列表</h3>
              <span>{{ playlist.length }} 首歌曲</span>
            </div>
            <button class="close-btn" type="button" aria-label="关闭播放列表" @click="closePlaylist">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div v-if="playlist.length" class="popup-list">
            <div
              v-for="(song, index) in playlist"
              :key="song.id || song.url || `${song.title}-${index}`"
              class="popup-item"
              :class="{ active: currentIndex === index }"
            >
              <span class="item-index" @click="playSong(index)">{{ index + 1 }}</span>
              <div class="item-cover" @click="playSong(index)">
                <img :src="song.cover" :alt="song.title" />
              </div>
              <div class="item-info" @click="playSong(index)">
                <h4>{{ song.title }}</h4>
                <p>{{ song.artist }}</p>
              </div>
              <span class="item-time">{{ song.duration }}</span>
              <button class="remove-btn" type="button" aria-label="从播放列表移除" @click.stop="removeFromPlaylist(index)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-else class="playlist-empty-state">
            <strong>播放列表还是空的</strong>
            <span>下一首会继续从本地音乐中切换</span>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlayer } from '../composables/usePlayer'
import { useProgressBar } from '../composables/useProgressBar'
import { useVolumeSlider } from '../composables/useVolumeSlider'
import MusicPageBackground from '../components/MusicPageBackground.vue'
import ProgressWalker from '../components/ProgressWalker.vue'
import PlayerShinchanDecor from '../components/PlayerShinchanDecor.vue'
import LyricsToggleButton from '../components/LyricsToggleButton.vue'
import PlayerTitleMarquee from '../components/PlayerTitleMarquee.vue'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp } from '../config/musicThemeCatalog'

const router = useRouter()
const route = useRoute()

const {
  currentSong: sharedCurrentSong,
  isPlaying: sharedIsPlaying,
  currentTime: sharedCurrentTime,
  duration: sharedDuration,
  volume: sharedVolume,
  isLiked: sharedIsLiked,
  playlist: sharedPlaylist,
  currentIndex: sharedCurrentIndex,
  playMode: sharedPlayMode,
  playByIndex,
  playSong: playerPlaySong,
  setCurrentSong,
  removeFromPlaylist,
  initAudio,
  syncPlayerClock,
  audioElement,
  seek: globalSeek,
  parsedLyrics,
  currentLyricIndex,
  isLyricsLoading,
  loadLyrics,
  next,
  prev,
  toggleLike: playerToggleLike,
  togglePlay: playerTogglePlay,
  play: playerPlay,
  pause: playerPause,
  cyclePlayMode
} = usePlayer()

const { settings: musicSettings } = useMusicBackground()
const activeMusicIp = computed(() => getMusicThemeIp(musicSettings.preset))

// ── 进度条（使用共享 composable）──
const {
  progress,
  tooltipPosition,
  isDragging,
  dragCurrentTime,
  formatTime,
  syncProgress,
  seek,
  startDragging,
  handleDragging,
  stopDragging
} = useProgressBar({
  currentTime: sharedCurrentTime,
  duration: sharedDuration,
  onSeek: (percent) => globalSeek(percent * sharedDuration.value)
})

const lyricsRef = ref(null)
const isDarkMode = ref(false)
const isReturning = ref(false)
const isCompactPlayer = ref(false)
const showPlaylist = ref(false)
const compactPlayerMedia = window.matchMedia('(max-width: 1180px), (max-width: 1366px) and (pointer: coarse)')
const isMobileLyricsView = computed(() => isCompactPlayer.value && route.query.view === 'lyrics')

const syncCompactPlayer = () => {
  isCompactPlayer.value = compactPlayerMedia.matches
}

const openMobileLyrics = () => {
  if (!isCompactPlayer.value || isMobileLyricsView.value) return
  router.push({
    path: route.path,
    query: {
      ...route.query,
      view: 'lyrics'
    }
  })
}

const handlePlaylistClick = () => {
  showPlaylist.value = !showPlaylist.value
}
const playlistDrawerDragY = ref(0)
let playlistDrawerStartY = 0

const closePlaylist = () => {
  playlistDrawerDragY.value = 0
  showPlaylist.value = false
}

const startPlaylistDrawerDrag = (event) => {
  if (!isCompactPlayer.value || event.touches.length !== 1) return
  playlistDrawerStartY = event.touches[0].clientY
}

const movePlaylistDrawerDrag = (event) => {
  if (!isCompactPlayer.value || event.touches.length !== 1) return
  playlistDrawerDragY.value = Math.max(0, event.touches[0].clientY - playlistDrawerStartY)
}

const endPlaylistDrawerDrag = () => {
  if (playlistDrawerDragY.value >= 86) {
    closePlaylist()
    return
  }
  playlistDrawerDragY.value = 0
}

const cancelPlaylistDrawerDrag = () => {
  playlistDrawerDragY.value = 0
}
const previousVolume = ref(0.7)

const isLyricsDragging = ref(false)
const isLyricsManualMode = ref(false)
const isLyricsViewSettling = ref(false)
let lyricsDragStartY = 0
let lyricsDragStartScrollTop = 0
let lyricsDragMoved = false
let lyricsEntryFrame = 0
let lyricsEntrySettleFrame = 0
let lyricsEntrySettleTimer = 0

const scrollActiveLineToCenter = (smooth = true) => {
  if (!lyricsRef.value || isLyricsManualMode.value) return
  const activeLine = lyricsRef.value.querySelector('.lyrics-line.active')
  if (!activeLine) return

  const viewport = lyricsRef.value
  const viewportRect = viewport.getBoundingClientRect()
  const activeRect = activeLine.getBoundingClientRect()
  const targetTop = Math.max(
    0,
    viewport.scrollTop
      + activeRect.top
      - viewportRect.top
      - (viewport.clientHeight - activeRect.height) / 2
  )
  const distance = Math.abs(targetTop - viewport.scrollTop)
  const shouldAnimate = smooth && distance < viewport.clientHeight * 0.72

  if (shouldAnimate) {
    viewport.scrollTo({ top: targetTop, behavior: 'smooth' })
    return
  }

  // Entering the lyric reader can require skipping dozens of lines. Assigning
  // scrollTop directly avoids the long native smooth-scroll animation.
  const previousBehavior = viewport.style.scrollBehavior
  viewport.style.scrollBehavior = 'auto'
  viewport.scrollTop = targetTop
  viewport.style.scrollBehavior = previousBehavior
}

const jumpToCurrentLyricImmediately = () => {
  if (!isMobileLyricsView.value) return

  isLyricsManualMode.value = false
  isLyricsViewSettling.value = true
  syncPlayerClock()

  if (lyricsEntryFrame) cancelAnimationFrame(lyricsEntryFrame)
  if (lyricsEntrySettleFrame) cancelAnimationFrame(lyricsEntrySettleFrame)
  if (lyricsEntrySettleTimer) clearTimeout(lyricsEntrySettleTimer)

  nextTick(() => {
    lyricsEntryFrame = requestAnimationFrame(() => {
      lyricsEntryFrame = 0
      scrollActiveLineToCenter(false)
      lyricsEntrySettleFrame = requestAnimationFrame(() => {
        lyricsEntrySettleFrame = 0
        scrollActiveLineToCenter(false)
      })
    })
  })

  lyricsEntrySettleTimer = window.setTimeout(() => {
    lyricsEntrySettleTimer = 0
    scrollActiveLineToCenter(false)
    isLyricsViewSettling.value = false
  }, 120)
}

const onLyricsMouseMove = (event) => {
  if (!isLyricsDragging.value || !lyricsRef.value) return
  const deltaY = event.clientY - lyricsDragStartY
  if (Math.abs(deltaY) > 4) lyricsDragMoved = true
  lyricsRef.value.scrollTop = lyricsDragStartScrollTop - deltaY
}

const onLyricsMouseUp = () => {
  isLyricsDragging.value = false
  document.removeEventListener('mousemove', onLyricsMouseMove)
  document.removeEventListener('mouseup', onLyricsMouseUp)
}

const onLyricsMouseDown = (event) => {
  if (!lyricsRef.value || event.button !== 0) return
  event.preventDefault()
  isLyricsDragging.value = true
  isLyricsManualMode.value = true
  lyricsDragStartY = event.clientY
  lyricsDragStartScrollTop = lyricsRef.value.scrollTop
  lyricsDragMoved = false
  document.addEventListener('mousemove', onLyricsMouseMove)
  document.addEventListener('mouseup', onLyricsMouseUp)
}

const onLyricsTouchMove = (event) => {
  if (!isLyricsDragging.value || !lyricsRef.value) return
  event.preventDefault()
  const deltaY = event.touches[0].clientY - lyricsDragStartY
  if (Math.abs(deltaY) > 4) lyricsDragMoved = true
  lyricsRef.value.scrollTop = lyricsDragStartScrollTop - deltaY
}

const onLyricsTouchEnd = () => {
  isLyricsDragging.value = false
  document.removeEventListener('touchmove', onLyricsTouchMove)
  document.removeEventListener('touchend', onLyricsTouchEnd)
}

const onLyricsTouchStart = (event) => {
  if (!lyricsRef.value) return
  isLyricsDragging.value = true
  isLyricsManualMode.value = true
  lyricsDragStartY = event.touches[0].clientY
  lyricsDragStartScrollTop = lyricsRef.value.scrollTop
  lyricsDragMoved = false
  document.addEventListener('touchmove', onLyricsTouchMove, { passive: false })
  document.addEventListener('touchend', onLyricsTouchEnd)
}

const onLyricsWheel = () => {
  isLyricsManualMode.value = true
}

const onLyricLineClick = (line) => {
  if (lyricsDragMoved || !line || line.unsynced || typeof line.time !== 'number') return
  isLyricsManualMode.value = false
  globalSeek(line.time)
  if (!isPlaying.value) {
    playerPlay()
  }
  nextTick(() => scrollActiveLineToCenter(true))
}

const audioRef = computed(() => audioElement.value)

const isPlaying = sharedIsPlaying
const currentTime = sharedCurrentTime
const duration = sharedDuration
const volume = sharedVolume
const isLiked = sharedIsLiked

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
    volume.value = nextVolume
    if (audioRef.value) audioRef.value.volume = nextVolume
  }
})
const currentSong = sharedCurrentSong
const hasUnsyncedLyrics = computed(() => parsedLyrics.value.some(line => line.unsynced))
const lyricsEmptyText = computed(() => {
  if (currentSong.value?.isPreview || currentSong.value?.source === 'online') {
    return '试听片段没有准确的完整版时间点，暂不显示同步歌词'
  }
  if (currentSong.value?.source === 'audius') {
    if (currentSong.value?.isInstrumental) {
      return '作者已标注这首在线歌曲为纯音乐'
    }
    return '该在线歌曲暂无匹配歌词，可能为纯音乐或歌词库尚未收录'
  }
  return '暂无歌词'
})
const playlist = sharedPlaylist
const currentIndex = sharedCurrentIndex
const playMode = sharedPlayMode

const checkDarkMode = () => {
  isDarkMode.value = document.body.classList.contains('dark-mode')
    || document.body.classList.contains('music-theme-dark')
}

let darkModeObserver = null

onMounted(() => {
  syncCompactPlayer()
  compactPlayerMedia.addEventListener?.('change', syncCompactPlayer)
  window.addEventListener('mesting:request-back', handleScopedBackRequest)

  if (window.darkModeObserver) {
    window.musicPageObserver = window.darkModeObserver
    window.darkModeObserver = null
  }

  checkDarkMode()
  darkModeObserver = new MutationObserver(checkDarkMode)
  darkModeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  window.playerPageObserver = darkModeObserver

  const audio = initAudio()
  if (audio) {
    audio.volume = volume.value
  }

  syncPlayerClock()
  loadLyrics().finally(() => {
    syncPlayerClock()
    syncProgress()
    nextTick(() => scrollActiveLineToCenter(false))
  })
})

// 组件卸载时清理观察器
onUnmounted(() => {
  compactPlayerMedia.removeEventListener?.('change', syncCompactPlayer)
  window.removeEventListener('mesting:request-back', handleScopedBackRequest)
  if (darkModeObserver) {
    darkModeObserver.disconnect()
  }
  if (window.playerPageObserver === darkModeObserver) {
    window.playerPageObserver = null
  }
  document.removeEventListener('mousemove', onLyricsMouseMove)
  document.removeEventListener('mouseup', onLyricsMouseUp)
  document.removeEventListener('touchmove', onLyricsTouchMove)
  document.removeEventListener('touchend', onLyricsTouchEnd)
  if (lyricsEntryFrame) cancelAnimationFrame(lyricsEntryFrame)
  if (lyricsEntrySettleFrame) cancelAnimationFrame(lyricsEntrySettleFrame)
  if (lyricsEntrySettleTimer) clearTimeout(lyricsEntrySettleTimer)
})

watch(currentSong, () => {
  isLyricsManualMode.value = false
  syncPlayerClock()
  loadLyrics().finally(() => {
    syncPlayerClock()
    syncProgress()
    nextTick(() => scrollActiveLineToCenter(false))
  })
})

watch(isPlaying, (playing) => {
  if (playing) {
    tooltipPosition.value = 0
  }
})

watch(currentLyricIndex, (index) => {
  if (index >= 0) {
    nextTick(() => scrollActiveLineToCenter(!isLyricsViewSettling.value))
  }
})

watch(
  isMobileLyricsView,
  (visible) => {
    if (visible) jumpToCurrentLyricImmediately()
  },
  { flush: 'post' }
)

// 使用统一的 cyclePlayMode 替代直接操作 playMode
const togglePlayMode = () => cyclePlayMode()

const leaveMobileLyricsView = () => {
  const previousRoute = window.history.state?.back
  if (typeof previousRoute === 'string' && previousRoute.startsWith('/music-player')) {
    router.back()
    return
  }

  const query = { ...route.query }
  delete query.view
  return router.replace({ path: '/music-player', query })
}

const handlePlayerBack = () => {
  if (showPlaylist.value) {
    closePlaylist()
    return true
  }

  if (isMobileLyricsView.value) {
    leaveMobileLyricsView()
    return true
  }

  if (isReturning.value) return true
  isReturning.value = true
  router.replace('/music')
  return true
}

const handleScopedBackRequest = (event) => {
  if (route.path !== '/music-player') return
  if (handlePlayerBack() && event.detail) {
    event.detail.handled = true
  }
}

const goBack = () => handlePlayerBack()

const togglePlay = () => playerTogglePlay()

const playSong = (index) => {
  playByIndex(index)
  if (isCompactPlayer.value) closePlaylist()
}

const prevSong = () => prev()
const nextSong = () => next()
const toggleLike = () => playerToggleLike()

const defaultCover = '/images/covers/qingtian.jpg'

const handleImageError = (e) => { e.target.src = defaultCover }

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = previousVolume.value
  }
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
}

const setSong = (song) => {
  playerPlaySong(song)
}

const setPlaying = (playing) => {
  if (playing) {
    playerPlay()
  } else {
    playerPause()
  }
}

defineExpose({ setSong, setPlaying, currentSong, isPlaying })
</script>
<style scoped>
@import '../css/MusicPlayer.css';
</style>
