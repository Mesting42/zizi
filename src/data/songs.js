// ============================================================
// 单一歌曲数据源 (Single Source of Truth)
// 所有歌曲、歌单数据均在此定义，其他模块从此引入
// ============================================================

/**
 * 生成歌曲唯一标识符
 * @param {string} url - 歌曲URL
 * @returns {string} 唯一ID
 */
export const generateMusicId = (url) => {
  const normalizedUrl = String(url || '').trim()
  let hash = 2166136261

  for (let index = 0; index < normalizedUrl.length; index += 1) {
    hash ^= normalizedUrl.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  const extension = normalizedUrl.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'audio'
  return `music_${(hash >>> 0).toString(36)}_${extension}`
}

// ============================================================
// 全量歌曲库（所有可用歌曲的完整列表）
// ============================================================
export const allSongs = [
  {
    title: '起风了',
    artist: '买辣椒也用券',
    url: '/music/起风了 - 买辣椒也用券.aac',
    cover: '/images/covers/qifengle.jpg',
    duration: '5:25',
    lrc: '/lyrics/起风了.lrc'
  },
  {
    title: '晴天',
    artist: '周杰伦',
    url: '/music/晴天 - 周杰伦.mp3',
    cover: '/images/covers/qingtian.jpg',
    duration: '4:29',
    lrc: '/lyrics/晴天.lrc'
  },
  {
    title: '稻香',
    artist: '周杰伦',
    url: '/music/稻香 - 周杰伦.mp3',
    cover: '/images/covers/daoxiang.jpg',
    duration: '3:43',
    lrc: '/lyrics/稻香.lrc'
  },
  {
    title: '夜曲',
    artist: '周杰伦',
    url: '/music/夜曲 - 周杰伦.mp3',
    cover: '/images/covers/yequ.jpg',
    duration: '4:34',
    lrc: '/lyrics/夜曲.lrc'
  },
  {
    title: '以父之名',
    artist: '周杰伦',
    url: '/music/以父之名.wav',
    cover: '/images/covers/yifuzhiming.jpg',
    duration: '5:42',
    lrc: '/lyrics/以父之名.lrc'
  },
  {
    title: '七里香',
    artist: '周杰伦',
    url: '/music/七里香 - 周杰伦.mp3',
    cover: '/images/covers/qilixiang.jpg',
    duration: '4:59',
    lrc: '/lyrics/七里香.lrc'
  },
  {
    title: '告白气球',
    artist: '周杰伦',
    url: '/music/告白气球 - 周杰伦.aac',
    cover: '/images/covers/gaobaiqiqiu.jpg',
    duration: '3:35',
    lrc: '/lyrics/告白气球.lrc'
  },
  {
    title: '青花瓷',
    artist: '周杰伦',
    url: '/music/青花瓷 - 周杰伦.mp3',
    cover: '/images/covers/qinghuaci.jpg',
    duration: '3:59',
    lrc: '/lyrics/青花瓷.lrc'
  },
  {
    title: '花海',
    artist: '周杰伦',
    url: '/music/花海.m4a',
    cover: '/images/covers/huahai.jpg',
    duration: '4:24',
    lrc: '/lyrics/花海.lrc'
  }
].map(song => ({
  ...song,
  id: generateMusicId(song.url)
}))

// ============================================================
// 推荐歌曲（用于"发现音乐"页面的"最新音乐"区域）
// ============================================================
export const recommendedSongs = allSongs

// ============================================================
// 精选歌单
// ============================================================
export const featuredPlaylists = [
  { id: 'featured-1', name: '灵魂乐旧时光', cover: '/images/13416469429950015.jpeg', onlineQuery: 'classic soul', onlineSource: 'Audius' },
  { id: 'featured-2', name: '氛围轻音乐', cover: '/images/13416469431116038.jpeg', onlineQuery: 'ambient instrumental', onlineSource: 'Audius' },
  { id: 'featured-3', name: '低保真专注时刻', cover: '/images/13416469432277202.jpeg', onlineQuery: 'lofi study', onlineSource: 'Audius' },
  { id: 'featured-4', name: '慢拍治愈电台', cover: '/images/13416469433517463.jpeg', onlineQuery: 'chill relaxing', onlineSource: 'Audius' },
  { id: 'featured-5', name: '动画感原声精选', cover: '/images/13416469434708644.jpeg', onlineQuery: 'anime soundtrack', onlineSource: 'Audius' },
  { id: 'featured-6', name: '深夜 R&B 微醺', cover: '/images/13416469436036463.jpeg', onlineQuery: 'late night rnb', onlineSource: 'Audius' }
]

// ============================================================
// 宝藏歌单
// ============================================================
export const treasurePlaylists = [
  { id: 'treasure-1', name: '东方旋律收藏', cover: '/images/13416469437208232.jpeg', onlineQuery: 'chinese music', onlineSource: 'Audius' },
  { id: 'treasure-2', name: '流行热单放送', cover: '/images/13416469467325044.jpeg', onlineQuery: 'pop hits', onlineSource: 'Audius' },
  { id: 'treasure-3', name: '日系韩流混合站', cover: '/images/13416469468993130.jpeg', onlineQuery: 'jpop kpop', onlineSource: 'Audius' },
  { id: 'treasure-4', name: '独立民谣故事集', cover: '/images/13416469470216262.jpeg', onlineQuery: 'indie folk', onlineSource: 'Audius' }
]

// ============================================================
// 编辑推荐歌单
// ============================================================
export const editorPlaylists = [
  { id: 'editor-1', name: '电子跑步节拍', cover: '/images/13416469477674348.jpeg', onlineQuery: 'workout electronic', onlineSource: 'Audius' },
  { id: 'editor-2', name: '深眠环境音', cover: '/images/13416469354055551.jpeg', onlineQuery: 'sleep ambient', onlineSource: 'Audius' },
  { id: 'editor-3', name: '咖啡馆爵士', cover: '/images/13416469356600254.jpeg', onlineQuery: 'coffee jazz', onlineSource: 'Audius' },
  { id: 'editor-4', name: '雨夜松弛感', cover: '/images/13416469357886115.jpeg', onlineQuery: 'rainy chill', onlineSource: 'Audius' },
  { id: 'editor-5', name: '公路旅行独立声', cover: '/images/13416469359090353.jpeg', onlineQuery: 'indie travel', onlineSource: 'Audius' },
  { id: 'editor-6', name: '复古怀旧放映室', cover: '/images/13416469428051659.jpeg', onlineQuery: 'retro nostalgia', onlineSource: 'Audius' }
]

// ============================================================
// 在线发现歌单（只在“全部歌单”页展示，不占用用户本地歌单）
// ============================================================
export const explorePlaylists = [
  { id: 'explore-1', name: '城市漫游指南', cover: '/images/13416469471235110.jpeg', onlineQuery: 'city pop night drive', onlineSource: 'Audius' },
  { id: 'explore-2', name: '独立女声收藏', cover: '/images/13416469472281968.jpeg', onlineQuery: 'indie female vocal', onlineSource: 'Audius' },
  { id: 'explore-3', name: '复古迪斯科舞池', cover: '/images/13416469473401529.jpeg', onlineQuery: 'disco funk retro', onlineSource: 'Audius' },
  { id: 'explore-4', name: '电子星球漫游', cover: '/images/13416469474435386.jpeg', onlineQuery: 'electronic synthwave', onlineSource: 'Audius' },
  { id: 'explore-5', name: '爵士午后', cover: '/images/13416469475600604.jpeg', onlineQuery: 'smooth jazz lounge', onlineSource: 'Audius' },
  { id: 'explore-6', name: '清晨原野', cover: '/images/13416469476573717.jpeg', onlineQuery: 'acoustic morning chill', onlineSource: 'Audius' },
  { id: 'explore-7', name: '灵魂律动', cover: '/images/13416469337261709.jpeg', onlineQuery: 'neo soul groove', onlineSource: 'Audius' },
  { id: 'explore-8', name: '摇滚现场', cover: '/images/13416469362905352.jpeg', onlineQuery: 'alternative rock live', onlineSource: 'Audius' },
  { id: 'explore-9', name: '午夜霓虹', cover: '/images/13416469360258155.jpeg', onlineQuery: 'midnight synth pop', onlineSource: 'Audius' },
  { id: 'explore-10', name: '海边公路', cover: '/images/13416469361531865.jpeg', onlineQuery: 'coastal indie road trip', onlineSource: 'Audius' },
  { id: 'explore-11', name: '松弛周末', cover: '/images/playlists/explore-11.jpg', onlineQuery: 'laid back weekend chill', onlineSource: 'Audius' },
  { id: 'explore-12', name: '纯音乐专注', cover: '/images/playlists/explore-12.jpg', onlineQuery: 'instrumental focus music', onlineSource: 'Audius' },
  { id: 'explore-13', name: '浪漫法语', cover: '/images/playlists/explore-13.jpg', onlineQuery: 'french pop romantic', onlineSource: 'Audius' },
  { id: 'explore-14', name: '拉丁热浪', cover: '/images/playlists/explore-14.jpg', onlineQuery: 'latin dance summer', onlineSource: 'Audius' },
  { id: 'explore-15', name: '钢琴独奏', cover: '/images/playlists/explore-15.jpg', onlineQuery: 'solo piano peaceful', onlineSource: 'Audius' },
  { id: 'explore-16', name: '地下说唱', cover: '/images/playlists/explore-16.jpg', onlineQuery: 'underground hip hop', onlineSource: 'Audius' },
  { id: 'explore-17', name: '未来贝斯', cover: '/images/playlists/explore-17.jpg', onlineQuery: 'future bass melodic', onlineSource: 'Audius' },
  { id: 'explore-18', name: '电影氛围', cover: '/images/playlists/explore-18.jpg', onlineQuery: 'cinematic ambient score', onlineSource: 'Audius' },
  { id: 'explore-19', name: '夏日舞曲', cover: '/images/playlists/explore-19.jpg', onlineQuery: 'summer dance pop', onlineSource: 'Audius' },
  { id: 'explore-20', name: '深夜电台', cover: '/images/playlists/explore-20.jpg', onlineQuery: 'late night radio chill', onlineSource: 'Audius' },
  { id: 'explore-21', name: '女声民谣', cover: '/images/playlists/explore-21.jpg', onlineQuery: 'female acoustic folk', onlineSource: 'Audius' },
  { id: 'explore-22', name: '蓝调酒馆', cover: '/images/playlists/explore-22.jpg', onlineQuery: 'blues bar live', onlineSource: 'Audius' },
  { id: 'explore-23', name: '世界音乐', cover: '/images/playlists/explore-23.jpg', onlineQuery: 'world music fusion', onlineSource: 'Audius' },
  { id: 'explore-24', name: '复古摇滚', cover: '/images/playlists/explore-24.jpg', onlineQuery: 'classic retro rock', onlineSource: 'Audius' }
]

// ============================================================
// 每日推荐歌曲（引用 allSongs 中的歌曲）
// ============================================================
export const dailyRecommendSongs = [
  { id: 'daily-1', title: '晴天', artist: '周杰伦', cover: '/images/covers/qingtian.jpg', duration: '4:29' },
  { id: 'daily-2', title: '起风了', artist: '买辣椒也用券', cover: '/images/covers/qifengle.jpg', duration: '5:25' },
  { id: 'daily-3', title: '稻香', artist: '周杰伦', cover: '/images/covers/daoxiang.jpg', duration: '3:43' },
  { id: 'daily-4', title: '七里香', artist: '周杰伦', cover: '/images/covers/qilixiang.jpg', duration: '4:59' },
  { id: 'daily-5', title: '告白气球', artist: '周杰伦', cover: '/images/covers/gaobaiqiqiu.jpg', duration: '3:35' }
]

// ============================================================
// 首页歌单元数据映射表（替代原来的 if-else 链）
// ============================================================
export const HOME_PLAYLIST_META = {
  // featured
  'featured-1':  { name: '经典怀旧',   cover: '/images/13416469429950015.jpeg', onlineQuery: 'classic soul', onlineSource: 'Audius' },
  'featured-2':  { name: '轻音乐合集', cover: '/images/13416469431116038.jpeg', onlineQuery: 'ambient instrumental', onlineSource: 'Audius' },
  'featured-3':  { name: '学习工作BGM', cover: '/images/13416469432277202.jpeg', onlineQuery: 'lofi study', onlineSource: 'Audius' },
  'featured-4':  { name: '治愈系音乐', cover: '/images/13416469433517463.jpeg', onlineQuery: 'chill relaxing', onlineSource: 'Audius' },
  'featured-5':  { name: '动漫原声',   cover: '/images/13416469434708644.jpeg', onlineQuery: 'anime soundtrack', onlineSource: 'Audius' },
  'featured-6':  { name: '夜深时分',   cover: '/images/13416469436036463.jpeg', onlineQuery: 'late night rnb', onlineSource: 'Audius' },
  // treasure
  'treasure-1':  { name: '华语经典',   cover: '/images/13416469437208232.jpeg', onlineQuery: 'chinese music', onlineSource: 'Audius' },
  'treasure-2':  { name: '欧美流行',   cover: '/images/13416469467325044.jpeg', onlineQuery: 'pop hits', onlineSource: 'Audius' },
  'treasure-3':  { name: '日韩精选',   cover: '/images/13416469468993130.jpeg', onlineQuery: 'jpop kpop', onlineSource: 'Audius' },
  'treasure-4':  { name: '民谣故事',   cover: '/images/13416469470216262.jpeg', onlineQuery: 'indie folk', onlineSource: 'Audius' },
  // editor
  'editor-1':    { name: '跑步节奏',   cover: '/images/13416469477674348.jpeg', onlineQuery: 'workout electronic', onlineSource: 'Audius' },
  'editor-2':    { name: '睡前放松',   cover: '/images/13416469354055551.jpeg', onlineQuery: 'sleep ambient', onlineSource: 'Audius' },
  'editor-3':    { name: '咖啡时光',   cover: '/images/13416469356600254.jpeg', onlineQuery: 'coffee jazz', onlineSource: 'Audius' },
  'editor-4':    { name: '雨天 mood', cover: '/images/13416469357886115.jpeg', onlineQuery: 'rainy chill', onlineSource: 'Audius' },
  'editor-5':    { name: '旅行必备',   cover: '/images/13416469359090353.jpeg', onlineQuery: 'indie travel', onlineSource: 'Audius' },
  'editor-6':    { name: '回忆杀',     cover: '/images/13416469428051659.jpeg', onlineQuery: 'retro nostalgia', onlineSource: 'Audius' },
  // explore（由在线发现歌单自动生成，后续扩充无需重复维护映射）
  ...Object.fromEntries(explorePlaylists.map(({ id, ...meta }) => [id, meta]))
}

// ============================================================
// 工具函数
// ============================================================

/** 获取默认音乐池（与 allSongs 相同，保留以兼容旧代码） */
export const getDefaultMusicPool = () => allSongs

/** 按ID获取歌曲 */
export const getSongById = (id) => allSongs.find(s => s.id === id)

/** 按URL获取歌曲 */
export const getSongByUrl = (url) => allSongs.find(s => s.url === url)

/** 获取默认歌曲（晴天） */
export const getDefaultSong = () => allSongs.find(s => s.title === '晴天') || allSongs[0]

/** 初始化所有歌曲的ID（确保每首歌都有id字段） */
export const ensureMusicId = (song) => {
  if (!song) return song
  return {
    ...song,
    id: song.id || generateMusicId(song.url)
  }
}
