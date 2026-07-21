<template>
  <div class="article-list">
    <div class="page-header">
      <div class="header-copy">
        <span class="header-kicker">Inspiration Lab</span>
        <h1>灵感实验室</h1>
        <p class="subtitle">不把页面当作静态的文章目录，而是把零散的想法、正在试验的体验和可复用的记录放在同一个创作现场。</p>
      </div>
      <div class="header-stats" aria-label="文章概览">
        <div class="stat-item">
          <strong>{{ articles.length }}</strong>
          <span>份档案</span>
        </div>
        <div class="stat-item">
          <strong>{{ categories.length - 1 }}</strong>
          <span>个方向</span>
        </div>
        <div class="stat-item">
          <strong>{{ totalReadTime }}</strong>
          <span>分钟阅读</span>
        </div>
      </div>
    </div>

    <section class="inspiration-lab" aria-label="灵感实验室">
      <div class="inspiration-spotlight">
        <span class="inspiration-eyebrow">{{ activeInspiration.eyebrow }}</span>
        <h2>{{ activeInspiration.title }}</h2>
        <p>{{ activeInspiration.description }}</p>
        <div class="inspiration-tags">
          <span v-for="tag in activeInspiration.tags" :key="tag">{{ tag }}</span>
        </div>
        <button type="button" class="inspiration-shuffle" @click="shuffleInspiration">
          <span>换一条灵感</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"/>
          </svg>
        </button>
      </div>

      <div class="inspiration-orbit" aria-hidden="true">
        <span class="inspiration-orbit-number">0{{ inspirationIndex + 1 }}</span>
        <span class="inspiration-orbit-core">M</span>
        <i class="inspiration-orbit-ring inspiration-orbit-ring-a"></i>
        <i class="inspiration-orbit-ring inspiration-orbit-ring-b"></i>
        <i class="inspiration-orbit-signal inspiration-orbit-signal-a"></i>
        <i class="inspiration-orbit-signal inspiration-orbit-signal-b"></i>
      </div>

      <div class="inspiration-notes">
        <article>
          <span>01 / CAPTURE</span>
          <strong>灵感收集器</strong>
          <p>把一句话、一个镜头或一次交互瞬间，留成下一次创作的起点。</p>
        </article>
        <article>
          <span>02 / MAKE</span>
          <strong>正在制作</strong>
          <p>把页面从“能用”继续推向“有感受”，持续更新正在尝试的设计。</p>
        </article>
        <article>
          <span>03 / PLAY</span>
          <strong>今日声音</strong>
          <p>音乐页面里正在播放的旋律，也可以成为一段新的视觉情绪。</p>
        </article>
      </div>
    </section>

    <div class="archive-heading">
      <div>
        <span>KNOWLEDGE ARCHIVE</span>
        <h2>把有用的思考留在这里</h2>
      </div>
      <p>原有文章仍然保留成可检索的知识档案；不需要读完整篇，也能快速找到曾经做过的判断与方法。</p>
    </div>

    <div class="filters" aria-label="文章分类">
      <button
        v-for="category in categories"
        :key="category"
        :class="['filter-btn', { active: selectedCategory === category }]"
        @click="selectedCategory = category"
      >
        <span>{{ category }}</span>
        <small>{{ getCategoryCount(category) }}</small>
      </button>
    </div>

    <div class="list-toolbar">
      <div>
        <span class="current-filter">当前筛选 · {{ selectedCategory }}</span>
        <p>{{ selectedSummary }}</p>
      </div>
      <span class="article-count">{{ filteredArticles.length }} 篇</span>
    </div>

    <div class="articles">
      <BorderGlow
        v-for="(article, index) in filteredArticles"
        :key="article.id"
        tag="article"
        v-bind="cardGlowProps"
        :class-name="getArticleItemClass()"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="article-item-content">
          <div class="article-topline">
            <span class="article-number">{{ formatIndex(index) }}</span>
            <span :class="['category', `category-${getCategoryTone(article.category)}`]">{{ article.category }}</span>
          </div>
          <h3>{{ article.title }}</h3>
          <p class="excerpt">{{ article.excerpt }}</p>
          <div class="meta">
            <span class="date">{{ article.date }}</span>
            <span class="read-time">{{ article.readTime }} 分钟阅读</span>
          </div>
          <router-link :to="`/article/${article.id}?fromCategory=${selectedCategory}`" class="read-more">
            <span>阅读全文</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </BorderGlow>

      <!-- 空状态提示 -->
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">暂无内容</h3>
        <p class="empty-text">该分类下还没有文章，敬请期待更多精彩内容！</p>
        <button
          v-if="selectedCategory !== '全部'"
          type="button"
          class="empty-action"
          @click="openCreateArticle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>新增文章</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BorderGlow from '../components/BorderGlow.vue'
