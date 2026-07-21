import { ref, watch, shallowRef, computed } from 'vue'
import { allSongs, getDefaultSong as getDefaultSongFromData, ensureMusicId } from '../data/songs.js'
import { incrementPlayCount, getPlayCount, formatPlayCount } from './useStats.js'
import {
  PLAY_MODES,
  dedupePlaybackQueue,
  findQueueSongIndex,
  normalizePlayMode,
  resolveUpcomingQueueIndex
} from './playerQueue.js'

const STORAGE_KEY = 'music-player-state'
const GLOBAL_LYRICS_KEY = 'music-global-lyrics-visible'

const normalizeLyricsKey = (value = '') => String(value).trim().toLowerCase()
const normalizeMatchToken = (value = '') => normalizeLyricsKey(value).replace(/\s+/g, '')

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

// 默认歌曲（从统一数据源获取）
const defaultSong = getDefaultSongFromData()
const defaultMusicPool = allSongs
const localMusicPool = allSongs.filter(song => String(song?.url || '').startsWith('/music/'))

const findCatalogSong = (song) => {
  if (!song) return null

  // URL 是音频的真实唯一来源，必须优先于历史 ID。
  // 旧版 generateMusicId 会把中文都替换成下划线，曾让“晴天 / 稻香 / 夜曲”
  // 获得同一个 ID，并在同步时全部被误认成晴天。
  if (song.url) {
    const urlMatch = defaultMusicPool.find(item => item.url === song.url)
    if (urlMatch) return urlMatch
  }

  if (song.title && song.artist) {
    const metadataMatch = defaultMusicPool.find(item => (
      item.title === song.title && item.artist === song.artist
    ))
    if (metadataMatch) return metadataMatch
  }

  if (song.id) {
    const idMatches = defaultMusicPool.filter(item => item.id === song.id)
    if (idMatches.length === 1) return idMatches[0]
  }

  return null
}

const isPreviewSong = (song) => {
  if (!song) return false
  if (song.isPreview || song.source === 'online') return true
  const url = String(song.url || '')
  return /itunes\.apple\.com|mzstatic\.com|audio-ssl\./i.test(url)
}

