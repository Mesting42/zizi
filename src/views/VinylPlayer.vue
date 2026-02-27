<template>
  <div class="vinyl-player-page" :class="{ 'dark-theme': isDarkMode }">
    <button class="close-btn" @click="goBack">
      ✕
    </button>

    <div class="player-container">
      <div class="vinyl-section">
        <div class="vinyl-wrapper">
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

        <div class="current-song-info">
          <h1 class="song-title">{{ currentSong.title }}</h1>
          <p class="song-artist">{{ currentSong.artist }}</p>
        </div>
      </div>

      <div class="lyrics-section">
        <div class="lyrics-header">
          <!-- 移除歌词标题 -->
        </div>
        <div class="lyrics-content" ref="lyricsRef">
          <template v-if="parsedLyrics.length > 0">
            <div 
              v-for="(line, index) in parsedLyrics" 
              :key="index"
              class="lyrics-line" 
              :class="{ active: index === currentLyricIndex }"
            >
              {{ line.text }}
            </div>
          </template>
          <div v-else class="lyrics-line" :class="{ active: currentTime > 0 }">
            暂无歌词
          </div>
        </div>
      </div>
    </div>

    <!-- 底部播放控制栏 -->
    <footer class="player-bar">
      <div 
        class="player-progress" 
        :class="{ dragging: isDragging }"
        @click="seek"
        @mousedown="isDragging = true"
      >
        <div class="player-progress-bar">
          <div class="player-progress-now" :style="{ width: progress + '%' }"></div>
          <div 
            class="player-progress-tooltip" 
            :style="{ left: tooltipPosition + '%' }"
          >
            <span class="tooltip-time-current">{{ formatTime(currentTime) }}</span>
            <span class="tooltip-time-sep">/</span>
            <span class="tooltip-time-duration">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      
      <div class="bar-song">
        <img :src="currentSong.cover" class="song-cover spinning" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }" @error="handleImageError" />
        <div class="song-text">
          <h4>{{ currentSong.title }}</h4>
          <p>{{ currentSong.artist }}</p>
        </div>
        <button class="like-btn" :class="{ liked: isLiked }" @click.stop="toggleLike">
          <svg viewBox="0 0 24 24" :fill="isLiked ? '#e74c3c' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div class="bar-controls">
        <button class="ctrl-btn play-mode-btn" :class="playMode" :title="playMode === 'list' ? '列表循环' : playMode === 'single' ? '单曲循环' : '随机播放'" @click="togglePlayMode">
          <svg v-if="playMode === 'list'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
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
          <button class="ctrl-btn list-btn" @click="showPlaylist = !showPlaylist" title="播放列表">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
            <span v-if="playlist.length > 0" class="list-count">{{ playlist.length }}</span>
          </button>
        </div>
      </div>

      <div class="bar-extra">
        <div class="volume-wrap">
          <button class="vol-btn" @click="toggleMute">
            <svg v-if="volume > 0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <div class="vol-bar" @click="seekVolume">
            <div class="vol-line"></div>
            <div class="vol-now" :style="{ width: (volume * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </footer>

    <!-- 播放列表弹窗 -->
    <div class="playlist-popup" v-if="showPlaylist">
      <div class="popup-header">
        <h3>播放列表</h3>
        <button class="close-btn" @click="showPlaylist = false">✕</button>
      </div>
      <div class="popup-content">
        <div 
          v-for="(song, index) in playlist" 
          :key="index" 
          class="popup-song"
          :class="{ active: currentIndex === index }"
          @click="playSong(index)"
        >
          <img :src="song.cover" class="popup-cover" />
          <div class="popup-info">
            <h4>{{ song.title }}</h4>
            <p>{{ song.artist }}</p>
          </div>
          <span class="popup-duration">{{ song.duration }}</span>
        </div>
        <div v-if="playlist.length === 0" class="empty-playlist">
          播放列表为空
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlayer } from '../composables/usePlayer'

const router = useRouter()
const route = useRoute()

