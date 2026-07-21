import { ensureMusicId } from '../data/songs.js'

// Jamendo 的曲库由创作者自主选择授权方式。客户端 ID 不是私密凭据，
// 但必须由站点所有者在 Jamendo 开发者后台申请，不能使用他人的 ID。
const JAMENDO_API_BASE = import.meta.env.VITE_JAMENDO_API_URL || 'https://api.jamendo.com/v3.0'
const JAMENDO_CLIENT_ID = String(import.meta.env.VITE_JAMENDO_CLIENT_ID || '').trim()
const REQUEST_TIMEOUT = 9000
const FALLBACK_COVER = '/images/playlist-default.jpg'

const queryCache = new Map()
const pendingQueries = new Map()

export const isJamendoConfigured = () => Boolean(JAMENDO_CLIENT_ID)

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const normalizeJamendoLyrics = (lyrics) => {
  if (typeof lyrics === 'string') return lyrics.trim()
  if (typeof lyrics?.lyrics === 'string') return lyrics.lyrics.trim()
  if (typeof lyrics?.text === 'string') return lyrics.text.trim()
  return ''
}

const getCover = (track) => track?.image || track?.album_image || FALLBACK_COVER

const normalizeJamendoTrack = (track) => {
  if (!track?.id || !track?.name || !track?.audio) return null

  const lyrics = normalizeJamendoLyrics(track.lyrics)
  return ensureMusicId({
    id: `jamendo_${track.id}`,
    providerId: String(track.id),
    provider: 'Jamendo',
    source: 'jamendo',
    isOnlineFull: true,
    isPreview: false,
    title: track.name,
    artist: track.artist_name || 'Jamendo Artist',
    album: track.album_name || '',
    cover: getCover(track),
    url: track.audio,
    duration: formatDuration(track.duration),
    fullDurationSec: Number(track.duration) || undefined,
    providerLyrics: lyrics,
    lyricsProvider: lyrics ? 'Jamendo' : '',
    licenseUrl: track.license_ccurl || '',
    externalUrl: track.shareurl || track.shorturl || ''
  })
}

const fetchJamendo = async (params) => {
  const query = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json',
    limit: '10',
    include: 'musicinfo licenses lyrics',
    audioformat: 'mp32',
    ...params
  })

  const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${query.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  })
  if (!response.ok) throw new Error(`jamendo-${response.status}`)

  const payload = await response.json()
  return Array.isArray(payload?.results) ? payload.results : []
}

export const searchJamendoTracks = async (query, options = {}) => {
  const normalizedQuery = String(query || '').trim()
  if (!normalizedQuery || !isJamendoConfigured()) return []

  const limit = Math.max(1, Math.min(30, Number(options.limit) || 10))
  const cacheKey = `${normalizedQuery.toLowerCase()}:${limit}`
  if (queryCache.has(cacheKey)) return queryCache.get(cacheKey)
  if (pendingQueries.has(cacheKey)) return pendingQueries.get(cacheKey)

  const request = fetchJamendo({ search: normalizedQuery, limit: String(limit) })
    .then((tracks) => {
      const seen = new Set()
      const songs = tracks.map(normalizeJamendoTrack).filter(Boolean).filter((song) => {
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
