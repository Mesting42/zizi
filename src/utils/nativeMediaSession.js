import { watch } from 'vue'
import { usePlayer } from '../composables/usePlayer'

const ARTWORK_SIZE = 256
const PROGRESS_SYNC_INTERVAL_MS = 3500
const artworkCache = new Map()

const getNativeBridge = () => {
  const bridge = window.MestingMediaNotification
  return bridge && typeof bridge.update === 'function' ? bridge : null
}

const getTrackKey = (song = {}) => [
  song.id || '',
  song.title || '',
  song.artist || '',
  song.cover || ''
].join('::')

const renderArtworkData = async (source) => {
  if (!source) return ''
  if (artworkCache.has(source)) return artworkCache.get(source)

  const artworkPromise = (async () => {
    try {
      const response = await fetch(new URL(source, window.location.href).href)
      if (!response.ok) return ''
      const blob = await response.blob()
      const bitmap = await createImageBitmap(blob)
      const side = Math.min(bitmap.width, bitmap.height)
      const sourceX = Math.max(0, (bitmap.width - side) / 2)
      const sourceY = Math.max(0, (bitmap.height - side) / 2)
      const canvas = document.createElement('canvas')
      canvas.width = ARTWORK_SIZE
      canvas.height = ARTWORK_SIZE
      const context = canvas.getContext('2d', { alpha: false })
      if (!context) {
        bitmap.close?.()
        return ''
      }
      context.drawImage(
        bitmap,
        sourceX,
        sourceY,
        side,
        side,
        0,
        0,
        ARTWORK_SIZE,
        ARTWORK_SIZE
      )
      bitmap.close?.()
      return canvas.toDataURL('image/jpeg', 0.84)
    } catch {
      return ''
    }
  })()

  artworkCache.set(source, artworkPromise)
  return artworkPromise
}

export const initNativeMediaSession = (router) => {
  if (typeof window === 'undefined' || !getNativeBridge()) return () => {}

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isLiked,
    play,
    pause,
    next,
    prev,
    seek,
    toggleLike,
    setGlobalLyricsVisible
  } = usePlayer()

  let notificationActivated = false
  let latestTrackKey = ''
  let artworkRequestId = 0
  let lastProgressSyncAt = 0

  const postState = (coverData = '') => {
    const bridge = getNativeBridge()
    if (!bridge || !notificationActivated) return

    const song = currentSong.value || {}
    bridge.update(JSON.stringify({
      trackKey: getTrackKey(song),
      title: song.title || '正在播放',
      artist: song.artist || 'Mesting 音乐',
      playing: Boolean(isPlaying.value),
      liked: Boolean(isLiked.value),
      positionMs: Math.max(0, Math.round(Number(currentTime.value || 0) * 1000)),
      durationMs: Math.max(0, Math.round(Number(duration.value || 0) * 1000)),
      coverData
    }))
  }

  const syncState = ({ refreshArtwork = false } = {}) => {
    if (!notificationActivated) {
      if (!isPlaying.value) return
      notificationActivated = true
    }

    const song = currentSong.value || {}
    const trackKey = getTrackKey(song)
    const trackChanged = trackKey !== latestTrackKey
    if (trackChanged) {
      latestTrackKey = trackKey
      refreshArtwork = true
    }

    // Show the native controls immediately; artwork follows asynchronously.
    postState()
    if (!refreshArtwork || !song.cover) return

    const requestId = ++artworkRequestId
    renderArtworkData(song.cover).then((coverData) => {
      if (
        requestId !== artworkRequestId
        || getTrackKey(currentSong.value || {}) !== trackKey
      ) {
        return
      }
      postState(coverData)
    })
  }

  const stopPlayerWatch = watch(
    [currentSong, isPlaying, duration, isLiked],
    () => syncState(),
    { deep: true }
  )

  const stopProgressWatch = watch(currentTime, () => {
    if (!notificationActivated) return
    const now = Date.now()
    if (now - lastProgressSyncAt < PROGRESS_SYNC_INTERVAL_MS) return
    lastProgressSyncAt = now
    postState()
  })

  const handleNativeControl = (event) => {
    const action = event.detail?.action
    switch (action) {
      case 'play':
        if (!isPlaying.value) play()
        break
      case 'pause':
        if (isPlaying.value) pause()
        break
      case 'next':
        next()
        break
      case 'previous':
        prev()
        break
      case 'seek': {
        const positionMs = Number(event.detail?.positionMs)
        if (Number.isFinite(positionMs) && positionMs >= 0) {
          seek(positionMs / 1000)
          syncState()
        }
        break
      }
      case 'toggle_like':
        toggleLike()
        break
      case 'open_lyrics':
        setGlobalLyricsVisible(true)
        window.MestingLyricsOverlay?.show?.()
        break
      case 'open_lyrics_settings':
        window.dispatchEvent(new CustomEvent('mesting:open-native-lyrics-settings'))
        break
      default:
        break
    }
  }

  const handlePermissionChange = () => syncState({ refreshArtwork: true })
  const stopNotification = () => {
    const bridge = getNativeBridge()
    if (bridge && typeof bridge.stop === 'function') bridge.stop()
  }

  window.addEventListener('mesting:native-media-control', handleNativeControl)
  window.addEventListener('mesting:native-media-permission-changed', handlePermissionChange)
  window.addEventListener('beforeunload', stopNotification)

  return () => {
    stopPlayerWatch()
    stopProgressWatch()
    window.removeEventListener('mesting:native-media-control', handleNativeControl)
    window.removeEventListener('mesting:native-media-permission-changed', handlePermissionChange)
    window.removeEventListener('beforeunload', stopNotification)
    stopNotification()
  }
}
