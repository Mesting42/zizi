<template>
  <header class="header" :class="{ 'is-home-hero': isHomeHero }">
    <div class="header-container">
      <nav class="nav" aria-label="主导航">
        <router-link to="/" class="logo" aria-label="返回首页">
          <span class="logo-mark">M</span>
          <span class="logo-text">Mesting</span>
        </router-link>

        <div v-if="isMusicModule && activeMusicIp !== 'classic'" class="music-nav-decor" aria-hidden="true">
          <span class="music-nav-crayon"></span>
          <span class="music-nav-note music-nav-note--one">♪</span>
          <span class="music-nav-note music-nav-note--two">♫</span>
          <span class="music-nav-character-pair" :class="`music-nav-character-pair--${activeMusicIp}`">
            <template v-if="activeMusicIp === 'shinchan'">
              <img
              class="music-nav-character music-nav-character--shinchan"
              src="/images/motion-walk-shinchan-stride.png"
              alt=""
              >
              <img
              class="music-nav-character music-nav-character--shiro"
              src="/images/progress-shiro-walk-stride.png"
              alt=""
              >
            </template>
            <template v-else>
              <img
                class="music-nav-ip-character"
                :class="`music-nav-ip-character--${activeMusicIp}`"
                :src="activeMusicIp === 'hello-kitty' ? '/images/ip-themes/hello-kitty-main.png' : '/images/ip-themes/kuromi-main.png'"
                alt=""
              >
              <img
                class="music-nav-ip-companion"
                :class="`music-nav-ip-companion--${activeMusicIp}`"
                :src="activeMusicIp === 'hello-kitty' ? '/images/ip-themes/hello-kitty-angel.png' : '/images/ip-themes/kuromi-melody.png'"
                alt=""
              >
            </template>
          </span>
        </div>

        <ul class="nav-links">
          <li><router-link to="/" active-class="active">首页</router-link></li>
          <li><router-link to="/articles" active-class="active">文章</router-link></li>
          <li><router-link to="/music" active-class="active">音乐</router-link></li>
          <li><router-link to="/about" active-class="active">关于</router-link></li>
          <li v-if="!isMusicModule">
            <button class="dark-mode-toggle" type="button" @click="toggleDarkMode" :aria-label="isDarkMode ? '切换到浅色模式' : '切换到深色模式'">
              <svg v-if="isDarkMode" class="icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg v-else class="icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicBackground } from '../composables/useMusicBackground'
import { getMusicThemeIp } from '../config/musicThemeCatalog'

const isDarkMode = ref(false)
const route = useRoute()
const isMusicModule = computed(() => route.path.startsWith('/music'))
const isHomeHero = ref(route.path === '/')
const { settings: musicBackgroundSettings } = useMusicBackground()
const activeMusicIp = computed(() => getMusicThemeIp(musicBackgroundSettings.preset))

let headerSurfaceFrame = 0

const syncHomeHeaderSurface = () => {
  if (headerSurfaceFrame) return

  headerSurfaceFrame = window.requestAnimationFrame(() => {
    headerSurfaceFrame = 0

    if (route.path !== '/') {
      isHomeHero.value = false
      return
    }

    const homeContent = document.querySelector('.home-content')
    // 首屏还在导航下方时，导航透出首屏；进入内容区后恢复通用玻璃外观。
    isHomeHero.value = !homeContent || homeContent.getBoundingClientRect().top > 92
  })
}

onMounted(() => {
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode === 'true') {
    isDarkMode.value = true
    if (!isMusicModule.value) {
      document.body.classList.add('dark-mode')
      document.documentElement.style.colorScheme = 'dark'
    }
  }

  syncHomeHeaderSurface()
  window.addEventListener('scroll', syncHomeHeaderSurface, { passive: true })
  window.addEventListener('resize', syncHomeHeaderSurface)
})

watch(() => route.path, () => {
  syncHomeHeaderSurface()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(headerSurfaceFrame)
  window.removeEventListener('scroll', syncHomeHeaderSurface)
  window.removeEventListener('resize', syncHomeHeaderSurface)
})

