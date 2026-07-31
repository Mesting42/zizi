<template>
  <div ref="caseStudyRef" :class="['case-study', `case-study--${variant}`]">
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

      <section v-if="metrics.length" class="case-study-overview" data-case-reveal :aria-label="overview.label">
        <p>{{ overview.label }}</p>
        <div>
          <article v-for="item in metrics" :key="item.label">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </article>
        </div>
      </section>

      <section
        :class="['case-study-preview', { 'case-study-preview--immersive': immersivePreview }]"
        :aria-label="`${title} interactive preview`"
      >
        <div class="case-study-preview-bar">
          <div>
            <i aria-hidden="true"></i>
            <span>{{ previewLabel }}</span>
          </div>
          <div class="case-study-preview-actions">
            <a :href="iframeSrc" target="_blank" rel="noopener">{{ copy.openProject }} <span>↗</span></a>
            <button type="button" :title="isFullscreen ? copy.exitFullscreen : copy.viewFullscreen" @click="toggleFullscreen">
              <span>{{ isFullscreen ? copy.exitFullscreen : copy.viewFullscreen }}</span>
              <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>
        <iframe
          ref="iframeRef"
          :src="iframePreviewSrc"
          class="case-study-iframe"
          :title="iframeTitle"
          loading="eager"
          allowfullscreen
          @load="handleIframeLoad"
        ></iframe>
      </section>

      <section v-if="challenge.title" class="case-study-challenge" data-case-reveal>
        <div>
          <p>{{ challenge.eyebrow }}</p>
          <h2>{{ challenge.title }}</h2>
        </div>
        <div class="case-study-challenge-copy">
          <p>{{ challenge.text }}</p>
          <ul>
            <li v-for="item in challenge.points" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section v-if="principles.length" class="case-study-principles" data-case-reveal :aria-label="principlesLabel">
        <div class="case-study-section-heading">
          <p>{{ principlesLabel }}</p>
          <h2>{{ principlesTitle }}</h2>
        </div>
        <div class="case-study-principle-grid">
          <article v-for="(item, index) in principles" :key="item.title">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section v-if="process.length" class="case-study-process" data-case-reveal :aria-label="processLabel">
        <div class="case-study-section-heading">
          <p>{{ processLabel }}</p>
          <h2>{{ processTitle }}</h2>
        </div>
        <ol>
          <li v-for="(item, index) in process" :key="item.title">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <p>{{ item.phase }}</p>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="case-study-story" data-case-reveal aria-labelledby="case-story-title">
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

      <section class="case-study-next" data-case-reveal :aria-label="copy.nextProject">
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
        <a href="mailto:mesting042@gmail.com">{{ copy.contact }}</a>
      </div>
      <span>{{ copy.spaceName }} / 2026</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PortfolioHeader from './PortfolioHeader.vue'
import { useLocale } from '../composables/useLocale'

const props = defineProps({
  variant: { type: String, default: 'default' },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: Array, required: true },
  previewLabel: { type: String, required: true },
  iframeSrc: { type: String, required: true },
  iframeTitle: { type: String, required: true },
  statement: { type: String, required: true },
  details: { type: Array, required: true },
  overview: { type: Object, default: () => ({ label: '' }) },
  metrics: { type: Array, default: () => [] },
  challenge: { type: Object, default: () => ({}) },
  principlesLabel: { type: String, default: '' },
  principlesTitle: { type: String, default: '' },
  principles: { type: Array, default: () => [] },
  processLabel: { type: String, default: '' },
  processTitle: { type: String, default: '' },
  process: { type: Array, default: () => [] },
  nextEyebrow: { type: String, required: true },
  nextTitle: { type: String, required: true },
  nextTo: { type: String, required: true }
})

const caseStudyRef = ref(null)
const iframeRef = ref(null)
const isFullscreen = ref(false)
const immersivePreview = ref(false)
const restoreAttempted = ref(false)
let caseStudyObserver
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
const restorePreview = computed(() => props.variant === 'xiaomi' && route.query.restorePreview === '1')
const iframePreviewSrc = computed(() => restorePreview.value
  ? `${props.iframeSrc}#phones`
  : props.iframeSrc)
const copy = computed(() => isChinese.value
  ? {
      technologies: '项目技术',
      exitFullscreen: '退出全屏',
      viewFullscreen: '全屏查看',
      openProject: '独立打开项目',
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
      openProject: 'Open Project',
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
  const nativeFullscreen = document.fullscreenElement === iframeRef.value
  isFullscreen.value = nativeFullscreen
  if (nativeFullscreen) {
    immersivePreview.value = false
    document.body.classList.remove('case-study-preview-restored')
  }
}

const syncImmersiveBody = () => {
  document.body.classList.toggle('case-study-preview-restored', immersivePreview.value)
}

const exitImmersivePreview = () => {
  immersivePreview.value = false
  isFullscreen.value = false
  syncImmersiveBody()
}

const requestPreviewFullscreen = async () => {
  immersivePreview.value = true
  isFullscreen.value = true
  syncImmersiveBody()

  try {
    await iframeRef.value?.requestFullscreen?.()
  } catch {
    // The CSS immersive mode remains active when the browser blocks a
    // programmatic fullscreen request after a route transition.
  }
}

const restorePhoneMatrix = () => {
  try {
    iframeRef.value?.contentDocument?.getElementById('phones')?.scrollIntoView({ block: 'start' })
  } catch {
    // A cross-origin deployment can still use the #phones fragment fallback.
  }
}

const handleIframeLoad = () => {
  if (!restorePreview.value) return
  restorePhoneMatrix()
  if (!restoreAttempted.value) {
    restoreAttempted.value = true
    requestPreviewFullscreen()
  }
}

const toggleFullscreen = async () => {
  if (!iframeRef.value) return

  if (document.fullscreenElement) {
    await document.exitFullscreen?.()
    return
  }

  if (immersivePreview.value) {
    exitImmersivePreview()
    return
  }

  await requestPreviewFullscreen()
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && immersivePreview.value && !document.fullscreenElement) {
    exitImmersivePreview()
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('keydown', handleEscape)

  if (restorePreview.value) {
    nextTick(() => {
      restorePhoneMatrix()
      if (!restoreAttempted.value) {
        restoreAttempted.value = true
        requestPreviewFullscreen()
      }
    })
  }

  const revealTargets = caseStudyRef.value?.querySelectorAll('[data-case-reveal]') ?? []
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-in-view'))
    return
  }

  caseStudyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-in-view', entry.isIntersecting))
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px'
  })

  revealTargets.forEach((target) => caseStudyObserver.observe(target))
})

onUnmounted(() => {
  if (document.fullscreenElement === iframeRef.value) {
    document.exitFullscreen?.().catch(() => {})
  }
  immersivePreview.value = false
  syncImmersiveBody()
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('keydown', handleEscape)
  caseStudyObserver?.disconnect()
})
</script>

<style>
@import '../css/CaseStudy.css';
</style>
