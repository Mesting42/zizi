import assert from 'node:assert/strict'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

class FakeAudio {
  constructor() {
    this.listeners = new Map()
    this.currentTime = 0
    this.duration = 120
    this.readyState = 4
    this.volume = 1
    this.paused = true
    this.loop = false
    this.src = ''
  }

  addEventListener(name, callback, options = {}) {
    const callbacks = this.listeners.get(name) || []
    callbacks.push({ callback, once: Boolean(options.once) })
    this.listeners.set(name, callbacks)
  }

  removeEventListener(name, callback) {
    const callbacks = this.listeners.get(name) || []
    this.listeners.set(name, callbacks.filter(entry => entry.callback !== callback))
  }

  emit(name) {
    const callbacks = [...(this.listeners.get(name) || [])]
    callbacks.forEach((entry) => {
      entry.callback()
      if (entry.once) this.removeEventListener(name, entry.callback)
    })
  }

  load() {
    this.emit('loadedmetadata')
    this.emit('canplay')
  }

  play() {
    this.paused = false
    this.emit('play')
    return Promise.resolve()
  }

  pause() {
    this.paused = true
    this.emit('pause')
  }
}

globalThis.localStorage = new MemoryStorage()
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  setTimeout,
  clearTimeout
}
globalThis.Audio = FakeAudio
globalThis.HTMLMediaElement = { HAVE_FUTURE_DATA: 3 }
globalThis.fetch = async () => ({
  ok: false,
  status: 404,
  json: async () => ({}),
  text: async () => ''
})

const { allSongs } = await import('../src/data/songs.js')
const { usePlayer } = await import('../src/composables/usePlayer.js')

const player = usePlayer()

assert.equal(allSongs.length, 8, '本地曲库应包含 8 首歌曲')
assert.equal(new Set(allSongs.map(song => song.id)).size, 8, '每首本地歌曲必须拥有唯一 ID')

const restoredLegacySong = player.syncSongWithCatalog({
  ...allSongs[2],
  id: 'music__music__________mp3'
})
assert.equal(restoredLegacySong.title, '稻香', '旧缓存的冲突 ID 必须通过真实 URL 恢复正确歌曲')

assert.equal(player.playlist.value.length, 0, '页面初始化时播放列表必须为空')
player.play()
assert.equal(player.currentSong.value.title, '晴天')
assert.equal(player.playlist.value.length, 0, '播放默认歌曲不能自动把本地曲库加入播放列表')
assert.equal(player.currentIndex.value, -1, '当前歌曲不应占用待播列表索引')

player.next()
assert.equal(player.currentSong.value.title, '稻香', '空播放列表时下一首应切换本地音乐')
assert.equal(player.playlist.value.length, 0, '本地备用切歌不能填充播放列表')
player.prev()
assert.equal(player.currentSong.value.title, '晴天', '空播放列表时上一首应按本地曲库反向切换')
assert.equal(player.playlist.value.length, 0)

player.playSong(allSongs[2], allSongs)
assert.equal(player.currentSong.value.title, '稻香', '普通点播应直接播放所选歌曲')
assert.equal(player.playlist.value.length, 0, '普通点播即使传入页面歌曲组也不能自动填充播放列表')
player.next()
assert.equal(player.currentSong.value.title, '夜曲', '普通点播后的下一首仍应从本地曲库继续')

player.addToPlaylist(allSongs[0])
player.addToPlaylist(allSongs[7])
assert.deepEqual(
  player.playlist.value.map(song => song.title),
  ['起风了', '花海'],
  '播放列表只应包含用户明确加入的歌曲，并保持加入顺序'
)
player.next()
assert.equal(player.currentSong.value.title, '起风了', '播放列表有歌时应优先播放列表第一首')
assert.deepEqual(player.playlist.value.map(song => song.title), ['花海'])
player.next()
assert.equal(player.currentSong.value.title, '花海', '播放列表应继续按顺序消费')
assert.equal(player.playlist.value.length, 0, '歌曲开始播放后应立即从播放列表移除')
player.next()
assert.equal(player.currentSong.value.title, '起风了', '播放列表听空后应自动回到本地曲库切歌')
assert.equal(player.playlist.value.length, 0, '回到本地切歌时播放列表仍应为空')

player.cyclePlayMode()
assert.equal(player.playMode.value, 'single')
player.audioElement.value.emit('ended')
assert.equal(player.currentSong.value.title, '起风了', '单曲循环自然播完应重播当前歌曲')
assert.equal(player.playlist.value.length, 0, '单曲自然重播不能填充播放列表')
player.next()
assert.equal(player.currentSong.value.title, '晴天', '单曲循环不应锁死手动本地下一首')

player.cyclePlayMode()
assert.equal(player.playMode.value, 'random')
const randomStart = player.currentSong.value.url
player.next()
assert.notEqual(player.currentSong.value.url, randomStart, '空列表的随机模式应从本地曲库切换到另一首')
assert.equal(player.playlist.value.length, 0, '随机切换本地歌曲也不能填充播放列表')

player.cyclePlayMode()
assert.equal(player.playMode.value, 'list')
const explicitQueue = [
  {
    id: 'queue-one',
    title: '队列一',
    artist: '测试歌手',
    url: '/music/queue-one.mp3',
    cover: '/images/covers/qingtian.jpg',
    duration: '1:00'
  },
  {
    id: 'queue-two',
    title: '队列二',
    artist: '测试歌手',
    url: '/music/queue-two.mp3',
    cover: '/images/covers/qingtian.jpg',
    duration: '1:00'
  }
]
player.replacePlaylist(explicitQueue)
player.next()
assert.equal(player.currentSong.value.title, '队列一', '有播放列表时应优先消费第一首')
assert.deepEqual(player.playlist.value.map(song => song.title), ['队列二'])

const originalConsoleError = console.error
console.error = () => {}
player.audioElement.value.emit('error')
console.error = originalConsoleError
assert.equal(player.currentSong.value.title, '队列二', '列表歌曲加载失败时应继续尝试列表下一首')
assert.equal(player.playlist.value.length, 0, '坏链接切到下一首后也应立即消费队列项')
player.next()
assert.equal(player.currentSong.value.title, '起风了', '显式播放列表耗尽后应回到本地歌曲')
assert.equal(player.playlist.value.length, 0)

player.playCollection(allSongs.slice(0, 3), 1)
assert.equal(player.currentSong.value.title, '晴天', '“播放全部”可以明确建立播放列表并从所选歌曲开始')
assert.deepEqual(player.playlist.value.map(song => song.title), ['稻香', '起风了'])
player.playSong(allSongs[4], allSongs)
assert.equal(player.currentSong.value.title, '七里香')
assert.deepEqual(
  player.playlist.value.map(song => song.title),
  ['稻香', '起风了'],
  '普通点播不能覆盖已有播放列表'
)

assert.equal(player.audioElement.value.loop, false, '浏览器原生 loop 必须保持关闭')

console.log('播放器逻辑验证通过：初始空列表、有列表按顺序、空列表切本地、普通点播不填队列和坏链接跳过均正常。')