const { 
  currentSong,
  isPlaying,
  currentTime,
  duration,
  playlist,
  currentIndex,
  playMode,
  volume,
  isLiked,
  parsedLyrics,
  currentLyricIndex,
  initAudio,
  togglePlay: globalTogglePlay,
  seek: globalSeek,
  next: globalNext,
  prev: globalPrev,
  playByIndex,
  setVolume: globalSetVolume,
  toggleLike: globalToggleLike,
  cyclePlayMode
} = usePlayer()

const lyricsRef = ref(null)
const isDarkMode = ref(false)
const showPlaylist = ref(false)
const previousVolume = ref(0.7)
const isDragging = ref(false)
const tooltipPosition = ref(0)

const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const checkDarkMode = () => {
  isDarkMode.value = document.body.classList.contains('dark-mode')
}

const goBack = () => {
  router.push('/music')
}

const formatTime = (time) => {
  if (!time || !isFinite(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  globalTogglePlay()
}

const prevSong = () => {
  globalPrev()
}

const nextSong = () => {
  globalNext()
}

const playSong = (index) => {
  playByIndex(index)
  showPlaylist.value = false
}

const togglePlayMode = () => {
  cyclePlayMode()
}

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = previousVolume.value
  }
  globalSetVolume(volume.value)
}

const seekVolume = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  globalSetVolume(percent)
}

const seek = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  let percent = (e.clientX - rect.left) / rect.width
  percent = Math.max(0, Math.min(1, percent))
  globalSeek(percent * duration.value)
}

const handleSeekMove = (e) => {
  if (isDragging.value) {
    const progressBar = document.querySelector('.player-progress')
    if (progressBar) {
      const rect = progressBar.getBoundingClientRect()
      let percent = (e.clientX - rect.left) / rect.width
      percent = Math.max(0, Math.min(1, percent))
      
      let tooltipPercent = percent * 100
      const minPos = 50 / 2
      const maxPos = 100 - 50 / 2
      tooltipPercent = Math.max(minPos, Math.min(maxPos, tooltipPercent))
      tooltipPosition.value = tooltipPercent
    }
  }
}

const stopDragging = () => {
  if (isDragging.value) {
    const progressBar = document.querySelector('.player-progress')
    if (progressBar) {
      const rect = progressBar.getBoundingClientRect()
      const percent = tooltipPosition.value / 100
      globalSeek(percent * duration.value)
    }
  }
  isDragging.value = false
}

const toggleLike = () => {
  globalToggleLike()
}

const defaultCover = '/images/13416469354055551.jpeg'

const handleImageError = (e) => {
  e.target.src = defaultCover
}

onMounted(() => {
  initAudio()
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  
  document.addEventListener('mouseup', stopDragging, { passive: true })
  document.addEventListener('mousemove', handleSeekMove, { passive: false })
})

// 监听歌词索引变化，自动滚动
watch(currentLyricIndex, (index) => {
  if (index >= 0 && lyricsRef.value) {
    nextTick(() => {
      const activeLine = lyricsRef.value.querySelector('.lyrics-line.active')
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
})

// 监听播放进度，自动更新tooltip位置
watch(currentTime, () => {
  if (!isDragging.value && duration.value > 0) {
    const progressPercent = (currentTime.value / duration.value) * 100
    const progressBar = document.querySelector('.player-progress')
    if (progressBar) {
      const progressBarWidth = progressBar.offsetWidth || 500
      const progressPixels = (progressPercent / 100) * progressBarWidth
      const maxOffset = 35
      const currentOffset = Math.min(progressPixels * 0.4, maxOffset)
      const tooltipPixels = progressPixels - currentOffset
      tooltipPosition.value = (tooltipPixels / progressBarWidth) * 100
    }
  }
})

// 组件卸载时清理
import { onUnmounted, nextTick } from 'vue'
onUnmounted(() => {
  // 清理工作
})
</script>
<style>
@import '../css/VinylPlayer.css';
</style>



