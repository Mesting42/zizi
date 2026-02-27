import { ref, watch, shallowRef } from 'vue'

const STORAGE_KEY = 'music-player-state'

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return null
}

const savedState = loadFromStorage()

// 验证歌曲数据是否完整
const validateSong = (song) => {
  if (!song) return false
  return song.title && song.artist && song.url && song.cover && song.duration
}

// 默认歌曲
const defaultSong = {
  title: '晴天',
  artist: '周杰伦',
  url: '/music/晴天 - 周杰伦.mp3',
  cover: '/images/13416469354055551.jpeg',
  duration: '4:29',
  lrc: '/lyrics/晴天.lrc'
}

const currentSong = ref(validateSong(savedState?.currentSong) ? savedState.currentSong : defaultSong)

const isPlaying = ref(savedState?.isPlaying || false)
const currentTime = ref(savedState?.currentTime || 0)
const duration = ref(savedState?.duration || 0)
const volume = ref(savedState?.volume ?? 0.7)
const isLiked = ref(savedState?.isLiked || false)
const playMode = ref(savedState?.playMode || 'list')
const playlist = ref(savedState?.playlist || [])
const favorites = ref(savedState?.favorites || [])
const currentIndex = ref(savedState?.currentIndex || 0)
const rotationAngle = ref(savedState?.rotationAngle || 0)
const parsedLyrics = ref([])
const currentLyricIndex = ref(-1)

// 当前播放的歌单ID
const currentPlaylistId = ref('')
// 标记是否通过拖动进度条完成播放
const isSeekedToEnd = ref(false)

const parseLRC = (lrcContent) => {
  let lines = lrcContent.split('\n')

  if (lines.length === 1 && lines[0].includes('[')) {
    lines = lines[0].split('[').filter(l => l.trim())
    lines = lines.map(l => '[' + l)
  }

  const lyrics = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  for (const line of lines) {
    const match = line.match(timeRegex)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3])
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = line.replace(timeRegex, '').trim()

      if (text) {
        lyrics.push({ time, text })
      }
    }
  }

  return lyrics.sort((a, b) => a.time - b.time)
}

// 歌词缓存
const lyricsCache = new Map()

const loadLyrics = async () => {
  if (!currentSong.value.lrc) {
    parsedLyrics.value = []
    return
  }

  // 检查缓存
  const cacheKey = currentSong.value.lrc
  if (lyricsCache.has(cacheKey)) {
    parsedLyrics.value = lyricsCache.get(cacheKey)
    return
  }

  try {
    const response = await fetch(currentSong.value.lrc)
    if (!response.ok) {
      console.error('Failed to load lyrics:', response.status, response.statusText)
      parsedLyrics.value = []
      return
    }
    const lrcContent = await response.text()
    const lyrics = parseLRC(lrcContent)

    // 缓存歌词（最多缓存20首）
    if (lyricsCache.size >= 20) {
      const firstKey = lyricsCache.keys().next().value
      lyricsCache.delete(firstKey)
    }
    lyricsCache.set(cacheKey, lyrics)

    parsedLyrics.value = lyrics
  } catch (error) {
    console.error('Failed to load lyrics:', error)
    parsedLyrics.value = []
  }
}

const updateCurrentLyricIndex = () => {
  if (parsedLyrics.value.length === 0) {
    currentLyricIndex.value = -1
    return
  }

  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime.value >= parsedLyrics.value[i].time) {
      currentLyricIndex.value = i
      return
    }
  }
  currentLyricIndex.value = -1
}

const audioElement = shallowRef(null)