const resolveAudioUrl = (url = '') => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return url
    .split('/')
    .map((segment, index) => {
      if (index === 0 && segment === '') return ''
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    .join('/')
}

const getSongDedupeKey = (song) => {
  if (!song) return ''
  const synced = syncSongWithCatalog(song)
  // 收藏以“歌名 + 歌手”为优先依据：同一首歌即使来自旧缓存、不同歌单
  // 或被补上了不同的 id，也不应在收藏里出现两次。
  const title = normalizeMatchToken(synced.title)
  const artist = normalizeMatchToken(synced.artist)
  if (title && artist) return `meta:${title}|${artist}`
  if (synced.id && !synced.isPreview) return `id:${synced.id}`
  if (synced.url) return `url:${synced.url}`
  return ''
}

const dedupeSongList = (songs) => {
  const seen = new Set()
  const result = []
  for (const song of songs || []) {
    const key = getSongDedupeKey(song)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(syncSongWithCatalog(song))
  }
  return result
}

const syncSongWithCatalog = (song) => {
  if (!song) return song
  // 在线授权曲库的播放地址不能被同名本地歌曲替换；否则搜索到的
  // Jamendo/Audius 完整曲目可能会错误跳回本地文件。
  if (isPreviewSong(song)) {
    return ensureMusicId({ ...song, isPreview: true, source: song.source || 'online' })
  }

  if (['jamendo', 'audius'].includes(song.source)) {
    return ensureMusicId({ ...song, isPreview: false, source: song.source })
  }

  const matched = findCatalogSong(song)
  if (!matched) return ensureMusicId(song)

  return ensureMusicId({
    ...song,
    title: matched.title || song.title,
    artist: matched.artist || song.artist,
    url: matched.url || song.url,
    cover: matched.cover,
    duration: matched.duration || song.duration,
    lrc: matched.lrc || song.lrc,
    id: matched.id || song.id
  })
}

const findFavoriteIndex = (song) => favorites.value.findIndex(item => getSongDedupeKey(item) === getSongDedupeKey(song))

const currentSong = ref(syncSongWithCatalog(validateSong(savedState?.currentSong) ? savedState.currentSong : defaultSong))

const isPlaying = ref(false)
const currentTime = ref(savedState?.currentTime || 0)
const duration = ref(savedState?.duration || 0)
const volume = ref(savedState?.volume ?? 0.7)
const playMode = ref(normalizePlayMode(savedState?.playMode))
// 播放队列属于临时状态：每次重新打开站点都从 0 开始，不恢复上次的队列。
const playlist = ref([])
const storedFavoriteCount = Array.isArray(savedState?.favorites) ? savedState.favorites.length : 0
const favorites = ref(dedupeSongList(savedState?.favorites || []))
const hasStoredDuplicateFavorites = storedFavoriteCount !== favorites.value.length
// 收藏状态必须由“当前歌曲是否存在于收藏列表”推导，不能在切歌时沿用上一首的布尔值。
const isLiked = computed(() => findFavoriteIndex(currentSong.value) >= 0)
// 播放列表只保存“尚未播放”的歌曲，因此当前歌曲永远不占用队列索引。
const currentIndex = ref(-1)

// 播放历史只负责“上一首”；播放列表为空时的切歌来源是独立的本地曲库。
const playbackHistory = ref([])
const playbackHistoryIndex = ref(-1)
const historyNavigationTargetKey = ref('')
const MAX_PLAYBACK_HISTORY = 50

const getPlaybackHistoryKey = (song) => {
  if (!song) return ''
  return song.url || song.id || `${song.title || ''}-${song.artist || ''}`
}

const setCurrentSong = (song) => {
  currentSong.value = syncSongWithCatalog(song)
}

const recordPlayedTrack = (song) => {
  const normalizedSong = syncSongWithCatalog(song)
  const trackKey = getPlaybackHistoryKey(normalizedSong)
  if (!trackKey) return

  // 从历史中返回后再主动点播新歌，后续轨迹应当以新选择为准。
  if (playbackHistoryIndex.value < playbackHistory.value.length - 1) {
    playbackHistory.value = playbackHistory.value.slice(0, playbackHistoryIndex.value + 1)
  }

  const activeSong = playbackHistory.value[playbackHistoryIndex.value]
  if (getPlaybackHistoryKey(activeSong) === trackKey) return

  playbackHistory.value = [...playbackHistory.value, normalizedSong].slice(-MAX_PLAYBACK_HISTORY)
  playbackHistoryIndex.value = playbackHistory.value.length - 1
}

const getHistoryTrack = (direction, allowedSongs = null) => {
  if (!playbackHistory.value.length) return null

  const currentKey = getPlaybackHistoryKey(currentSong.value)
  const matchingIndex = playbackHistory.value
    .map(getPlaybackHistoryKey)
    .lastIndexOf(currentKey)

  if (matchingIndex !== -1) {
    playbackHistoryIndex.value = matchingIndex
  } else if (playbackHistoryIndex.value < 0) {
    return null
  }

  const allowedKeys = Array.isArray(allowedSongs)
    ? new Set(allowedSongs.map(getPlaybackHistoryKey))
    : null
  const step = direction < 0 ? -1 : 1
  let targetIndex = playbackHistoryIndex.value + step

  while (targetIndex >= 0 && targetIndex < playbackHistory.value.length) {
    const target = playbackHistory.value[targetIndex]
    if (!allowedKeys || allowedKeys.has(getPlaybackHistoryKey(target))) {
      playbackHistoryIndex.value = targetIndex
      return target
    }
    targetIndex += step
  }

  return null
}

const parsedLyrics = ref([])
const currentLyricIndex = ref(-1)
const isLyricsLoading = ref(false)
const showGlobalLyrics = ref(localStorage.getItem(GLOBAL_LYRICS_KEY) === 'true')

const PREVIEW_CLIP_SEC = 30
// 试听片段在整首歌时间轴上的起点（秒）。整首歌词 + 整首进度条共用此偏移：
// 音频只播放高潮片段，但歌词与进度条都按“整首歌”展示，播放头落在高潮处，从而保持同步。
const previewOffsetSec = ref(0)

// 当前播放的歌单ID
const currentPlaylistId = ref('')
// 标记是否通过拖动进度条完成播放
const isSeekedToEnd = ref(false)

// 连续加载失败计数器（防止无限递归）
let consecutiveLoadFailures = 0
const MAX_LOAD_FAILURES = 3

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
const lyricsPendingRequests = new Map()
const lyricsMissCache = new Map()
const LYRICS_MISS_TTL = 2 * 60 * 1000
let lyricsRequestId = 0

const ARTIST_ROMANIZATION = {
  '陈粒': ['chenli', 'chen li'],
  '周杰伦': ['jaychou', 'jay chou'],
  '林俊杰': ['jjlin', 'jj lin', 'linjunjie'],
  '邓紫棋': ['gem', 'g.e.m.', 'dengziqi'],
  '陈奕迅': ['eason', 'chenyixun']
}

const titleMatchesRecord = (songTitle, recordTitle) => {
  const left = normalizeMatchToken(songTitle)
  const right = normalizeMatchToken(recordTitle)
  if (!left || !right) return false
  return left === right || right.includes(left) || left.includes(right)
}

const artistMatchesRecord = (songArtist, recordArtist) => {
  if (!songArtist || !recordArtist) return false

  const left = normalizeMatchToken(songArtist)
  const right = normalizeMatchToken(recordArtist)
  if (left === right || right.includes(left) || left.includes(right)) return true

  const aliases = ARTIST_ROMANIZATION[songArtist.trim()] || []
  return aliases.some(alias => right.includes(normalizeMatchToken(alias)))
}

const scoreLyricsRecord = (record, song) => {
  if (!record?.syncedLyrics && !record?.plainLyrics) return -1

  let score = 0
  if (titleMatchesRecord(song.title, record.trackName)) score += 100
  else return -1

  if (artistMatchesRecord(song.artist, record.artistName)) score += 60
  else if (song.artist) score -= 20

  if (record.syncedLyrics) score += 25
  else if (record.plainLyrics) score += 8

  if (song.fullDurationSec && record.duration) {
    const diff = Math.abs(Number(song.fullDurationSec) - Number(record.duration))
    if (diff <= 2) score += 40
    else if (diff <= 6) score += 24
    else if (diff <= 12) score += 10
    else score -= Math.min(30, diff)
  }

  if (song.album && record.albumName && normalizeMatchToken(song.album) === normalizeMatchToken(record.albumName)) {
    score += 12
  }

  return score
}

const pickBestLyricsRecord = (results, song) => {
  if (!Array.isArray(results) || !results.length) return null

  let bestRecord = null
  let bestScore = -1

  for (const record of results) {
    const score = scoreLyricsRecord(record, song)
    if (score > bestScore) {
      bestScore = score
      bestRecord = record
    }
  }

  return bestRecord
}

const resolveLyricsPath = (song) => {
  if (!song) return null
  if (song.lrc) return song.lrc
  if (song.title) return `/lyrics/${encodeURIComponent(song.title)}.lrc`
  return null
}

const findLocalSongLyricsPath = (song) => {
  if (!song?.title) return null
  const titleKey = normalizeLyricsKey(song.title)
  const match = allSongs.find(item => normalizeLyricsKey(item.title) === titleKey)
  return match?.lrc || null
}

const plainLyricsToDisplayLines = (plainLyrics) => {
  return plainLyrics
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((text) => ({ time: Number.POSITIVE_INFINITY, text, unsynced: true }))
}

const LRCLIB_CLIENT = 'personal-blog/1.0'
const LRCLIB_HEADERS = {
  'Lrclib-Client': LRCLIB_CLIENT,
  'User-Agent': LRCLIB_CLIENT
}

const getLRCLIBEndpoints = (suffix) => {
  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`
  return [
    import.meta.env.DEV ? `/api/lrclib${normalized}` : null,
    `https://lrclib.net/api${normalized}`
  ].filter(Boolean)
}