import { cardGlowProps } from '../config/cardGlow.js'

const route = useRoute()
const router = useRouter()
const categories = ref(['全部', '前端开发', 'CSS', 'JavaScript', 'Vue', '后端开发'])
const selectedCategory = ref('全部')
const inspirationIndex = ref(0)

const inspirations = [
  {
    eyebrow: 'TODAY / SIGNAL 01',
    title: '把一个普通页面，做成会呼吸的体验。',
    description: '从节奏、留白到互动反馈，每个微小变化都能让页面更像一个正在发生的空间。',
    tags: ['视觉节奏', '微动效', '体验叙事']
  },
  {
    eyebrow: 'TODAY / SIGNAL 02',
    title: '把收藏夹，变成下一次创作的燃料。',
    description: '不用急着把灵感归类；先让它们以图像、声音和一句短句的方式停留在这里。',
    tags: ['灵感采样', '情绪板', '持续迭代']
  },
  {
    eyebrow: 'TODAY / SIGNAL 03',
    title: '好的作品，会留下一点想再回来看的理由。',
    description: '比起堆叠信息，更在意每次回到页面时，是否还能发现一处新的细节。',
    tags: ['细节打磨', '交互温度', '数字档案']
  }
]

const activeInspiration = computed(() => inspirations[inspirationIndex.value])

const shuffleInspiration = () => {
  inspirationIndex.value = (inspirationIndex.value + 1) % inspirations.length
}

const articles = ref([
  {
    id: 1,
    title: 'Vue3 Composition API 完全指南',
    excerpt: '深入了解 Vue3 的 Composition API，掌握响应式编程的核心概念，包括 ref、reactive、computed 等重要特性。',
    date: '2024-01-15',
    category: 'Vue',
    readTime: 10
  },
  {
    id: 2,
    title: '现代 CSS 技巧与实践',
    excerpt: '探索 CSS 的新特性，学习如何构建现代化的网页布局，包括 Grid、Flexbox 和 CSS 变量等。',
    date: '2024-01-10',
    category: 'CSS',
    readTime: 8
  },
  {
    id: 3,
    title: 'JavaScript 异步编程详解',
    excerpt: '从 Promise 到 Async/Await，全面掌握 JavaScript 异步编程，理解事件循环机制。',
    date: '2024-01-05',
    category: 'JavaScript',
    readTime: 12
  },
  {
    id: 4,
    title: 'Vue Router 路由管理最佳实践',
    excerpt: '学习如何在 Vue3 项目中配置和使用 Vue Router，掌握路由守卫、动态路由等高级功能。',
    date: '2024-01-01',
    category: 'Vue',
    readTime: 7
  },
  {
    id: 5,
    title: 'CSS 动画与过渡效果',
    excerpt: '掌握 CSS 动画和过渡效果，创建流畅的用户界面交互体验。',
    date: '2023-12-28',
    category: 'CSS',
    readTime: 6
  },
  {
    id: 6,
    title: 'JavaScript ES6+ 新特性总结',
    excerpt: '全面了解 JavaScript ES6 及后续版本的新特性，提升代码质量和开发效率。',
    date: '2023-12-20',
    category: 'JavaScript',
    readTime: 15
  }
])

const filteredArticles = computed(() => {
  if (selectedCategory.value === '全部') {
    return articles.value
  }
  return articles.value.filter(article => article.category === selectedCategory.value)
})

const totalReadTime = computed(() => articles.value.reduce((total, article) => total + article.readTime, 0))

const selectedSummary = computed(() => {
  if (selectedCategory.value === '全部') {
    return '从框架实践到 CSS 动效，把近期的学习笔记和项目经验收在这里。'
  }
  if (filteredArticles.value.length === 0) {
    return `当前 ${selectedCategory.value} 分类还没有文章，可以直接新建一篇。`
  }
  return `聚焦 ${selectedCategory.value} 方向的文章，适合快速回顾相关知识点。`
})

const getCategoryCount = (category) => {
  if (category === '全部') return articles.value.length
  return articles.value.filter(article => article.category === category).length
}

const getCategoryTone = (category) => {
  const tones = {
    Vue: 'vue',
    CSS: 'css',
    JavaScript: 'javascript',
    前端开发: 'frontend',
    后端开发: 'backend'
  }
  return tones[category] || 'default'
}

const formatIndex = (index) => String(index + 1).padStart(2, '0')

const getArticleItemClass = () => 'article-item'

const openCreateArticle = () => {
  if (selectedCategory.value === '全部') return

  router.push({
    name: 'Category',
    params: { name: selectedCategory.value },
    query: { create: '1' }
  })
}

onMounted(() => {
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
})
</script>
<style scoped>
@import '../css/ArticleList.css';
</style>
