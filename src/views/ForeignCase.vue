<template>
  <div class="foreign-case">
    <div class="case-header">
      <h1 class="case-title">响应式国外网站</h1>
      <p class="case-desc">一个现代化的在线学习平台网站，展示了精美的UI设计和流畅的用户体验</p>
      <div class="case-tech">
        <span class="tech-badge">HTML5</span>
        <span class="tech-badge">CSS3</span>
        <span class="tech-badge">响应式设计</span>
        <span class="tech-badge">Flexbox</span>
        <span class="tech-badge">Grid</span>
      </div>
    </div>

    <div class="case-content">
      <div class="case-iframe-container">
        <div class="iframe-header">
          <span class="iframe-title">响应式国外网站</span>
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
          :src="foreignUrl"
          class="case-iframe"
          :class="{ 'fullscreen': isFullscreen }"
          title="响应式国外网站案例"
          frameborder="0"
        ></iframe>
      </div>

      <div class="case-info">
        <h2>项目说明</h2>
        <div class="info-item">
          <h3>项目简介</h3>
          <p>这是一个现代化的在线学习平台网站，采用响应式设计，适配各种设备尺寸。网站展示了精美的UI设计，包含课程展示、教程、直播流等功能模块。</p>
        </div>
        <div class="info-item">
          <h3>技术特点</h3>
          <ul>
            <li>✓ 完全响应式布局，支持桌面、平板、手机</li>
            <li>✓ 使用 Flexbox 和 Grid 布局技术</li>
            <li>✓ 精美的动画效果和过渡动画</li>
            <li>✓ 现代化的配色方案和视觉设计</li>
            <li>✓ 清晰的信息层级和用户体验</li>
          </ul>
        </div>
        <div class="info-item">
          <h3>主要功能</h3>
          <ul>
            <li>课程展示卡片</li>
            <li>多平台技术图标展示</li>
            <li>搜索功能</li>
            <li>移动端适配导航</li>
            <li>评分系统</li>
          </ul>
        </div>
        <div class="info-item">
          <h3>适用场景</h3>
          <p>适合在线教育平台、课程展示网站、学习资源分享平台等场景。</p>
        </div>
      </div>
    </div>

    <div class="case-actions">
      <button @click="goBack" class="btn btn-primary">
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const foreignUrl = ref('/foreign/index.html')
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
@import '../css/ForeignCase.css';
</style>


