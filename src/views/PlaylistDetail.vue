<template>
  <div class="playlist-detail" :class="{ 'dark-theme': isDarkMode }">
    <header class="detail-header">
      <div class="cover-wrap">
        <img :src="coverPreview" alt="" class="cover" :class="isHomePlaylist && activeThemeIp !== 'shinchan' ? ['ip-cover', `ip-cover--${activeThemeIp}`] : ''" />
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
        <div class="label">{{ isHomePlaylist ? '在线完整歌单 · Audius' : '歌单' }}</div>
        <h1 v-if="isHomePlaylist" class="playlist-display-title">{{ editableName }}</h1>
        <input
          v-else
          v-model="editableName"
          class="name-input"
          @blur="saveName"
          placeholder="歌单名称"
          :disabled="isHomePlaylist"
        />
        <p v-if="isHomePlaylist" class="playlist-display-description">{{ editableDescription }}</p>
        <textarea
          v-else
          v-model="editableDescription"
          class="desc-input"
          @blur="saveDescription"
          placeholder="为歌单写一句描述..."
          rows="2"
          :disabled="isHomePlaylist"
        />
        <div class="actions">
          <button class="back-btn" type="button" :aria-label="backButtonText" @click="goBack">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            {{ backButtonText }}
          </button>
          <button class="play-all-btn" @click="playAll" :disabled="isOnlinePlaylistLoading || !playlist || playlist.songs.length === 0" :class="{ disabled: isOnlinePlaylistLoading || !playlist || playlist.songs.length === 0 }">
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

      <div v-if="isOnlinePlaylistLoading" class="online-playlist-state loading">
        正在获取可完整播放的在线歌曲...
      </div>
      <div v-else-if="onlinePlaylistError" class="online-playlist-state error">
        {{ onlinePlaylistError }}，当前显示本地歌曲作为备用。
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
              class="primary-btn add-selected-btn"
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
              <img :src="song.cover || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=music%20note%20icon%20minimal%20style&size=512x512'" alt="" loading="lazy" decoding="async" />
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
            <img :src="song.cover || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=music%20note%20icon%20minimal%20style&size=512x512'" alt="" class="song-cover-small" loading="lazy" decoding="async" />
          </span>
          <span class="col-title">{{ song.title }}</span>
          <span class="col-artist">{{ song.artist }}</span>
          <span class="col-duration">{{ song.duration || '--:--' }}</span>
          <span class="col-actions">
            <button class="link-btn" @click.stop="play(song)">播放</button>
            <button class="link-btn" @click.stop="addToGlobalPlaylist(song)">添加</button>
            <button class="link-btn danger" @click.stop="removeSong(index)" v-if="!isHomePlaylist">移除</button>
          </span>
          <button
            class="song-more-btn"
            type="button"
            :aria-label="`打开${song.title}的更多操作`"
            @pointerdown.stop
            @click.stop="openSongActions(song, index)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="5" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="12" cy="19" r="1.7" />
            </svg>
          </button>
        </div>
      </section>
      <div v-else-if="!isOnlinePlaylistLoading" class="empty">
        {{ isHomePlaylist ? '在线曲库暂时没有返回歌曲，请稍后重试～' : '该歌单暂无歌曲，点击上方“添加歌曲”开始创建吧～' }}
      </div>
    </main>

    <!-- 底部播放控制栏 -->
    <footer v-if="false" class="player-bar player-bar-unified" aria-hidden="true">
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
            <span class="tooltip-time-current">{{ formatTime(currentTime) }}</span>
            <span class="tooltip-time-sep">/</span>
            <span class="tooltip-time-duration">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
      
      <div class="bar-song" @click="goToPlayer">
        <span class="bar-song-record" :class="{ 'is-spinning': isPlaying }" aria-hidden="true">
          <img :src="currentSong.cover" class="song-cover" />
        </span>
        <div class="song-text">
          <PlayerTitleMarquee :text="currentSong.title" />
          <p>{{ currentSong.artist }}</p>
        </div>
        <button class="like-btn" :class="{ liked: isLiked }" @click.stop="toggleLike">
          <svg viewBox="0 0 24 24" :fill="isLiked ? '#e74c3c' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
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
            <span v-if="globalPlaylist.length > 0" class="list-count">{{ globalPlaylist.length }}</span>
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

    <MusicBottomPlayer
      variant="capsule"
      :queue-mode="isHomePlaylist ? 'drawer' : 'page'"
    />

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
            <img :src="song.cover" :alt="song.title" loading="lazy" decoding="async" />
          </div>
          <div class="item-info" @click="playSong(index)">
            <h4>{{ song.title }}</h4>
            <p>{{ song.artist }}</p>
          </div>
          <span class="item-time">{{ song.duration }}</span>
        </div>
        <div v-if="globalPlaylist.length === 0" class="empty-playlist">
          接下来没有待播放的歌曲
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="song-actions-sheet">
        <div
          v-if="songActionTarget"
          class="song-actions-overlay"
          @click.self="closeSongActions"
          @keydown.esc="closeSongActions"
        >
          <section class="song-actions-sheet" role="dialog" aria-modal="true" aria-label="歌曲操作">
            <div class="song-actions-handle" aria-hidden="true"></div>
            <div class="song-actions-current">
              <img :src="songActionTarget.song.cover || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=music%20note%20icon%20minimal%20style&size=512x512'" alt="" />
              <div>
                <strong>{{ songActionTarget.song.title }}</strong>
                <span>{{ songActionTarget.song.artist }}</span>
              </div>
            </div>

            <div class="song-actions-list">
              <button type="button" @click="playFromSongActions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                播放此歌曲
              </button>
              <button type="button" @click="addFromSongActions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                加入播放列表
              </button>
              <button v-if="!isHomePlaylist" class="is-danger" type="button" @click="removeFromSongActions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M9 7l1-2h4l1 2M6 7l1 13h10l1-13" /></svg>
                从当前歌单移除
              </button>
            </div>
            <button class="song-actions-cancel" type="button" @click="closeSongActions">取消</button>
          </section>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="playlist-delete-dialog">
        <div
          v-if="showDeleteConfirm"
          class="playlist-delete-overlay"
          @click.self="closeDeleteConfirm"
        >
          <section
            ref="deleteDialogRef"
            class="playlist-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="playlist-delete-title"
            aria-describedby="playlist-delete-description"
            tabindex="-1"
            @keydown.esc="closeDeleteConfirm"
          >
            <button class="playlist-delete-close" type="button" aria-label="关闭" @click="closeDeleteConfirm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div class="playlist-delete-visual" aria-hidden="true">
              <div class="playlist-delete-cover">
                <img :src="coverPreview || playlist?.cover || '/images/playlist-default.jpg'" alt="">
              </div>
              <span class="playlist-delete-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6" />
                </svg>
              </span>
            </div>

            <div class="playlist-delete-copy">
              <span class="playlist-delete-eyebrow">PLAYLIST · 整理歌单</span>
              <h2 id="playlist-delete-title">删除“{{ playlist?.name || editableName || '这个歌单' }}”？</h2>
              <p id="playlist-delete-description">
                删除后，这张歌单将从你的歌单列表中消失。
              </p>
              <div class="playlist-delete-keep-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                歌曲文件与收藏记录都会保留
              </div>
            </div>

            <div class="playlist-delete-actions">
              <button class="playlist-delete-cancel" type="button" @click="closeDeleteConfirm">先保留</button>
              <button class="playlist-delete-confirm" type="button" @click="confirmDeletePlaylist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
                删除歌单
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylists } from '../composables/usePlaylists'
import { usePlayer } from '../composables/usePlayer'
import { useProgressBar } from '../composables/useProgressBar'
import { useVolumeSlider } from '../composables/useVolumeSlider'
import ProgressWalker from '../components/ProgressWalker.vue'
import PlayerShinchanDecor from '../components/PlayerShinchanDecor.vue'
import LyricsToggleButton from '../components/LyricsToggleButton.vue'
import PlayerTitleMarquee from '../components/PlayerTitleMarquee.vue'
import MusicBottomPlayer from '../components/MusicBottomPlayer.vue'
import { loadAudiusPlaylist } from '../services/audius.js'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp, getThemedPlaylistCover } from '../config/musicThemeCatalog'

