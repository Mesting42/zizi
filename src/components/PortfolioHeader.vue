<template>
  <div class="portfolio-navigation">
    <nav class="portfolio-navbar" :aria-label="labels.navAria">
      <div class="portfolio-nav-left">
        <router-link class="portfolio-brand" :to="homeTarget" :aria-label="labels.homeAria" @click="closeMenu">
          <svg class="portfolio-brand-mark" viewBox="0 0 26 22" aria-hidden="true">
            <rect x="2" y="4" width="14" height="6" rx="3" transform="rotate(-35 2 4)" />
            <rect x="10" y="12" width="14" height="6" rx="3" transform="rotate(-35 10 12)" />
          </svg>
          <span>Mesting</span>
        </router-link>

        <button
          class="portfolio-menu-pill"
          :class="{ 'is-open': menuOpen }"
          type="button"
          aria-controls="portfolio-project-menu"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          <span class="portfolio-menu-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" /></svg>
          </span>
          <span>Menu</span>
        </button>

        <div class="portfolio-tags-pill" :aria-label="labels.sectionsAria">
          <router-link :to="projectsTarget" @click="closeMenu">{{ labels.selectedWork }}</router-link>
          <router-link :to="aboutTarget" @click="closeMenu">{{ labels.aboutMe }}</router-link>
        </div>
      </div>

      <button
        class="portfolio-language-pill"
        type="button"
        :aria-label="labels.languageAria"
        :title="labels.languageTitle"
        @click="toggleLocale"
      >
        <span :class="{ active: isChinese }">中</span>
        <i aria-hidden="true"></i>
        <span :class="{ active: !isChinese }">EN</span>
      </button>

      <router-link
        class="portfolio-system-pill"
        to="/music"
        :aria-label="labels.musicAria"
        @pointerenter="preloadMusic"
        @focus="preloadMusic"
        @click="closeMenu"
      >
        <span class="portfolio-system-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <circle cx="5" cy="5" r="1.25" />
            <circle cx="11" cy="5" r="1.25" />
            <circle cx="5" cy="11" r="1.25" />
            <circle cx="11" cy="11" r="1.25" />
          </svg>
        </span>
        <span class="portfolio-system-label">{{ labels.soundSpace }}</span>
      </router-link>
    </nav>

    <Transition name="portfolio-menu-panel">
      <div v-if="menuOpen" id="portfolio-project-menu" class="portfolio-project-menu" :aria-label="labels.menuAria">
        <p>{{ labels.menuIntro }}</p>
        <router-link :to="homeTarget" @click="closeMenu"><span>01</span>{{ labels.home }}</router-link>
        <router-link :to="projectsTarget" @click="closeMenu"><span>02</span>{{ labels.work }}</router-link>
        <router-link :to="notesTarget" @click="closeMenu"><span>03</span>{{ labels.thinking }}</router-link>
        <router-link to="/music" @pointerenter="preloadMusic" @focus="preloadMusic" @click="closeMenu"><span>04</span>{{ labels.music }}</router-link>
        <router-link :to="aboutTarget" @click="closeMenu"><span>05</span>{{ labels.about }}</router-link>
        <a href="mailto:mesting042@gmail.com" @click="closeMenu"><span>06</span>{{ labels.contact }}</a>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { preloadMusicLanding } from '../router'
import { useLocale } from '../composables/useLocale'

const route = useRoute()
const menuOpen = ref(false)
const { isChinese, toggleLocale } = useLocale()

const homeTarget = computed(() => ({ path: '/', hash: '#top' }))
const projectsTarget = computed(() => ({ path: '/', hash: '#projects' }))
const notesTarget = computed(() => ({ path: '/articles' }))
const aboutTarget = computed(() => ({ path: '/', hash: '#about-space' }))
const labels = computed(() => isChinese.value
  ? {
      navAria: 'Mesting 导航',
      homeAria: '返回 Mesting 首页',
      sectionsAria: '主要页面',
      selectedWork: '精选作品',
      aboutMe: '关于我',
      musicAria: '进入声音空间',
      soundSpace: '声音空间',
      menuAria: '博客导航',
      menuIntro: '探索这个空间',
      home: '首页',
      work: '作品',
      thinking: '思考',
      music: '音乐',
      about: '关于',
      contact: '联系',
      languageAria: '切换为英文',
      languageTitle: 'English'
    }
  : {
      navAria: 'Mesting navigation',
      homeAria: 'Back to Mesting home',
      sectionsAria: 'Primary pages',
      selectedWork: 'Selected Work',
      aboutMe: 'About Me',
      musicAria: 'Enter the Sound Space',
      soundSpace: 'Sound Space',
      menuAria: 'Portfolio navigation',
      menuIntro: 'Explore This Space',
      home: 'Home',
      work: 'Projects',
      thinking: 'Thinking',
      music: 'Music',
      about: 'About',
      contact: 'Contact',
      languageAria: 'Switch to Chinese',
      languageTitle: '中文'
    })

