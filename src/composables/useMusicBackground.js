import { computed, reactive, ref, watch } from 'vue'

const SETTINGS_KEY = 'music-background-settings-v1'
const DB_NAME = 'mesting-music-background'
const DB_VERSION = 1
const STORE_NAME = 'media'
const MEDIA_KEY = 'homepage-background'

const defaults = {
  mode: 'default',
  preset: 'kasukabe-sky',
  mediaKind: '',
  mediaName: '',
  intensity: 58,
  showShinchan: true,
  progressStyle: 'theme',
  progressCharacter: 'theme',
  customAppearance: 'auto'
}

const readSettings = () => {
  if (typeof window === 'undefined') return { ...defaults }
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return { ...defaults, ...saved }
  } catch {
    return { ...defaults }
  }
}

const settings = reactive(readSettings())
const mediaUrl = ref('')
const isReady = ref(false)
let initPromise = null
let databasePromise = null

const resetProgressToTheme = () => {
  settings.progressStyle = 'theme'
  settings.progressCharacter = 'theme'
}

const openDatabase = () => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return databasePromise
}

const runStoreRequest = async (mode, callback) => {
  const db = await openDatabase()
  if (!db) return null

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const request = callback(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const replaceObjectUrl = (blob) => {
  if (mediaUrl.value?.startsWith('blob:')) URL.revokeObjectURL(mediaUrl.value)
  mediaUrl.value = blob ? URL.createObjectURL(blob) : ''
}

const initMusicBackground = () => {
  if (initPromise) return initPromise

  initPromise = runStoreRequest('readonly', store => store.get(MEDIA_KEY))
    .then((record) => {
      if (record?.blob) {
        replaceObjectUrl(record.blob)
        settings.mediaKind = record.kind || settings.mediaKind
        settings.mediaName = record.fileName || settings.mediaName
      } else if (settings.mode !== 'default') {
        settings.mode = 'default'
        settings.mediaKind = ''
        settings.mediaName = ''
      }
    })
    .catch(() => {
      settings.mode = 'default'
    })
    .finally(() => {
      isReady.value = true
    })

  return initPromise
}

const detectVideoAppearance = (file) => new Promise((resolve) => {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    resolve('dark')
    return
  }

  const previewUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  let timeoutId = 0
  let settled = false

  const finish = (appearance) => {
    if (settled) return
    settled = true
    if (timeoutId) window.clearTimeout(timeoutId)
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(previewUrl)
    resolve(appearance)
  }

  video.muted = true
  video.preload = 'metadata'
  video.playsInline = true
  video.onloadeddata = () => {
    try {
      const canvas = document.createElement('canvas')
      const width = Math.max(1, Math.min(96, video.videoWidth || 96))
      const height = Math.max(1, Math.min(96, video.videoHeight || 54))
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        finish('dark')
        return
      }

      context.drawImage(video, 0, 0, width, height)
      const pixels = context.getImageData(0, 0, width, height).data
      let luminance = 0
      for (let index = 0; index < pixels.length; index += 16) {
        luminance += (pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722) / 255
      }
      const averageLuminance = luminance / Math.ceil(pixels.length / 16)
      finish(averageLuminance >= 0.52 ? 'sunny' : 'dark')
    } catch {
      finish('dark')
    }
  }
  video.onerror = () => finish('dark')
  timeoutId = window.setTimeout(() => finish('dark'), 3200)
  video.src = previewUrl
})

const setCustomBackground = async (file) => {
  if (!(file instanceof File)) throw new Error('请选择图片或视频文件')

  const kind = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : ''

  if (!kind) throw new Error('仅支持图片或视频文件')

  const maxBytes = kind === 'video' ? 120 * 1024 * 1024 : 20 * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error(kind === 'video' ? '视频请控制在 120MB 以内' : '图片请控制在 20MB 以内')
  }

  await runStoreRequest('readwrite', store => store.put({
    blob: file,
    fileName: file.name,
    kind,
    updatedAt: Date.now()
  }, MEDIA_KEY))

  replaceObjectUrl(file)
  settings.mode = 'custom'
  settings.preset = 'classic'
  settings.mediaKind = kind
  settings.mediaName = file.name
  // 自定义图片/视频仍会解析为经典组合，但设置项统一保持“跟随主题”。
  resetProgressToTheme()
  settings.customAppearance = kind === 'video'
    ? await detectVideoAppearance(file)
    : 'auto'
  return kind
}

const useDefaultBackground = () => {
  settings.mode = 'default'
  resetProgressToTheme()
}

const usePresetBackground = (preset) => {
  settings.preset = preset || defaults.preset
  settings.mode = 'default'

  // 每次更换背景主题都重新建立默认联动；之后用户仍可单独覆盖这两项。
  resetProgressToTheme()

  // 经典主题没有角色场景；而动态主题的场景、角色和动作是主题本身的一部分。
  // 因此在从经典主题切回动态主题时恢复默认展示，避免只留下静态底色。
  settings.showShinchan = settings.preset !== 'classic'
}

const useCustomBackground = () => {
  if (mediaUrl.value) {
    settings.mode = 'custom'
    settings.preset = 'classic'
    resetProgressToTheme()
  }
}

const clearCustomBackground = async () => {
  await runStoreRequest('readwrite', store => store.delete(MEDIA_KEY)).catch(() => null)
  replaceObjectUrl(null)
  settings.mode = 'default'
  settings.mediaKind = ''
  settings.mediaName = ''
  resetProgressToTheme()
}

watch(settings, () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}, { deep: true })

export const useMusicBackground = () => {
  initMusicBackground()

  return {
    settings,
    mediaUrl,
    isReady,
    hasCustomMedia: computed(() => Boolean(mediaUrl.value)),
    customMediaStyle: computed(() => {
      const intensity = Math.min(0.98, Number(settings.intensity) / 100)
      const minimumOpacity = settings.customAppearance === 'sunny' ? 0.84 : 0.15
      return { opacity: Math.max(minimumOpacity, intensity) }
    }),
    setCustomBackground,
    useDefaultBackground,
    usePresetBackground,
    useCustomBackground,
    clearCustomBackground
  }
}
