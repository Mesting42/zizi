/**
 * 进度条拖拽与 Tooltip 通用逻辑
 * 从 Music.vue / MusicPlayer.vue / PlaylistDetail.vue 中提取
 */
import { ref, watch } from 'vue'

/**
 * @param {object} options
 * @param {import('vue').Ref<number>} options.currentTime - 当前播放时间 (秒)
 * @param {import('vue').Ref<number>} options.duration - 总时长 (秒)
 * @param {Function} options.onSeek - 拖动结束回调 (percent: number) => void
 * @param {string} [options.progressSelector] - 进度条元素选择器
 */
export function useProgressBar({ currentTime, duration, onSeek, progressSelector = '.player-progress' }) {
  const progress = ref(0)
  const tooltipPosition = ref(0)
  const isDragging = ref(false)
  const dragCurrentTime = ref(0)

  /** 格式化时间 */
  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /** 同步进度条（非拖拽时） */
  const syncProgress = () => {
    if (duration.value > 0) {
      const rawProgress = (currentTime.value / duration.value) * 100
      progress.value = rawProgress

      const bar = document.querySelector(progressSelector)
      const barWidth = bar ? bar.offsetWidth : 500
      const pixels = (rawProgress / 100) * barWidth
      const maxOffset = 35
      const offset = Math.min(pixels * 0.4, maxOffset)
      const tooltipPixels = pixels - offset
      tooltipPosition.value = (tooltipPixels / barWidth) * 100
    }
  }

  /** 更新拖拽位置 */
  const updateDragPosition = (e) => {
    const bar = document.querySelector(progressSelector)
    if (!bar) return

    const rect = bar.getBoundingClientRect()
    let percent = (e.clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent))

    progress.value = percent * 100
    dragCurrentTime.value = percent * duration.value

    const barWidth = rect.width
    const pixels = percent * barWidth
    const maxOffset = 35
    const offset = Math.min(pixels * 0.4, maxOffset)
    const tooltipPixels = pixels - offset
    tooltipPosition.value = (tooltipPixels / barWidth) * 100
  }

  /** 开始拖拽 */
  const startDragging = (e) => {
    isDragging.value = true
    dragCurrentTime.value = currentTime.value
    updateDragPosition(e)
  }

  /** 拖拽中（需在 mousemove 中调用） */
  const handleDragging = (e) => {
    if (!isDragging.value) return
    updateDragPosition(e)
  }

  /** 停止拖拽 */
  const stopDragging = (e) => {
    if (!isDragging.value) return

    const bar = document.querySelector(progressSelector)
    if (bar && e && e.type !== 'mouseleave') {
      const rect = bar.getBoundingClientRect()
      let percent = (e.clientX - rect.left) / rect.width
      percent = Math.max(0, Math.min(1, percent))
      isDragging.value = false
      onSeek(percent)
    } else {
      isDragging.value = false
    }
  }

  /** 点击进度条跳转 */
  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    onSeek(percent)
  }

  // 自动同步进度（非拖拽时）
  watch(currentTime, () => {
    if (!isDragging.value && duration.value > 0) {
      progress.value = (currentTime.value / duration.value) * 100
    }
    // 同步 tooltip（非拖拽时）
    if (!isDragging.value) {
      const bar = document.querySelector(progressSelector)
      if (bar) {
        const barWidth = bar.offsetWidth || 500
        const pixels = (progress.value / 100) * barWidth
        const maxOffset = 35
        const offset = Math.min(pixels * 0.4, maxOffset)
        const tooltipPixels = pixels - offset
        tooltipPosition.value = (tooltipPixels / barWidth) * 100
      }
    }
  })

  return {
    progress,
    tooltipPosition,
    isDragging,
    dragCurrentTime,
    formatTime,
    syncProgress,
    seek,
    startDragging,
    handleDragging,
    stopDragging,
    updateDragPosition
  }
}
