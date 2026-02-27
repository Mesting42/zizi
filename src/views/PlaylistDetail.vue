<template>
  <div class="playlist-detail" :class="{ 'dark-theme': isDarkMode }">
    <header class="detail-header">
      <div class="cover-wrap">
        <img :src="coverPreview" alt="" class="cover" />
        <div class="upload-overlay" v-if="!isHomePlaylist">
          <input 
            type="file" 
            accept="image/*" 
            @change="handleCoverUpload"
            id="cover-upload"
          />
          <label for="cover-upload" class="upload-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            更换封面
          </label>
        </div>
      </div>
      <div class="info">
        <div class="label">歌单</div>
        <input
          v-model="editableName"
          class="name-input"
          @blur="saveName"
          placeholder="歌单名称"
          :disabled="isHomePlaylist"
        />
        <textarea
          v-model="editableDescription"
          class="desc-input"
          @blur="saveDescription"
          placeholder="为歌单写一句描述..."
          rows="2"
          :disabled="isHomePlaylist"
        />
        <div class="actions">
          <button class="back-btn" @click="goBack">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            返回音乐首页
          </button>
          <button class="play-all-btn" @click="playAll" :disabled="!playlist || playlist.songs.length === 0" :class="{ disabled: !playlist || playlist.songs.length === 0 }">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            播放全部
          </button>
          <button class="danger-btn" @click="handleDelete" v-if="!isHomePlaylist">删除歌单</button>
        </div>
      </div>
    </header>

    <main class="detail-main" v-if="playlist">
      <div class="songs-header">
        <h2>歌曲列表</h2>
        <button class="add-btn" @click="showAdd = !showAdd" v-if="!isHomePlaylist">
          {{ showAdd ? '取消添加' : '添加歌曲' }}
        </button>
      </div>

      <!-- 默认从“我的收藏”中添加歌曲 -->
      <section v-if="showAdd && !isHomePlaylist" class="add-form">
        <div class="add-form-header">
          <h3>从收藏中添加歌曲</h3>
          <div class="add-form-actions">
            <button 
              class="secondary-btn" 
              @click="selectAllSongs"
              :disabled="!favorites.length"
            >
              {{ selectedSongs.length === favorites.length ? '取消全选' : '全选' }}
            </button>
            <button 
              class="primary-btn" 
              @click="addSelectedSongs"
              :disabled="selectedSongs.length === 0"
            >
              添加选中歌曲 ({{ selectedSongs.length }})
            </button>
          </div>
        </div>
        <div v-if="!favorites.length" class="empty">
          你的收藏列表为空，请先在音乐首页收藏几首歌～
        </div>
        <div v-else class="favorite-add-list">
          <div
            class="favorite-row"
            v-for="(song, index) in favorites"
            :key="song.url + index"
            :class="{ selected: selectedSongs.includes(song) }"
          >
            <div class="fav-checkbox">
              <input 
                type="checkbox" 
                :id="'song-' + index" 
                :checked="selectedSongs.includes(song)"
                @change="toggleSongSelection(song)"
              />
              <label :for="'song-' + index"></label>
            </div>
            <div class="fav-cover">
              <img :src="song.cover || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=music%20note%20icon%20minimal%20style&size=512x512'" alt="" />
            </div>
            <div class="fav-info">
              <div class="fav-title">{{ song.title }}</div>
              <div class="fav-artist">{{ song.artist }}</div>
            </div>
            <button class="primary-btn small" @click="addFavoriteSong(song)">
              添加
            </button>
          </div>
        </div>
      </section>

      <section v-if="playlist.songs.length" class="song-table">
        <div class="song-table-header">
          <span class="col-index">#</span>
          <span class="col-cover">封面</span>
          <span class="col-title">标题</span>
          <span class="col-artist">歌手</span>
          <span class="col-duration">时长</span>
          <span class="col-actions">操作</span>
        </div>
        <div
          class="song-row"
          v-for="(song, index) in playlist.songs"
          :key="song.url + index"
          @click="play(song)"
          style="cursor: pointer;"
        >
          <span class="col-index">{{ index + 1 }}</span>
          <span class="col-cover">
            <img :src="song.cover || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=music%20note%20icon%20minimal%20style&size=512x512'" alt="" class="song-cover-small" />
          </span>
          <span class="col-title">{{ song.title }}</span>
          <span class="col-artist">{{ song.artist }}</span>
          <span class="col-duration">{{ song.duration || '--:--' }}</span>
          <span class="col-actions">
            <button class="link-btn" @click.stop="play(song)">播放</button>
            <button class="link-btn" @click.stop="addToGlobalPlaylist(song)">添加</button>
            <button class="link-btn danger" @click.stop="removeSong(index)" v-if="!isHomePlaylist">移除</button>
          </span>
        </div>
      </section>
      <div v-else class="empty">
        该歌单暂无歌曲，点击上方“添加歌曲”开始创建吧～
      </div>
    </main>

    <!-- 底部播放控制栏 -->
    <footer class="player-bar">
      <!-- 顶部进度条 -->
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
            :style="{ left: (isDragging ? tooltipPosition : tooltipPosition) + '%' }"
          >
            <span class="tooltip-time-current">{{ formatTime(currentTime) }}</span>
            <span class="tooltip-time-sep">/</span>
            <span class="tooltip-time-duration">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      
      <div class="bar-song" @click="goToPlayer">
        <img :src="currentSong.cover" class="song-cover spinning" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }" />
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
            <span v-if="globalPlaylist.length > 0" class="list-count">{{ globalPlaylist.length }}</span>
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
        <button class="close-btn" @click="showPlaylist = false">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="popup-list">
        <div 
          class="popup-item" 
          v-for="(song, index) in globalPlaylist" 
          :key="index"
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
        </div>
        <div v-if="globalPlaylist.length === 0" class="empty-playlist">
          播放列表为空
        </div>
      </div>
    </div>

    <div v-if="showModeMessage" class="mode-message">
      {{ modeMessageText }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylists } from '../composables/usePlaylists'
