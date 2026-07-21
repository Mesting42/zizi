<template>
  <div :class="['all-playlists-page', { 'is-returning': isReturning }]">
    <MusicPageBackground :playing="isPlaying" />

    <main class="all-playlists-content">
      <header class="all-playlists-header">
        <button class="back-to-music" type="button" aria-label="返回音乐" @click="returnToMusic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div class="all-playlists-heading">
          <span class="all-playlists-eyebrow">PLAYLIST COLLECTION</span>
          <h1>全部歌单</h1>
          <p>{{ allPlaylists.length }} 张歌单，其中 {{ explorePlaylists.length }} 张来自在线发现</p>
        </div>

      </header>

      <nav class="playlist-category-tabs" aria-label="歌单分类">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          :class="{ active: activeCategory === category.id }"
          :aria-pressed="activeCategory === category.id"
          @click="activeCategory = category.id"
        >
          {{ category.name }}
          <span>{{ category.count }}</span>
        </button>
      </nav>

      <section class="all-playlists-grid" aria-live="polite">
        <article
          v-for="playlist in filteredPlaylists"
          :key="playlist.id"
          class="all-playlist-card"
          tabindex="0"
          @click="openPlaylist(playlist)"
          @keydown.enter="openPlaylist(playlist)"
          @keydown.space.prevent="openPlaylist(playlist)"
        >
          <div
            :class="[
              'all-playlist-cover',
              {
                [`all-playlist-cover--${activeThemeIp}`]: !playlist.isPersonal && activeThemeIp !== 'shinchan'
              }
            ]"
          >
            <img :class="!playlist.isPersonal && activeThemeIp !== 'shinchan' ? ['ip-cover', `ip-cover--${activeThemeIp}`] : ''" :src="getPlaylistCover(playlist)" :alt="playlist.name" loading="lazy" decoding="async" />
            <span class="playlist-type">{{ playlist.categoryName }}</span>
            <span class="playlist-play-icon" aria-hidden="true">▶</span>
          </div>
          <div class="all-playlist-info">
            <h2>{{ playlist.name }}</h2>
            <p>{{ playlist.isPersonal ? '我的本地歌单' : '在线完整歌单' }}</p>
          </div>
        </article>
      </section>

      <a
        class="playlist-cover-credits"
        href="/images/playlists/ATTRIBUTIONS.md"
        target="_blank"
        rel="noopener noreferrer"
      >
        查看部分歌单封面的图片来源与授权
      </a>
    </main>

    <!-- 全部歌单页保留在当前页面打开播放列表，避免跳转到独立页面。 -->
    <MusicBottomPlayer variant="capsule" queue-mode="drawer" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MusicPageBackground from '../components/MusicPageBackground.vue'
import MusicBottomPlayer from '../components/MusicBottomPlayer.vue'
import { usePlayer } from '../composables/usePlayer'
import { usePlaylists } from '../composables/usePlaylists'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp, getThemedPlaylistCover } from '../config/musicThemeCatalog'
import { featuredPlaylists, treasurePlaylists, editorPlaylists, explorePlaylists } from '../data/songs.js'
import { devicePerformanceProfile } from '../utils/devicePerformance'

const router = useRouter()
const { isPlaying } = usePlayer()
const { playlists: userPlaylists } = usePlaylists()
const { settings: musicBackgroundSettings } = useMusicBackground()
const activeCategory = ref('all')
const isReturning = ref(false)
const activeThemeIp = computed(() => getMusicThemeIp(musicBackgroundSettings.preset))

const playlistGroups = [
  { id: 'explore', name: '在线发现', playlists: explorePlaylists },
  { id: 'featured', name: '精选歌单', playlists: featuredPlaylists },
  { id: 'treasure', name: '宝藏歌单', playlists: treasurePlaylists },
  { id: 'editor', name: '编辑推荐', playlists: editorPlaylists }
]

let themedCoverCursor = 0
const onlinePlaylists = playlistGroups.flatMap((group) => (
  group.playlists.map((playlist) => ({
    ...playlist,
    themeCoverIndex: themedCoverCursor++,
    category: group.id,
    categoryName: group.name,
    isPersonal: false
  }))
))

