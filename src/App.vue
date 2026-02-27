<template>
  <div id="app" :class="`page-${currentPage}`">
    <!-- 背景装饰元素 -->
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>
    <div class="bg-shape bg-shape-3"></div>
    <div class="bg-shape bg-shape-4"></div>
    <div class="bg-particle bg-particle-1"></div>
    <div class="bg-particle bg-particle-2"></div>
    <div class="bg-particle bg-particle-3"></div>
    <div class="bg-particle bg-particle-4"></div>
    <div class="bg-particle bg-particle-5"></div>
    <div class="bg-wave"></div>
    <div class="bg-wave bg-wave-2"></div>

    <Header />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer v-if="!isMusicPage" />

    <!-- 全局悬浮音乐按钮 -->
    <div 
      v-if="isPlaying && !isMusicPage" 
      class="floating-music-btn"
      @click="goToVinylPlayer"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { usePlayer } from './composables/usePlayer'

const route = useRoute()
const router = useRouter()
const { isPlaying } = usePlayer()

// 根据路由确定当前页面类型
const currentPage = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path === '/about') return 'about'
  if (path.startsWith('/articles')) return 'articles'
  if (path.startsWith('/article')) return 'article'
  if (path.startsWith('/category')) return 'articles'
  if (path.startsWith('/vivo-case')) return 'home'
  if (path === '/music' || path === '/music-player' || path === '/vinyl-player') return 'music'
  return 'home'
})

// 判断是否是音乐页面
const isMusicPage = computed(() => {
  return route.path === '/music' || route.path === '/music-player' || route.path === '/vinyl-player'
})

// 跳转到黑胶唱片机页面
const goToVinylPlayer = () => {
  router.push('/vinyl-player')
}

// 监听页面变化，更新body的class
watch(
  currentPage,
  (newPage) => {
    // 移除所有页面相关的class
    document.body.classList.remove(
      'page-home',
      'page-about',
      'page-articles',
      'page-article',
      'page-music'
    )
    // 添加当前页面的class
    document.body.classList.add(`page-${newPage}`)
  },
  { immediate: true }
)
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
  scroll-behavior: smooth;
}

/* 美化滚动条 */
   html::-webkit-scrollbar {
     width: 8px;
   }
  
   html::-webkit-scrollbar-track {
     background: transparent;
   }
  
   html::-webkit-scrollbar-thumb {
     background: linear-gradient(180deg, #00d2ff 0%, #3a7bd5 100%);
     border-radius: 4px;
   }
  
   html::-webkit-scrollbar-thumb:hover {
     background: linear-gradient(180deg, #33e0ff 0%, #5a9fe8 100%);
   }

body {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow-x: hidden;
  transition: background 3s ease-in-out !important;
  width: 100%;
  max-width: 100vw;
  scroll-behavior: smooth;
}

/* 美化滚动条 - WebKit */
body::-webkit-scrollbar {
  width: 8px;
}

body::-webkit-scrollbar-track {
  background: transparent;
}

body::-webkit-scrollbar-thumb {
   background: linear-gradient(180deg, #00d2ff 0%, #3a7bd5 100%);
   border-radius: 4px;
 }
 
 body::-webkit-scrollbar-thumb:hover {
   background: linear-gradient(180deg, #33e0ff 0%, #5a9fe8 100%);
 }

/* 首页背景 */
body.page-home {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 首页背景装饰层 */
body.page-home::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.03) 0%, transparent 40%);
}

/* 首页浮动圆形装饰 */
body.page-home::after {
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
}

/* 关于我页面背景 */
body.page-about {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 文章列表页面背景 */
body.page-articles {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 文章列表页面背景装饰层 */
body.page-articles::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.03) 0%, transparent 40%);
}

/* 文章列表页面浮动圆形装饰 */
body.page-articles::after {
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
}

/* 文章详情页面背景 */
body.page-article {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 50%, #fa709a 100%);
}

/* 音乐页面背景 */
body.page-music {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

body.dark-mode.page-music {
  background: #1a1a1a;
}

/* 音乐页面隐藏背景装饰 */
.page-music .bg-shape,
.page-music .bg-particle,
.page-music .bg-wave {
  display: none;
}

/* 背景装饰层 */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.2) 0%, transparent 40%);
  animation: background-move 20s ease-in-out infinite;
  z-index: -1;
  pointer-events: none;
  transition: background 3s ease-in-out;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