const initAudio = () => {
  if (!audioElement.value) {
    audioElement.value = new Audio()
    audioElement.value.volume = volume.value

    audioElement.value.addEventListener('timeupdate', () => {
      currentTime.value = audioElement.value.currentTime
    })

    audioElement.value.addEventListener('loadedmetadata', () => {
      duration.value = audioElement.value.duration
      if (currentTime.value > 0 && audioElement.value.currentTime === 0) {
        audioElement.value.currentTime = currentTime.value
      }
      // 当元数据加载完成后，如果isPlaying为true，开始播放
      if (isPlaying.value) {
        audioElement.value.play().catch(e => console.error('Failed to play:', e))
      }
    })

    audioElement.value.addEventListener('ended', () => {
      handleSongEnd()
    })

    audioElement.value.addEventListener('play', () => {
      isPlaying.value = true
    })

    audioElement.value.addEventListener('pause', () => {
      isPlaying.value = false
    })

    if (currentSong.value.url) {
      audioElement.value.src = currentSong.value.url
      if (currentTime.value > 0) {
        audioElement.value.currentTime = currentTime.value
      }
    }
  }
  return audioElement.value
}

// 默认音乐池（Library）
const defaultMusicPool = [
  {
    title: '起风了',
    artist: '买辣椒也用券',
    url: '/music/起风了 - 买辣椒也用券.aac',
    cover: '/images/13416469337261709.jpeg',
    duration: '5:25',
    lrc: '/lyrics/起风了.lrc'
  },
  {
    title: '晴天',
    artist: '周杰伦',
    url: '/music/晴天 - 周杰伦.mp3',
    cover: '/images/13416469354055551.jpeg',
    duration: '4:29',
    lrc: '/lyrics/晴天.lrc'
  },
  {
    title: '稻香',
    artist: '周杰伦',
    url: '/music/稻香 - 周杰伦.mp3',
    cover: '/images/13416469356600254.jpeg',
    duration: '3:43',
    lrc: '/lyrics/稻香.lrc'
  },
  {
    title: '夜曲',
    artist: '周杰伦',
    url: 'https://music.163.com/song/media/outer/url?id=186017.mp3',
    cover: '/images/13416469357886115.jpeg',
    duration: '4:34'
  },
  {
    title: '七里香',
    artist: '周杰伦',
    url: '/music/七里香 - 周杰伦.mp3',
    cover: '/images/13416469359090353.jpeg',
    duration: '4:59',
    lrc: '/lyrics/七里香.lrc'
  },
  {
    title: '告白气球',
    artist: '周杰伦',
    url: 'https://music.163.com/song/media/outer/url?id=451048405.mp3',
    cover: '/images/13416469360258155.jpeg',
    duration: '3:35'
  },
  {
    title: '青花瓷',
    artist: '周杰伦',
    url: 'https://music.163.com/song/media/outer/url?id=186013.mp3',
    cover: '/images/13416469361531865.jpeg',
    duration: '3:59'
  },
  {
    title: '以父之名',
    artist: '周杰伦',
    url: 'https://music.163.com/song/media/outer/url?id=186018.mp3',
    cover: '/images/13416469362905352.jpeg',
    duration: '4:57'
  },
  {
    title: '花海',
    artist: '周杰伦',
    url: 'https://music.163.com/song/media/outer/url?id=186012.mp3',
    cover: '/images/13416469428051659.jpeg',
    duration: '4:24'
  }
]

// 播放默认音乐池中的音乐
const playFromDefaultPool = () => {
  if (defaultMusicPool.length > 0) {
    // 直接播放默认音乐池中的第一首，不添加到播放列表
    currentSong.value = defaultMusicPool[0]
    play()
  } else {
    isPlaying.value = false
    currentSong.value = { title: '暂无音乐', artist: '', cover: '/images/default-cover.png', url: '', duration: '0:00' }
  }
}

