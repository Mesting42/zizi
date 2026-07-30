import { computed, nextTick, ref } from 'vue'

const STORAGE_KEY = 'mesting-site-locale'
const VALID_LOCALES = new Set(['zh', 'en'])

const readStoredLocale = () => {
  if (typeof window === 'undefined') return ''
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return VALID_LOCALES.has(stored) ? stored : ''
}

const preferredLocaleForPath = (path = '') => (
  path.startsWith('/articles')
  || path.startsWith('/article/')
  || path.startsWith('/category/')
  || path.startsWith('/music')
    ? 'zh'
    : 'en'
)

const storedLocale = readStoredLocale()
const locale = ref(storedLocale || preferredLocaleForPath(
  typeof window === 'undefined' ? '/' : window.location.pathname
))
const hasExplicitChoice = ref(Boolean(storedLocale))
let activeLocaleTransition = null

const applyDocumentLocale = () => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
  document.documentElement.dataset.locale = locale.value
}

const setLocale = (nextLocale, persist = true) => {
  if (!VALID_LOCALES.has(nextLocale)) return
  locale.value = nextLocale
  hasExplicitChoice.value = persist

  if (persist && typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, nextLocale)
  }

  applyDocumentLocale()
}

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
)

const getFallbackTransitionTargets = () => [
  document.querySelector('.app-main'),
  document.querySelector('.app-shell > .header'),
  document.querySelector('.app-shell > .portfolio-navigation'),
  document.querySelector('.app-shell > footer')
].filter(Boolean)

const animateLocaleFallback = async (nextLocale) => {
  const targets = getFallbackTransitionTargets()
  const outgoing = targets.map((element) => element.animate(
    [
      { opacity: 1 },
      { opacity: 0.28 }
    ],
    {
      duration: 130,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards'
    }
  ))
  let incoming = []

  try {
    await Promise.allSettled(outgoing.map((animation) => animation.finished))
    setLocale(nextLocale)
    await nextTick()

    const incomingTargets = getFallbackTransitionTargets()
    incoming = incomingTargets.map((element) => element.animate(
      [
        { opacity: 0.28 },
        { opacity: 1 }
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both'
      }
    ))

    await Promise.allSettled(incoming.map((animation) => animation.finished))
  } finally {
    const animations = [...outgoing, ...incoming]
    animations.forEach((animation) => animation.cancel())
  }
}

const transitionToLocale = (nextLocale) => {
  if (!VALID_LOCALES.has(nextLocale) || nextLocale === locale.value) {
    return Promise.resolve()
  }

  if (typeof document === 'undefined' || prefersReducedMotion()) {
    setLocale(nextLocale)
    return Promise.resolve()
  }

  if (activeLocaleTransition) return activeLocaleTransition

  const root = document.documentElement
  root.classList.add('locale-transition-active')

  if (typeof document.startViewTransition === 'function') {
    const transition = document.startViewTransition(async () => {
      setLocale(nextLocale)
      await nextTick()
    })

    activeLocaleTransition = transition.finished
      .catch(() => {})
      .finally(() => {
        root.classList.remove('locale-transition-active')
        activeLocaleTransition = null
      })

    return activeLocaleTransition
  }

  activeLocaleTransition = animateLocaleFallback(nextLocale)
    .finally(() => {
      root.classList.remove('locale-transition-active')
      activeLocaleTransition = null
    })

  return activeLocaleTransition
}

const toggleLocale = () => {
  return transitionToLocale(locale.value === 'zh' ? 'en' : 'zh')
}

const syncLocaleForPath = (path) => {
  if (hasExplicitChoice.value) {
    applyDocumentLocale()
    return
  }

  locale.value = preferredLocaleForPath(path)
  applyDocumentLocale()
}

applyDocumentLocale()

export const useLocale = () => ({
  locale,
  isChinese: computed(() => locale.value === 'zh'),
  setLocale,
  toggleLocale
})

export { syncLocaleForPath }
