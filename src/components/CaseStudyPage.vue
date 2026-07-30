<template>
  <div class="case-study">
    <PortfolioHeader />

    <main>
      <header class="case-study-hero">
        <div class="case-study-hero-title">
          <p>{{ eyebrow }}</p>
          <h1>{{ title }}</h1>
        </div>
        <div class="case-study-hero-summary">
          <p>{{ description }}</p>
          <div class="case-study-tags" :aria-label="copy.technologies">
            <span v-for="tag in tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </header>

      <section class="case-study-preview" :aria-label="`${title} interactive preview`">
        <div class="case-study-preview-bar">
          <div>
            <i aria-hidden="true"></i>
            <span>{{ previewLabel }}</span>
          </div>
          <button type="button" :title="isFullscreen ? copy.exitFullscreen : copy.viewFullscreen" @click="toggleFullscreen">
            <span>{{ isFullscreen ? copy.exitFullscreen : copy.viewFullscreen }}</span>
            <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          </button>
        </div>
        <iframe
          ref="iframeRef"
          :src="iframeSrc"
          class="case-study-iframe"
          :title="iframeTitle"
          loading="eager"
        ></iframe>
      </section>

      <section class="case-study-story" aria-labelledby="case-story-title">
        <div class="case-study-story-lead">
          <p>{{ copy.projectNotes }} / 2026</p>
          <h2 id="case-story-title">{{ statement }}</h2>
        </div>
        <div class="case-study-facts">
          <article v-for="(item, index) in details" :key="item.title">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="case-study-next" :aria-label="copy.nextProject">
        <p>{{ nextEyebrow }}</p>
        <div>
          <h2>{{ nextTitle }}</h2>
          <router-link :to="nextProjectTarget">{{ copy.continueExploring }} <span>↗</span></router-link>
        </div>
      </section>
    </main>

    <footer class="case-study-footer">
      <router-link :to="projectReturnTarget">{{ copy.backToProjects }} <span>↖</span></router-link>
      <div>
        <router-link to="/">{{ copy.home }}</router-link>
        <router-link to="/music">{{ copy.music }}</router-link>
        <a href="mailto:3541798955@qq.com">{{ copy.contact }}</a>
      </div>
      <span>{{ copy.spaceName }} / 2026</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PortfolioHeader from './PortfolioHeader.vue'
import { useLocale } from '../composables/useLocale'

const props = defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: Array, required: true },
  previewLabel: { type: String, required: true },
  iframeSrc: { type: String, required: true },
  iframeTitle: { type: String, required: true },
  statement: { type: String, required: true },
  details: { type: Array, required: true },
  nextEyebrow: { type: String, required: true },
  nextTitle: { type: String, required: true },
  nextTo: { type: String, required: true }
})

const iframeRef = ref(null)
const isFullscreen = ref(false)
const { isChinese } = useLocale()
const route = useRoute()
const projectAnchor = computed(() => {
  const fromProject = route.query.fromProject
  return typeof fromProject === 'string' && /^project-[a-z0-9-]+$/.test(fromProject)
    ? fromProject
    : 'projects'
})
const projectReturnTarget = computed(() => ({ path: '/', hash: `#${projectAnchor.value}` }))
const nextProjectTarget = computed(() => projectAnchor.value === 'projects'
  ? props.nextTo
  : { path: props.nextTo, query: { fromProject: projectAnchor.value } })
const copy = computed(() => isChinese.value
  ? {
      technologies: '项目技术',
      exitFullscreen: '退出全屏',
      viewFullscreen: '全屏查看',
      projectNotes: '项目说明',
      nextProject: '下一个项目',
      continueExploring: '继续探索',
      backToProjects: '返回作品',
      home: '首页',
      music: '音乐',
      contact: '联系',
      spaceName: 'Mesting 个人数字空间'
    }
  : {
      technologies: 'Project technologies',
      exitFullscreen: 'Exit Fullscreen',
      viewFullscreen: 'View Fullscreen',
      projectNotes: 'PROJECT NOTES',
      nextProject: 'Next project',
      continueExploring: 'Continue Exploring',
      backToProjects: 'Back to Projects',
      home: 'Home',
      music: 'Music',
      contact: 'Contact',
      spaceName: 'Mesting Personal Space'
    })

const handleFullscreenChange = () => {
  isFullscreen.value = document.fullscreenElement === iframeRef.value
}

const toggleFullscreen = async () => {
  if (!iframeRef.value) return

  if (document.fullscreenElement) {
    await document.exitFullscreen?.()
    return
  }

  await iframeRef.value.requestFullscreen?.()
}

onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => document.removeEventListener('fullscreenchange', handleFullscreenChange))
</script>

<style>
@import '../css/CaseStudy.css';
</style>
