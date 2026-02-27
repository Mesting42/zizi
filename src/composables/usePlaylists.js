import { ref, watch } from 'vue'

const STORAGE_KEY = 'music-user-playlists'
const PLAY_COUNT_KEY = 'music-play-counts'

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load playlists from storage:', e)
  }
  return null
}

const loadPlayCounts = () => {
  try {
    const saved = localStorage.getItem(PLAY_COUNT_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load play counts from storage:', e)
  }
  return {}
}

const savePlayCounts = (playCounts) => {
  try {
    localStorage.setItem(PLAY_COUNT_KEY, JSON.stringify(playCounts))
  } catch (e) {
    console.error('Failed to save play counts:', e)
  }
}

const playCounts = ref(loadPlayCounts())

watch(
  playCounts,
  (val) => {
    savePlayCounts(val)
  },
  { deep: true }
)

const defaultPlaylists = []

let saved = loadFromStorage()
// 兼容历史数据：过滤掉旧的默认歌单（morning/night）
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

// 为音乐生成唯一标识
const generateMusicId = (song) => {
  return `music_${song.url.replace(/[^a-zA-Z0-9]/g, '_')}`
}

// 获取所有已上传的音乐（模拟）
const getAllUploadedMusic = () => {
  return [
    {
      id: 'music_起风了___买辣椒也用券aac',
      title: '起风了',
      artist: '买辣椒也用券',
      url: '/music/起风了 - 买辣椒也用券.aac',
      cover: '/images/13416469337261709.jpeg',
      duration: '5:25',
      lrc: '/lyrics/起风了.lrc'
    },
    {
      id: 'music_晴天___周杰伦mp3',
      title: '晴天',
      artist: '周杰伦',
      url: '/music/晴天 - 周杰伦.mp3',
      cover: '/images/13416469354055551.jpeg',
      duration: '4:29',
      lrc: '/lyrics/晴天.lrc'
    },
    {
      id: 'music_稻香___周杰伦mp3',
      title: '稻香',
      artist: '周杰伦',
      url: '/music/稻香 - 周杰伦.mp3',
      cover: '/images/13416469356600254.jpeg',
      duration: '3:43',
      lrc: '/lyrics/稻香.lrc'
    },
    {
      id: 'music_夜曲___周杰伦mp3',
      title: '夜曲',
      artist: '周杰伦',
      url: 'https://music.163.com/song/media/outer/url?id=186017.mp3',
      cover: '/images/13416469357886115.jpeg',
      duration: '4:34'
    },
    {
      id: 'music_七里香___周杰伦mp3',
      title: '七里香',
      artist: '周杰伦',
      url: '/music/七里香 - 周杰伦.mp3',
      cover: '/images/13416469359090353.jpeg',
      duration: '4:59',
      lrc: '/lyrics/七里香.lrc'
    },
    {
      id: 'music_告白气球___周杰伦mp3',
      title: '告白气球',
      artist: '周杰伦',
      url: 'https://music.163.com/song/media/outer/url?id=451048405.mp3',
      cover: '/images/13416469360258155.jpeg',
      duration: '3:35'
    },
    {
      id: 'music_青花瓷___周杰伦mp3',
      title: '青花瓷',
      artist: '周杰伦',
      url: 'https://music.163.com/song/media/outer/url?id=186013.mp3',
      cover: '/images/13416469361531865.jpeg',
      duration: '3:59'
    },
    {
      id: 'music_以父之名___周杰伦mp3',
      title: '以父之名',
      artist: '周杰伦',
      url: 'https://music.163.com/song/media/outer/url?id=186018.mp3',
      cover: '/images/13416469362905352.jpeg',
      duration: '4:57'
    },
    {
      id: 'music_花海___周杰伦mp3',
      title: '花海',
      artist: '周杰伦',
      url: 'https://music.163.com/song/media/outer/url?id=186012.mp3',
      cover: '/images/13416469428051659.jpeg',
      duration: '4:24'
    }
  ]
}

export const usePlaylists = () => {
  const createPlaylist = ({ name, description = '', cover = '', songs = [] } = {}) => {
    // 只存储音乐的唯一标识
    const songIds = songs.map(song => {
      const musicId = song.id || generateMusicId(song)
      return musicId
    })

    const newPlaylist = {
      id: generateId(),
      name: name || '新建歌单',
      description,
      cover: cover || '/images/playlist-default.jpg',
      songIds: songIds
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

  const getPlaylistById = (id) => {
    // 首先查找用户创建的歌单
    const userPlaylist = playlists.value.find((pl) => pl.id === id)
    if (userPlaylist) {
      // 从已上传音乐和用户收藏中获取完整信息
      const uploadedMusic = getAllUploadedMusic()

      // 从 localStorage 读取用户收藏数据
      let userFavorites = []
      try {
        const savedState = localStorage.getItem('music-player-state')
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          if (Array.isArray(parsedState.favorites)) {
            userFavorites = parsedState.favorites
          }
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
      }

      // 确保所有收藏的歌曲都有 id
      const normalizedFavorites = userFavorites.map(song => ({
        ...song,
        id: song.id || generateMusicId(song)
      }))

      // 合并已上传音乐和用户收藏
      const allMusic = [...uploadedMusic, ...normalizedFavorites]
      const musicMap = new Map(allMusic.map(music => [music.id, music]))

      // 过滤出存在的音乐
      const validSongs = (userPlaylist.songIds || []).map(musicId => musicMap.get(musicId)).filter(Boolean)

      // 获取播放次数
      const playCount = playCounts.value[id] || 0

      return {
        ...userPlaylist,
        songs: validSongs,
        playCount: formatPlayCount(playCount)
      }
    }

    // 处理首页歌单
    if (id.startsWith('featured-') || id.startsWith('treasure-') || id.startsWith('editor-')) {
      // 为首页歌单提供默认歌曲列表（使用已上传的音乐）
      const defaultSongs = getAllUploadedMusic()

      // 根据 ID 确定歌单名称和封面
      let name = '歌单'
      let cover = '/images/playlist-default.jpg'

      if (id === 'featured-1') {
        name = '经典怀旧'
        cover = '/images/13416469429950015.jpeg'
      } else if (id === 'featured-2') {
        name = '轻音乐合集'
        cover = '/images/13416469431116038.jpeg'
      } else if (id === 'featured-3') {
        name = '学习工作BGM'
        cover = '/images/13416469432277202.jpeg'
      } else if (id === 'featured-4') {
        name = '治愈系音乐'
        cover = '/images/13416469433517463.jpeg'
      } else if (id === 'featured-5') {
        name = '动漫原声'
        cover = '/images/13416469434708644.jpeg'
      } else if (id === 'featured-6') {
        name = '夜深时分'
        cover = '/images/13416469436036463.jpeg'
      } else if (id === 'treasure-1') {
        name = '粤语经典'
        cover = '/images/13416469471235110.jpeg'
      } else if (id === 'treasure-2') {
        name = '电子舞曲'
        cover = '/images/13416469472281968.jpeg'
      } else if (id === 'treasure-3') {
        name = '民谣时光'
        cover = '/images/13416469473401529.jpeg'
      } else if (id === 'treasure-4') {
        name = '摇滚盛宴'
        cover = '/images/13416469474435386.jpeg'
      } else if (id === 'treasure-5') {
        name = '爵士蓝调'
        cover = '/images/13416469475600604.jpeg'
      } else if (id === 'treasure-6') {
        name = '独立音乐'
        cover = '/images/13416469476573717.jpeg'
      } else if (id === 'editor-1') {
        name = '跑步节奏'
        cover = '/images/13416469477674348.jpeg'
      } else if (id === 'editor-2') {
        name = '睡前放松'
        cover = '/images/13416469437208232.jpeg'
      } else if (id === 'editor-3') {
        name = '咖啡时光'
        cover = '/images/13416469467325044.jpeg'
      } else if (id === 'editor-4') {
        name = '雨天 mood'
        cover = '/images/13416469468993130.jpeg'
      } else if (id === 'editor-5') {
        name = '旅行必备'
        cover = '/images/13416469470216262.jpeg'
      } else if (id === 'editor-6') {
        name = '回忆杀'
        cover = '/images/13416469428051659.jpeg'
      }

      // 获取播放次数
      const playCount = playCounts.value[id] || 0

      return {
        id,
        name,
        cover,
        description: '',
        songs: defaultSongs,
        playCount: formatPlayCount(playCount)
      }
    }

    return null
  }

  // 格式化播放次数
  const formatPlayCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + '万'
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
  }

  // 更新播放次数
  const incrementPlayCount = (playlistId) => {
    if (!playCounts.value[playlistId]) {
      playCounts.value[playlistId] = 0
    }
    playCounts.value[playlistId]++
  }

  const addSongToPlaylist = (id, song) => {
    const target = playlists.value.find((pl) => pl.id === id)
    if (!target) return

    // 只存储音乐的唯一标识
    const musicId = song.id || generateMusicId(song)

    if (!target.songIds) {
      target.songIds = []
    }

    const exists = target.songIds.includes(musicId)
    if (!exists) {
      target.songIds.push(musicId)
      // 强制更新playlists引用，确保响应式系统检测到变化
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
      target.songIds.splice(index, 1)
      // 强制更新playlists引用，确保响应式系统检测到变化
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
    incrementPlayCount
  }
}