import { usePlayer } from '../composables/usePlayer'

const route = useRoute()
const router = useRouter()

const {
  playlists,
  getPlaylistById,
  renamePlaylist,
  updateDescription,
  updateCover,
  addSongToPlaylist,
  removeSongFromPlaylist,
  removePlaylist,
  incrementPlayCount
} = usePlaylists()

const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isLiked,
  playMode,
  playlist: globalPlaylist,
  currentIndex,
  initAudio,
  togglePlay: globalTogglePlay,
  seek: globalSeek,
  next: globalNext,
  prev: globalPrev,
  playByIndex,
  playSong: globalPlaySong,
  setVolume: globalSetVolume,
  toggleLike: globalToggleLike,
  addToPlaylist: globalAddToPlaylist,
  cyclePlayMode,
  favorites,
  setCurrentPlaylistId
} = usePlayer()

const playlistId = computed(() => route.params.id)
const playlist = computed(() => getPlaylistById(playlistId.value))
const isHomePlaylist = computed(() => playlistId.value.startsWith('featured-') || playlistId.value.startsWith('treasure-') || playlistId.value.startsWith('editor-'))

const editableName = ref('')
const editableDescription = ref('')
const showAdd = ref(false)
const coverPreview = ref('')
const isDarkMode = ref(false)
const showPlaylist = ref(false)
const previousVolume = ref(0.7)
const isDragging = ref(false)
const tooltipPosition = ref(0)
const showModeMessage = ref(false)
const modeMessageText = ref('')
const selectedSongs = ref([])

const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

onMounted(() => {
  initAudio()
  if (playlist.value) {
    editableName.value = playlist.value.name
    editableDescription.value = playlist.value.description || ''
    coverPreview.value = playlist.value.cover
  }
  
  isDarkMode.value = document.body.classList.contains('dark-mode')
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.body.classList.contains('dark-mode')
  })
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  
  document.addEventListener('mouseup', stopDragging, { passive: true })
  document.addEventListener('mousemove', handleSeekMove, { passive: false })
  
  window.darkModeObserver = observer
})

const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = e.target.result
      if (playlist.value) {
        updateCover(playlist.value.id, e.target.result)
      }
    }
    reader.readAsDataURL(file)
  }
}

const goBack = () => {
  router.push('/music')
}

const saveName = () => {
  if (playlist.value) {
    renamePlaylist(playlist.value.id, editableName.value.trim())
  }
}

const saveDescription = () => {
  if (playlist.value) {
    updateDescription(playlist.value.id, editableDescription.value.trim())
  }
}

