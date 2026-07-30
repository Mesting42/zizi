import { createApp, nextTick } from 'vue'
import App from './App.vue'
import router from './router'
import { initDevicePerformanceProfile } from './utils/devicePerformance'
import { initNativeMediaSession } from './utils/nativeMediaSession'

import './assets/css/reset.css'
import './assets/css/global.css'
import './assets/css/dark-theme-harmony.css'
import './css/player-shared.css'
import './assets/css/mobile-performance.css'

initDevicePerformanceProfile()

// Site pages use a light canvas. Keep the first frame light while Vue and the
// lazy route component are loading; music routes apply their own theme later.
document.body.classList.remove('dark-mode', 'music-theme-dark')
document.documentElement.style.colorScheme = 'light'
localStorage.removeItem('darkMode')

const app = createApp(App)

app.use(router)

// Home is bundled into the entry graph, so this resolves without the previous
// second lazy request that left an empty #app after Chrome stopped loading.
await router.isReady()
app.mount('#app')
initNativeMediaSession(router)
await nextTick()

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const nativeSplash = window.MestingNativeSplash
    if (nativeSplash && typeof nativeSplash.ready === 'function') {
      nativeSplash.ready()
    }
  })
})
