import { createRouter, createWebHistory } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import Home from '../views/Home.vue'

const loadArticleList = () => import('../views/ArticleList.vue')
const loadMusic = () => import('../views/Music.vue')
const loadMusicPlaylists = () => import('../views/MusicPlaylists.vue')
const loadMusicQueue = () => import('../views/MusicQueue.vue')
const loadPlaylistDetail = () => import('../views/PlaylistDetail.vue')
const loadMusicPlayer = () => import('../views/MusicPlayer.vue')
const loadArticleDetail = () => import('../views/ArticleDetail.vue')
const loadCategory = () => import('../views/Category.vue')
const loadAbout = () => import('../views/About.vue')
const loadVivoCase = () => import('../views/VivoCase.vue')
const loadForeignCase = () => import('../views/ForeignCase.vue')
const loadFlutterMusicCase = () => import('../views/FlutterMusicCase.vue')
const loadAvatarLab = () => import('../views/AvatarLab.vue')

const musicRouteLoaders = [
  loadMusic,
  loadMusicPlaylists,
  loadMusicQueue,
  loadPlaylistDetail,
  loadMusicPlayer
]

let musicRoutesPreloadPromise = null

// The native app only serves the music module. Warm its route chunks after the
// first screen is interactive so later page switches never wait on parsing.
export const preloadMusicRoutes = () => {
  if (!musicRoutesPreloadPromise) {
    musicRoutesPreloadPromise = Promise.allSettled(musicRouteLoaders.map(loader => loader()))
  }
  return musicRoutesPreloadPromise
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: loadArticleList
  },
  {
    path: '/music',
    name: 'Music',
    component: loadMusic
  },
  {
    path: '/music/playlists',
    name: 'MusicPlaylists',
    component: loadMusicPlaylists
  },
  {
    path: '/music/queue',
    name: 'MusicQueue',
    component: loadMusicQueue
  },
  {
    path: '/music/playlist/:id',
    name: 'PlaylistDetail',
    component: loadPlaylistDetail
  },
  {
    path: '/music-player',
    name: 'MusicPlayer',
    component: loadMusicPlayer
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: loadArticleDetail
  },
  {
    path: '/category/:name',
    name: 'Category',
    component: loadCategory
  },
  {
    path: '/about',
    name: 'About',
    redirect: { path: '/', hash: '#about-space' }
  },
  {
    path: '/vivo-case',
    name: 'VivoCase',
    component: loadVivoCase
  },
  {
    path: '/foreign-case',
    name: 'ForeignCase',
    component: loadForeignCase
  },
  {
    path: '/flutter-music-case',
    name: 'FlutterMusicCase',
    component: loadFlutterMusicCase
  },
  {
    path: '/avatar-lab',
    name: 'AvatarLab',
    component: loadAvatarLab
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const waitForScrollTarget = (selector, timeout = 2600) => new Promise((resolve) => {
  const startedAt = performance.now()
  const minimumSettleTime = 360
  let previousTop = null
  let previousHeight = null
  let stableFrames = 0

  const check = () => {
    let target = null
    try {
      target = document.querySelector(selector)
    } catch {
      resolve(false)
      return
    }

    if (target) {
      const documentTop = target.getBoundingClientRect().top + window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const layoutStable = previousTop !== null
        && Math.abs(documentTop - previousTop) < 0.5
        && documentHeight === previousHeight

      stableFrames = layoutStable ? stableFrames + 1 : 0
      previousTop = documentTop
      previousHeight = documentHeight

      if (stableFrames >= 6 && performance.now() - startedAt >= minimumSettleTime) {
        resolve(true)
        return
      }
    }

    if (performance.now() - startedAt >= timeout) {
      resolve(Boolean(target))
      return
    }

    requestAnimationFrame(check)
  }

  check()
})

const getAnchorOffset = (selector) => {
  const target = selector.startsWith('#')
    ? document.getElementById(selector.slice(1))
    : document.querySelector(selector)
  if (!target) return 96

  const transform = window.getComputedStyle(target).transform
  if (!transform || transform === 'none') return 96

  try {
    const translateY = new DOMMatrixReadOnly(transform).m42
    return 96 + Math.max(0, translateY)
  } catch {
    return 96
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  async scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash) {
      const targetExists = await waitForScrollTarget(to.hash)
      if (!targetExists) return { top: 0 }

      return {
        el: to.hash,
        top: getAnchorOffset(to.hash),
        behavior: from.path === to.path ? 'smooth' : 'auto'
      }
    }

    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (Capacitor.isNativePlatform() && !to.path.startsWith('/music')) {
    return { path: '/music', replace: true }
  }

  return true
})

export default router