const addFavoriteSong = (song) => {
  if (!playlist.value) return
  console.log('尝试添加歌曲到歌单:', song.title, '歌单ID:', playlist.value.id)
  // 确保歌曲对象有 id 属性
  const songWithId = {
    ...song,
    id: song.id || `music_${song.url.replace(/[^a-zA-Z0-9]/g, '_')}`
  }
  addSongToPlaylist(playlist.value.id, songWithId)
  console.log('添加歌曲操作完成')
  showAdd.value = false // 添加歌曲后隐藏添加提示框
}

const toggleSongSelection = (song) => {
  const index = selectedSongs.value.findIndex(s => s.url === song.url)
  if (index > -1) {
    selectedSongs.value.splice(index, 1)
  } else {
    // 确保歌曲对象有 id 属性
    const songWithId = {
      ...song,
      id: song.id || `music_${song.url.replace(/[^a-zA-Z0-9]/g, '_')}`
    }
    selectedSongs.value.push(songWithId)
  }
}

const selectAllSongs = () => {
  if (selectedSongs.value.length === favorites.value.length) {
    // 取消全选
    selectedSongs.value = []
  } else {
    // 全选 - 确保所有歌曲都有 id
    selectedSongs.value = favorites.value.map(song => ({
      ...song,
      id: song.id || `music_${song.url.replace(/[^a-zA-Z0-9]/g, '_')}`
    }))
  }
}

const addSelectedSongs = () => {
  if (!playlist.value || selectedSongs.value.length === 0) return
  console.log('尝试添加选中的歌曲到歌单:', selectedSongs.value.length, '首')
  selectedSongs.value.forEach(song => {
    addSongToPlaylist(playlist.value.id, song)
  })
  console.log('添加选中歌曲操作完成')
  selectedSongs.value = [] // 清空选中状态
  showAdd.value = false // 隐藏添加提示框
}

const removeSong = (index) => {
  if (!playlist.value) return
  removeSongFromPlaylist(playlist.value.id, index)
}

const play = (song) => {
  globalPlaySong(song)
}

const playAll = () => {
  if (!playlist.value || !playlist.value.songs.length) return
  // 设置当前播放的歌单ID
  setCurrentPlaylistId(playlistId.value)
  // 将歌单中的歌曲按顺序加入用户播放列表
  playlist.value.songs.forEach(song => {
    globalAddToPlaylist(song)
  })
  // 从第一首开始播放
  playByIndex(0)
}

const addToGlobalPlaylist = (song) => {
  globalAddToPlaylist(song)
}

const handleDelete = () => {
  if (!playlist.value) return
  if (confirm('确定要删除这个歌单吗？该歌单内的歌曲不会被删除。')) {
    removePlaylist(playlist.value.id)
    router.push('/music')
  }
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
  const modes = ['list', 'single', 'random']
  const modeNames = { list: '列表循环', single: '单曲循环', random: '随机播放' }
  const currentIndex = modes.indexOf(playMode.value)
  cyclePlayMode()
  
  modeMessageText.value = modeNames[playMode.value]
  showModeMessage.value = true
  setTimeout(() => {
    showModeMessage.value = false
  }, 1500)
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

const goToPlayer = () => {
  router.push('/music-player')
}

watch(currentSong, () => {
  tooltipPosition.value = 0
  if (duration.value > 0 && currentTime.value > 0) {
    const progressBar = document.querySelector('.player-progress')
    const progressBarWidth = progressBar ? progressBar.offsetWidth : 500
    const progressPixels = (progress.value / 100) * progressBarWidth
    const maxOffset = 35
    const currentOffset = Math.min(progressPixels * 0.4, maxOffset)
    const tooltipPixels = progressPixels - currentOffset
    tooltipPosition.value = (tooltipPixels / progressBarWidth) * 100
  }
})

watch(isPlaying, (playing) => {
  if (playing) {
    tooltipPosition.value = 0
  }
})

watch(currentTime, () => {
  if (!isDragging.value) {
    const progressBar = document.querySelector('.player-progress')
    if (progressBar) {
      const progressBarWidth = progressBar.offsetWidth || 500
      const progressPixels = (progress.value / 100) * progressBarWidth
      const maxOffset = 35
      const currentOffset = Math.min(progressPixels * 0.4, maxOffset)
      const tooltipPixels = progressPixels - currentOffset
      tooltipPosition.value = (tooltipPixels / progressBarWidth) * 100
    }
  }
})
</script>
<style scoped>
@import '../css/PlaylistDetail.css';
</style>




