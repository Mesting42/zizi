import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/ArticleList.vue')
  },
  {
    path: '/music',
    name: 'Music',
    component: () => import('../views/Music.vue')
  },
  {
    path: '/music/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('../views/PlaylistDetail.vue')
  },
  {
    path: '/music-player',
    name: 'MusicPlayer',
    component: () => import('../views/MusicPlayer.vue')
  },
  {
    path: '/vinyl-player',
    name: 'VinylPlayer',
    component: () => import('../views/VinylPlayer.vue')
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/category/:name',
    name: 'Category',
    component: () => import('../views/Category.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/vivo-case',
    name: 'VivoCase',
    component: () => import('../views/VivoCase.vue')
  },
  {
    path: '/foreign-case',
    name: 'ForeignCase',
    component: () => import('../views/ForeignCase.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router