const route = useRoute()
const router = useRouter()
const { settings: musicBackgroundSettings } = useMusicBackground()
const activeThemeIp = computed(() => getMusicThemeIp(musicBackgroundSettings.preset))

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
  playCollection,
  setVolume: globalSetVolume,
  toggleLike: globalToggleLike,
  addToPlaylist: globalAddToPlaylist,
  cyclePlayMode,
  favorites
} = usePlayer()

// ── 进度条（使用共享 composable）──
const {
  progress,
  tooltipPosition,
  isDragging,
  formatTime,
  syncProgress,
  seek,
  stopDragging
} = useProgressBar({
  currentTime,
  duration,
  onSeek: (percent) => globalSeek(percent * duration.value)
})

const playlistId = computed(() => route.params.id)
const isHomePlaylist = computed(() => playlistId.value.startsWith('featured-') || playlistId.value.startsWith('treasure-') || playlistId.value.startsWith('editor-') || playlistId.value.startsWith('explore-'))
const enteredFromAllPlaylists = computed(() => route.query.from === 'all')
const backButtonText = computed(() => enteredFromAllPlaylists.value ? '返回全部歌单' : '返回音乐首页')
const basePlaylist = computed(() => getPlaylistById(playlistId.value))
const onlineHomePlaylist = ref(null)
const playlist = computed(() => onlineHomePlaylist.value || basePlaylist.value)

