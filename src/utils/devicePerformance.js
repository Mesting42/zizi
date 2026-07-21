import { Capacitor } from '@capacitor/core'

const root = document.documentElement
const body = document.body
const isNative = Capacitor.isNativePlatform()
const isIPad = /iPad/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const hasCoarsePointer = window.matchMedia('(any-pointer: coarse)').matches
const hasFineHover = window.matchMedia('(any-hover: hover)').matches
const initialLongestSide = Math.max(window.innerWidth, window.innerHeight)
const isMobilePerformance = isNative
  // Some Windows laptops and desktop displays expose a touch pointer too. They
  // still have a mouse/trackpad, so they should keep the full desktop scene
  // rather than being downgraded to the mobile rendering path.
  || (navigator.maxTouchPoints > 0 && hasCoarsePointer && !hasFineHover && initialLongestSide <= 1366)
const isLowMemory = Number(navigator.deviceMemory || 8) <= 4

export const devicePerformanceProfile = Object.freeze({
  isNative,
  isIPad,
  isMobilePerformance,
  isLowMemory
})

let viewportFrame = 0
let scrollingFrame = 0
let lastScrollTime = 0

const toggleClass = (className, force) => {
  root.classList.toggle(className, force)
  body.classList.toggle(className, force)
}

const syncViewportProfile = () => {
  viewportFrame = 0
  const viewport = window.visualViewport
  const width = Math.round(viewport?.width || window.innerWidth)
  const height = Math.round(viewport?.height || window.innerHeight)
  const landscape = width > height

  root.style.setProperty('--app-viewport-width', `${width}px`)
  root.style.setProperty('--app-viewport-height', `${height}px`)
  root.style.setProperty('--app-vh', `${height * 0.01}px`)

  toggleClass('orientation-landscape', landscape)
  toggleClass('orientation-portrait', !landscape)
}

const scheduleViewportProfile = () => {
  if (viewportFrame) return
  viewportFrame = requestAnimationFrame(syncViewportProfile)
}

const watchScrollIdle = (now) => {
  if (now - lastScrollTime > 96) {
    scrollingFrame = 0
    body.classList.remove('is-user-scrolling')
    return
  }

  scrollingFrame = requestAnimationFrame(watchScrollIdle)
}

const markUserScrolling = () => {
  if (!isMobilePerformance) return
  lastScrollTime = performance.now()
  body.classList.add('is-user-scrolling')

  if (!scrollingFrame) {
    scrollingFrame = requestAnimationFrame(watchScrollIdle)
  }
}

export const initDevicePerformanceProfile = () => {
  toggleClass('native-music-app', isNative)
  toggleClass('mobile-performance', isMobilePerformance)
  toggleClass('ipad-device', isIPad)
  toggleClass('low-memory-device', isLowMemory)
  syncViewportProfile()

  window.addEventListener('resize', scheduleViewportProfile, { passive: true })
  window.addEventListener('orientationchange', scheduleViewportProfile, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleViewportProfile, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleViewportProfile, { passive: true })

  document.addEventListener('scroll', markUserScrolling, { passive: true, capture: true })
  document.addEventListener('touchmove', markUserScrolling, { passive: true, capture: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      body.classList.remove('is-user-scrolling')
    } else {
      scheduleViewportProfile()
    }
  })
}