const handleSongEnd = () => {
  // 检查是否是自然播放结束（不是通过拖动进度条）
  if (!isSeekedToEnd.value && currentPlaylistId.value) {
    // 尝试导入 usePlaylists 并更新播放次数
    try {
      // 动态导入以避免循环依赖
      import('../composables/usePlaylists').then(({ usePlaylists }) => {
        const { incrementPlayCount } = usePlaylists()
        incrementPlayCount(currentPlaylistId.value)
      })
    } catch (error) {
      console.error('Failed to increment play count:', error)
    }
  }

  // 重置标记
  isSeekedToEnd.value = false

  // 规则 3：单曲循环模式必须独立控制
  if (playMode.value === 'single') {
    audioElement.value.currentTime = 0
    audioElement.value.play()
    return
  }

  // 规则 4：播放优先级逻辑
  // 检查当前是否在播放用户播放列表
  const isCurrentSongInPlaylist = playlist.value.some(s => s.url === currentSong.value.url)

  if (isCurrentSongInPlaylist && playlist.value.length > 0) {
    // 从播放列表中移除当前歌曲
    const removedIndex = playlist.value.findIndex(s => s.url === currentSong.value.url)
    playlist.value.splice(removedIndex, 1)

    // 情况 A：播放列表中仍有未播放音乐
    if (playlist.value.length > 0) {
      // 调整 currentIndex
      if (removedIndex < currentIndex.value) {
        currentIndex.value--
      } else if (removedIndex === currentIndex.value) {
        // 如果移除的是当前索引，且播放列表不为空，设置为 0 或保持在有效范围内
        currentIndex.value = Math.min(currentIndex.value, playlist.value.length - 1)
      }

      // 播放下一首
      currentSong.value = playlist.value[currentIndex.value]
      play()
    } else {
      // 情况 B：播放列表中已无剩余音乐
      // 判定播放列表已清空，自动切换至默认音乐池播放
      currentIndex.value = 0
      playFromDefaultPool()
    }
  } else {
    // 当前播放的是默认音乐池中的音乐，继续播放默认音乐池中的下一首
    const currentIndexInPool = defaultMusicPool.findIndex(s => s.url === currentSong.value.url)
    if (currentIndexInPool !== -1 && currentIndexInPool < defaultMusicPool.length - 1) {
      currentSong.value = defaultMusicPool[currentIndexInPool + 1]
      play()
    } else {
      // 默认音乐池播放完毕，重新从第一首开始
      playFromDefaultPool()
    }
  }
}

const removeFromPlaylist = (index) => {
  const removedSong = playlist.value[index]
  playlist.value.splice(index, 1)

  if (index < currentIndex.value) {
    currentIndex.value--
  } else if (index === currentIndex.value) {
    if (playlist.value.length > 0) {
      const newIndex = Math.min(index, playlist.value.length - 1)
      playByIndex(newIndex)
    } else {
      currentIndex.value = 0
    }
  }
}

const addToPlaylist = (song) => {
  const exists = playlist.value.some(s => s.url === song.url)
  if (!exists) {
    playlist.value.push(song)
    // 如果当前播放的是默认音乐（不在播放列表中），设置 currentIndex 为 0
    // 这样下一首就会播放播放列表中的第一首音乐
    const isCurrentSongInPlaylist = playlist.value.some(s => s.url === currentSong.value.url)
    if (!isCurrentSongInPlaylist) {
      currentIndex.value = 0
    }
  }
}

const currentAudioSrc = ref('')

const play = () => {
  const audio = initAudio()
  if (!currentSong.value.url) return

  // 只在切换歌曲时重置音频源和进度
  if (currentAudioSrc.value !== currentSong.value.url) {
    audio.src = currentSong.value.url
    currentAudioSrc.value = currentSong.value.url
    currentTime.value = 0
    audio.currentTime = 0
  }

  // 从当前进度继续播放
  if (audio.paused) {
    audio.currentTime = currentTime.value || 0
  }

  audio.play().catch(e => console.error('Play failed:', e))
  isPlaying.value = true
}

const pause = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    currentTime.value = audioElement.value.currentTime
    isPlaying.value = false
  }
}

const togglePlay = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const stop = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
    isPlaying.value = false
  }
}

const seek = (time) => {
  if (audioElement.value) {
    audioElement.value.currentTime = time
    currentTime.value = time
    // 检查是否拖动到歌曲尾部（95%以上）
    if (duration.value > 0 && time / duration.value >= 0.95) {
      isSeekedToEnd.value = true
    } else {
      isSeekedToEnd.value = false
    }
  }
}

