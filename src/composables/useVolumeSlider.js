import { ref } from 'vue'

const clampVolume = (value) => Math.max(0, Math.min(1, value))

/**
 * Shared pointer and keyboard interaction for the player's volume slider.
 * Pointer capture keeps dragging active even when the pointer leaves the bar.
 */
export function useVolumeSlider({ volume, onChange, step = 0.05 }) {
  const volumeBarRef = ref(null)
  const isVolumeDragging = ref(false)
  let activePointerId = null

  const commitVolume = (value) => {
    onChange(clampVolume(value))
  }

  const updateFromPointer = (event) => {
    const bar = volumeBarRef.value || event.currentTarget
    if (!bar) return

    const rect = bar.getBoundingClientRect()
    if (!rect.width) return

    commitVolume((event.clientX - rect.left) / rect.width)
  }

  const startVolumeDragging = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    isVolumeDragging.value = true
    activePointerId = event.pointerId
    event.currentTarget.setPointerCapture?.(event.pointerId)
    updateFromPointer(event)
    event.preventDefault()
  }

  const handleVolumeDragging = (event) => {
    if (!isVolumeDragging.value || event.pointerId !== activePointerId) return

    updateFromPointer(event)
    event.preventDefault()
  }

  const finishVolumeDragging = (event, commitFinalPosition) => {
    if (!isVolumeDragging.value || event.pointerId !== activePointerId) return

    if (commitFinalPosition) updateFromPointer(event)
    isVolumeDragging.value = false

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    activePointerId = null
  }

  const stopVolumeDragging = (event) => finishVolumeDragging(event, true)
  const cancelVolumeDragging = (event) => finishVolumeDragging(event, false)

  const handleVolumeKeydown = (event) => {
    let nextVolume = volume.value

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextVolume += step
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        nextVolume -= step
        break
      case 'PageUp':
        nextVolume += step * 2
        break
      case 'PageDown':
        nextVolume -= step * 2
        break
      case 'Home':
        nextVolume = 0
        break
      case 'End':
        nextVolume = 1
        break
      default:
        return
    }

    event.preventDefault()
    commitVolume(nextVolume)
  }

  return {
    volumeBarRef,
    isVolumeDragging,
    startVolumeDragging,
    handleVolumeDragging,
    stopVolumeDragging,
    cancelVolumeDragging,
    handleVolumeKeydown
  }
}
