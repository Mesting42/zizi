<template>
  <div class="home">
    <!-- ① 顶部介绍模块 - 采用不对称布局 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-greeting">Hi，我是</h1>
          <h2 class="hero-name">Mesting</h2>
          <p class="hero-role">前端实习生 · Vue 学习者 · 技术分享者</p>
          <p class="hero-desc">热爱前端开发，专注于 Vue3 生态和现代 Web 技术。在这里记录我的学习历程，分享技术心得和实践经验，与大家共同成长进步。我相信持续学习和分享是成长的必经之路。</p>
          <div class="hero-buttons">
            <router-link to="/about" class="btn btn-primary">
              <span>了解我</span>
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
            <a href="https://github.com" target="_blank" class="btn btn-outline">
              <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
        <div class="hero-decoration">
          <div class="decoration-circle decoration-1"></div>
          <div class="decoration-circle decoration-2"></div>
          <div class="decoration-circle decoration-3"></div>
        </div>
      </div>
    </section>

    <!-- 主要内容区域 - 采用网格布局 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="content-left">
        <!-- ② 最新文章模块 -->
        <section class="articles-section">
          <div class="section-header">
            <h2 class="section-title">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              最新文章
            </h2>
            <router-link to="/articles" class="view-all">全部 →</router-link>
          </div>
          <div class="article-grid">
            <div v-for="article in articles.slice(0, 3)" :key="article.id" class="article-card">
              <div class="article-number">{{ article.id }}</div>
              <div class="article-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.excerpt }}</p>
                <div class="article-meta">
                  <span class="article-date">{{ article.date }}</span>
                  <span class="article-category">{{ article.category }}</span>
                </div>
              </div>
              <router-link :to="`/article/${article.id}`" class="article-link">
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>
        </section>

        <!-- ②.5 项目案例模块 -->
        <section class="projects-section">
          <div class="section-header">
            <h2 class="section-title">
              <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              项目案例
            </h2>
            <router-link to="/articles" class="view-all">查看全部 →</router-link>
          </div>
          <div class="projects-grid">
            <div class="project-card">
              <div class="project-image">
                <div class="project-icon">📱</div>
              </div>
              <div class="project-info">
                <h3 class="project-title">Vivo响应式网站</h3>
                <p class="project-desc">采用语义化 HTML5 结构和 CSS3 高级特性，实现流畅的动画效果和多端适配，完整还原品牌视觉风格。</p>
                <div class="project-tags">
                  <span class="project-tag">HTML5</span>
                  <span class="project-tag">CSS3</span>
                  <span class="project-tag">响应式</span>
                </div>
              </div>
              <router-link to="/vivo-case" class="project-link">
                查看案例
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
            <div class="project-card">
              <div class="project-image">
                <div class="project-icon">🌍</div>
              </div>
              <div class="project-info">
                <h3 class="project-title">响应式国外网站</h3>
                <p class="project-desc">一个现代化的在线学习平台网站，采用响应式设计，适配各种设备尺寸，展示精美的UI设计和流畅的用户体验。</p>
                <div class="project-tags">
                  <span class="project-tag">HTML5</span>
                  <span class="project-tag">CSS3</span>
                  <span class="project-tag">Flexbox</span>
                  <span class="project-tag">Grid</span>
                </div>
              </div>
              <router-link to="/foreign-case" class="project-link">
                查看案例
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧边栏 -->
      <div class="content-right">
        <!-- ③ 技术方向模块 -->
        <section class="tech-section">
          <h2 class="section-title-small">
            <svg class="section-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            技术栈
          </h2>
          <p class="tech-desc">专注于现代前端技术栈，持续学习与实践</p>
          <div class="tech-tags">
            <router-link v-for="tech in techStack" :key="tech.name" :to="`/category/${tech.name}`" class="tech-tag">
              <span class="tech-icon">{{ tech.icon }}</span>
              <span class="tech-name">{{ tech.name }}</span>
            </router-link>
          </div>
        </section>

        <!-- ④ 关于本站模块 -->
        <section class="about-site-section">
          <h2 class="section-title-small">
            <svg class="section-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            关于本站
          </h2>
          <p class="site-desc">
            这里是我记录个人前端学习历程的地方，使用 Vue3 + Vite 技术栈构建。我致力于分享实用的技术心得和开发经验，记录每一个成长瞬间。无论是基础知识的积累，还是项目实践的总结，都希望能为同样在学习路上的你提供一些参考和启发。
          </p>
          <div class="site-tech">
            <span class="tech-badge">Vue3</span>
            <span class="tech-badge">Vite</span>
            <span class="tech-badge">CSS3</span>
          </div>
        </section>

        <!-- 快速导航 -->
        <section class="quick-nav">
          <h2 class="section-title-small">
            <svg class="section-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            快速导航
          </h2>
          <div class="nav-links">
            <router-link to="/articles" class="nav-link">
              <span class="nav-icon">📝</span>
              <span class="nav-text">全部文章</span>
            </router-link>
            <router-link to="/about" class="nav-link">
              <span class="nav-icon">👤</span>
              <span class="nav-text">关于我</span>
            </router-link>
            <router-link to="/vivo-case" class="nav-link">
              <span class="nav-icon">🚀</span>
              <span class="nav-text">项目案例</span>
            </router-link>
          </div>
        </section>

        <!-- 联系方式 -->
        <section class="contact-section">
          <h2 class="section-title-small">
            <svg class="section-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            联系方式
          </h2>
          <p class="contact-desc">欢迎与我交流，共同学习进步</p>
          <div class="contact-links">
            <a href="https://github.com" target="_blank" class="contact-link">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="contact-text">GitHub</span>
            </a>
            <a href="mailto:example@email.com" class="contact-link">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span class="contact-text">Email</span>
            </a>
            <a href="https://twitter.com" target="_blank" class="contact-link">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span class="contact-text">Twitter</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const articles = ref([
  {
    id: 1,
    title: 'Vue3 Composition API 完全指南',
    excerpt: '深入了解 Vue3 的 Composition API，从 setup 函数、ref、reactive 到 computed、watch，全面掌握响应式编程的核心概念。通过实际案例演示如何组织代码逻辑，提升代码的可维护性和复用性。',
    date: '2024-01-15',
    category: 'Vue'
  },
  {
    id: 2,
    title: '现代 CSS 技巧与实践',
    excerpt: '探索 CSS 的最新特性，包括 Flexbox、Grid 布局、CSS 变量、动画和过渡效果。学习如何构建现代化的网页布局，掌握响应式设计的最佳实践，打造美观且高性能的用户界面。',
    date: '2024-01-10',
    category: 'CSS'
  },
  {
    id: 3,
    title: 'JavaScript 异步编程详解',
    excerpt: '从回调函数到 Promise，再到 Async/Await 语法糖，全面掌握 JavaScript 异步编程的演进历程。深入理解事件循环机制，学会处理复杂的异步场景，编写更优雅的异步代码。',
    date: '2024-01-05',
    category: 'JavaScript'
  },
  {
    id: 4,
    title: '前端性能优化实战',
    excerpt: '从资源加载优化、代码分割、懒加载到渲染性能优化，全方位提升用户体验。学习使用 Chrome DevTools 进行性能分析，掌握关键性能指标（KPI）的优化策略，让网页飞起来。',
    date: '2024-01-02',
    category: '性能优化'
  },
  {
    id: 5,
    title: 'Vite 构建工具深入浅出',
    excerpt: '了解 Vite 的核心原理，基于 ES Modules 的极速开发服务器和 Rollup 的高效打包。对比传统构建工具的优势，学习插件系统、环境配置和部署优化，大幅提升开发效率和构建速度。',
    date: '2023-12-28',
    category: '工具'
  }
])

const techStack = ref([
  { name: 'Vue', icon: '⚡' },
  { name: 'JavaScript', icon: '📜' },
  { name: 'CSS', icon: '🎨' },
  { name: '学习记录', icon: '📚' }
])

// 组件挂载时不设置body背景，由App.vue统一管理
onMounted(() => {
  // 不再设置body背景样式，让App.vue统一管理
})

// 组件卸载时不恢复body背景，让App.vue统一管理
onUnmounted(() => {
  // 不再清除body背景样式
})
</script>
<style scoped>
@import '../css/Home.css';
</style>