const toggleDarkMode = () => {
  if (isMusicModule.value) return
  const nextDark = !isDarkMode.value

  const clearViewTransitionSnapshots = () => {
    document.body.classList.remove('theme-transitioning')
  }

  const applyTheme = () => {
    isDarkMode.value = nextDark
    document.body.classList.toggle('dark-mode', nextDark)
    document.documentElement.style.colorScheme = nextDark ? 'dark' : 'light'
    localStorage.setItem('darkMode', String(nextDark))
  }

  // 仅切换真实页面颜色，不再创建整页快照或遮罩层。
  // 音乐模块有多层 fixed 背景，根快照在 Chromium 中可能残留为灰色蒙层。
  clearViewTransitionSnapshots()
  applyTheme()
  requestAnimationFrame(clearViewTransitionSnapshots)
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  padding: 0.75rem 0;
  background: transparent;
  pointer-events: none;
}

.header-container {
  width: var(--shell-width);
  max-width: var(--shell-max-width);
  margin-inline: auto;
  pointer-events: auto;
}

.nav {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 999px;
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.95), transparent 24%),
    radial-gradient(circle at 84% 115%, rgba(91, 108, 255, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.24) 48%, rgba(255, 255, 255, 0.12) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    inset 0 -1px 0 rgba(255, 255, 255, 0.22),
    0 24px 60px rgba(15, 23, 42, 0.11),
    0 10px 24px rgba(15, 23, 42, 0.05),
    0 0 40px rgba(91, 108, 255, 0.08);
  backdrop-filter: blur(56px) saturate(220%) contrast(110%);
  -webkit-backdrop-filter: blur(56px) saturate(220%) contrast(110%);
  transform: translateZ(0);
}

.nav::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(91, 108, 255, 0.18) 58%, rgba(255, 255, 255, 0.72) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.84;
  pointer-events: none;
  z-index: 0;
}

.nav::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.72), transparent 24%),
    radial-gradient(circle at 78% 120%, rgba(91, 108, 255, 0.18), transparent 34%),
    linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.34) 45%, rgba(255, 255, 255, 0.08) 53%, transparent 76%);
  background-size: auto, auto, 220% 100%;
  background-position: 0 0, 100% 100%, 0 50%;
  mix-blend-mode: screen;
  opacity: 0.68;
  pointer-events: none;
  z-index: 0;
  animation: navSheen 14s ease-in-out infinite;
}

.nav > * {
  position: relative;
  z-index: 1;
}

