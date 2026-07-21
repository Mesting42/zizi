<template>
  <div ref="homeRoot" class="home home-v2 home-motion motion-scroll-pending">
    <div class="home-opening-curtain" aria-hidden="true"></div>

    <section class="hero home-hero" aria-labelledby="home-title">
      <HomeTechCanvas />
      <div class="hero-noise" aria-hidden="true"></div>
      <div class="hero-scanline" aria-hidden="true"></div>

      <div class="hero-layout">
        <div class="hero-copy">
          <p class="hero-kicker motion-hero-eyebrow" data-hero-reveal>
            <span class="hero-kicker-dot"></span>
            DIGITAL ATELIER · {{ currentYear }}
          </p>

          <h1 id="home-title" class="hero-title">
            <span class="hero-title-mask">
              <span class="hero-title-inner">Mesting</span>
            </span>
          </h1>

          <p class="hero-role motion-hero-role" data-hero-reveal>
            <span>Design.</span>
            <span>Code.</span>
            <span>Music.</span>
          </p>

          <p class="hero-desc motion-hero-desc" data-hero-reveal>
            用代码构建有情绪、有细节的数字体验。这里不只是文章目录，
            也是我持续生长的作品、音乐与想法档案。
          </p>

          <div class="hero-actions" data-hero-reveal>
            <a href="#selected-work" class="hero-action hero-action-primary motion-hero-action">
              <span>查看精选作品</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <router-link to="/about" class="hero-action hero-action-secondary motion-hero-action">
              进入个人档案
            </router-link>
          </div>

          <div class="hero-availability" data-hero-reveal>
            <span class="availability-pulse"></span>
            <span>个人博客持续更新中</span>
            <span class="availability-divider"></span>
            <span>{{ currentTimeLabel }}</span>
          </div>
        </div>

        <div class="hero-visual motion-hero-panel motion-hero-parallax" aria-hidden="true">
          <div class="hero-orbit hero-orbit-outer"></div>
          <div class="hero-orbit hero-orbit-middle"></div>
          <div class="hero-orbit hero-orbit-inner"></div>
          <div class="hero-core">
            <span class="hero-core-label">M</span>
            <span class="hero-core-ring"></span>
          </div>
          <span class="orbit-node orbit-node-one"></span>
          <span class="orbit-node orbit-node-two"></span>
          <span class="orbit-node orbit-node-three"></span>
          <div class="hero-coordinate hero-coordinate-top">31.2304° N</div>
          <div class="hero-coordinate hero-coordinate-bottom">121.4737° E</div>
        </div>

        <div class="hero-status-panel motion-hero-panel-item" data-hero-reveal>
          <div class="hero-status-head">
            <span>LIVE SIGNAL</span>
            <span class="hero-status-bars"><i></i><i></i><i></i><i></i></span>
          </div>
          <strong>正在构建更完整的个人数字空间</strong>
          <p>Vue 3 · Motion System · Music Experience</p>
          <div class="hero-status-progress"><span></span></div>
        </div>
      </div>

      <a href="#selected-work" class="hero-scroll" aria-label="向下浏览精选作品">
        <span>SCROLL TO EXPLORE</span>
        <i></i>
      </a>
    </section>

    <div class="home-signal-strip" aria-hidden="true">
      <div class="home-signal-track">
        <span v-for="(signal, index) in homeSignalsLoop" :key="`${signal}-${index}`">
          {{ signal }}
          <i></i>
        </span>
      </div>
    </div>

    <main class="home-content">
      <div class="home-content-atmosphere" aria-hidden="true">
        <span class="home-atmosphere-orb home-atmosphere-orb-a"></span>
        <span class="home-atmosphere-orb home-atmosphere-orb-b"></span>
        <span class="home-atmosphere-orb home-atmosphere-orb-c"></span>
        <span class="home-atmosphere-scan"></span>
        <span class="home-atmosphere-marker home-atmosphere-marker-a">01 / WORK</span>
        <span class="home-atmosphere-marker home-atmosphere-marker-b">MESTING / ARCHIVE</span>
      </div>
      <aside class="home-side-rail home-side-rail-left" aria-hidden="true">
        <div class="home-side-rail-inner">
          <small>PROJECT INDEX</small>
          <span v-for="chapter in homeChapters" :key="chapter.number">
            <b>{{ chapter.number }}</b>{{ chapter.label }}
          </span>
        </div>
      </aside>

      <aside class="home-side-rail home-side-rail-right" aria-hidden="true">
        <div class="home-side-rail-inner">
          <small>LOCAL / SHANGHAI</small>
          <strong>{{ currentTimeLabel }}</strong>
          <span><i></i> SITE ONLINE</span>
        </div>
      </aside>

      <section id="selected-work" class="home-section selected-work motion-section">
        <span class="section-watermark" aria-hidden="true">01</span>
        <div class="section-heading">
          <div>
            <p class="section-index motion-section-eyebrow">01 / SELECTED WORK</p>
            <h2 class="motion-section-title">把想法做成<br>可以触摸的体验</h2>
          </div>
          <p class="section-lead motion-section-link">
            不只展示结果，也保留设计、尝试和迭代的过程。
          </p>
        </div>

        <article class="featured-project motion-stagger-item">
          <div class="featured-project-media motion-image-reveal">
            <img src="/vivo/img/banner2.jpg" alt="Vivo 响应式网站案例界面" />
            <div class="featured-project-screen">
              <span>FEATURED / 01</span>
              <strong>Responsive<br>Experience</strong>
            </div>
            <span class="media-corner media-corner-top"></span>
            <span class="media-corner media-corner-bottom"></span>
          </div>
          <div class="featured-project-copy">
            <p class="project-type">WEB DESIGN · FRONTEND</p>
            <h3>Vivo 响应式品牌站</h3>
            <p>
              从视觉还原、响应式布局到交互动效，重新组织品牌信息的浏览节奏，
              让页面在不同设备中依然保持完整的视觉表达。
            </p>
            <div class="project-facts">
              <span><small>ROLE</small>设计与开发</span>
              <span><small>STACK</small>HTML · CSS · JS</span>
              <span><small>YEAR</small>2024</span>
            </div>
            <router-link to="/vivo-case" class="text-link">
              查看完整案例
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </router-link>
          </div>
        </article>

        <div class="project-pair">
          <router-link to="/foreign-case" class="project-teaser project-teaser-visual motion-stagger-item">
            <img src="/foreign/img/pic4.png" alt="国外响应式站点案例" class="motion-image-reveal" />
            <span class="project-teaser-number">02</span>
            <div>
              <small>UI SYSTEM</small>
              <strong>国外响应式站点</strong>
            </div>
          </router-link>

          <router-link to="/music" class="project-teaser project-teaser-music motion-stagger-item">
            <div class="sound-wave" aria-hidden="true">
              <i v-for="index in 18" :key="index" :style="{ '--wave-index': index }"></i>
            </div>
            <span class="project-teaser-number">03</span>
            <div>
              <small>IMMERSIVE MODULE</small>
              <strong>音乐空间体验</strong>
            </div>
          </router-link>
        </div>

        <div class="home-capability-rail motion-stagger-item">
          <div class="capability-rail-intro">
            <small>CRAFT SYSTEM / 2026</small>
            <strong>从视觉到交互，保持同一种表达。</strong>
          </div>
          <article v-for="(capability, index) in homeCapabilities" :key="capability.title">
            <span>0{{ index + 1 }}</span>
            <div>
              <strong>{{ capability.title }}</strong>
              <small>{{ capability.detail }}</small>
            </div>
            <i aria-hidden="true"></i>
          </article>
        </div>
      </section>

      <section class="home-section latest-thinking motion-section">
        <span class="section-watermark" aria-hidden="true">02</span>
        <div class="section-heading section-heading-compact">
          <div>
            <p class="section-index motion-section-eyebrow">02 / LATEST THINKING</p>
            <h2 class="motion-section-title">最近写下的想法</h2>
          </div>
          <router-link to="/articles" class="text-link motion-section-link">
            查看全部文章
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </router-link>
        </div>

        <div class="article-ledger">
          <router-link
            v-for="(article, index) in articles.slice(0, 3)"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="ledger-row motion-stagger-item"
          >
            <span class="ledger-number">0{{ index + 1 }}</span>
            <span class="ledger-category">{{ article.category }}</span>
            <span class="ledger-title">{{ article.title }}</span>
            <span class="ledger-date">{{ article.date }}</span>
            <span class="ledger-arrow" aria-hidden="true">↗</span>
          </router-link>
        </div>
      </section>

      <section class="music-portal motion-section">
        <span class="section-watermark section-watermark-light" aria-hidden="true">03</span>
        <div class="music-portal-backdrop" aria-hidden="true"></div>
        <div class="music-portal-copy">
          <p class="section-index motion-section-eyebrow">03 / MUSIC SPACE</p>
          <h2 class="motion-section-title">让旋律成为<br>网站的另一条叙事线</h2>
          <p class="motion-stagger-item">
            从歌单、歌词到主题背景，这里是一块可以随心情切换的声音空间。
          </p>
          <router-link to="/music" class="music-portal-action motion-stagger-item">
            进入音乐空间
            <span>↗</span>
          </router-link>
        </div>

        <div class="music-now motion-stagger-item">
          <div class="music-vinyl" :class="{ 'is-playing': isPlaying }">
            <img :src="activeSong.cover" :alt="`${activeSong.name}封面`" />
          </div>
          <div class="music-now-copy">
            <small>NOW IN PLAYER</small>
            <strong>{{ activeSong.name }}</strong>
            <span>{{ activeSong.artist }}</span>
          </div>
          <div class="music-equalizer" :class="{ 'is-playing': isPlaying }" aria-hidden="true">
            <i></i><i></i><i></i><i></i><i></i>
          </div>
        </div>
      </section>

      <section class="home-section digital-archive motion-section">
        <span class="section-watermark" aria-hidden="true">04</span>
        <div class="section-heading section-heading-compact">
          <div>
            <p class="section-index motion-section-eyebrow">04 / DIGITAL ARCHIVE</p>
            <h2 class="motion-section-title">一份正在更新的<br>个人数字档案</h2>
          </div>
          <p class="section-lead motion-section-link">代码、文章和音乐共同构成这里。</p>
        </div>

        <div class="archive-grid">
          <article class="archive-card archive-card-large motion-stagger-item">
            <span class="archive-card-label">LOCAL TIME</span>
            <strong>{{ currentTimeLabel }}</strong>
            <p>Asia / Shanghai</p>
            <div class="archive-clock-lines" aria-hidden="true"><i></i><i></i><i></i></div>
          </article>

          <article class="archive-card motion-stagger-item">
            <span class="archive-card-label">ARTICLES</span>
            <strong>{{ articles.length.toString().padStart(2, '0') }}</strong>
            <p>持续记录与整理</p>
          </article>

          <article class="archive-card motion-stagger-item">
            <span class="archive-card-label">CURRENT FOCUS</span>
            <strong class="archive-card-word">体验细节</strong>
            <p>Motion · UI · Music</p>
          </article>

          <article class="archive-card archive-card-stack motion-stagger-item">
            <span class="archive-card-label">TOOLKIT</span>
            <div class="archive-tags">
              <span v-for="tech in techStack" :key="tech">{{ tech }}</span>
            </div>
          </article>

          <article class="archive-card archive-card-contact motion-stagger-item">
            <span class="archive-card-label">LET'S CONNECT</span>
            <strong class="archive-card-word">保持联系</strong>
            <div class="archive-contact-links">
              <a href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="mailto:contact@mesting.com">Email ↗</a>
              <router-link to="/about">About ↗</router-link>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import HomeTechCanvas from '../components/HomeTechCanvas.vue'