const allPlaylists = computed(() => [
  ...onlinePlaylists,
  ...userPlaylists.value.map((playlist) => ({
    ...playlist,
    category: 'personal',
    categoryName: '我的歌单',
    isPersonal: true
  }))
])

const categories = computed(() => [
  { id: 'all', name: '全部', count: allPlaylists.value.length },
  ...playlistGroups.map((group) => ({
    id: group.id,
    name: group.name,
    count: group.playlists.length
  })),
  { id: 'personal', name: '我的歌单', count: userPlaylists.value.length }
])

const filteredPlaylists = computed(() => {
  if (activeCategory.value === 'all') return allPlaylists.value
  return allPlaylists.value.filter((playlist) => playlist.category === activeCategory.value)
})

const openPlaylist = (playlist) => {
  router.push({ name: 'PlaylistDetail', params: { id: playlist.id }, query: { from: 'all' } })
}

const returnToMusic = () => {
  if (isReturning.value) return

  if (devicePerformanceProfile.isMobilePerformance) {
    router.push('/music')
    return
  }

  isReturning.value = true
  window.setTimeout(() => {
    router.push('/music')
  }, 220)
}

const getPlaylistCover = (playlist) => {
  if (playlist.isPersonal) return playlist.cover
  // 每套 IP 主题首页均有 16 张独立封面；全部歌单超过 16 张后沿用
  // 歌单自身同样不重复的封面，避免通过取模再次产生视觉重复。
  if (playlist.themeCoverIndex >= 16) return playlist.cover
  return getThemedPlaylistCover(musicBackgroundSettings.preset, playlist.themeCoverIndex, playlist.cover)
}
</script>

<style scoped>
@import '../css/MusicPlaylists.css';
</style>

