import { createRouter, createWebHistory } from 'vue-router'
import { Capacitor } from '@capacitor/core'

const loadHome = () => import('../views/Home.vue')
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
    component: loadHome
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
    component: loadAbout
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (Capacitor.isNativePlatform() && !to.path.startsWith('/music')) {
    return { path: '/music', replace: true }
  }

  return true
})

export default router
