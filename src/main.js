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

const app = createApp(App)

app.use(router)
app.mount('#app')
initNativeMediaSession(router)

const signalNativeSplashReady = async () => {
  await router.isReady()
  await nextTick()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const nativeSplash = window.MestingNativeSplash
      if (nativeSplash && typeof nativeSplash.ready === 'function') {
        nativeSplash.ready()
      }
    })
  })
}

signalNativeSplashReady()