<style>
/* “全部歌单”在手机上与音乐首页、在线歌单详情共用悬浮胶囊播放器。 */
@media (max-width: 767px) {
  body.page-music #app .all-playlists-page footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player {
    --mobile-player-progress-color: var(--music-progress-fill, #ff535d);
    position: fixed !important;
    inset:
      auto
      12px
      calc(
        10px + max(
          var(--native-safe-bottom, 0px),
          env(safe-area-inset-bottom, 0px)
        )
      )
      12px !important;
    z-index: 6000 !important;
    display: flex !important;
    align-items: center !important;
    width: auto !important;
    max-width: none !important;
    min-height: 66px !important;
    height: 66px !important;
    box-sizing: border-box !important;
    gap: 7px !important;
    margin: 0 !important;
    padding: 0 9px 0 0 !important;
    overflow: visible !important;
    border: 1px solid var(--mobile-ip-card-border, rgba(255, 255, 255, .58)) !important;
    border-radius: 999px !important;
    background: var(--mobile-ip-player, var(--music-player-bar-bg, rgba(255, 255, 255, .94))) !important;
    box-shadow:
      0 14px 34px rgba(15, 21, 40, .22),
      inset 0 1px 0 rgba(255, 255, 255, .68) !important;
    backdrop-filter: blur(22px) saturate(155%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(155%) !important;
    transform: none !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .player-shinchan-decor,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .player-progress,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-extra,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .like-btn,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .play-mode-btn,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn:not(.play-btn):not(.list-btn) {
    display: none !important;
  }

  body.page-music #app .all-playlists-page footer.player-bar.player-bar-unified.playlists-bottom-player.playlist-detail-capsule-player .play-mode-btn {
    display: none !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-song {
    position: static !important;
    z-index: 1 !important;
    display: flex !important;
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    gap: 8px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    transform: none !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-song-record {
    position: relative !important;
    display: grid !important;
    flex: 0 0 64px !important;
    width: 64px !important;
    min-width: 64px !important;
    height: 64px !important;
    place-items: center !important;
    overflow: hidden !important;
    border-radius: 50% !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-song-record .song-cover {
    display: block !important;
    width: 38px !important;
    height: 38px !important;
    margin: 0 !important;
    border-radius: 50% !important;
    object-fit: cover !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text {
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

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text h4,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text .player-title-marquee {
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    color: var(--text-primary, #202633) !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    line-height: 1.15 !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    text-shadow: none !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text p {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    color: var(--text-muted, #758095) !important;
    font-size: 11px !important;
    line-height: 1.15 !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-controls,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns {
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
    gap: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.list-btn {
    display: inline-grid !important;
    padding: 0 !important;
    place-items: center !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn {
    position: relative !important;
    z-index: 0 !important;
    isolation: isolate !important;
    width: 34px !important;
    min-width: 34px !important;
    height: 34px !important;
    margin: 0 !important;
    border-radius: 50% !important;
    color: #27262d !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn::before {
    position: absolute !important;
    inset: 0 !important;
    z-index: 0 !important;
    display: block !important;
    content: '' !important;
    border-radius: inherit !important;
    background: conic-gradient(
      from -90deg,
      var(--mobile-player-progress-color) var(--mobile-play-progress, 0%),
      rgba(112, 120, 137, .34) 0
    ) !important;
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)) !important;
    mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)) !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn::after {
    position: absolute !important;
    inset: 4px !important;
    z-index: 1 !important;
    display: block !important;
    content: '' !important;
    border-radius: inherit !important;
    background: rgba(255, 255, 255, .98) !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, .16) !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn svg {
    position: relative !important;
    z-index: 2 !important;
    width: 18px !important;
    height: 18px !important;
    color: currentColor !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.list-btn {
    width: 34px !important;
    min-width: 34px !important;
    height: 34px !important;
    margin: 0 12px 0 18px !important;
    color: var(--text-primary, #2a2d36) !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page footer.playlist-detail-capsule-player {
    --mobile-player-progress-color: #fff;
    border-color: rgba(255, 255, 255, .1) !important;
    background: var(--music-player-bar-bg-dark, rgba(18, 16, 26, .94)) !important;
    box-shadow:
      0 14px 34px rgba(0, 0, 0, .42),
      inset 0 1px 0 rgba(255, 255, 255, .08) !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text h4,
  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text .player-title-marquee,
  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn,
  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.list-btn {
    color: #fff !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page .playlist-detail-capsule-player .song-text p {
    color: rgba(224, 229, 237, .62) !important;
  }

  body:is(.dark-mode, .music-theme-dark).page-music #app .all-playlists-page .playlist-detail-capsule-player .control-btns > .ctrl-btn.play-btn::after {
    background: rgba(37, 36, 42, .98) !important;
  }

  body.music-ip-shinchan.page-music #app .all-playlists-page footer.playlist-detail-capsule-player {
    --text-primary: #28384b;
    --text-muted: #78869a;
    --mobile-player-progress-color: #ee5b59;
    border-color: rgba(255, 211, 116, .38) !important;
    background: linear-gradient(105deg, #fff8e7, #edf8f5) !important;
  }

  body.music-ip-hello-kitty.page-music #app .all-playlists-page footer.playlist-detail-capsule-player {
    --text-primary: #603141;
    --text-muted: #a47686;
    --mobile-player-progress-color: #d73b61;
    border-color: rgba(218, 83, 125, .26) !important;
    background: linear-gradient(105deg, #fffaf5, #ffe9f1) !important;
  }

  body.music-ip-kuromi.page-music #app .all-playlists-page footer.playlist-detail-capsule-player {
    --text-primary: #fff4fc;
    --text-muted: #cbb6d1;
    --mobile-player-progress-color: #ff72bd;
    border-color: rgba(239, 91, 173, .28) !important;
    background: linear-gradient(105deg, #120916, #28112f) !important;
  }

  body.native-music-app.page-music #app .all-playlists-page footer.playlist-detail-capsule-player {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

@media (max-width: 390px) {
  body.page-music #app .all-playlists-page footer.playlist-detail-capsule-player,
  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-song-record {
    min-height: 60px !important;
    height: 60px !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-song-record {
    flex-basis: 60px !important;
    width: 60px !important;
    min-width: 60px !important;
  }

  body.page-music #app .all-playlists-page .playlist-detail-capsule-player .bar-song-record .song-cover {
    width: 35px !important;
    height: 35px !important;
  }
}
</style>
