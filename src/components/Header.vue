<template>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="logo">
          <router-link to="/">个人博客</router-link>
        </div>
        <ul class="nav-links">
          <li>
            <router-link to="/" active-class="active">首页</router-link>
          </li>
          <li>
            <router-link to="/articles" active-class="active">文章列表</router-link>
          </li>
          <li>
            <router-link to="/music" active-class="active">音乐</router-link>
          </li>
          <li>
            <router-link to="/about" active-class="active">关于我</router-link>
          </li>
          <li>
            <button class="dark-mode-toggle" @click="toggleDarkMode" :aria-label="isDarkMode ? '切换到浅色模式' : '切换到深色模式'">
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
import { ref, onMounted, watch } from 'vue'

const isDarkMode = ref(false)

// 从localStorage读取暗黑模式设置
onMounted(() => {
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode === 'true') {
    isDarkMode.value = true
    document.body.classList.add('dark-mode')
  }
})

// 切换暗黑模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.body.classList.remove('dark-mode')
    localStorage.setItem('darkMode', 'false')
  }
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  max-width: 100vw;
  
  /* iOS液态玻璃效果 */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* 微妙的边框效果 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  
  /* 优化过渡效果，只对需要的属性应用动画 */
  transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;
}

/* 暗黑模式导航栏 */
body.dark-mode .header {
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 暗黑模式滚动时的效果 */
body.dark-mode .header.scrolled {
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 暗黑模式导航链接 */
body.dark-mode .nav-links a {
  color: #ffffff;
}

body.dark-mode .nav-links a:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
}

body.dark-mode .nav-links a.active {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.2);
}

/* 暗黑模式切换按钮 */
body.dark-mode .dark-mode-toggle {
  color: #ffffff;
}

body.dark-mode .dark-mode-toggle:hover {
  background: rgba(99, 102, 241, 0.2);
}

/* 滚动时的效果 */
.header.scrolled {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(25px) saturate(200%);
  -webkit-backdrop-filter: blur(25px) saturate(200%);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  width: 100%;
  max-width: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.logo a:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin: 0;
  width: fit-content;
  max-width: 100%;
}

.nav-links li {
  display: flex;
  align-items: center;
}

.nav-links a {
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: transparent;
  display: inline-block;
  overflow: hidden;
}

.nav-links a:hover {
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.08);
  transform: translateY(-2px);
}

.nav-links a.active {
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.12);
}

/* 添加液态光效 */
.nav-links a::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
  pointer-events: none;
  z-index: -1;
  max-width: 200%;
  max-height: 200%;
}

.nav-links a:hover::before {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .header {
    padding: 0.5rem 0;
  }

  .nav {
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.5rem 0;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .logo a {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
  }

  .nav-links {
    gap: 0.3rem;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    overflow-x: auto;
    white-space: nowrap;
  }

  .nav-links li {
    display: flex;
    align-items: center;
  }

  .nav-links a {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .dark-mode-toggle {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dark-mode-toggle .icon {
    width: 14px;
    height: 14px;
  }
}

/* 针对iPhone 6/7等小屏幕设备的特殊调整 */
@media (max-width: 375px) {
  .nav {
    gap: 0.2rem;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .logo a {
    font-size: 1rem;
    display: flex;
    align-items: center;
  }

  .nav-links {
    align-items: center;
  }

  .nav-links li {
    display: flex;
    align-items: center;
  }

  .nav-links a {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
  }

  .dark-mode-toggle {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dark-mode-toggle .icon {
    width: 12px;
    height: 12px;
  }
}

/* 暗黑模式切换按钮 */
.dark-mode-toggle {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode-toggle:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark-mode-toggle:active {
  transform: scale(0.95);
}

.dark-mode-toggle::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.dark-mode-toggle:hover::before {
  opacity: 0.15;
  transform: scale(1);
}

.dark-mode-toggle .icon {
  width: 22px;
  height: 22px;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode-toggle .sun-icon {
  animation: sunEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode-toggle .moon-icon {
  animation: moonEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes sunEnter {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

@keyframes moonEnter {
  from {
    opacity: 0;
    transform: rotate(90deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}
</style>