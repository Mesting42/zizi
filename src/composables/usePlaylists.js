import { ref, watch } from 'vue'
import { allSongs, HOME_PLAYLIST_META, generateMusicId, ensureMusicId } from '../data/songs.js'
import { getPlayCount, formatPlayCount, incrementPlayCount } from './useStats.js'

const STORAGE_KEY = 'music-user-playlists'

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load playlists from storage:', e)
  }
  return null
}

const defaultPlaylists = []

let saved = loadFromStorage()
// 兼容历史数据：过滤掉旧的默认歌单
if (Array.isArray(saved)) {
  saved = saved.filter((pl) => pl.id !== 'morning' && pl.id !== 'night')
}

const playlists = ref(Array.isArray(saved) ? saved : defaultPlaylists)

watch(
  playlists,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.error('Failed to save playlists:', e)
    }
  },
  { deep: true }
)

const generateId = () => `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

/**
 * 构建完整音乐映射表（allSongs + 用户收藏）
 * 所有歌曲查找均通过此函数，避免直接读取 localStorage
 */
const buildMusicMap = (userFavorites = []) => {
  let savedState = {}
  try {
    savedState = JSON.parse(localStorage.getItem('music-player-state') || '{}')
  } catch (e) {
    savedState = {}
  }

  const normalizedFavorites = userFavorites.map(song => ensureMusicId(song))
  const normalizedPlaylist = Array.isArray(savedState.playlist)
    ? savedState.playlist.map(song => ensureMusicId(song))
    : []
  const normalizedSavedFavorites = Array.isArray(savedState.favorites)
    ? savedState.favorites.map(song => ensureMusicId(song))
    : []
  const allMusic = [...allSongs, ...normalizedFavorites, ...normalizedPlaylist, ...normalizedSavedFavorites]
  return new Map(allMusic.map(music => [music.id, music]))
}

export const usePlaylists = () => {
  const createPlaylist = ({ name, description = '', cover = '', songs = [] } = {}) => {
    const songIds = songs.map(song => {
      return song.id || generateMusicId(song.url)
    })

    const newPlaylist = {
      id: generateId(),
      name: name || '新建歌单',
      description,
      cover: cover || '/images/playlist-default.jpg',
      songIds: songIds,
      // 无后端场景下保存歌曲快照，确保在线歌曲刷新后仍能从用户歌单恢复。
      songs: songs.map(song => ensureMusicId(song))
    }
    playlists.value.unshift(newPlaylist)
    return newPlaylist
  }

  const removePlaylist = (id) => {
    playlists.value = playlists.value.filter((pl) => pl.id !== id)
  }

  const renamePlaylist = (id, name) => {
    const target = playlists.value.find((pl) => pl.id === id)
    if (target) target.name = name || target.name
  }

  const updateDescription = (id, description) => {
    const target = playlists.value.find((pl) => pl.id === id)
    if (target) target.description = description
  }

  const updateCover = (id, cover) => {
    const target = playlists.value.find((pl) => pl.id === id)
    if (target) target.cover = cover
  }

  /**
   * 根据ID获取歌单详情
   * - 用户创建的歌单：从 playlists 中查找
   * - 推荐与在线歌单 (featured-/treasure-/editor-/explore-)：使用元数据映射表
   */
  const getPlaylistById = (id, userFavorites = []) => {
    // 首先查找用户创建的歌单
    const userPlaylist = playlists.value.find((pl) => pl.id === id)
    if (userPlaylist) {
      const musicMap = buildMusicMap(userFavorites)
      const storedMusicMap = new Map(
        (userPlaylist.songs || []).map(song => {
          const normalized = ensureMusicId(song)
          return [normalized.id, normalized]
        })
      )
      const validSongs = (userPlaylist.songIds || [])
        .map(musicId => musicMap.get(musicId) || storedMusicMap.get(musicId))
        .filter(Boolean)

      const playCount = getPlayCount(id)

      return {
        ...userPlaylist,
        songs: validSongs,
        playCount: formatPlayCount(playCount)
      }
    }

    // 处理首页歌单 —— 使用元数据映射表替代 if-else 链
    if (id.startsWith('featured-') || id.startsWith('treasure-') || id.startsWith('editor-') || id.startsWith('explore-')) {
      const meta = HOME_PLAYLIST_META[id]
      if (!meta) return null

      const playCount = getPlayCount(id)

      return {
        id,
        name: meta.name,
        cover: meta.cover,
        description: `来自 ${meta.onlineSource || '在线曲库'} 的可完整播放独立音乐`,
        onlineQuery: meta.onlineQuery,
        onlineSource: meta.onlineSource,
        songs: [...allSongs],
        playCount: formatPlayCount(playCount)
      }
    }

    return null
  }

  const addSongToPlaylist = (id, song) => {
    const target = playlists.value.find((pl) => pl.id === id)
    if (!target) return

    const musicId = song.id || generateMusicId(song.url)

    if (!target.songIds) {
      target.songIds = []
    }
    if (!target.songs) {
      target.songs = []
    }

    const exists = target.songIds.includes(musicId)
    if (!exists) {
      target.songIds.push(musicId)
      target.songs.push(ensureMusicId(song))
      playlists.value = [...playlists.value]
      console.log('歌曲已添加到歌单:', song.title, '音乐ID:', musicId)
    } else {
      console.log('歌曲已存在于歌单中:', song.title)
    }
  }

  const removeSongFromPlaylist = (id, index) => {
    const target = playlists.value.find((pl) => pl.id === id)
    if (!target) return
    if (target.songIds) {
      const musicId = target.songIds[index]
      target.songIds.splice(index, 1)
      if (target.songs) {
        const storedIndex = target.songs.findIndex(song => ensureMusicId(song).id === musicId)
        if (storedIndex >= 0) target.songs.splice(storedIndex, 1)
      }
      playlists.value = [...playlists.value]
    }
  }

  return {
    playlists,
    createPlaylist,
    removePlaylist,
    renamePlaylist,
    updateDescription,
    updateCover,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    incrementPlayCount,
    getPlayCount,
    formatPlayCount,
    // 兼容旧代码
    getAllUploadedMusic: () => allSongs
  }
}
