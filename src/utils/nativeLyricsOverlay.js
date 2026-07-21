export const NATIVE_LYRICS_PREFERENCES_KEY = 'music-native-lyrics-preferences'

export const DEFAULT_NATIVE_LYRICS_PREFERENCES = Object.freeze({
  color: '#FFFFFF',
  size: 22,
  locked: false
})

const normalizePreferences = (preferences = {}) => ({
  color: /^#[0-9a-f]{6}$/i.test(preferences.color || '')
    ? preferences.color.toUpperCase()
    : DEFAULT_NATIVE_LYRICS_PREFERENCES.color,
  size: Math.min(36, Math.max(16, Number(preferences.size) || DEFAULT_NATIVE_LYRICS_PREFERENCES.size)),
  locked: Boolean(preferences.locked)
})

export const loadNativeLyricsPreferences = () => {
  if (typeof window === 'undefined') return { ...DEFAULT_NATIVE_LYRICS_PREFERENCES }

  try {
    const saved = JSON.parse(window.localStorage.getItem(NATIVE_LYRICS_PREFERENCES_KEY) || '{}')
    return normalizePreferences(saved)
  } catch {
    return { ...DEFAULT_NATIVE_LYRICS_PREFERENCES }
  }
}

export const saveNativeLyricsPreferences = (preferences) => {
  const normalized = normalizePreferences(preferences)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(NATIVE_LYRICS_PREFERENCES_KEY, JSON.stringify(normalized))
  }
  return normalized
}

export const applyNativeLyricsPreferences = (preferences) => {
  if (typeof window === 'undefined') return
  const normalized = normalizePreferences(preferences)

  try {
    window.MestingLyricsOverlay?.configure?.(
      normalized.color,
      normalized.size,
      normalized.locked
    )
  } catch {
    // The web preview does not expose the Android floating-window bridge.
  }
}