/* 关于我页面背景装饰层 */
body.page-about::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(240, 147, 251, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(245, 87, 108, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.2) 0%, transparent 40%);
}

/* 文章列表页面背景装饰层 */
body.page-articles::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(79, 172, 254, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 242, 254, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(67, 233, 123, 0.2) 0%, transparent 40%);
}

/* 文章详情页面背景装饰层 */
body.page-article::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(250, 112, 154, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(254, 225, 64, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(250, 112, 154, 0.2) 0%, transparent 40%);
}

@keyframes background-move {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(2%, 2%) rotate(1deg);
  }
  50% {
    transform: translate(-1%, 3%) rotate(-1deg);
  }
  75% {
    transform: translate(3%, -2%) rotate(2deg);
  }
}

/* 浮动圆形装饰 */
body::after {
  content: '';
  position: fixed;
  top: 10%;
  right: 10%;
  width: 300px;
  height: 300px;
  max-width: 100%;
  max-height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  z-index: -1;
  pointer-events: none;
  transition: background 3s ease-in-out;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

/* 关于我页面浮动圆形装饰 */
body.page-about::after {
  background: radial-gradient(circle, rgba(240, 147, 251, 0.15) 0%, transparent 70%);
}

/* 文章列表页面浮动圆形装饰 */
body.page-articles::after {
  background: radial-gradient(circle, rgba(79, 172, 254, 0.15) 0%, transparent 70%);
}

/* 文章详情页面浮动圆形装饰 */
body.page-article::after {
  background: radial-gradient(circle, rgba(250, 112, 154, 0.15) 0%, transparent 70%);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

/* 动态几何图形 */
.bg-shape {
  position: fixed;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  z-index: -1;
  pointer-events: none;
  transition: background 3s ease-in-out;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

/* 首页动态几何图形 */
.page-home .bg-shape {
  background: rgba(240, 147, 251, 0.08);
}

/* 关于我页面动态几何图形 */
.page-about .bg-shape {
  background: rgba(240, 147, 251, 0.08);
}

/* 文章列表页面动态几何图形 */
.page-articles .bg-shape {
  background: rgba(79, 172, 254, 0.08);
}

/* 文章详情页面动态几何图形 */
.page-article .bg-shape {
  background: rgba(250, 112, 154, 0.08);
}

.bg-shape-1 {
  top: 20%;
  left: 15%;
  width: 200px;
  height: 200px;
  animation: float 10s ease-in-out infinite;
  animation-delay: 0s;
}

.bg-shape-2 {
  top: 60%;
  right: 20%;
  width: 150px;
  height: 150px;
  animation: float 12s ease-in-out infinite;
  animation-delay: 2s;
}

.bg-shape-3 {
  bottom: 15%;
  left: 25%;
  width: 180px;
  height: 180px;
  animation: float 14s ease-in-out infinite;
  animation-delay: 4s;
}

.bg-shape-4 {
  top: 30%;
  right: 30%;
  width: 120px;
  height: 120px;
  animation: float 9s ease-in-out infinite;
  animation-delay: 1s;
}

/* 粒子效果 */
.bg-particle {
  position: fixed;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: particle-float 15s linear infinite;
  z-index: -1;
  pointer-events: none;
  transition: background 3s ease-in-out;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 首页粒子效果 */
.page-home .bg-particle {
  background: rgba(240, 147, 251, 0.4);
}

/* 关于我页面粒子效果 */
.page-about .bg-particle {
  background: rgba(240, 147, 251, 0.4);
}

/* 文章列表页面粒子效果 */
.page-articles .bg-particle {
  background: rgba(79, 172, 254, 0.4);
}

/* 文章详情页面粒子效果 */
.page-article .bg-particle {
  background: rgba(250, 112, 154, 0.4);
}

.bg-particle-1 {
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.bg-particle-2 {
  top: 30%;
  left: 80%;
  animation-delay: 3s;
}

.bg-particle-3 {
  top: 70%;
  left: 15%;
  animation-delay: 6s;
}

.bg-particle-4 {
  top: 50%;
  left: 90%;
  animation-delay: 9s;
}

.bg-particle-5 {
  top: 85%;
  left: 60%;
  animation-delay: 12s;
}

@keyframes particle-float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

/* 波浪装饰 */
.bg-wave {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  height: 200px;
  max-height: 200px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(255,255,255,0.05)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
  animation: wave 15s linear infinite;
  z-index: -1;
  pointer-events: none;
  transition: background 3s ease-in-out;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

/* 首页波浪装饰 */
.page-home .bg-wave {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(240,147,251,0.08)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
}

/* 关于我页面波浪装饰 */
.page-about .bg-wave {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(240,147,251,0.08)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
}

/* 文章列表页面波浪装饰 */
.page-articles .bg-wave {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(79,172,254,0.08)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
}

/* 文章详情页面波浪装饰 */
.page-article .bg-wave {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(250,112,154,0.08)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
}

.bg-wave-2 {
  bottom: 20px;
  height: 150px;
  opacity: 0.5;
  animation: wave 20s linear infinite reverse;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 暗黑模式 */
body.dark-mode {
  background: #000000 !important;
  transition: background 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 暗黑模式背景动画 */
body.dark-mode::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.2) 0%, transparent 40%);
  animation: dark-background-move 10s ease-in-out infinite !important;
}

@keyframes dark-background-move {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.8;
  }
  25% {
    transform: translate(5%, 5%) rotate(3deg);
    opacity: 0.9;
  }
  50% {
    transform: translate(-4%, 6%) rotate(-2deg);
    opacity: 0.85;
  }
  75% {
    transform: translate(6%, -5%) rotate(2deg);
    opacity: 0.95;
  }
}

/* 暗黑模式浮动圆形装饰 */
body.dark-mode::after {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  opacity: 0.7;
}

/* 暗黑模式动态几何图形 */
body.dark-mode .bg-shape {
  background: rgba(99, 102, 241, 0.12);
  opacity: 0.8;
}

/* 暗黑模式粒子效果 */
body.dark-mode .bg-particle {
  background: rgba(99, 102, 241, 0.5);
  opacity: 0.9;
}

/* 全局过渡动画 - 主题切换效果 */
* {
  transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  transition: background 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 背景装饰元素的过渡动画 */
.bg-shape,
.bg-particle,
.bg-wave {
  transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1),
              transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 主题切换时的微动画 */
body.dark-mode .bg-shape,
body.dark-mode .bg-particle {
  animation: themeSwitchPulse 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes themeSwitchPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

/* 暗黑模式波浪装饰 */
body.dark-mode .bg-wave {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(99,102,241,0.06)' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
  opacity: 0.5;
}

/* 页面切换过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 全局悬浮音乐按钮 */
.floating-music-btn {
  position: fixed;
  bottom: 80px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  z-index: 9999;
  animation: float 3s ease-in-out infinite;
  transition: all 0.3s ease;
}

.floating-music-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.floating-music-btn svg {
  width: 30px;
  height: 30px;
  color: white;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 暗黑模式下的悬浮音乐按钮 */
body.dark-mode .floating-music-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

body.dark-mode .floating-music-btn:hover {
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-music-btn {
    bottom: 70px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
  
  .floating-music-btn svg {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .floating-music-btn {
    bottom: 60px;
    right: 15px;
    width: 45px;
    height: 45px;
  }
  
  .floating-music-btn svg {
    width: 20px;
    height: 20px;
  }
}
</style>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 20px 24px;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* 美化滚动条 - WebKit */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
   background: linear-gradient(180deg, #00d2ff 0%, #3a7bd5 100%);
   border-radius: 4px;
 }
 
 .main-content::-webkit-scrollbar-thumb:hover {
   background: linear-gradient(180deg, #33e0ff 0%, #5a9fe8 100%);
 }
</style>