import { useHomeMotion } from '../composables/useHomeMotion'
import { usePlayer } from '../composables/usePlayer'

const homeRoot = ref(null)
const clock = ref(new Date())
const currentYear = new Date().getFullYear()
const { currentSong, isPlaying } = usePlayer()

const articles = ref([
  {
    id: 1,
    title: 'Vue3 Composition API 完全指南',
    excerpt: '深入了解 Vue3 的 Composition API，从 setup 函数到响应式编程。',
    date: '2024-01-15',
    category: 'Vue'
  },
  {
    id: 2,
    title: '现代 CSS 技巧与实践',
    excerpt: '探索 Grid、Flexbox、CSS 变量和动画的组合方式。',
    date: '2024-01-10',
    category: 'CSS'
  },
  {
    id: 3,
    title: 'JavaScript 异步编程详解',
    excerpt: '从 Promise 到 Async/Await，梳理异步控制流与事件循环。',
    date: '2024-01-05',
    category: 'JavaScript'
  },
  {
    id: 4,
    title: '前端性能优化实战',
    excerpt: '从资源加载、拆包到渲染优化，建立完整的性能思维。',
    date: '2024-01-02',
    category: '性能优化'
  },
  {
    id: 5,
    title: 'Vite 构建工具深入浅出',
    excerpt: '了解 Vite 的核心原理与插件系统，让开发体验更轻快。',
    date: '2023-12-28',
    category: '工具'
  }
])

