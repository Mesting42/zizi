<template>
  <div class="thinking-library">
    <PortfolioHeader />

    <main>
      <header class="thinking-library-hero">
        <div>
          <p>{{ copy.archiveKicker }} / {{ articleArchive.length }} {{ copy.articles }}</p>
          <h1>{{ copy.heroTitle[0] }}<br><span>{{ copy.heroTitle[1] }}</span></h1>
        </div>
        <div class="thinking-library-summary">
          <p>{{ copy.summary }}</p>
          <div>
            <span><b>{{ articleArchive.length }}</b>{{ copy.articleCount }}</span>
            <span><b>{{ categories.length - 1 }}</b>{{ copy.categoryCount }}</span>
            <span><b>{{ totalReadTime }}</b>{{ copy.minutes }}</span>
          </div>
        </div>
      </header>

      <section class="thinking-library-content" aria-labelledby="archive-list-title">
        <div class="thinking-library-toolbar">
          <div>
            <p>{{ copy.knowledgeIndex }}</p>
            <h2 id="archive-list-title">{{ copy.allArticles }}</h2>
          </div>
          <div class="thinking-library-filters" :aria-label="copy.articleCategories">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              :class="{ active: selectedCategory === category }"
              @click="selectedCategory = category"
            >{{ categoryLabel(category) }} <span>{{ categoryCount(category) }}</span></button>
          </div>
        </div>

        <div class="thinking-library-list">
          <router-link
            v-for="(article, index) in localizedFilteredArticles"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="thinking-library-row"
            :aria-label="`${copy.openArticle}: ${article.title}`"
          >
            <span class="thinking-library-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="thinking-library-copy">
              <p>{{ article.category }} · {{ article.date }}</p>
              <h3>{{ article.title }}</h3>
              <span>{{ article.excerpt }}</span>
            </div>
            <div class="thinking-library-meta">
              <span>{{ article.readTime }} {{ copy.minRead }}</span>
              <i>↗</i>
            </div>
          </router-link>
        </div>

        <div v-if="filteredArticles.length === 0" class="thinking-library-empty">
          <span>{{ copy.empty }}</span>
          <button type="button" @click="selectedCategory = '全部'">{{ copy.viewAll }}</button>
        </div>
      </section>
    </main>

    <footer class="thinking-library-footer">
      <router-link :to="{ path: '/', hash: '#thinking-archive' }">{{ copy.backHome }} <span>↖</span></router-link>
      <span>Mesting / Thinking Archive / 2026</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PortfolioHeader from '../components/PortfolioHeader.vue'
import { useArticles } from '../utils/articlesStore'
import { useLocale } from '../composables/useLocale'
import {
  articleCategoryTranslations as categoryTranslations,
  localizeArticle
} from '../utils/articleTranslations'

const { articles } = useArticles()
const { isChinese } = useLocale()
const selectedCategory = ref('全部')
const copy = computed(() => isChinese.value
  ? {
      archiveKicker: '思考档案',
      articles: '篇文章',
      heroTitle: ['思考不是结论，', '而是一条仍在延伸的路径。'],
      summary: '把学习记录、项目经验与还在形成的判断留在这里。它们不需要同时出现在首页，但始终可以被重新打开。',
      articleCount: '篇文章',
      categoryCount: '个方向',
      minutes: '分钟',
      knowledgeIndex: '知识索引',
      allArticles: '全部文章',
      articleCategories: '文章分类',
      minRead: '分钟阅读',
      openArticle: '打开文章',
      empty: '当前分类还没有文章。',
      viewAll: '查看全部',
      backHome: '返回首页'
    }
  : {
      archiveKicker: 'THINKING ARCHIVE',
      articles: 'ARTICLES',
      heroTitle: ['Thinking is not a conclusion,', 'but a path that keeps unfolding.'],
      summary: 'Learning notes, project experience, and ideas still taking shape live here. They do not need to appear on the homepage at once, but they can always be reopened.',
      articleCount: ' articles',
      categoryCount: ' directions',
      minutes: ' minutes',
      knowledgeIndex: 'KNOWLEDGE INDEX',
      allArticles: 'All Articles',
      articleCategories: 'Article categories',
      minRead: 'MIN READ',
      openArticle: 'Open article',
      empty: 'There are no articles in this category yet.',
      viewAll: 'View All',
      backHome: 'Back Home'
    })

const categoryLabel = category => (
  isChinese.value ? category : (categoryTranslations[category] || category)
)

const articleArchive = computed(() => [...articles.value]
  .sort((a, b) => (a.order || a.id || 0) - (b.order || b.id || 0)))

const categories = computed(() => [
  '全部',
  ...new Set(articleArchive.value.map(article => article.category).filter(Boolean))
])

const filteredArticles = computed(() => {
  if (selectedCategory.value === '全部') return articleArchive.value
  return articleArchive.value.filter(article => article.category === selectedCategory.value)
})

const localizedFilteredArticles = computed(() => filteredArticles.value
  .map(article => localizeArticle(article, isChinese.value)))

const totalReadTime = computed(() => articleArchive.value
  .reduce((total, article) => total + Number(article.readTime || 0), 0))

const categoryCount = (category) => {
  if (category === '全部') return articleArchive.value.length
  return articleArchive.value.filter(article => article.category === category).length
}
</script>

<style>
@import '../css/ArticleArchive.css';
</style>