const editableName = ref('')
const editableDescription = ref('')
const showAdd = ref(false)
const coverPreview = ref('')
const isDarkMode = ref(false)
const showPlaylist = ref(false)
const songActionTarget = ref(null)
const handlePlaylistClick = () => {
  if (window.matchMedia('(max-width: 679px)').matches) {
    showPlaylist.value = false
    router.push({ name: 'MusicQueue', query: { from: router.currentRoute.value.fullPath } })
    return
  }
  showPlaylist.value = !showPlaylist.value
}
const showDeleteConfirm = ref(false)
const deleteDialogRef = ref(null)
const previousVolume = ref(0.7)

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
    globalSetVolume(nextVolume)
  }
})
const selectedSongs = ref([])
const isOnlinePlaylistLoading = ref(false)
const onlinePlaylistError = ref('')

let darkModeObserver = null

const applyPlaylistMeta = (target) => {
  if (!target) return
  editableName.value = target.name
  editableDescription.value = target.description || ''
  const coverIndex = [...String(target.id || '')].reduce((total, character) => total + character.charCodeAt(0), 0)
  coverPreview.value = isHomePlaylist.value
    ? getThemedPlaylistCover(musicBackgroundSettings.preset, coverIndex, target.cover)
    : target.cover
}

watch(() => musicBackgroundSettings.preset, () => {
  if (isHomePlaylist.value && playlist.value) applyPlaylistMeta(playlist.value)
})

const loadOnlineHomeSongs = async () => {
  const target = basePlaylist.value
  if (!isHomePlaylist.value || !target?.onlineQuery) return

  isOnlinePlaylistLoading.value = true
  onlinePlaylistError.value = ''
  try {
    const songs = await loadAudiusPlaylist(target)
    if (!songs.length) throw new Error('empty-online-playlist')
    onlineHomePlaylist.value = {
      ...target,
      description: `来自 Audius 的 ${songs.length} 首可完整播放独立音乐`,
      songs
    }
    applyPlaylistMeta(onlineHomePlaylist.value)
  } catch (error) {
    onlinePlaylistError.value = '在线完整曲库暂时不可用'
  } finally {
    isOnlinePlaylistLoading.value = false
  }
}

onMounted(() => {
  initAudio()
  applyPlaylistMeta(playlist.value)
  loadOnlineHomeSongs()

  isDarkMode.value = document.body.classList.contains('dark-mode')
    || document.body.classList.contains('music-theme-dark')
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.body.classList.contains('dark-mode')
      || document.body.classList.contains('music-theme-dark')
  })
  darkModeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

  window.darkModeObserver = darkModeObserver

  nextTick(() => syncProgress())
})

