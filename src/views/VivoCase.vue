<template>
  <div class="vivo-case">
    <div class="case-header">
      <h1 class="case-title">Vivo响应式网站案例</h1>
      <p class="case-desc">这是一个完整的响应式网页设计项目，展示了现代前端开发技术</p>
      <div class="case-tech">
        <span class="tech-badge">HTML5</span>
        <span class="tech-badge">CSS3</span>
        <span class="tech-badge">响应式设计</span>
        <span class="tech-badge">Flexbox</span>
      </div>
    </div>

    <div class="case-content">
      <div class="case-iframe-container">
        <div class="iframe-header">
          <span class="iframe-title">Vivo响应式网站</span>
          <button @click="toggleFullscreen" class="fullscreen-btn" :title="isFullscreen ? '退出全屏' : '全屏查看'">
            <svg v-if="!isFullscreen" class="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <svg v-else class="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </button>
        </div>
        <iframe 
          ref="iframeRef"
          :src="vivoUrl" 
          class="case-iframe"
          :class="{ 'fullscreen': isFullscreen }"
          title="Vivo响应式网站案例"
          frameborder="0"
        ></iframe>
      </div>

      <div class="case-info">
        <h2>项目说明</h2>
        <div class="info-item">
          <h3>📱 响应式设计</h3>
          <p>完美适配桌面端、平板和移动设备，提供一致的用户体验</p>
        </div>
        <div class="info-item">
          <h3>🎨 现代UI设计</h3>
          <p>采用简洁大气的设计风格，注重用户体验和视觉层次</p>
        </div>
        <div class="info-item">
          <h3>⚡ 性能优化</h3>
          <p>优化加载速度，使用CSS动画和过渡效果提升交互体验</p>
        </div>
        <div class="info-item">
          <h3>🔧 技术栈</h3>
          <ul>
            <li>HTML5 语义化标签</li>
            <li>CSS3 Flexbox 布局</li>
            <li>媒体查询实现响应式</li>
            <li>CSS 动画和过渡效果</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="case-actions">
      <button @click="goBack" class="btn btn-secondary">返回首页</button>
      <a href="https://github.com" target="_blank" class="btn btn-primary">
        查看源码
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const vivoUrl = ref('/vivo/index.html')
const isFullscreen = ref(false)
const iframeRef = ref(null)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    // 进入全屏模式
    if (iframeRef.value && iframeRef.value.requestFullscreen) {
      iframeRef.value.requestFullscreen()
    }
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  } else {
    // 退出全屏模式
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }
}

const handleFullscreenChange = () => {
  // 如果用户按ESC退出全屏，同步状态
  if (!document.fullscreenElement && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  // 不再设置body背景色，让App.vue统一管理背景样式
})

onUnmounted(() => {
  // 不再清除body背景样式，让App.vue统一管理背景样式
  // 清理全屏事件监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // 如果处于全屏状态，退出全屏
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
})

const goBack = () => {
  router.push('/')
}
</script>
<style scoped>
@import '../css/VivoCase.css';
</style>