const closeMenu = () => {
  menuOpen.value = false
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const preloadMusic = () => {
  preloadMusicLanding()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

watch(() => route.fullPath, closeMenu)

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

.portfolio-navigation {
  position: relative;
  z-index: 1200;
  color: #080808;
  font-family: Inter, Arial, sans-serif;
}

.portfolio-navbar {
  position: fixed;
  z-index: 1200;
  top: 18px;
  left: 50%;
  display: flex;
  width: max-content;
  max-width: calc(100% - 32px);
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 5px 6px 5px 12px;
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: 999px;
  background: #101010;
  box-shadow: 0 12px 35px rgba(0, 0, 0, .16), inset 0 1px 0 rgba(255, 255, 255, .08);
  animation: portfolio-nav-enter .8s cubic-bezier(.16, 1, .3, 1) both;
}

.portfolio-navbar > *,
.portfolio-navbar a { pointer-events: auto; }

.portfolio-nav-left { display: flex; align-items: center; gap: 6px; }

.portfolio-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -.03em;
  text-decoration: none;
}

.portfolio-brand-mark { width: 18px; height: 16px; overflow: visible; fill: #fff; }
.portfolio-brand > span { display: none; }

.portfolio-menu-pill,
.portfolio-language-pill,
.portfolio-system-pill,
.portfolio-tags-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  white-space: nowrap;
}

.portfolio-language-pill {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  border: 0;
  border-radius: 999px;
  color: rgba(255, 255, 255, .42);
  background: rgba(255, 255, 255, .075);
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .02em;
  cursor: pointer;
}

.portfolio-language-pill span { transition: color .2s ease, opacity .2s ease; }
.portfolio-language-pill span.active { color: #fff; }
.portfolio-language-pill i {
  width: 1px;
  height: 11px;
  background: rgba(255, 255, 255, .18);
}

.portfolio-menu-pill {
  gap: 7px;
  min-height: 32px;
  padding: 3px 9px 3px 3px;
  border: 0;
  color: #fff;
  background: rgba(255, 255, 255, .09);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}

.portfolio-menu-icon,
.portfolio-system-icon {
  display: grid;
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
}

.portfolio-menu-icon { color: #050505; background: #fff; }
.portfolio-menu-icon svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  transition: transform .35s cubic-bezier(.16, 1, .3, 1);
}
.portfolio-menu-pill.is-open .portfolio-menu-icon svg { transform: rotate(45deg); }

.portfolio-tags-pill {
  display: none;
  gap: 14px;
  min-height: 32px;
  padding: 0 12px;
  color: rgba(255, 255, 255, .62);
  background: transparent;
  font-size: 10px;
}

.portfolio-tags-pill a {
  color: rgba(255, 255, 255, .62);
  text-decoration: none;
  transition: color .2s ease;
}
.portfolio-tags-pill a:hover { color: #fff; }

.portfolio-system-pill {
  gap: 8px;
  min-height: 32px;
  padding: 3px 10px 3px 3px;
  color: #080808;
  background: #fff;
  font-size: 10px;
  text-decoration: none;
}

.portfolio-system-icon { color: #fff; background: #050505; }
.portfolio-system-icon svg { width: 14px; height: 14px; fill: currentColor; }
.portfolio-system-label { display: none; }

.portfolio-project-menu {
  --portfolio-menu-x: 0px;
  position: fixed;
  z-index: 1199;
  top: 68px;
  right: 16px;
  left: 16px;
  display: grid;
  gap: 3px;
  padding: 18px;
  border: 1px solid rgba(0, 0, 0, .08);
  border-radius: 24px;
  background: rgba(255, 255, 255, .985);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .14);
  clip-path: inset(0 0 0 0 round 24px);
  filter: blur(0);
  opacity: 1;
  transform: translateX(var(--portfolio-menu-x));
  transform-origin: 50% 0;
}

.portfolio-project-menu > p {
  margin: 0 0 10px;
  color: rgba(0, 0, 0, .42);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .12em;
  will-change: transform, opacity, filter;
}

.portfolio-project-menu a {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border-radius: 13px;
  color: #111;
  font-size: 14px;
  text-decoration: none;
  transition: background .2s ease, transform .2s ease;
  will-change: transform, opacity, filter;
}
.portfolio-project-menu a span { color: rgba(0, 0, 0, .36); font-size: 10px; }
.portfolio-project-menu a:hover { background: #f4f4f6; transform: translateX(3px); }

.portfolio-menu-panel-enter-active,
.portfolio-menu-panel-leave-active {
  overflow: hidden;
  will-change: clip-path, transform, opacity, filter;
  transition:
    clip-path .48s cubic-bezier(.16, 1, .3, 1),
    transform .48s cubic-bezier(.16, 1, .3, 1),
    opacity .2s ease,
    filter .3s ease;
}

.portfolio-menu-panel-enter-active > p,
.portfolio-menu-panel-enter-active > a,
.portfolio-menu-panel-leave-active > p,
.portfolio-menu-panel-leave-active > a {
  transition: opacity .26s ease, transform .38s cubic-bezier(.16, 1, .3, 1), filter .28s ease;
}

.portfolio-menu-panel-leave-active {
  transition:
    clip-path .38s cubic-bezier(.4, 0, 1, 1) .1s,
    transform .38s cubic-bezier(.4, 0, 1, 1) .1s,
    opacity .18s ease .16s,
    filter .26s ease .1s;
}

.portfolio-menu-panel-enter-active > p { transition-delay: .1s; }
.portfolio-menu-panel-enter-active > a:nth-of-type(1) { transition-delay: .13s; }
.portfolio-menu-panel-enter-active > a:nth-of-type(2) { transition-delay: .16s; }
.portfolio-menu-panel-enter-active > a:nth-of-type(3) { transition-delay: .19s; }
.portfolio-menu-panel-enter-active > a:nth-of-type(4) { transition-delay: .22s; }
.portfolio-menu-panel-enter-active > a:nth-of-type(5) { transition-delay: .25s; }
.portfolio-menu-panel-enter-active > a:nth-of-type(6) { transition-delay: .28s; }

/* Close in reverse order, then fold the panel back into the navigation. */
.portfolio-menu-panel-leave-active > p { transition-delay: .1s; }
.portfolio-menu-panel-leave-active > a:nth-of-type(1) { transition-delay: .1s; }
.portfolio-menu-panel-leave-active > a:nth-of-type(2) { transition-delay: .08s; }
.portfolio-menu-panel-leave-active > a:nth-of-type(3) { transition-delay: .06s; }
.portfolio-menu-panel-leave-active > a:nth-of-type(4) { transition-delay: .04s; }
.portfolio-menu-panel-leave-active > a:nth-of-type(5) { transition-delay: .02s; }

.portfolio-menu-panel-enter-from {
  opacity: 0;
  clip-path: inset(0 0 100% 0 round 24px);
  filter: blur(5px);
  transform: translateX(var(--portfolio-menu-x)) translateY(-8px) scaleY(.72);
}

.portfolio-menu-panel-enter-from > p,
.portfolio-menu-panel-enter-from > a {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(-12px);
}

.portfolio-menu-panel-leave-to {
  opacity: 0;
  clip-path: inset(0 0 100% 0 round 24px);
  filter: blur(3px);
  transform: translateX(var(--portfolio-menu-x)) translateY(-5px) scaleY(.82);
}

.portfolio-menu-panel-leave-to > p,
.portfolio-menu-panel-leave-to > a {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(-6px);
}

@media (max-width: 767px) {
  /* Keep the navigation close to the viewport edge while still respecting a
     real device safe area when the browser exposes one. */
  .portfolio-navbar {
    top: max(16px, calc(env(safe-area-inset-top, 0px) + 8px));
    gap: 5px;
    padding-right: 5px;
  }

  /* The old icon-only control did not explain where it would take someone.
     Keep the compact shape, but make the destination explicit on phones. */
  .portfolio-system-pill {
    gap: 7px;
    min-height: 36px;
    padding: 4px 4px 4px 11px;
    border: 1px solid rgba(255,255,255,.18);
    box-shadow: 0 5px 14px rgba(0,0,0,.12);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: -.01em;
  }

  .portfolio-system-label { display: inline; }
  .portfolio-system-icon {
    order: 2;
    width: 28px;
    height: 28px;
    background: #dc5149;
  }

  .portfolio-language-pill { padding-inline: 7px; }

  .portfolio-project-menu {
    top: max(72px, calc(env(safe-area-inset-top, 0px) + 64px));
  }
}

@media (min-width: 768px) {
  .portfolio-navbar { top: 22px; padding: 6px 7px 6px 14px; }
  .portfolio-nav-left { gap: 7px; }
  .portfolio-brand > span,
  .portfolio-tags-pill,
  .portfolio-system-label { display: inline-flex; }
  .portfolio-menu-pill,
  .portfolio-language-pill,
  .portfolio-system-pill { min-height: 34px; }
  .portfolio-menu-icon,
  .portfolio-system-icon { width: 28px; height: 28px; }
  .portfolio-system-pill { padding-right: 13px; }
  .portfolio-project-menu { --portfolio-menu-x: -50%; top: 74px; right: auto; left: 50%; width: 260px; }
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-navbar { animation: none; }
  .portfolio-menu-panel-enter-active,
  .portfolio-menu-panel-leave-active,
  .portfolio-menu-panel-enter-active > p,
  .portfolio-menu-panel-enter-active > a,
  .portfolio-menu-panel-leave-active > p,
  .portfolio-menu-panel-leave-active > a { transition: none; }
}

@keyframes portfolio-nav-enter {
  from { opacity: 0; transform: translate(-50%, -16px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