// 组件卸载时清理
onUnmounted(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect()
  }
  if (window.darkModeObserver === darkModeObserver) {
    window.darkModeObserver = null
  }
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
  router.push(enteredFromAllPlaylists.value ? '/music/playlists' : '/music')
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

const openSongActions = (song, index) => {
  songActionTarget.value = { song, index }
}

const closeSongActions = () => {
  songActionTarget.value = null
}

const playFromSongActions = () => {
  if (!songActionTarget.value) return
  play(songActionTarget.value.song)
  closeSongActions()
}

const addFromSongActions = () => {
  if (!songActionTarget.value) return
  addToGlobalPlaylist(songActionTarget.value.song)
  closeSongActions()
}

const removeFromSongActions = () => {
  if (!songActionTarget.value) return
  removeSong(songActionTarget.value.index)
  closeSongActions()
}

const play = (song) => {
  if (!playlist.value?.songs?.length) return
  globalPlaySong(song, null, { playlistId: playlistId.value })
}

const playAll = () => {
  if (!playlist.value || !playlist.value.songs.length) return
  playCollection(playlist.value.songs, 0, { playlistId: playlistId.value })
}

const addToGlobalPlaylist = (song) => {
  globalAddToPlaylist(song)
}

const handleDelete = async () => {
  if (!playlist.value) return
  showDeleteConfirm.value = true
  await nextTick()
  deleteDialogRef.value?.focus()
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
}

