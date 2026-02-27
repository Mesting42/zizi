<template>
  <div class="article-list">
    <div class="page-header">
      <h1>文章列表</h1>
      <p class="subtitle">探索我的所有文章</p>
    </div>

    <div class="filters">
      <button
        v-for="category in categories"
        :key="category"
        :class="['filter-btn', { active: selectedCategory === category }]"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <div class="articles">
      <div
        v-for="(article, index) in filteredArticles"
        :key="article.id"
        :class="['card article-item scroll-animate', { visible: isVisible[index] }]"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="article-item-content">
          <h3>{{ article.title }}</h3>
          <p class="excerpt">{{ article.excerpt }}</p>
          <div class="meta">
            <span class="date">{{ article.date }}</span>
            <span class="category">{{ article.category }}</span>
            <span class="read-time">{{ article.readTime }} 分钟阅读</span>
          </div>
          <router-link :to="`/article/${article.id}?fromCategory=${selectedCategory}`" class="read-more">
            阅读更多
          </router-link>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">暂无内容</h3>
        <p class="empty-text">该分类下还没有文章，敬请期待更多精彩内容！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const categories = ref(['全部', '前端开发', 'CSS', 'JavaScript', 'Vue', '后端开发'])
const selectedCategory = ref('全部')
const isVisible = ref([])

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

// 滚动动画观察器
let observer = null

const observeElements = () => {
  const elements = document.querySelectorAll('.scroll-animate')
  isVisible.value = new Array(elements.length).fill(false)

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = Array.from(elements).indexOf(entry.target)
        if (index !== -1) {
          isVisible.value[index] = entry.isIntersecting
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  )

  elements.forEach((el) => observer.observe(el))
}

onMounted(async () => {
  // 从URL参数中读取分类
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }

  await nextTick()
  observeElements()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
<style scoped>
@import '../css/ArticleList.css';
</style>