const seekByPercent = (percent) => {
  if (audioElement.value && duration.value > 0) {
    const time = percent * duration.value
    audioElement.value.currentTime = time
    currentTime.value = time
    // 检查是否拖动到歌曲尾部（95%以上）
    if (percent >= 0.95) {
      isSeekedToEnd.value = true
    } else {
      isSeekedToEnd.value = false
    }
  }
}

const setVolume = (val) => {
  volume.value = val
  if (audioElement.value) {
    audioElement.value.volume = val
  }
}

const playByIndex = (index) => {
  if (playlist.value.length === 0) return
  if (index >= 0 && index < playlist.value.length) {
    const wasPlayingSameSong = currentIndex.value === index && currentSong.value.url === playlist.value[index].url

    currentIndex.value = index
    currentSong.value = playlist.value[index]

    if (!wasPlayingSameSong) {
      currentTime.value = 0
      currentAudioSrc.value = '' // 重置音频源，强制重新加载
    }

    play()
  } else if (currentSong.value.url) {
    play()
  }
}

const playSong = (song) => {
  currentSong.value = song
  play()
}

const next = () => {
  // 规则 3：单曲循环模式必须独立控制
  if (playMode.value === 'single') {
    seek(0)
    play()
    return
  }

  // 规则 4：播放优先级逻辑
  // 检查当前是否在播放用户播放列表
  const isCurrentSongInPlaylist = playlist.value.some(s => s.url === currentSong.value.url)

  if (isCurrentSongInPlaylist && playlist.value.length > 0) {
    // 情况 A：播放列表中只有一首音乐
    if (playlist.value.length === 1) {
      // 下一首播放默认音乐池中的音乐
      playFromDefaultPool()
      return
    }

    // 情况 B：播放列表中有多首音乐
    let newIndex
    if (playMode.value === 'random') {
      newIndex = Math.floor(Math.random() * playlist.value.length)
      // 避免随机到当前索引
      while (newIndex === currentIndex.value) {
        newIndex = Math.floor(Math.random() * playlist.value.length)
      }
    } else {
      newIndex = (currentIndex.value + 1) % playlist.value.length
    }

    // 播放下一首
    currentIndex.value = newIndex
    currentSong.value = playlist.value[newIndex]
    play()
  } else {
    // 当前播放的是默认音乐池中的音乐，继续播放默认音乐池中的下一首
    const currentIndexInPool = defaultMusicPool.findIndex(s => s.url === currentSong.value.url)
    if (currentIndexInPool !== -1 && currentIndexInPool < defaultMusicPool.length - 1) {
      currentSong.value = defaultMusicPool[currentIndexInPool + 1]
      play()
    } else {
      // 默认音乐池播放完毕，重新从第一首开始
      playFromDefaultPool()
    }
  }
}