const fetchLRCLIBDirect = async (suffix, timeoutMs = 4500) => {
  const urls = getLRCLIBEndpoints(suffix)
  const attempts = urls.map(async (url) => {
    const response = await fetch(url, {
      // 本地开发代理可以附带客户端标识；跨域直连保持简单请求，避免额外预检拖慢歌词。
      headers: url.startsWith('/') ? LRCLIB_HEADERS : undefined,
      signal: AbortSignal.timeout(timeoutMs)
    })
    if (!response.ok) throw new Error(`lrclib-${response.status}`)
    return response
  })

  try {
    // 任一线路先成功就立刻使用，不再等待最慢线路超时。
    return await Promise.any(attempts)
  } catch {
    return null
  }
}

const fetchLRCLIBWithProxy = async (suffix, timeoutMs = 6500) => {
  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`
  const targetUrl = `https://lrclib.net/api${normalized}`

  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(timeoutMs) })
    if (response.ok) return response
  } catch (error) {
    console.warn('LRCLIB proxy request failed:', error)
  }
  return null
}

const lyricsFromRecord = (record) => {
  if (!record) return []
  if (record.syncedLyrics) return parseLRC(record.syncedLyrics)
  if (record.plainLyrics) return plainLyricsToDisplayLines(record.plainLyrics)
  return []
}

const pickBestLyricsFromRecords = (results, song) => {
  const record = pickBestLyricsRecord(results, song)
  return lyricsFromRecord(record)
}

const fetchLyricsRecordFromLRCLIBGet = async (song, useProxy = false) => {
  if (!song?.title || !song.fullDurationSec) return null

  const getParams = new URLSearchParams({
    track_name: song.title,
    artist_name: song.artist || '',
    album_name: song.album || '',
    duration: String(song.fullDurationSec)
  })

  const fetcher = useProxy ? fetchLRCLIBWithProxy : fetchLRCLIBDirect
  const response = await fetcher(`/get?${getParams.toString()}`, useProxy ? 6500 : 4500)
  if (!response) return null

  try {
    const record = await response.json()
    return scoreLyricsRecord(record, song) >= 80 ? record : null
  } catch {
    return null
  }
}

const searchLyricsRecordsFromLRCLIB = async (song, useProxy = false) => {
  const plans = [
    { track_name: song.title, artist_name: song.artist },
    { track_name: song.title, artist_name: song.artist, album_name: song.album },
    { q: `${song.title} ${song.artist || ''}`.trim() },
    { track_name: song.title }
  ].filter((plan) => Object.values(plan).some(Boolean))

  const seenPlans = new Set()
  const searchPlans = plans.filter((plan) => {
    const key = JSON.stringify(plan)
    if (seenPlans.has(key)) return false
    seenPlans.add(key)
    return true
  })

  const fetcher = useProxy ? fetchLRCLIBWithProxy : fetchLRCLIBDirect
  const merged = []
  const seen = new Set()

  // 多种匹配方案并行执行，最长只等待一轮超时，不再逐个请求累加等待时间。
  const attempts = await Promise.allSettled(searchPlans.map(async (plan) => {
    const params = new URLSearchParams()
    Object.entries(plan).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    const response = await fetcher(`/search?${params.toString()}`, useProxy ? 6500 : 4500)
    if (!response) return []

    try {
      const results = await response.json()
      return Array.isArray(results) ? results : []
    } catch {
      return []
    }
  }))

  for (const attempt of attempts) {
    if (attempt.status !== 'fulfilled') continue
    for (const record of attempt.value) {
      const recordKey = record.id ?? `${record.trackName}-${record.artistName}-${record.duration}`
      if (seen.has(recordKey)) continue
      seen.add(recordKey)
      merged.push(record)
    }
  }

  return merged
}

const firstAvailableLyrics = async (candidates) => {
  try {
    return await Promise.any(candidates.map(async (candidate) => {
      const lyrics = await candidate
      if (!Array.isArray(lyrics) || !lyrics.length) throw new Error('lyrics-not-found')
      return lyrics
    }))
  } catch {
    return []
  }
}

const fetchLyricsFromLRCLIB = async (song) => {
  // 精确匹配与搜索同时开始，谁先拿到有效歌词就立即返回。
  const directLyrics = await firstAvailableLyrics([
    fetchLyricsRecordFromLRCLIBGet(song).then(lyricsFromRecord),
    searchLyricsRecordsFromLRCLIB(song).then(records => pickBestLyricsFromRecords(records, song))
  ])
  if (directLyrics.length) return directLyrics

  // 直连不可用时再走一次代理兜底，避免每条搜索都重复直连等待。
  return firstAvailableLyrics([
    fetchLyricsRecordFromLRCLIBGet(song, true).then(lyricsFromRecord),
    searchLyricsRecordsFromLRCLIB(song, true).then(records => pickBestLyricsFromRecords(records, song))
  ])
}