.music-nav-decor {
  position: absolute !important;
  inset: 0;
  z-index: 1 !important;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.music-nav-character-pair {
  position: absolute;
  left: clamp(154px, 18%, 286px);
  bottom: -27px;
  display: flex;
  align-items: flex-end;
  gap: 0;
  width: 116px;
  height: 86px;
  transform-origin: 50% 100%;
  filter: drop-shadow(0 5px 5px rgba(55, 43, 34, 0.16));
  animation: music-nav-original-bob 3.8s ease-in-out infinite;
}

.music-nav-character {
  display: block;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.music-nav-character--shinchan {
  width: 72px;
  height: 82px;
  object-position: center bottom;
}

.music-nav-character--shiro {
  width: 48px;
  height: 43px;
  margin-left: -10px;
  margin-bottom: 17px;
  transform-origin: 50% 100%;
  animation: music-nav-original-shiro 1.8s ease-in-out infinite;
}

.music-nav-ip-character,
.music-nav-ip-companion { position: relative; display: block; flex: 0 0 auto; }
.music-nav-ip-character::before,
.music-nav-ip-character::after,
.music-nav-ip-character i::before,
.music-nav-ip-character i::after,
.music-nav-ip-companion::before,
.music-nav-ip-companion::after { content: ''; position: absolute; display: block; }
.music-nav-ip-character { width: 70px; height: 70px; margin-bottom: 5px; }
.music-nav-ip-character--hello-kitty::before { left: 8px; top: 14px; width: 54px; height: 48px; border: 2px solid #493f48; border-radius: 46%; background: #fffdf8; }
.music-nav-ip-character--hello-kitty::after { right: 0; top: 6px; width: 25px; height: 17px; border-radius: 50%; background: #e9435d; box-shadow: -12px 1px #e9435d; }
.music-nav-ip-character--hello-kitty i::before { left: 25px; top: 39px; width: 4px; height: 6px; border-radius: 50%; background: #302a31; box-shadow: 22px 0 #302a31; }
.music-nav-ip-character--hello-kitty i::after { left: 36px; top: 48px; width: 7px; height: 5px; border-radius: 50%; background: #efc23b; }
.music-nav-ip-character--kuromi::before { left: 8px; top: 19px; width: 54px; height: 44px; border-radius: 48%; background: #fff9f7; }
.music-nav-ip-character--kuromi::after { left: 3px; top: 5px; width: 64px; height: 40px; border-radius: 50% 50% 34% 34%; background: #2c2233; clip-path: polygon(0 20%, 17% 0, 30% 38%, 70% 38%, 84% 0, 100% 20%, 91% 100%, 9% 100%); }
.music-nav-ip-character--kuromi i::before { left: 25px; top: 43px; z-index: 2; width: 4px; height: 6px; border-radius: 50%; background: #33263b; box-shadow: 22px 0 #33263b; }
.music-nav-ip-character--kuromi i::after { left: 31px; top: 15px; z-index: 2; width: 14px; height: 14px; border-radius: 50%; background: #ef70ad; }
.music-nav-ip-companion { width: 34px; height: 36px; margin: 0 0 22px -8px; }
.music-nav-ip-companion--hello-kitty::before { left: 7px; top: 8px; width: 24px; height: 26px; border-radius: 45% 45% 52% 52%; background: #ef4f58; }
.music-nav-ip-companion--hello-kitty::after { left: 18px; top: 2px; width: 13px; height: 7px; border-radius: 80% 10% 80% 10%; background: #67a654; transform: rotate(-16deg); }
.music-nav-ip-companion--kuromi::before { left: 3px; top: 10px; width: 29px; height: 22px; border-radius: 50%; background: #31243a; }
.music-nav-ip-companion--kuromi::after { left: 0; top: 4px; width: 35px; height: 24px; background: #31243a; clip-path: polygon(0 55%, 32% 0, 50% 55%, 68% 0, 100% 55%, 70% 100%, 30% 100%); }
.music-nav-character-pair--hello-kitty,
.music-nav-character-pair--kuromi { bottom: -20px; align-items: flex-end; }

img.music-nav-ip-character,
img.music-nav-ip-companion {
  display: block;
  height: auto;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
img.music-nav-ip-character { width: 72px; margin: 0; filter: drop-shadow(0 4px 6px rgba(71, 39, 60, .14)); }
img.music-nav-ip-companion { width: 42px; margin: 0 0 13px -12px; }
img.music-nav-ip-character--hello-kitty { width: 68px; }
img.music-nav-ip-companion--hello-kitty { width: 40px; margin-left: -8px; }
img.music-nav-ip-character--kuromi { width: 72px; }
img.music-nav-ip-companion--kuromi { width: 44px; }

body.music-ip-hello-kitty .nav {
  border-radius: 12px 30px 12px 30px;
  border-color: rgba(190, 44, 74, .14);
  background: linear-gradient(90deg, rgba(255,253,247,.94), rgba(255,232,238,.92), rgba(255,250,244,.94));
  box-shadow: 0 16px 38px rgba(125, 41, 60, .1);
}
body.music-ip-kuromi .nav {
  border-radius: 6px 28px 6px 28px;
  border-color: rgba(239, 77, 159, .28);
  color: #f7eef8;
  background: linear-gradient(90deg, rgba(12,8,16,.95), rgba(43,24,51,.94), rgba(12,8,16,.95));
  box-shadow: 10px 10px 0 rgba(225, 61, 145, .06), 0 16px 42px rgba(17, 8, 21, .26);
}
body.music-ip-kuromi .logo,
body.music-ip-kuromi .nav-links a { color: #f4e9f5; }
body.music-ip-kuromi .nav-links a.active { color: #ff78ba; background: rgba(239,68,158,.14); }
body.music-preset-hello-kitty-midnight .nav {
  border-color: rgba(220,173,95,.2);
  color: #f7e6cf;
  background: linear-gradient(90deg, #17080d, #45101f, #17080d);
}
body.music-preset-hello-kitty-midnight .logo,
body.music-preset-hello-kitty-midnight .nav-links a { color:#f8e5ca; }

@keyframes music-nav-original-bob {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); }
  50% { transform: translate3d(0, -3px, 0) rotate(1deg); }
}

@keyframes music-nav-original-shiro {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  45% { transform: translateY(-4px) rotate(2deg); }
}

.music-nav-shinchan {
  position: absolute;
  left: clamp(158px, 17%, 250px);
  bottom: -17px;
  width: 58px;
  height: 52px;
  border: 2px solid rgba(84, 43, 31, 0.32);
  border-radius: 46% 48% 42% 42%;
  background: #f3ba96;
  box-shadow: 0 -4px 12px rgba(76, 51, 37, 0.11);
  animation: music-nav-peek 5.8s ease-in-out infinite;
}

.music-nav-shinchan::after {
  content: '';
  position: absolute;
  left: 15px;
  bottom: 10px;
  width: 8px;
  height: 5px;
  border-radius: 50%;
  border-bottom: 2px solid #8d3e36;
}

.music-nav-shinchan-hair {
  position: absolute;
  inset: -4px 3px auto;
  height: 18px;
  border-radius: 52% 52% 32% 32%;
  background: #171717;
  clip-path: polygon(0 0, 100% 0, 100% 66%, 87% 50%, 76% 78%, 61% 51%, 48% 76%, 34% 48%, 18% 76%, 0 58%);
}

.music-nav-shinchan-eye {
  position: absolute;
  top: 22px;
  width: 8px;
  height: 10px;
  border-radius: 50%;
  background: #171717;
  animation: music-nav-blink 5.1s steps(1, end) infinite;
}

.music-nav-shinchan-eye--left { left: 18px; }
.music-nav-shinchan-eye--right { left: 34px; }

.music-nav-shinchan > b {
  position: absolute;
  left: 12px;
  bottom: -2px;
  width: 15px;
  height: 10px;
  border-radius: 50%;
  background: #f3ba96;
  border-top: 2px solid rgba(84, 43, 31, 0.24);
}

.music-nav-shinchan > b:last-child { left: auto; right: 10px; }

.music-nav-shiro {
  position: absolute;
  left: clamp(225px, 24%, 348px);
  bottom: 8px;
  width: 38px;
  height: 23px;
  border: 1px solid rgba(83, 94, 104, 0.26);
  border-radius: 52% 55% 45% 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 5px 10px rgba(62, 78, 91, 0.1);
  animation: music-nav-shiro-hop 3.2s ease-in-out infinite;
}

.music-nav-shiro::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 1px;
  width: 16px;
  height: 16px;
  border-radius: 48%;
  background: #fff;
  border: 1px solid rgba(83, 94, 104, 0.24);
}

.music-nav-shiro i {
  position: absolute;
  left: -3px;
  top: 6px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #24272b;
  box-shadow: 8px 0 0 #24272b;
}

.music-nav-shiro b {
  position: absolute;
  right: -10px;
  top: 1px;
  width: 16px;
  height: 7px;
  border-top: 2px solid #fff;
  border-radius: 50%;
  transform: rotate(28deg);
  transform-origin: left center;
  animation: music-nav-shiro-tail 0.7s ease-in-out infinite alternate;
}

.music-nav-crayon {
  position: absolute;
  left: 44%;
  top: 13px;
  width: 42px;
  height: 7px;
  border-radius: 999px 4px 4px 999px;
  background: linear-gradient(90deg, #f2bc47 0 78%, #f7df8f 78%);
  opacity: 0.44;
  transform: rotate(-8deg);
}

.music-nav-note {
  position: absolute;
  color: rgba(232, 82, 86, 0.45);
  font-family: Georgia, serif;
  font-weight: 800;
  animation: music-nav-note-float 3.6s ease-in-out infinite;
}

.music-nav-note--one { left: 38%; bottom: 9px; font-size: 18px; }
.music-nav-note--two { left: 56%; top: 8px; color: rgba(77, 157, 190, 0.4); animation-delay: -1.8s; }

body:is(.dark-mode, .music-theme-dark) .nav {
  border-color: rgba(255, 255, 255, 0.05);
  background: linear-gradient(135deg, rgba(30, 24, 42, 0.94) 0%, rgba(18, 15, 23, 0.92) 100%);
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.38),
    0 0 20px rgba(109, 40, 217, 0.05);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
}

body:is(.dark-mode, .music-theme-dark) .nav::before {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.14), rgba(109, 40, 217, 0.08) 42%, rgba(244, 114, 182, 0.05) 72%, rgba(167, 139, 250, 0.04));
  opacity: 0.2;
}

body:is(.dark-mode, .music-theme-dark) .nav::after {
  opacity: 0.06;
  mix-blend-mode: normal;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--text-primary);
  font-weight: 900;
  letter-spacing: -0.04em;
  padding-left: 0.2rem;
}

.logo-mark {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.44);
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.88), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.12) 48%, rgba(255, 255, 255, 0.2) 100%),
    linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(91, 108, 255, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.58);
}

.logo-text {
  font-size: 1.15rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  margin: 0;
  list-style: none;
  min-width: 0;
}

.nav-links li {
  display: flex;
  align-items: center;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.12));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 6px 18px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  color: var(--text-light);
  font-size: 0.94rem;
  font-weight: 750;
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    transform 0.3s var(--ease-spring),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast);
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--primary-color);
  border-color: rgba(255, 255, 255, 0.72);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.24));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 12px 26px rgba(91, 108, 255, 0.14),
    0 0 20px rgba(91, 108, 255, 0.08);
  transform: translateY(-1px);
}

body:is(.dark-mode, .music-theme-dark) .nav-links a {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(36, 30, 48, 0.72);
  color: #b8afc8;
  box-shadow: none;
}

body:is(.dark-mode, .music-theme-dark) .nav-links a:hover,
body:is(.dark-mode, .music-theme-dark) .nav-links a.active {
  color: #f5f3ff;
  border-color: rgba(167, 139, 250, 0.22);
  background: rgba(109, 40, 217, 0.18);
  box-shadow: 0 0 16px rgba(109, 40, 217, 0.12);
}

.dark-mode-toggle {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.12));
  color: var(--text-primary);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 6px 18px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.dark-mode-toggle:hover {
  transform: translateY(-1px) scale(1.05);
  color: var(--primary-color);
  border-color: rgba(255, 255, 255, 0.7);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.22));
  box-shadow:
    0 10px 24px rgba(91, 108, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transition:
    transform 0.35s var(--ease-spring),
    border-color var(--transition-fast),
    background var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

body:is(.dark-mode, .music-theme-dark) .dark-mode-toggle {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(36, 30, 48, 0.72);
  color: #c4b5fd;
  box-shadow: none;
}

body:is(.dark-mode, .music-theme-dark) .dark-mode-toggle:hover {
  border-color: rgba(167, 139, 250, 0.22);
  background: rgba(109, 40, 217, 0.18);
  color: #f5f3ff;
  box-shadow: 0 0 16px rgba(109, 40, 217, 0.12);
}

body:is(.dark-mode, .music-theme-dark) .logo-mark {
  border-color: rgba(167, 139, 250, 0.18);
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
  box-shadow: 0 8px 20px rgba(76, 29, 149, 0.28);
}

.icon {
  width: 18px;
  height: 18px;
  transition: transform 0.48s var(--ease-spring), opacity 0.35s ease;
}

.dark-mode-toggle:active .icon {
  transform: rotate(18deg) scale(0.9);
}

@keyframes navSheen {
  0%,
  100% {
    background-position: 0 0, 100% 100%, 0 50%;
  }
  50% {
    background-position: 0 0, 100% 100%, 100% 50%;
  }
}

@keyframes music-nav-peek {
  0%, 100% { transform: translateY(3px) rotate(-1deg); }
  48% { transform: translateY(-2px) rotate(1deg); }
}

@keyframes music-nav-blink {
  0%, 44%, 48%, 78%, 82%, 100% { transform: scaleY(1); }
  45%, 47%, 79%, 81% { transform: scaleY(0.12); }
}

@keyframes music-nav-shiro-hop {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes music-nav-shiro-tail {
  from { transform: rotate(12deg); }
  to { transform: rotate(42deg); }
}

@keyframes music-nav-note-float {
  0%, 100% { transform: translateY(2px) rotate(-7deg); opacity: 0.28; }
  50% { transform: translateY(-4px) rotate(5deg); opacity: 0.62; }
}

@media (prefers-reduced-motion: reduce) {
  .nav::after {
    animation: none;
  }

  .music-nav-shinchan,
  .music-nav-shinchan-eye,
  .music-nav-shiro,
  .music-nav-shiro b,
  .music-nav-character-pair,
  .music-nav-character--shiro,
  .music-nav-note {
    animation: none !important;
  }
}

@media (max-width: 768px) {
  .header { padding: 0.5rem 0; }
  .header-container { width: min(calc(100% - 20px), var(--shell-max-width)); }
  .nav { min-height: 58px; gap: 0.55rem; padding: 0.45rem 0.55rem; }
  .logo-text { display: none; }
  .logo-mark { width: 36px; height: 36px; }
  .nav-links { flex: 1; justify-content: flex-end; overflow-x: auto; scrollbar-width: none; }
  .nav-links::-webkit-scrollbar { display: none; }
  .nav-links a { min-height: 34px; padding: 0.38rem 0.6rem; font-size: 0.82rem; white-space: nowrap; }
  .dark-mode-toggle { width: 34px; height: 34px; }
  .music-nav-character-pair {
    left: 46px;
    bottom: -29px;
    width: 92px;
    height: 74px;
    opacity: 0.42;
  }
  .music-nav-character--shinchan { width: 60px; height: 70px; }
  .music-nav-character--shiro { width: 39px; height: 36px; margin-left: -9px; margin-bottom: 14px; }
  .music-nav-shinchan { left: 53px; width: 46px; height: 42px; bottom: -17px; opacity: 0.34; }
  .music-nav-shinchan-eye { top: 18px; width: 6px; height: 8px; }
  .music-nav-shinchan-eye--left { left: 14px; }
  .music-nav-shinchan-eye--right { left: 27px; }
  .music-nav-shiro { display: none; }
  .music-nav-crayon { left: 34%; opacity: 0.22; }
  .music-nav-note--one { left: 29%; }
  .music-nav-note--two { left: 48%; }
}
/* 非音乐页面的暗黑导航使用纯黑石墨配色。 */
body.dark-mode .nav {
  border-color: rgba(255, 255, 255, 0.07);
  background: linear-gradient(135deg, rgba(18, 20, 23, 0.97), rgba(8, 9, 11, 0.96));
  box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.04), 0 10px 34px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px) saturate(105%);
  -webkit-backdrop-filter: blur(18px) saturate(105%);
}

body.dark-mode .nav::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(131, 181, 165, 0.045) 46%, rgba(255, 255, 255, 0.018));
  opacity: 0.22;
}