const confirmDeletePlaylist = () => {
  if (!playlist.value) return
  const playlistToDelete = playlist.value.id
  showDeleteConfirm.value = false
  removePlaylist(playlistToDelete)
  router.push('/music')
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

const toggleLike = () => {
  globalToggleLike()
}

const goToPlayer = () => {
  router.push('/music-player')
}
</script>
<style scoped>
@import '../css/PlaylistDetail.css';
</style>

<style>
/* The detail page imports a large legacy stylesheet whose mobile player rules
   are scoped onto this component's root. Keep the final phone capsule global
   and more specific so the online playlist can never fall back to a full-width
   toolbar again. */
@media (max-width: 767px) {
  body.page-music #app .playlist-detail footer.playlists-bottom-player {
    --mobile-player-progress-color: var(--music-progress-fill, #ff535d);
    --mobile-player-progress-track: rgba(129, 137, 153, .3);
    position: fixed !important;
    top: auto !important;
    z-index: 6000 !important;
    left: 12px !important;
    right: 12px !important;
    bottom: calc(10px + env(safe-area-inset-bottom)) !important;
    width: auto !important;
    max-width: none !important;
    min-height: 66px !important;
    height: 66px !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    gap: 7px !important;
    padding: 0 9px 0 0 !important;
    overflow: visible !important;
    border: 1px solid var(--mobile-ip-card-border, rgba(255, 255, 255, .42)) !important;
    border-top: 1px solid var(--mobile-ip-card-border, rgba(255, 255, 255, .58)) !important;
    border-radius: 999px !important;
    background: var(--mobile-ip-player, var(--music-player-bar-bg, rgba(246, 249, 255, .94))) !important;
    box-shadow:
      0 14px 34px rgba(15, 21, 40, .22),
      inset 0 1px 0 rgba(255, 255, 255, .58) !important;
    backdrop-filter: blur(22px) saturate(155%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(155%) !important;
    transform: none !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .player-shinchan-decor,
  body.page-music #app .playlist-detail .playlists-bottom-player .player-progress,
  body.page-music #app .playlist-detail .playlists-bottom-player .bar-extra,
  body.page-music #app .playlist-detail .playlists-bottom-player .like-btn,
  body.page-music #app .playlist-detail .playlists-bottom-player .play-mode-btn,
  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn:not(.play-btn):not(.list-btn) {
    display: none !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .bar-song {
    z-index: 1 !important;
    display: flex !important;
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    gap: 8px !important;
    overflow: hidden !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .bar-song-record {
    position: relative !important;
    display: grid !important;
    flex: 0 0 64px !important;
    width: 64px !important;
    height: 64px !important;
    place-items: center !important;
    overflow: hidden !important;
    border-radius: 50% !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .bar-song-record .song-cover {
    display: block !important;
    width: 38px !important;
    height: 38px !important;
    margin: 0 !important;
    border-radius: 50% !important;
    object-fit: cover !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .song-text {
    display: flex !important;
    flex: 1 1 auto !important;
    flex-direction: column !important;
    justify-content: center !important;
    width: 0 !important;
    min-width: 0 !important;
    max-width: none !important;
    gap: 2px !important;
    overflow: hidden !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .song-text h4,
  body.page-music #app .playlist-detail .playlists-bottom-player .song-text .player-title-marquee {
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    color: var(--text-primary) !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    line-height: 1.15 !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    text-shadow: none !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .song-text p {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    color: var(--text-muted) !important;
    font-size: 11px !important;
    line-height: 1.15 !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .bar-controls,
  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns {
    position: static !important;
    display: flex !important;
    flex: 0 0 auto !important;
    align-items: center !important;
    width: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
    transform: none !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn,
  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.list-btn {
    display: inline-grid !important;
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
    place-items: center !important;
    border: 0 !important;
    color: var(--music-progress-fill, #ff535d) !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.list-btn {
    width: 34px !important;
    min-width: 34px !important;
    height: 34px !important;
    margin-right: 12px !important;
    margin-left: 20px !important;
    color: var(--text-primary) !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn {
    position: relative !important;
    z-index: 0 !important;
    isolation: isolate !important;
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    margin: 0 !important;
    border-radius: 50% !important;
    color: #27262d !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn::before {
    position: absolute !important;
    inset: 0 !important;
    z-index: 0 !important;
    display: block !important;
    content: '' !important;
    border-radius: inherit !important;
    background: conic-gradient(
      from -90deg,
      var(--mobile-player-progress-color) var(--mobile-play-progress, 0%),
      var(--mobile-player-progress-track) 0
    ) !important;
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)) !important;
    mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)) !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn::after {
    position: absolute !important;
    inset: 4px !important;
    z-index: 1 !important;
    display: block !important;
    content: '' !important;
    border-radius: inherit !important;
    background: rgba(255, 255, 255, .98) !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, .16) !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn svg {
    position: relative !important;
    z-index: 2 !important;
    width: 18px !important;
    height: 18px !important;
    color: currentColor !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail footer.playlists-bottom-player {
    --mobile-player-progress-track: rgba(255, 255, 255, .34);
    border-color: rgba(255, 255, 255, .1) !important;
    background: var(--mobile-ip-player, var(--music-player-bar-bg-dark, rgba(18, 16, 26, .94))) !important;
    box-shadow:
      0 14px 34px rgba(0, 0, 0, .42),
      inset 0 1px 0 rgba(255, 255, 255, .08) !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail .playlists-bottom-player .song-text h4,
  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail .playlists-bottom-player .song-text .player-title-marquee {
    color: #fff !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail .playlists-bottom-player .song-text p {
    color: rgba(224, 229, 237, .62) !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn {
    color: #fff !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn::before {
    background: conic-gradient(
      from -90deg,
      #fff var(--mobile-play-progress, 0%),
      var(--mobile-player-progress-track) 0
    ) !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn::after {
    background: rgba(37, 36, 42, .98) !important;
  }

  body.native-music-app.page-music #app .playlist-detail footer.playlists-bottom-player {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  body.page-music #app .playlist-detail {
    padding-bottom: calc(112px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 390px) {
  body.page-music #app .playlist-detail footer.playlists-bottom-player,
  body.page-music #app .playlist-detail .playlists-bottom-player .bar-song-record {
    min-height: 60px !important;
    height: 60px !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .bar-song-record {
    flex-basis: 60px !important;
    width: 60px !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .bar-song-record .song-cover {
    width: 35px !important;
    height: 35px !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.play-btn {
    width: 30px !important;
    min-width: 30px !important;
    height: 30px !important;
  }

  body.page-music #app .playlist-detail .playlists-bottom-player .control-btns > .ctrl-btn.list-btn {
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
  }
}

/* Final conflict guard: player-shared.css contains an older five-button phone
   transport layout loaded after route chunks. The detail capsule intentionally
   matches the music-home mini player: song information plus play and queue. */
@media (max-width: 767px) {
  /* Bind the compact shape to the component variant itself. This keeps a
     personal playlist in capsule mode during the add-song selection state,
     even while route/theme classes are being refreshed by the native shell. */
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player {
    --mobile-player-progress-color: var(--music-progress-fill, #ff535d);
    --mobile-player-progress-track: rgba(129, 137, 153, .3);
    position: fixed !important;
    inset: auto 12px calc(
      12px + max(
        var(--native-safe-bottom, 0px),
        env(safe-area-inset-bottom, 0px)
      )
    ) 12px !important;
    z-index: 6000 !important;
    display: flex !important;
    align-items: center !important;
    width: auto !important;
    max-width: none !important;
    min-height: 66px !important;
    height: 66px !important;
    box-sizing: border-box !important;
    gap: 7px !important;
    padding: 0 9px 0 0 !important;
    overflow: visible !important;
    border: 1px solid var(--mobile-ip-card-border, rgba(255, 255, 255, .42)) !important;
    border-radius: 999px !important;
    background: var(--mobile-ip-player, var(--music-player-bar-bg, rgba(246, 249, 255, .94))) !important;
    box-shadow:
      0 14px 34px rgba(15, 21, 40, .22),
      inset 0 1px 0 rgba(255, 255, 255, .58) !important;
    transform: none !important;
  }

  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .player-shinchan-decor,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .player-progress,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .bar-extra,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .like-btn,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .play-mode-btn,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .control-btns > .ctrl-btn:not(.play-btn):not(.list-btn) {
    display: none !important;
  }

  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .bar-song {
    position: static !important;
    display: flex !important;
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
  }

  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .bar-controls,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .bar-controls .control-btns {
    position: static !important;
    inset: auto !important;
    display: flex !important;
    flex: 0 0 auto !important;
    grid-template-columns: none !important;
    align-items: center !important;
    justify-content: center !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
    transform: none !important;
  }

  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn,
  #app .playlist-detail footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .control-btns > .ctrl-btn.list-btn {
    display: inline-grid !important;
  }

  body.music-ip-shinchan.page-music #app .playlist-detail footer.playlist-detail-capsule-player {
    --text-primary: #28384b;
    --text-muted: #78869a;
    --mobile-player-progress-color: var(--music-progress-fill, #ff535d);
    border-color: rgba(255, 211, 116, .38) !important;
    background: linear-gradient(105deg, #fff8e7, #edf8f5) !important;
  }

  body.music-ip-hello-kitty.page-music #app .playlist-detail footer.playlist-detail-capsule-player {
    --text-primary: #603141;
    --text-muted: #a47686;
    --mobile-player-progress-color: var(--music-progress-fill, #ff535d);
    border-color: rgba(218, 83, 125, .26) !important;
    background: linear-gradient(105deg, #fffaf5, #ffe9f1) !important;
  }

  body.music-ip-kuromi.page-music #app .playlist-detail footer.playlist-detail-capsule-player {
    --text-primary: #fff4fc;
    --text-muted: #cbb6d1;
    --mobile-player-progress-color: var(--music-progress-fill, #ff535d);
    border-color: rgba(239, 91, 173, .28) !important;
    background: linear-gradient(105deg, #120916, #28112f) !important;
    box-shadow:
      0 14px 34px rgba(8, 3, 13, .4),
      inset 0 1px 0 rgba(255, 255, 255, .08) !important;
  }

  body.music-ip-kuromi.page-music #app .playlist-detail footer.playlist-detail-capsule-player .control-btns > .ctrl-btn.list-btn {
    color: #ffb5df !important;
  }

  body:is(.music-preset-midnight-cinema, .music-preset-hello-kitty-midnight, .music-preset-kuromi-midnight).page-music #app .playlist-detail footer.playlist-detail-capsule-player {
    --text-primary: #fff6ea;
    --text-muted: #cfbda4;
    --mobile-player-progress-color: #fff;
    border-color: rgba(240, 197, 109, .24) !important;
    background: linear-gradient(105deg, #151214, #30211d) !important;
  }
}
</style>