const fetchLyricsFromLyricsOvh = async (song) => {
  if (!song?.title || !song?.artist || song.isInstrumental) return []

  const targetUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`
  try {
    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return []
    const payload = await response.json()
    if (typeof payload?.lyrics !== 'string') return []
    return plainLyricsToDisplayLines(payload.lyrics)
  } catch {
    return []
  }
}

const LYRICS_CACHE_VERSION = 'v4'

const rawLyricsCacheKey = (song) => `${LYRICS_CACHE_VERSION}:raw:${normalizeLyricsKey(song.title)}:${normalizeLyricsKey(song.artist)}`

const resolveLyricsCacheKey = (song) => {
  if (!song) return ''
  const base = song.lrc
    || resolveLyricsPath(song)
    || `${LYRICS_CACHE_VERSION}:online:${normalizeLyricsKey(song.title)}:${normalizeLyricsKey(song.artist)}`
  return song.isPreview ? `${base}:preview` : `${base}:full`
}

const CREDIT_LINE_PATTERN = /编[曲制]|作[词曲]|录[音混]|混[音缩]|母带|出品|发行|营销|吉他|贝斯|鼓|键盘|小提琴|弦乐|和声|和音|produc|composer|arrang/i

const isCreditLine = (text = '') => CREDIT_LINE_PATTERN.test(text)

// 找出“副歌钩子”：歌词里重复次数最多的非制作信息行。iTunes 试听几乎必然包含副歌，
// 以钩子句为锚点比单纯看密度更能命中真实试听片段。
const HOOK_MIN_REPEAT = 2

const buildHookSet = (lyrics) => {
  const counts = new Map()
  for (const line of lyrics) {
    if (isCreditLine(line.text)) continue
    const key = normalizeMatchToken(line.text)
    if (key.length < 2) continue
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  let maxCount = 1
  counts.forEach((count) => { if (count > maxCount) maxCount = count })

  const hooks = new Set()
  if (maxCount >= HOOK_MIN_REPEAT) {
    counts.forEach((count, key) => {
      if (count >= maxCount) hooks.add(key)
    })
  }
  return hooks
}

const scorePreviewWindow = (lyrics, start, clipSec = PREVIEW_CLIP_SEC, fullDurationSec = 0, hooks = null) => {
  const lines = lyrics.filter(line => line.time >= start && line.time < start + clipSec)
  if (!lines.length) return -1

  const creditCount = lines.filter(line => isCreditLine(line.text)).length
  // 整窗几乎全是制作信息（词/曲/编曲…）→ 不可能是试听片段
  if (creditCount >= Math.max(2, Math.ceil(lines.length * 0.45))) return -1

  const firstOffset = lines[0].time - start
  // 以歌词密度为主：iTunes 30s 试听几乎都截取副歌/高潮，那里歌词最密集
  let score = lines.length * 10 - firstOffset * 4 - (firstOffset > 4 ? 10 : 0)
  score -= creditCount * 22

  // 命中副歌钩子句给高额加分：让窗口锁定到真正的高潮段而非密集的主歌
  if (hooks && hooks.size) {
    const hookHits = lines.filter(line => hooks.has(normalizeMatchToken(line.text))).length
    score += hookHits * 18
  }

  // 试听极少从前奏/开头截取，避免窗口被选在歌曲最前面
  if (start < 12) score -= (12 - start) * 2

  // 偏好“第一段副歌”所在区域（约 22%~50%）：iTunes 多取首段副歌；中后段次之
  if (fullDurationSec > clipSec) {
    const rel = (start + clipSec / 2) / fullDurationSec
    if (rel >= 0.22 && rel <= 0.5) score += 14
    else if (rel > 0.5 && rel <= 0.72) score += 6
    else if (rel < 0.22) score -= 8
  }

  return score
}

const estimatePreviewStartSec = (lyrics, fullDurationSec) => {
  if (!lyrics.length) return 0

  const hooks = buildHookSet(lyrics)
  const lastTime = lyrics[lyrics.length - 1].time
  const maxStart = Math.max(0, (fullDurationSec || lastTime + 5) - PREVIEW_CLIP_SEC)

  // 优先：副歌钩子句的首次出现（iTunes 试听几乎必含副歌，比窗口打分更稳）
  if (hooks.size) {
    for (const line of lyrics) {
      if (isCreditLine(line.text)) continue
      if (!hooks.has(normalizeMatchToken(line.text))) continue
      const leadIn = line.time > 8 ? 2 : 0
      return Math.max(0, Math.min(maxStart, Math.round(line.time - leadIn)))
    }
  }

  const candidates = new Set()

  // 用每句歌词的起点做候选，让窗口正好卡在某句歌词开头，避免半句切入；
  // 同时补一个“提前 1 秒”的候选，模拟 iTunes 常见的“副歌前半秒切入”。
  lyrics.forEach((line) => {
    if (line.time <= maxStart) candidates.add(Math.max(0, Math.round(line.time)))
    const pre = Math.max(0, Math.round(line.time - 1))
    if (pre <= maxStart) candidates.add(pre)
  })
  // 再补一组等距候选，避免遗漏空档
  for (let start = 0; start <= maxStart; start += 1) {
    candidates.add(start)
  }

  let bestStart = 0
  let bestScore = -1

  candidates.forEach((start) => {
    if (start > maxStart) return
    const score = scorePreviewWindow(lyrics, start, PREVIEW_CLIP_SEC, fullDurationSec, hooks)
    if (score > bestScore) {
      bestScore = score
      bestStart = start
    }
  })

  return bestStart
}

const isCurrentSongPreview = () => isPreviewSong(currentSong.value)

const getPreviewClipLength = () => audioElement.value?.duration || PREVIEW_CLIP_SEC

const mapDisplayTimeToAudioTime = (displayTime) => {
  const clipLen = getPreviewClipLength()
  return Math.max(0, Math.min(clipLen, displayTime - previewOffsetSec.value))
}

const mapAudioTimeToDisplayTime = (audioTime) => previewOffsetSec.value + audioTime

// 试听歌曲也保留整首歌词（原始时间轴）。不再裁剪/重定基，
// 仅由 applyPreviewTimeline 估算高潮起点，交给播放/进度逻辑做时间轴映射。
const prepareLyricsForSong = (song, rawLyrics) => rawLyrics

// 根据整首歌词 + 整首时长估算试听片段落在全曲中的起点，并把进度条切到“整首时长 + 高潮起点”。
const applyPreviewTimeline = (song, lyrics) => {
  if (isPreviewSong(song)) {
    previewOffsetSec.value = lyrics.length ? estimatePreviewStartSec(lyrics, song.fullDurationSec) : 0
    if (song.fullDurationSec) duration.value = song.fullDurationSec
    const audioTime = audioElement.value?.currentTime || 0
    // 尚未开始播放时，把播放头预置到高潮起点，进度条一打开就停在正确位置
    if (audioTime < 0.1) currentTime.value = previewOffsetSec.value
  } else {
    previewOffsetSec.value = 0
  }
}

const fetchRawLyricsForSong = async (song) => {
  if (song?.isInstrumental) return []

  const candidatePaths = song.isPreview
    ? [findLocalSongLyricsPath(song)].filter(Boolean)
    : [song.lrc, resolveLyricsPath(song), findLocalSongLyricsPath(song)].filter(Boolean)

  for (const lrcPath of [...new Set(candidatePaths)]) {
    try {
      const lyrics = await fetchLyricsFromPath(lrcPath)
      if (lyrics.length) return lyrics
    } catch (error) {
      console.error('Failed to load lyrics:', lrcPath, error)
    }
  }

  // 在线来源只消费曲库明确随歌曲返回、或作者在曲目说明中提供的歌词；
  // 不再通过第三方猜测或抓取商业歌词，避免把未授权歌词带入公开站点。
  if (song?.providerLyrics) {
    const providerLyrics = String(song.providerLyrics).trim()
    const syncedLyrics = parseLRC(providerLyrics)
    return syncedLyrics.length ? syncedLyrics : plainLyricsToDisplayLines(providerLyrics)
  }

  if (song?.creatorLyrics) {
    const creatorLyrics = plainLyricsToDisplayLines(song.creatorLyrics)
    if (creatorLyrics.length) return creatorLyrics
  }

  return []
}

const getRawLyricsForSong = async (song) => {
  const cacheKey = rawLyricsCacheKey(song)
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)
  }

  const missUntil = lyricsMissCache.get(cacheKey) || 0
  if (missUntil > Date.now()) return []

  // 搜索预取、点击播放和切歌监听可能同时触发；同一首歌始终复用同一个在途请求。
  if (lyricsPendingRequests.has(cacheKey)) {
    return lyricsPendingRequests.get(cacheKey)
  }

  const request = fetchRawLyricsForSong(song)
    .then((rawLyrics) => {
      if (rawLyrics.length) {
        if (lyricsCache.size >= 40) {
          const firstKey = lyricsCache.keys().next().value
          lyricsCache.delete(firstKey)
        }
        lyricsCache.set(cacheKey, rawLyrics)
        lyricsMissCache.delete(cacheKey)
      } else {
        // 暂时找不到时短期记忆结果，防止同一首试听反复触发整套远程搜索。
        lyricsMissCache.set(cacheKey, Date.now() + LYRICS_MISS_TTL)
      }
      return rawLyrics
    })
    .finally(() => lyricsPendingRequests.delete(cacheKey))

  lyricsPendingRequests.set(cacheKey, request)
  return request
}

const getLyricsForSong = async (song) => {
  // iTunes 等试听源只返回一段音频，并不提供它在完整版中的准确起点。
  // 因此不能把完整版歌词时间轴硬套到试听片段上，否则高亮歌词必然可能错位。
  if (isPreviewSong(song)) return []

  const cacheKey = resolveLyricsCacheKey(song)
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)
  }

  const rawLyrics = await getRawLyricsForSong(song)
  const lyrics = prepareLyricsForSong(song, rawLyrics)
  if (lyrics.length) {
    storeLyrics(cacheKey, lyrics, { updateView: false })
  }
  return lyrics
}

const prefetchLyrics = (song) => {
  if (!song?.title) return Promise.resolve()
  if (isPreviewSong(song)) return Promise.resolve([])
  // 搜索结果出现后提前加载；若用户立即点击，播放流程会复用同一个请求。
  return getLyricsForSong(song).catch(() => [])
}

const storeLyrics = (cacheKey, lyrics, options = {}) => {
  const { updateView = true } = options
  if (lyricsCache.size >= 40) {
    const firstKey = lyricsCache.keys().next().value
    lyricsCache.delete(firstKey)
  }
  lyricsCache.set(cacheKey, lyrics)
  if (updateView) {
    parsedLyrics.value = lyrics
    currentLyricIndex.value = -1
    updateCurrentLyricIndex()
  }
}

const fetchLyricsFromPath = async (lrcPath) => {
  const response = await fetch(lrcPath)
  if (!response.ok) return []
  return parseLRC(await response.text())
}

const loadLyrics = async () => {
  const song = currentSong.value
  const requestId = ++lyricsRequestId

  if (!song) {
    parsedLyrics.value = []
    currentLyricIndex.value = -1
    isLyricsLoading.value = false
    return
  }

  if (isPreviewSong(song)) {
    parsedLyrics.value = []
    currentLyricIndex.value = -1
    previewOffsetSec.value = 0
    isLyricsLoading.value = false
    return
  }

  const cacheKey = resolveLyricsCacheKey(song)
  if (lyricsCache.has(cacheKey)) {
    const cached = lyricsCache.get(cacheKey)
    parsedLyrics.value = cached
    currentLyricIndex.value = -1
    applyPreviewTimeline(song, cached)
    updateCurrentLyricIndex()
    isLyricsLoading.value = false
    return
  }

  // 切歌后立刻清空上一首歌词，避免异步加载期间歌词页/桌面词仍显示上一首（试听切歌最明显）
  parsedLyrics.value = []
  currentLyricIndex.value = -1
  isLyricsLoading.value = true

  try {
    const lyrics = await getLyricsForSong(song)
    if (requestId !== lyricsRequestId) return
    parsedLyrics.value = lyrics
    currentLyricIndex.value = -1
    applyPreviewTimeline(song, lyrics)
    updateCurrentLyricIndex()
  } catch (error) {
    if (requestId !== lyricsRequestId) return
    console.error('Failed to load lyrics:', error)
    parsedLyrics.value = []
    currentLyricIndex.value = -1
  } finally {
    if (requestId === lyricsRequestId) {
      isLyricsLoading.value = false
    }
  }
}

const updateCurrentLyricIndex = () => {
  const lyrics = parsedLyrics.value
  const len = lyrics.length
  if (len === 0) {
    currentLyricIndex.value = -1
    return
  }

  // 二分查找 O(log n)
  let left = 0
  let right = len - 1
  let result = -1

  while (left <= right) {
    const mid = (left + right) >>> 1
    if (lyrics[mid].time <= currentTime.value) {
      result = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  currentLyricIndex.value = result
}

const audioElement = shallowRef(null)
const currentAudioSrc = ref('')
const isAudioReady = ref(false)

// 路由切换到歌词页时立即读取真实 audio 时钟，避免 UI 仍停在上一首歌的旧进度。
const syncPlayerClock = () => {
  const audio = audioElement.value
  if (!audio) return

  const nextTime = Number(audio.currentTime)
  if (Number.isFinite(nextTime)) {
    currentTime.value = nextTime
  }

  const nextDuration = Number(audio.duration)
  if (Number.isFinite(nextDuration) && nextDuration > 0) {
    duration.value = nextDuration
  }

  updateCurrentLyricIndex()
}

const initAudio = () => {
  if (!audioElement.value) {
    audioElement.value = new Audio()
    audioElement.value.volume = volume.value
    // 播放模式完全由队列逻辑控制，禁止浏览器原生 loop 与界面状态脱节。
    audioElement.value.loop = false

    audioElement.value.addEventListener('timeupdate', syncPlayerClock)

    audioElement.value.addEventListener('loadedmetadata', () => {
      // 试听源只知道片段自身时长，使用真实片段时间轴，避免伪装成完整版进度。
      duration.value = audioElement.value.duration
      if (currentTime.value > 0 && audioElement.value.currentTime === 0) {
        audioElement.value.currentTime = currentTime.value
      }
      syncPlayerClock()
      consecutiveLoadFailures = 0
    })

    ;['seeking', 'seeked', 'playing', 'canplay'].forEach(eventName => {
      audioElement.value.addEventListener(eventName, syncPlayerClock)
    })

    audioElement.value.addEventListener('ended', () => {
      handleSongEnd()
    })

    audioElement.value.addEventListener('play', () => {
      isPlaying.value = true
      const currentKey = getPlaybackHistoryKey(currentSong.value)
      if (historyNavigationTargetKey.value) {
        // 保留同一首历史目标的标记直到真正切到另一首，避免浏览器补发
        // play 事件时把“前进分支”误判为一次新的点播而截断。
        if (historyNavigationTargetKey.value === currentKey) return
        historyNavigationTargetKey.value = ''
      }
      recordPlayedTrack(currentSong.value)
    })

    audioElement.value.addEventListener('pause', () => {
      isPlaying.value = false
    })

    audioElement.value.addEventListener('error', () => {
      console.error('Audio load error:', audioElement.value?.src)
      recoverFromAudioLoadError(playRequestId, currentAudioSrc.value)
    })

    if (currentSong.value.url) {
      const initialUrl = resolveAudioUrl(currentSong.value.url)
      audioElement.value.src = initialUrl
      currentAudioSrc.value = initialUrl
      if (currentTime.value > 0) {
        audioElement.value.currentTime = currentTime.value
      }
    }
  }
  return audioElement.value
}

const getLocalMusicIndex = (song) => localMusicPool.findIndex(item => (
  getPlaybackHistoryKey(item) === getPlaybackHistoryKey(song)
))

const normalizePlaybackQueue = (songs) => dedupePlaybackQueue(
  (songs || [])
    .filter(song => song?.url && song?.title)
    .map(syncSongWithCatalog)
)

const removeSongFromUpcomingQueue = (song) => {
  const queueIndex = findQueueSongIndex(playlist.value, song)
  if (queueIndex >= 0) {
    playlist.value.splice(queueIndex, 1)
  }
  currentIndex.value = -1
  return queueIndex
}

/**
 * 直接替换“待播列表”。当前歌曲和已经播放过的歌曲不属于待播列表。
 */
const replacePlaylist = (songs) => {
  const normalizedQueue = normalizePlaybackQueue(songs)
  playlist.value = normalizedQueue.filter(song => (
    getPlaybackHistoryKey(song) !== getPlaybackHistoryKey(currentSong.value)
  ))
  currentIndex.value = -1
  return playlist.value
}

/**
 * 播放列表只接受用户明确加入的歌曲，绝不能用本地曲库自动补齐。
 */
const ensureUpcomingQueue = () => {
  removeSongFromUpcomingQueue(currentSong.value)
  return playlist.value
}

const resolveLocalFallbackIndex = (direction = 1) => {
  if (!localMusicPool.length) return -1

  const activeLocalIndex = getLocalMusicIndex(currentSong.value)
  if (playMode.value === 'random') {
    if (localMusicPool.length === 1) return 0
    if (activeLocalIndex < 0) {
      return Math.floor(Math.random() * localMusicPool.length)
    }

    const randomOffset = 1 + Math.floor(Math.random() * (localMusicPool.length - 1))
    return (activeLocalIndex + randomOffset) % localMusicPool.length
  }

  if (activeLocalIndex < 0) {
    return direction < 0 ? localMusicPool.length - 1 : 0
  }

  return (
    activeLocalIndex +
    (direction < 0 ? -1 : 1) +
    localMusicPool.length
  ) % localMusicPool.length
}

const playLocalMusicAt = (index) => {
  if (!localMusicPool.length) {
    isPlaying.value = false
    currentSong.value = { title: '暂无音乐', artist: '', cover: '/images/covers/qingtian.jpg', url: '', duration: '0:00' }
    return false
  }

  const safeIndex = ((index % localMusicPool.length) + localMusicPool.length) % localMusicPool.length
  return startSong(localMusicPool[safeIndex])
}

const playFallbackLocal = (direction = 1) => {
  const localIndex = resolveLocalFallbackIndex(direction)
  return localIndex >= 0 ? playLocalMusicAt(localIndex) : false
}

const handleSongEnd = () => {
  // 检查是否是自然播放结束（不是通过拖动进度条）
  if (!isSeekedToEnd.value && currentPlaylistId.value) {
    // 直接调用 useStats 的 incrementPlayCount，无需动态 import
    incrementPlayCount(currentPlaylistId.value)
  }

  // 重置标记
  isSeekedToEnd.value = false

  // “自然播完”才遵守单曲循环；手动上一首 / 下一首始终允许切歌。
  advancePlayback(1, { automatic: true })
}

const removeFromPlaylist = (index) => {
  if (!Number.isInteger(index) || index < 0 || index >= playlist.value.length) return false
  playlist.value.splice(index, 1)
  currentIndex.value = -1
  return true
}

const addToPlaylist = (song) => {
  const normalizedSong = syncSongWithCatalog(ensureMusicId(song))
  if (!normalizedSong?.url) return false

  if (getPlaybackHistoryKey(normalizedSong) === getPlaybackHistoryKey(currentSong.value)) {
    return false
  }

  const exists = findQueueSongIndex(playlist.value, normalizedSong) >= 0
  if (!exists) {
    playlist.value.push(normalizedSong)
  }
  currentIndex.value = -1
  return !exists
}

/**
 * “播放全部”会明确建立待播列表；普通点播必须使用 playSong，不能自动填充播放列表。
 */
const playCollection = (songs, startSongOrIndex = 0, options = {}) => {
  const collection = normalizePlaybackQueue(songs)
  if (!collection.length) return false

  const requestedIndex = typeof startSongOrIndex === 'number'
    ? startSongOrIndex
    : findQueueSongIndex(collection, startSongOrIndex)
  const safeIndex = requestedIndex >= 0 && requestedIndex < collection.length
    ? requestedIndex
    : 0

  currentPlaylistId.value = options.playlistId || ''
  const rotatedQueue = [
    ...collection.slice(safeIndex),
    ...collection.slice(0, safeIndex)
  ]
  playlist.value = rotatedQueue
  currentIndex.value = -1
  return playByIndex(0)
}

let playRequestId = 0

const recoverFromAudioLoadError = (requestId, failedUrl) => {
  if (requestId !== playRequestId) return

  consecutiveLoadFailures += 1
  isPlaying.value = false

  const activeQueue = ensureUpcomingQueue()
  if (consecutiveLoadFailures >= MAX_LOAD_FAILURES) {
    console.error('Unable to continue playback after audio load failure:', failedUrl)
    if (audioElement.value && !audioElement.value.paused) {
      audioElement.value.pause()
    }
    return
  }

  if (activeQueue.length) {
    const nextIndex = resolveUpcomingQueueIndex({
      length: activeQueue.length,
      mode: playMode.value
    })
    playByIndex(nextIndex)
    return
  }

  if (!playFallbackLocal(1)) {
    console.error('Unable to continue playback after audio load failure:', failedUrl)
  }
}

const play = () => {
  const requestId = ++playRequestId
  ensureUpcomingQueue()
  const audio = initAudio()
  const url = resolveAudioUrl(currentSong.value?.url)
  if (!url) return

  const startPlayback = () => {
    if (requestId !== playRequestId) return

    const playPromise = audio.play()
    if (playPromise === undefined) return

    playPromise
      .then(() => {
        if (requestId !== playRequestId) return
        isPlaying.value = true
        consecutiveLoadFailures = 0
      })
      .catch((error) => {
        if (requestId !== playRequestId) return
        console.error('Play failed:', error)
        isPlaying.value = false
      })
  }

  if (currentAudioSrc.value !== url) {
    isAudioReady.value = false
    currentAudioSrc.value = url
    audio.src = url
    currentTime.value = 0
    audio.currentTime = 0

    const onCanPlay = () => {
      audio.removeEventListener('error', onError)
      if (requestId !== playRequestId) return
      isAudioReady.value = true
      startPlayback()
    }

    const onError = () => {
      audio.removeEventListener('canplay', onCanPlay)
      if (requestId !== playRequestId) return
      console.error('Audio load error:', url)
      recoverFromAudioLoadError(requestId, url)
    }

    audio.addEventListener('canplay', onCanPlay, { once: true })
    audio.addEventListener('error', onError, { once: true })
    audio.load()
    return
  }

  if (currentTime.value > 0) {
    const targetAudioTime = currentTime.value
    if (Math.abs(audio.currentTime - targetAudioTime) > 0.5) {
      audio.currentTime = targetAudioTime
    }
  }

  if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    const onCanPlay = () => {
      audio.removeEventListener('error', onError)
      if (requestId !== playRequestId) return
      startPlayback()
    }
    const onError = () => {
      audio.removeEventListener('canplay', onCanPlay)
      if (requestId !== playRequestId) return
      recoverFromAudioLoadError(requestId, url)
    }
    audio.addEventListener('canplay', onCanPlay, { once: true })
    audio.addEventListener('error', onError, { once: true })
    return
  }

  startPlayback()
}

const pause = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    const audioTime = audioElement.value.currentTime
    currentTime.value = audioTime
    isPlaying.value = false
  }
}

const togglePlay = () => {
  const audio = initAudio()
  if (!currentSong.value.url) return

  if (!audio.paused) {
    pause()
    return
  }

  play()
}

const stop = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
    isPlaying.value = false
  }
}

const seek = (time) => {
  if (!audioElement.value) return

  const safeTime = Math.max(0, Math.min(duration.value || time, time))
  audioElement.value.currentTime = safeTime
  currentTime.value = safeTime

  isSeekedToEnd.value = duration.value > 0 && currentTime.value / duration.value >= 0.95
}

const seekByPercent = (percent) => {
  if (duration.value > 0) {
    seek(percent * duration.value)
  }
}

const setVolume = (val) => {
  volume.value = val
  if (audioElement.value) {
    audioElement.value.volume = val
  }
}

const restartCurrentTrack = () => {
  const audio = initAudio()
  currentTime.value = 0
  isSeekedToEnd.value = false

  try {
    audio.currentTime = 0
  } catch {
    // 元数据尚未加载时由 play() 在切换音源后归零。
  }

  play()
}

const startSong = (song, { fromHistory = false } = {}) => {
  const normalizedSong = syncSongWithCatalog(song)
  if (!normalizedSong?.url) return false

  removeSongFromUpcomingQueue(normalizedSong)
  if (fromHistory) {
    historyNavigationTargetKey.value = getPlaybackHistoryKey(normalizedSong)
  }

  setCurrentSong(normalizedSong)
  currentIndex.value = -1
  currentAudioSrc.value = ''
  currentTime.value = 0
  isSeekedToEnd.value = false
  play()
  return true
}

const playByIndex = (index) => {
  if (!playlist.value.length) return false
  if (!Number.isInteger(index) || index < 0 || index >= playlist.value.length) return false

  // 一首歌只要开始播放，就立即从“待播列表”消费掉。
  const [selectedSong] = playlist.value.splice(index, 1)
  currentIndex.value = -1
  return startSong(selectedSong)
}

const playSong = (song, _contextSongs = null, options = {}) => {
  const normalizedSong = syncSongWithCatalog(song)
  if (!normalizedSong?.url) return false

  const queueIndex = findQueueSongIndex(playlist.value, normalizedSong)
  if (queueIndex >= 0) {
    currentPlaylistId.value = options.playlistId || currentPlaylistId.value
    return playByIndex(queueIndex)
  }

  currentPlaylistId.value = options.playlistId || ''
  return startSong(normalizedSong)
}

const advancePlayback = (direction, { automatic = false } = {}) => {
  const activeQueue = ensureUpcomingQueue()

  // 单曲循环只在自然播完时重播当前歌曲，手动切歌仍会消费下一首。
  if (automatic && playMode.value === 'single') {
    restartCurrentTrack()
    return true
  }

  if (!automatic && direction < 0 && activeQueue.length) {
    const previousSong = getHistoryTrack(-1)
    return previousSong
      ? startSong(previousSong, { fromHistory: true })
      : playFallbackLocal(-1)
  }

  if (!activeQueue.length) {
    return playFallbackLocal(direction)
  }

  const targetIndex = resolveUpcomingQueueIndex({
    length: activeQueue.length,
    mode: playMode.value
  })
  return playByIndex(targetIndex)
}

const next = () => advancePlayback(1)

const prev = () => advancePlayback(-1)

const toggleLike = () => {
  const favoriteIndex = findFavoriteIndex(currentSong.value)
  if (favoriteIndex >= 0) {
    const favoriteKey = getSongDedupeKey(currentSong.value)
    // 兼容旧缓存中已经存在的重复项：取消收藏时一次性移除同一首歌的全部副本。
    favorites.value = favorites.value.filter(song => getSongDedupeKey(song) !== favoriteKey)
    return
  }

  const songWithId = ensureMusicId(syncSongWithCatalog(currentSong.value))
  favorites.value = dedupeSongList([...favorites.value, songWithId])
}

const removeFromFavorites = (index) => {
  if (index >= 0 && index < favorites.value.length) {
    favorites.value.splice(index, 1)
  }
}

const cyclePlayMode = () => {
  const currentMode = normalizePlayMode(playMode.value)
  const currentModeIndex = PLAY_MODES.indexOf(currentMode)
  playMode.value = PLAY_MODES[(currentModeIndex + 1) % PLAY_MODES.length]
  if (audioElement.value) {
    audioElement.value.loop = false
  }
  if (
    typeof window !== 'undefined'
    && typeof window.dispatchEvent === 'function'
    && typeof CustomEvent === 'function'
  ) {
    window.dispatchEvent(new CustomEvent('mesting:play-mode-changed', {
      detail: { mode: playMode.value }
    }))
  }
  return playMode.value
}

const toggleGlobalLyrics = () => {
  showGlobalLyrics.value = !showGlobalLyrics.value
  localStorage.setItem(GLOBAL_LYRICS_KEY, String(showGlobalLyrics.value))
}

const setGlobalLyricsVisible = (visible) => {
  showGlobalLyrics.value = Boolean(visible)
  localStorage.setItem(GLOBAL_LYRICS_KEY, String(showGlobalLyrics.value))
}

watch(currentSong, () => {
  loadLyrics()
}, { deep: true })

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
      isPlaying: isPlaying.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

// 打开页面时即清理旧缓存里遗留的重复收藏，后续刷新也不会再出现。
if (hasStoredDuplicateFavorites) saveToStorage()

// 使用 1500ms 防抖减少 localStorage 写入频率，避免导航时的主线程阻塞
const debouncedSaveToStorage = debounce(saveToStorage, 1500)

watch(currentTime, () => {
  updateCurrentLyricIndex()
  debouncedSaveToStorage()
})

watch([currentSong, duration, volume, isLiked, playMode, playlist, favorites, currentIndex, isPlaying], saveToStorage, { deep: true })

// 页面卸载时保存状态
const handleBeforeUnload = () => {
  saveToStorage()
  if (isPlaying.value && audioElement.value) {
    audioElement.value.pause()
  }
}

// 注册页面卸载事件（组件卸载时可清理）
let unloadHandlerRegistered = false

const registerUnloadHandler = () => {
  if (!unloadHandlerRegistered && typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload)
    unloadHandlerRegistered = true
  }
}

registerUnloadHandler()

// 封面版本迁移：强制将 localStorage 中的旧封面同步为官方封面
const COVER_VERSION_KEY = 'music-player-cover-version'
const CURRENT_COVER_VERSION = '2'

const migrateCoversIfNeeded = () => {
  try {
    if (localStorage.getItem(COVER_VERSION_KEY) === CURRENT_COVER_VERSION) return

    setCurrentSong(currentSong.value)
    playlist.value = playlist.value.map(syncSongWithCatalog)
    favorites.value = dedupeSongList(favorites.value)
    saveToStorage()
    localStorage.setItem(COVER_VERSION_KEY, CURRENT_COVER_VERSION)
  } catch (e) {
    console.error('Cover migration failed:', e)
  }
}

migrateCoversIfNeeded()

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
    audioElement,
    parsedLyrics,
    currentLyricIndex,
    isLyricsLoading,
    loadLyrics,
    prefetchLyrics,
    initAudio,
    syncPlayerClock,
    play,
    pause,
    togglePlay,
    stop,
    seek,
    seekByPercent,
    setVolume,
    playByIndex,
    playSong,
    playCollection,
    setCurrentSong,
    syncSongWithCatalog,
    next,
    prev,
    toggleLike,
    removeFromFavorites,
    cyclePlayMode,
    showGlobalLyrics,
    toggleGlobalLyrics,
    setGlobalLyricsVisible,
    removeFromPlaylist,
    addToPlaylist,
    replacePlaylist,
    currentAudioSrc,
    setCurrentPlaylistId,
    incrementPlayCount,
    getPlayCount,
    formatPlayCount
  }
}
