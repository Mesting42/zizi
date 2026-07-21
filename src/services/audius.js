import { ensureMusicId } from '../data/songs.js'

// Audius 提供公开的独立音乐曲库与完整音频流，不需要后端或私密 API Key。
// app_name 只是公开的客户端标识，不属于密钥。
const AUDIUS_API_BASE = import.meta.env.VITE_AUDIUS_API_URL || 'https://api.audius.co/v1'
const AUDIUS_APP_NAME = import.meta.env.VITE_AUDIUS_APP_NAME || 'mesting-personal-blog'
const REQUEST_TIMEOUT = 9000
const FALLBACK_COVER = '/images/playlist-default.jpg'

const queryCache = new Map()
const pendingQueries = new Map()

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, '0')}`
}

const getArtwork = (track) => {
  const artwork = track?.artwork
  if (!artwork || typeof artwork === 'string') return artwork || FALLBACK_COVER
  return artwork['480x480'] || artwork['1000x1000'] || artwork['150x150'] || FALLBACK_COVER
}

const getExternalUrl = (track) => {
  if (!track?.permalink) return 'https://audius.co'
  return track.permalink.startsWith('http')
    ? track.permalink
    : `https://audius.co${track.permalink.startsWith('/') ? '' : '/'}${track.permalink}`
}

const cleanDescription = (description = '') => String(description || '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\r/g, '')
  .trim()

const isInstrumentalDescription = (description = '') => {
  return /\b(?:instrumental|instrumental track|no vocals?|without vocals?)\b|纯音乐|无人声/i.test(description)
}

// 部分 Audius 作者会把歌词直接写在歌曲说明里。仅在有明确歌词段落标记时提取，
// 避免把简介、宣传语或社交链接错误地当成歌词。
const extractCreatorLyrics = (description = '') => {
  const text = cleanDescription(description)
  if (!text || isInstrumentalDescription(text)) return ''

  const hasSectionMarker = /(?:^|\n)\s*(?:lyrics?|歌词)\s*[:：-]?|\[(?:verse|chorus|bridge|hook|intro|outro)[^\]]*\]/im.test(text)
  if (!hasSectionMarker) return ''

  const markerIndex = text.search(/(?:^|\n)\s*(?:lyrics?|歌词)\s*[:：-]?/im)
  const lyricBlock = markerIndex >= 0 ? text.slice(markerIndex).replace(/^\s*(?:lyrics?|歌词)\s*[:：-]?\s*/i, '') : text
  const lines = lyricBlock
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !/^https?:\/\//i.test(line) && !/^@\w+/.test(line))

  return lines.length >= 4 ? lines.join('\n') : ''
}

const normalizeAudiusTrack = (track) => {
  if (!track?.id || !track?.title) return null

  const streamUrl = `${AUDIUS_API_BASE}/tracks/${encodeURIComponent(track.id)}/stream?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}`
  const description = cleanDescription(track.description)
  return ensureMusicId({
    id: `audius_${track.id}`,
    providerId: track.id,
    provider: 'Audius',
    source: 'audius',
    isOnlineFull: true,
    isPreview: false,
    title: track.title,
    artist: track.user?.name || track.user?.handle || 'Audius Artist',
    album: track.album_name || track.genre || '',
    genre: track.genre || '',
    cover: getArtwork(track),
    url: streamUrl,
    duration: formatDuration(track.duration),
    fullDurationSec: Number(track.duration) || undefined,
    description,
    isInstrumental: isInstrumentalDescription(description),
    creatorLyrics: extractCreatorLyrics(description),
    externalUrl: getExternalUrl(track)
  })
}

const fetchAudius = async (path, params = {}) => {
  const searchParams = new URLSearchParams({
    app_name: AUDIUS_APP_NAME,
    ...params
  })
  const response = await fetch(`${AUDIUS_API_BASE}${path}?${searchParams.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  })
  if (!response.ok) throw new Error(`audius-${response.status}`)
  const payload = await response.json()
  return Array.isArray(payload?.data) ? payload.data : []
}

export const searchAudiusTracks = async (query, options = {}) => {
  const normalizedQuery = String(query || '').trim()
  if (!normalizedQuery) return []

  const limit = Math.max(1, Math.min(30, Number(options.limit) || 12))
  const cacheKey = `${normalizedQuery.toLowerCase()}:${limit}`
  if (queryCache.has(cacheKey)) return queryCache.get(cacheKey)
  if (pendingQueries.has(cacheKey)) return pendingQueries.get(cacheKey)

  const request = fetchAudius('/tracks/search', {
    query: normalizedQuery,
    limit: String(limit)
  })
    .then((tracks) => {
      const seen = new Set()
      const songs = tracks
        .filter(track => track?.is_streamable !== false && track?.is_unlisted !== true)
        .map(normalizeAudiusTrack)
        .filter(Boolean)
        .filter((song) => {
          if (seen.has(song.id)) return false
          seen.add(song.id)
          return true
        })
      queryCache.set(cacheKey, songs)
      return songs
    })
    .finally(() => pendingQueries.delete(cacheKey))

  pendingQueries.set(cacheKey, request)
  return request
}

export const loadAudiusPlaylist = async (playlist, limit = 18) => {
  if (!playlist?.onlineQuery) return []
  return searchAudiusTracks(playlist.onlineQuery, { limit })
}
