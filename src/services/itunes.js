import { ensureMusicId } from '../data/songs.js'

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search'
const REQUEST_TIMEOUT = 9000
const FALLBACK_COVER = '/images/playlist-default.jpg'

const queryCache = new Map()
const pendingQueries = new Map()

const formatDuration = (milliseconds = 0) => {
  const total = Math.max(0, Math.round((Number(milliseconds) || 0) / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const getArtwork = (track) => String(track?.artworkUrl100 || '')
  .replace(/\d+x\d+(bb|[-]\d+)?/i, '600x600bb') || FALLBACK_COVER

const normalizeITunesTrack = (track) => {
  if (!track?.previewUrl || !track?.trackName) return null

  return ensureMusicId({
    id: `itunes_${track.trackId || `${track.artistName}-${track.trackName}`}`,
    providerId: String(track.trackId || ''),
    provider: 'iTunes',
    source: 'itunes',
    isPreview: true,
    isOnlineFull: false,
    title: track.trackName,
    artist: track.artistName || 'Apple Music Artist',
    album: track.collectionName || '',
    cover: getArtwork(track),
    url: track.previewUrl,
    duration: `${formatDuration(track.trackTimeMillis)}（30 秒试听）`,
    fullDurationSec: Math.round((Number(track.trackTimeMillis) || 0) / 1000),
    externalUrl: track.trackViewUrl || track.collectionViewUrl || ''
  })
}

export const searchITunesPreviews = async (query, options = {}) => {
  const normalizedQuery = String(query || '').trim()
  if (!normalizedQuery) return []

  const limit = Math.max(1, Math.min(20, Number(options.limit) || 8))
  const cacheKey = `${normalizedQuery.toLowerCase()}:${limit}`
  if (queryCache.has(cacheKey)) return queryCache.get(cacheKey)
  if (pendingQueries.has(cacheKey)) return pendingQueries.get(cacheKey)

  const request = (async () => {
    const params = new URLSearchParams({
      term: normalizedQuery,
      media: 'music',
      entity: 'song',
      country: 'US',
      limit: String(limit)
    })
    const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })
    if (!response.ok) throw new Error(`itunes-${response.status}`)

    const payload = await response.json()
    const seen = new Set()
    const songs = (Array.isArray(payload?.results) ? payload.results : [])
      .map(normalizeITunesTrack)
      .filter(Boolean)
      .filter((song) => {
        if (seen.has(song.id)) return false
        seen.add(song.id)
        return true
      })
    queryCache.set(cacheKey, songs)
    return songs
  })().finally(() => pendingQueries.delete(cacheKey))

  pendingQueries.set(cacheKey, request)
  return request
}