const prev = () => {
  // 规则 3：单曲循环模式必须独立控制
  if (playMode.value === 'single') {
    seek(0)
    play()
    return
  }

  // 检查当前是否在播放用户播放列表
  const isCurrentSongInPlaylist = playlist.value.some(s => s.url === currentSong.value.url)

  if (isCurrentSongInPlaylist && playlist.value.length > 0) {
    // 情况 A：播放列表中只有一首音乐
    if (playlist.value.length === 1) {
      // 上一首播放默认音乐池中的最后一首
      if (defaultMusicPool.length > 0) {
        currentSong.value = defaultMusicPool[defaultMusicPool.length - 1]
        play()
      }
      return
    }

    // 情况 B：播放列表中有多首音乐
    let newIndex
    if (playMode.value === 'random') {
      newIndex = Math.floor(Math.random() * playlist.value.length)
      // 避免随机到当前索引
      while (newIndex === currentIndex.value) {
        newIndex = Math.floor(Math.random() * playlist.value.length)
      }
    } else {
      newIndex = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    }

    // 播放上一首
    currentIndex.value = newIndex
    currentSong.value = playlist.value[newIndex]
    play()
  } else {
    // 当前播放的是默认音乐池中的音乐，继续播放默认音乐池中的上一首
    const currentIndexInPool = defaultMusicPool.findIndex(s => s.url === currentSong.value.url)
    if (currentIndexInPool !== -1 && currentIndexInPool > 0) {
      currentSong.value = defaultMusicPool[currentIndexInPool - 1]
      play()
    } else {
      // 默认音乐池播放到了第一首，播放最后一首
      if (defaultMusicPool.length > 0) {
        currentSong.value = defaultMusicPool[defaultMusicPool.length - 1]
        play()
      }
    }
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  if (isLiked.value) {
    if (!favorites.value.find(s => s.url === currentSong.value.url)) {
      const songWithId = {
        ...currentSong.value,
        id: currentSong.value.id || `music_${currentSong.value.url.replace(/[^a-zA-Z0-9]/g, '_')}`
      }
      favorites.value.push(songWithId)
    }
  } else {
    const index = favorites.value.findIndex(s => s.url === currentSong.value.url)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
  }
}

const removeFromFavorites = (index) => {
  if (index >= 0 && index < favorites.value.length) {
    favorites.value.splice(index, 1)
  }
}

const cyclePlayMode = () => {
  const modes = ['list', 'single', 'random']
  const currentModeIndex = modes.indexOf(playMode.value)
  playMode.value = modes[(currentModeIndex + 1) % modes.length]
}

watch(currentSong, (newSong) => {
  if (audioElement.value && isPlaying.value) {
    audioElement.value.src = newSong.url
    audioElement.value.play()
  }
  loadLyrics()
})

// 初始化时加载歌词
loadLyrics()

watch(volume, (newVal) => {
  if (audioElement.value) {
    audioElement.value.volume = newVal
  }
})

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const saveToStorage = () => {
  try {
    const state = {
      currentSong: currentSong.value,
      currentTime: currentTime.value,
      duration: duration.value,
      volume: volume.value,
      isLiked: isLiked.value,
      playMode: playMode.value,
      playlist: playlist.value,
      favorites: favorites.value,
      currentIndex: currentIndex.value,
      isPlaying: isPlaying.value,
      rotationAngle: rotationAngle.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

// 使用防抖优化频繁的状态保存（currentTime 每秒钟更新多次）
const debouncedSaveToStorage = debounce(saveToStorage, 500)

// 对 currentTime 使用防抖，其他状态立即保存
watch(currentTime, () => {
  updateCurrentLyricIndex()
  debouncedSaveToStorage()
})

watch([currentSong, duration, volume, isLiked, playMode, playlist, favorites, currentIndex, isPlaying, rotationAngle], saveToStorage, { deep: true })

// 页面卸载时保存状态并暂停音乐
const handleBeforeUnload = () => {
  // 保存当前状态
  saveToStorage()
  // 暂停音乐但保持isPlaying状态
  if (isPlaying.value && audioElement.value) {
    audioElement.value.pause()
  }
}

// 注册页面卸载事件
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', handleBeforeUnload)
}

// 设置当前播放的歌单ID
const setCurrentPlaylistId = (playlistId) => {
  currentPlaylistId.value = playlistId
}

export function usePlayer() {
  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLiked,
    playMode,
    playlist,
    favorites,
    currentIndex,
    rotationAngle,
    audioElement,
    parsedLyrics,
    currentLyricIndex,
    loadLyrics,
    initAudio,
    play,
    pause,
    togglePlay,
    stop,
    seek,
    seekByPercent,
    setVolume,
    playByIndex,
    playSong,
    next,
    prev,
    toggleLike,
    removeFromFavorites,
    cyclePlayMode,
    removeFromPlaylist,
    addToPlaylist,
    currentAudioSrc,
    setCurrentPlaylistId
  }
}