const techStack = ['Vue 3', 'JavaScript', 'CSS', 'GSAP', 'Vite', 'Responsive UI']

const homeSignals = [
  'PRODUCT THINKING',
  'MOTION LANGUAGE',
  'FRONTEND CRAFT',
  'RESPONSIVE SYSTEM',
  'MUSIC EXPERIENCE',
  'DIGITAL ARCHIVE'
]

const homeSignalsLoop = [...homeSignals, ...homeSignals]

const homeChapters = [
  { number: '01', label: 'WORK' },
  { number: '02', label: 'THINKING' },
  { number: '03', label: 'MUSIC' },
  { number: '04', label: 'ARCHIVE' }
]

const homeCapabilities = [
  { title: 'Visual Direction', detail: '层级、留白与品牌感' },
  { title: 'Motion Language', detail: '克制而连续的反馈' },
  { title: 'Responsive Craft', detail: '跨设备保持完整体验' }
]

const activeSong = computed(() => ({
  name: currentSong.value?.name || '晴天',
  artist: currentSong.value?.artist || '周杰伦',
  cover: currentSong.value?.cover || '/images/covers/qingtian.jpg'
}))

const currentTimeLabel = computed(() => new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(clock.value))

let clockTimer = 0

useHomeMotion(homeRoot)

onMounted(() => {
  clockTimer = window.setInterval(() => {
    clock.value = new Date()
  }, 30000)
})

onUnmounted(() => {
  window.clearInterval(clockTimer)
})
</script>

<style scoped>
@import '../css/Home.css';
</style>
