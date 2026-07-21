export const PLAY_MODES = Object.freeze(['list', 'single', 'random'])

export const normalizePlayMode = (mode) => (
  PLAY_MODES.includes(mode) ? mode : 'list'
)

export const getQueueSongKey = (song) => {
  if (!song) return ''
  if (song.url) return `url:${song.url}`
  if (song.id) return `id:${song.id}`

  const title = String(song.title || '').trim().toLowerCase()
  const artist = String(song.artist || '').trim().toLowerCase()
  return title || artist ? `meta:${title}|${artist}` : ''
}

export const findQueueSongIndex = (songs, targetSong) => {
  const targetKey = getQueueSongKey(targetSong)
  if (!targetKey) return -1
  return (songs || []).findIndex(song => getQueueSongKey(song) === targetKey)
}

export const dedupePlaybackQueue = (songs) => {
  const seen = new Set()
  const queue = []

  for (const song of songs || []) {
    const key = getQueueSongKey(song)
    if (!key || seen.has(key)) continue
    seen.add(key)
    queue.push(song)
  }

  return queue
}

/**
 * 从只包含“尚未播放歌曲”的队列中选择下一项：
 * - 顺序和单曲模式的手动切歌都消费第一项。
 * - 随机模式从全部剩余项中抽取一项。
 * - 单曲自然重播由播放器在调用本函数前单独处理。
 */
export const resolveUpcomingQueueIndex = ({
  length,
  mode,
  random = Math.random
}) => {
  if (!Number.isInteger(length) || length <= 0) return -1

  const normalizedMode = normalizePlayMode(mode)
  if (normalizedMode === 'random') {
    const randomValue = Math.max(0, Math.min(0.999999999, Number(random()) || 0))
    return Math.floor(randomValue * length)
  }

  return 0
}
