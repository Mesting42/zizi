/**
 * 播放统计模块 —— 独立模块，无循环依赖
 * 从 usePlaylists 中提取，供 usePlayer 和 usePlaylists 共同使用
 */
import { ref, watch } from 'vue'

const PLAY_COUNT_KEY = 'music-play-counts'

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

// 模块级单例
const playCounts = ref(loadPlayCounts())

watch(
  playCounts,
  (val) => {
    savePlayCounts(val)
  },
  { deep: true }
)

/** 格式化播放次数 */
export const formatPlayCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + '万'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

/** 增加播放次数 */
export const incrementPlayCount = (playlistId) => {
  if (!playCounts.value[playlistId]) {
    playCounts.value[playlistId] = 0
  }
  playCounts.value[playlistId]++
}

/** 获取播放次数 */
export const getPlayCount = (playlistId) => {
  return playCounts.value[playlistId] || 0
}

export function useStats() {
  return {
    playCounts,
    incrementPlayCount,
    getPlayCount,
    formatPlayCount
  }
}