body.dark-mode .nav-links a,
body.dark-mode .dark-mode-toggle {
  border-color: rgba(255, 255, 255, 0.07);
  background: rgba(27, 30, 34, 0.86);
  color: #bfc5cb;
  box-shadow: none;
}

body.dark-mode .nav-links a:hover,
body.dark-mode .nav-links a.active,
body.dark-mode .dark-mode-toggle:hover {
  color: #f4f5f6;
  border-color: rgba(131, 181, 165, 0.2);
  background: rgba(131, 181, 165, 0.1);
  box-shadow: 0 0 16px rgba(131, 181, 165, 0.055);
}

body.dark-mode .logo-mark {
  border-color: rgba(255, 255, 255, 0.11);
  background: linear-gradient(145deg, #34383d, #16181b);
  box-shadow: 0 9px 22px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* 音乐路由上的导航保持和当前 IP 一致，覆盖站点通用暗色导航。 */
body.music-ip-shinchan .nav {
  border-color: rgba(255, 255, 255, 0.58);
  background: linear-gradient(100deg, rgba(255, 253, 238, 0.94), rgba(210, 238, 255, 0.86));
  box-shadow: 0 12px 30px rgba(50, 86, 108, 0.18);
}

body.music-ip-shinchan .nav-links a,
body.music-ip-shinchan .dark-mode-toggle { color: #315778; }

body.music-ip-shinchan .nav-links a.active {
  color: #e65051;
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(255, 255, 255, 0.92);
}

body.music-ip-hello-kitty .nav {
  border-color: rgba(255, 236, 243, 0.62);
  background: linear-gradient(100deg, rgba(255, 248, 250, 0.96), rgba(255, 218, 233, 0.9));
  box-shadow: 0 12px 30px rgba(183, 49, 100, 0.18);
}

body.music-ip-hello-kitty .nav-links a,
body.music-ip-hello-kitty .dark-mode-toggle { color: #913253; }

body.music-ip-hello-kitty .nav-links a.active {
  color: #c52758;
  background: rgba(255, 255, 255, 0.76);
  border-color: rgba(225, 81, 129, 0.26);
}

body.music-preset-hello-kitty-midnight .nav {
  border-color: rgba(224, 175, 100, 0.22);
  background: linear-gradient(100deg, rgba(50, 11, 25, 0.97), rgba(28, 8, 17, 0.96));
  box-shadow: 0 12px 32px rgba(21, 3, 10, 0.5);
}

body.music-preset-hello-kitty-midnight .nav-links a,
body.music-preset-hello-kitty-midnight .dark-mode-toggle { color: #f8e5ca; background: rgba(91, 28, 48, 0.58); }
body.music-preset-hello-kitty-midnight .nav-links a.active { color: #ffe1a8; border-color: rgba(227, 173, 93, 0.34); background: rgba(181, 65, 101, 0.36); }

/* 小新「春日部深夜影院」：与页面的炭黑、暖金午夜场景保持一致。 */
body.music-preset-midnight-cinema .nav {
  border-color: rgba(240, 199, 128, 0.22);
  background:
    radial-gradient(circle at 78% 6%, rgba(221, 158, 74, 0.16), transparent 34%),
    linear-gradient(100deg, rgba(18, 18, 21, 0.97), rgba(45, 35, 33, 0.95) 52%, rgba(13, 16, 21, 0.97));
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 232, 190, 0.08);
}

body.music-preset-midnight-cinema .nav::before {
  background: linear-gradient(112deg, rgba(237, 179, 85, 0.14), transparent 40%, rgba(166, 59, 65, 0.08));
  opacity: 0.32;
}

body.music-preset-midnight-cinema .logo { color: #fff1db; }
body.music-preset-midnight-cinema .logo-mark {
  border-color: rgba(255, 226, 175, 0.26);
  background: radial-gradient(circle at 30% 25%, rgba(255, 245, 214, 0.76), transparent 32%), linear-gradient(145deg, #c98a43, #744034);
  box-shadow: 0 9px 22px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 246, 221, 0.32);
}

body.music-preset-midnight-cinema .nav-links a,
body.music-preset-midnight-cinema .dark-mode-toggle {
  border-color: rgba(243, 206, 147, 0.14);
  background: rgba(255, 232, 190, 0.07);
  color: #edddc5;
  box-shadow: none;
}

body.music-preset-midnight-cinema .nav-links a:hover,
body.music-preset-midnight-cinema .nav-links a.active,
body.music-preset-midnight-cinema .dark-mode-toggle:hover {
  border-color: rgba(246, 201, 122, 0.34);
  background: rgba(220, 158, 75, 0.18);
  color: #ffe7b8;
  box-shadow: 0 0 16px rgba(228, 166, 77, 0.14);
}

body.music-preset-midnight-cinema .music-nav-decor { filter: brightness(0.9) saturate(1.08); }
body.music-preset-midnight-cinema .music-nav-note { color: rgba(244, 190, 101, 0.52); }
body.music-preset-midnight-cinema .music-nav-note--two { color: rgba(213, 136, 83, 0.45); }

body.music-ip-kuromi .nav {
  border-color: rgba(239, 90, 183, 0.26);
  background: linear-gradient(100deg, rgba(32, 17, 45, 0.97), rgba(17, 9, 30, 0.97));
  box-shadow: 0 12px 34px rgba(14, 3, 23, 0.52), 0 0 18px rgba(236, 61, 160, 0.1);
}

body.music-ip-kuromi .nav-links a,
body.music-ip-kuromi .dark-mode-toggle { color: #f7eaf8; background: rgba(72, 38, 83, 0.5); }
body.music-ip-kuromi .nav-links a.active { color: #ff91cc; border-color: rgba(241, 80, 177, 0.36); background: rgba(197, 50, 132, 0.24); }

/* 音乐页所有主题统一取消导航的玻璃白描边，只保留主题底色与投影。 */
body.page-music .nav {
  border: 0 !important;
  box-shadow: 0 14px 34px rgba(18, 15, 28, 0.22) !important;
}

body.page-music .nav::before {
  display: none !important;
}

body.page-music .nav-links a,
body.page-music .dark-mode-toggle {
  border: 0 !important;
  box-shadow: 0 6px 18px rgba(18, 15, 28, 0.1) !important;
}

body.page-music .nav-links a:hover,
body.page-music .nav-links a.active,
body.page-music .dark-mode-toggle:hover {
  border: 0 !important;
  box-shadow: 0 9px 22px rgba(18, 15, 28, 0.14) !important;
}

/* Classic keeps the same liquid-glass navigation shell as the other music themes.
   Only the IP character decoration is omitted. */
body.music-ip-classic.page-music .nav {
  color: #315777;
  border: 1px solid rgba(255, 255, 255, 0.54) !important;
  border-radius: 999px;
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.8), transparent 28%),
    linear-gradient(115deg, rgba(255, 255, 255, 0.58), rgba(224, 242, 255, 0.3) 54%, rgba(255, 255, 255, 0.38)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.78),
    0 14px 34px rgba(43, 91, 125, 0.16) !important;
  backdrop-filter: blur(32px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(150%) !important;
}

body.music-ip-classic.page-music .nav::after {
  display: block !important;
  opacity: 0.36;
  mix-blend-mode: screen;
}

body.music-ip-classic.page-music .nav::before {
  display: block !important;
  background: linear-gradient(125deg, rgba(255, 255, 255, 0.88), rgba(147, 207, 245, 0.16) 54%, rgba(255, 255, 255, 0.62)) !important;
  opacity: 0.58;
}

body.music-ip-classic.page-music .nav-links a {
  color: #426987 !important;
  background: rgba(255, 255, 255, .52) !important;
}

body.music-ip-classic.page-music .nav-links a.active {
  color: #256896 !important;
  background: rgba(206, 237, 255, .88) !important;
}

body.music-ip-classic.music-appearance-dark.page-music .nav {
  color: #edf6ff;
  background: linear-gradient(100deg, rgba(10, 15, 28, .96), rgba(24, 28, 54, .94)) !important;
  box-shadow: 0 14px 34px rgba(0, 0, 0, .38) !important;
}

body.music-ip-classic.music-appearance-dark.page-music .nav-links a {
  color: rgba(240, 247, 255, .8) !important;
  background: rgba(255, 255, 255, .08) !important;
}

body.music-ip-classic.music-appearance-dark.page-music .nav-links a.active {
  color: #ffffff !important;
  background: rgba(103, 173, 228, .24) !important;
}

/* 首页深色首屏：导航不再自带一层高亮白色，改为以低透明度透出
   当前首屏的深绿与星空背景；离开首屏后会自动回到通用玻璃样式。 */
body.dark-mode.page-home .header.is-home-hero .nav {
  border-color: rgba(174, 218, 205, 0.14);
  background:
    linear-gradient(112deg, rgba(6, 17, 17, 0.5), rgba(18, 56, 52, 0.24) 54%, rgba(8, 22, 22, 0.42));
  box-shadow:
    inset 0 1px 0 rgba(214, 244, 235, 0.1),
    0 14px 36px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(30px) saturate(135%);
  -webkit-backdrop-filter: blur(30px) saturate(135%);
}

body.dark-mode.page-home .header.is-home-hero .nav::before {
  background: linear-gradient(120deg, rgba(179, 232, 214, 0.14), transparent 43%, rgba(93, 170, 148, 0.08));
  opacity: 0.38;
}

body.dark-mode.page-home .header.is-home-hero .nav::after {
  opacity: 0.13;
  mix-blend-mode: screen;
}

body.dark-mode.page-home .header.is-home-hero .logo {
  color: rgba(237, 248, 244, 0.94);
}

body.dark-mode.page-home .header.is-home-hero .nav-links a,
body.dark-mode.page-home .header.is-home-hero .dark-mode-toggle {
  border-color: rgba(205, 238, 228, 0.1);
  background: rgba(4, 17, 16, 0.22);
  color: rgba(219, 237, 231, 0.78);
  box-shadow: inset 0 1px 0 rgba(235, 255, 249, 0.05);
}

body.dark-mode.page-home .header.is-home-hero .nav-links a:hover,
body.dark-mode.page-home .header.is-home-hero .nav-links a.active,
body.dark-mode.page-home .header.is-home-hero .dark-mode-toggle:hover {
  border-color: rgba(166, 223, 205, 0.22);
  background: rgba(107, 182, 159, 0.16);
  color: #effbf7;
  box-shadow: 0 0 18px rgba(94, 174, 151, 0.1);
}
</style>
