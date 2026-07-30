<template>
  <div ref="homeRoot" class="oddy-space">
    <main>
      <section id="top" class="oddy-hero nk-hero">
        <div class="nk-video-shell" aria-hidden="true">
          <video ref="heroVideo" class="nk-hero-video" autoplay muted loop playsinline preload="auto">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4" type="video/mp4">
          </video>
        </div>

        <PortfolioHeader />

        <div class="nk-hero-footer">
          <div class="nk-hero-copy-block">
            <p class="nk-hero-subtitle"><i aria-hidden="true"></i>{{ copy.heroEyebrow }}</p>
            <h1 class="nk-hero-heading">
              <span>{{ copy.heroTitle[0] }}</span>
              <span>{{ copy.heroTitle[1] }}</span>
            </h1>
            <div class="nk-hero-actions">
              <router-link class="nk-hero-action nk-hero-action-primary" to="/#projects">{{ copy.exploreProjects }}</router-link>
              <router-link class="nk-hero-action nk-hero-action-secondary" to="/#about-space">{{ copy.aboutSpace }}</router-link>
            </div>
          </div>
          <div class="nk-hero-keywords" :aria-label="copy.disciplinesAria">
            <span>Flutter / Android</span>
            <span>Vue 3</span>
            <span>Visual &amp; Sound</span>
          </div>
        </div>
      </section>

      <section
        ref="marqueeSection"
        class="oddy-marquee-section"
        :class="{
          'is-dragging': marqueeDragging,
          'uses-native-scroll': marqueeStaticPreviews
        }"
        :aria-label="copy.marqueeAria"
        @pointerdown="beginMarqueeDrag"
        @pointermove="moveMarqueeDrag"
        @pointerup="finishMarqueeDrag"
        @pointercancel="finishMarqueeDrag"
        @lostpointercapture="finishMarqueeDrag"
        @dragstart.prevent
      >
        <div v-if="marqueeMounted" ref="marqueeTrack" class="oddy-marquee-track">
          <div
            v-for="repeat in (marqueeStaticPreviews ? 1 : 2)"
            :key="repeat"
            class="oddy-marquee-group"
            :aria-hidden="repeat > 1 ? 'true' : undefined"
          >
            <figure
              v-for="(asset, assetIndex) in marqueeAssets"
              :key="`${repeat}-${asset.src}`"
              class="oddy-marquee-card"
              :data-card-index="assetIndex"
            >
              <div class="oddy-marquee-card-inner">
                <span class="oddy-marquee-poster" aria-hidden="true"></span>
                <video
                  v-if="!marqueeStaticPreviews || marqueeActiveVideoIndexes.has(assetIndex)"
                  class="oddy-marquee-media"
                  :src="asset.src"
                  :aria-label="asset.alt"
                  autoplay
                  loop
                  muted
                  playsinline
                  preload="metadata"
                  disablepictureinpicture
                ></video>
                <span class="oddy-marquee-glint" aria-hidden="true"></span>
                <span class="oddy-marquee-focus" aria-hidden="true"></span>
                <div class="oddy-marquee-caption">
                  <small>REFERENCE / {{ String(assetIndex + 1).padStart(2, '0') }}</small>
                  <strong>{{ asset.alt }}</strong>
                  <i aria-hidden="true">↗</i>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <AmbientSideFields />

      <section id="about-space" class="oddy-quote-section">
        <div class="oddy-quote-layout">
          <div class="oddy-quote-copy oddy-reveal">
            <span class="oddy-quote-mark" aria-hidden="true">“</span>
            <h2>{{ copy.quote[0] }}<br><span>{{ copy.quote[1] }}</span><br>{{ copy.quote[2] }}</h2>
            <p class="oddy-signature">{{ copy.signature }}</p>
            <div class="oddy-signal-row" :aria-label="copy.keywordsAria">
              <span>VUE 3</span>
              <span>THREE.JS</span>
              <span>VISUAL NOTES</span>
            </div>
          </div>
          <div ref="avatarMount" class="oddy-avatar-card">
            <div class="oddy-avatar-label">LIVE AVATAR / 01</div>
            <div class="oddy-avatar-viewport">
              <img
                class="oddy-avatar-fallback"
                :class="{ 'is-hidden': avatarReady }"
                src="/images/avatar-fallback.png"
                :alt="isChinese ? 'Mesting 的数字分身预览' : 'Mesting digital avatar preview'"
                width="1016"
                height="940"
                loading="eager"
                decoding="async"
                fetchpriority="low"
              >
              <AvatarMouseFollow
                v-if="avatarVisible && !avatarFailed"
                :model-url="avatarModelUrl"
                :max-yaw="14"
                :max-pitch="7"
                :camera-zoom="0.98"
                :camera-target-y="0.18"
                :max-pixel-ratio="1.25"
                :max-fps="24"
                :interactive="false"
                :show-pointer="false"
                :show-status="false"
                @ready="handleAvatarReady"
                @error="handleAvatarError"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="oddy-offerings oddy-reveal" :aria-label="copy.exploreSpaceAria">
        <div class="oddy-offering-grid">
          <article class="oddy-offering oddy-offering-dark">
            <p class="oddy-card-index">{{ copy.offerings[0].index }}</p>
            <h2>{{ copy.offerings[0].title }}</h2>
            <p>{{ copy.offerings[0].lines[0] }}<br>{{ copy.offerings[0].lines[1] }}</p>
            <div class="oddy-offering-bottom">
              <strong>{{ copy.offerings[0].meta }}</strong>
              <router-link class="oddy-button oddy-button-light" to="/#projects">{{ copy.offerings[0].action }} <span>↘</span></router-link>
            </div>
          </article>
          <article class="oddy-offering oddy-offering-light">
            <p class="oddy-card-index">{{ copy.offerings[1].index }}</p>
            <h2>{{ copy.offerings[1].title }}</h2>
            <p>{{ copy.offerings[1].lines[0] }}<br>{{ copy.offerings[1].lines[1] }}</p>
            <div class="oddy-offering-bottom">
              <strong>{{ copy.offerings[1].meta }}</strong>
              <router-link class="oddy-button oddy-button-secondary" to="/#thinking-archive">{{ copy.offerings[1].action }} <span>↘</span></router-link>
            </div>
          </article>
        </div>
      </section>

      <section class="oddy-notes oddy-reveal" aria-labelledby="notes-title">
        <div class="oddy-notes-heading">
          <div>
            <p class="oddy-kicker">{{ copy.notesKicker }}</p>
            <h2 id="notes-title">{{ copy.notesTitle[0] }}<br><span>{{ copy.notesTitle[1] }}</span></h2>
          </div>
          <div class="oddy-carousel-controls">
            <button type="button" :aria-label="copy.previousNote" @click="previousNote">←</button>
            <button type="button" :aria-label="copy.nextNote" @click="nextNote">→</button>
          </div>
        </div>
        <div class="oddy-notes-window" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
          <div class="oddy-notes-track" :style="{ transform: `translateX(-${activeNote * 100}%)` }">
            <article v-for="note in spaceNotes" :key="note.index" class="oddy-note-card">
              <span class="oddy-note-quote" aria-hidden="true">✳</span>
              <p>{{ note.text }}</p>
              <footer>
                <span class="oddy-note-number">{{ note.index }}</span>
                <span><b>{{ note.title }}</b>{{ note.meta }}</span>
              </footer>
            </article>
          </div>
        </div>
        <div class="oddy-pagination" aria-hidden="true">
          <i v-for="(note, index) in spaceNotes" :key="note.index" :class="{ active: index === activeNote }"></i>
        </div>
      </section>

      <section id="projects" class="oddy-projects" aria-labelledby="projects-title">
        <header class="oddy-projects-intro oddy-reveal">
          <p class="oddy-kicker">{{ copy.projectsKicker }} / {{ currentYear }}</p>
          <h2 id="projects-title">{{ copy.projectsTitle[0] }} <span>{{ copy.projectsTitle[1] }}</span></h2>
        </header>
        <div class="oddy-project-stack">
          <article
            v-for="project in projects"
            :id="project.anchor"
            :key="project.anchor"
            class="oddy-project oddy-reveal"
          >
            <div class="oddy-project-copy">
              <p>{{ project.index }}</p>
              <h3>{{ project.title }}</h3>
              <span>{{ project.description }}</span>
            </div>
            <component
              :is="project.to ? 'router-link' : 'a'"
              :to="project.to ? { path: project.to, query: { fromProject: project.anchor } } : undefined"
              :href="project.href"
              class="oddy-project-visual"
              :class="{ 'oddy-project-visual--flutter': project.kind === 'flutter' }"
              :data-project-image="project.kind === 'flutter' ? null : project.anchor"
              :aria-label="`${copy.viewProjectAria} ${project.title}`"
            >
              <div class="oddy-project-visual-clip">
                <div v-if="project.kind === 'flutter'" class="oddy-flutter-project" aria-hidden="true">
                  <div class="oddy-flutter-project-copy">
                    <span>FLUTTER / ANDROID</span>
                    <strong>Mesting<br><i>Music</i></strong>
                    <small>MAKE LISTENING PERSONAL</small>
                  </div>
                  <div class="oddy-flutter-record"></div>
                  <div class="oddy-flutter-phone">
                    <img src="/generated/flutter-music/recommendation.png" alt="" loading="lazy" decoding="async">
                  </div>
                  <div class="oddy-flutter-stat"><b>25</b><span>VISUAL<br>THEMES</span></div>
                </div>
                <img
                  v-else-if="activeProjectImages.has(project.anchor)"
                  :src="project.image"
                  :alt="project.title"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                >
              </div>
              <b>{{ copy.openProject }} <i>↗</i></b>
            </component>
          </article>
        </div>
      </section>

      <section id="thinking-archive" class="oddy-article-archive oddy-reveal" aria-labelledby="article-archive-title">
        <header class="oddy-article-archive-heading">
          <div>
            <p class="oddy-kicker">{{ copy.archiveKicker }} / {{ articleArchive.length }} {{ copy.notesCount }}</p>
            <h2 id="article-archive-title">{{ copy.archiveTitle[0] }}<br><span>{{ copy.archiveTitle[1] }}</span></h2>
          </div>
        </header>

        <div class="oddy-article-list">
          <router-link
            v-for="(article, index) in articlePreview"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="oddy-article-row"
          >
            <span class="oddy-article-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="oddy-article-copy">
              <p>{{ article.category }} · {{ article.date }}</p>
              <h3>{{ article.title }}</h3>
              <span>{{ article.excerpt }}</span>
            </div>
            <div class="oddy-article-meta">
              <span>{{ article.readTime }} {{ copy.minRead }}</span>
              <i>↗</i>
            </div>
          </router-link>
        </div>

        <router-link class="oddy-article-entry" to="/articles">
          <div>
            <p>{{ copy.fullArchive }} / {{ articleArchive.length }} {{ copy.articlesCount }}</p>
            <h3>{{ copy.archiveEntryTitle }}</h3>
            <span>{{ copy.archiveEntryText }}</span>
          </div>
          <i>↗</i>
        </router-link>
      </section>

      <section class="oddy-partner-shell oddy-reveal">
        <div class="oddy-partner" @pointermove="spawnTrail">
          <div class="oddy-partner-orb oddy-partner-orb--notes" aria-hidden="true">
            <span class="oddy-partner-orb-index">01 / NOTES</span>
            <span class="oddy-partner-orb-orbit"><i></i><i></i><i></i></span>
            <span class="oddy-partner-orb-caption">WORK IN<br>MOTION</span>
          </div>
          <div class="oddy-partner-orb oddy-partner-orb--sound" aria-hidden="true">
            <span class="oddy-partner-orb-index">02 / SOUND</span>
            <span class="oddy-partner-orb-record"><i></i></span>
            <span class="oddy-partner-orb-bars"><i></i><i></i><i></i><i></i><i></i></span>
          </div>
          <span
            v-for="trail in trailItems"
            :key="trail.id"
            class="oddy-trail-image"
            :style="{ left: `${trail.x}px`, top: `${trail.y}px`, '--trail-rotation': `${trail.rotation}deg` }"
            aria-hidden="true"
          ><img :src="trail.src" alt=""></span>
          <div class="oddy-partner-content">
            <p class="oddy-kicker">{{ copy.conversationKicker }}</p>
            <h2>{{ copy.partnerTitle[0] }}<br><span>{{ copy.partnerTitle[1] }}</span></h2>
            <a class="oddy-button oddy-button-primary" href="mailto:3541798955@qq.com">
              <span class="oddy-button-avatar">M</span>{{ copy.writeEmail }}
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="oddy-footer">
      <div class="oddy-footer-top">
        <div class="oddy-footer-invite">
          <p>{{ copy.footerEyebrow }}</p>
          <h2>{{ copy.footerTitle[0] }}<br><span>{{ copy.footerTitle[1] }}</span></h2>
          <a class="oddy-button oddy-button-primary" href="mailto:3541798955@qq.com">{{ copy.startConversation }} <span>↗</span></a>
        </div>
        <div class="oddy-footer-links">
          <div>
            <span class="oddy-footer-link-title">{{ copy.explore }}</span>
            <router-link to="/#projects">{{ copy.projects }}</router-link>
            <router-link to="/#about-space">{{ copy.about }}</router-link>
            <router-link to="/music">{{ copy.music }}</router-link>
          </div>
          <div>
            <span class="oddy-footer-link-title">{{ copy.connect }}</span>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="mailto:3541798955@qq.com">{{ copy.email }} ↗</a>
          </div>
        </div>
      </div>
      <div class="oddy-copyright"><span>{{ copy.copyright }}</span><span>CHINA / {{ currentYear }}</span></div>
    </footer>

    <nav class="oddy-bottom-nav" :aria-label="copy.quickNavAria">
      <button type="button" class="oddy-bottom-mark" :aria-label="copy.backToTop" @click="scrollToTop">M</button>
      <a href="mailto:3541798955@qq.com">{{ copy.writeEmail }} <span>↗</span></a>
    </nav>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { useArticles } from '../utils/articlesStore'
import { localizeArticle } from '../utils/articleTranslations'
import { useLocale } from '../composables/useLocale'
import PortfolioHeader from '../components/PortfolioHeader.vue'
import AmbientSideFields from '../components/AmbientSideFields.vue'

const avatarModelUrl = '/models/avatar/mesting-rodin-rebuild-optimized.glb'
let avatarComponentPreload = null

const preloadAvatarComponent = () => {
  if (!avatarComponentPreload) {
    avatarComponentPreload = import('../components/AvatarMouseFollow.vue')
  }
  return avatarComponentPreload
}

const AvatarMouseFollow = defineAsyncComponent(preloadAvatarComponent)

const homeRoot = ref(null)
const heroVideo = ref(null)
const avatarMount = ref(null)
const marqueeSection = ref(null)
const marqueeTrack = ref(null)
const marqueeDragging = ref(false)
const marqueeMounted = ref(false)
const marqueeStaticPreviews = ref(
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
)
const marqueeActiveVideoIndexes = ref(new Set())
const avatarVisible = ref(false)
const avatarReady = ref(false)
const avatarFailed = ref(false)
const activeNote = ref(0)
const activeProjectImages = ref(new Set())
const trailItems = ref([])
const currentYear = new Date().getFullYear()
const { articles } = useArticles()
const { isChinese } = useLocale()

const homeCopy = {
  en: {
    heroEyebrow: 'MESTING / PERSONAL DIGITAL SPACE · 2026',
    heroTitle: ['Code, Interfaces & Sound.', 'Made to Keep Evolving.'],
    exploreProjects: 'Explore Projects',
    aboutSpace: 'About This Space',
    disciplinesAria: 'Creative disciplines',
    marqueeAria: 'A draggable stream of creative references',
    quote: ['I want this space to feel', 'like a work in motion,', 'not a display case.'],
    signature: 'Mesting, always in progress',
    keywordsAria: 'Digital space keywords',
    avatarAlt: 'Mesting 3D digital avatar',
    exploreSpaceAria: 'Explore the space',
    offerings: [
      {
        index: '01 / SELECTED WORK',
        title: 'Project Archive',
        lines: ['From concept pages to usable interactive experiences.', 'A record of finished work and ideas still evolving.'],
        meta: 'Continuously updated',
        action: 'View Projects'
      },
      {
        index: '02 / NOTES & SOUND',
        title: 'Notes & Sound',
        lines: ['Thoughts in progress, fragments from reading, and playlists.', 'Not yet defined, but worth keeping.'],
        meta: 'Always unfolding',
        action: 'Read Notes'
      }
    ],
    notesKicker: 'A FEW NOTES FROM THE SPACE',
    notesTitle: ['Questions in the process', 'that do not need quick answers.'],
    previousNote: 'Previous note',
    nextNote: 'Next note',
    projectsKicker: 'SELECTED PROJECTS',
    projectsTitle: ['A project is not an ending.', 'It is the start of another conversation.'],
    viewProjectAria: 'View',
    openProject: 'Open Project',
    archiveKicker: 'THINKING ARCHIVE',
    notesCount: 'NOTES',
    archiveTitle: ['Paths already taken,', 'reframed as thoughts worth reopening.'],
    minRead: 'MIN READ',
    fullArchive: 'FULL ARCHIVE',
    articlesCount: 'ARTICLES',
    archiveEntryTitle: 'Enter the Complete Thinking Archive',
    archiveEntryText: 'Browse every article, study log, and practice note by category.',
    conversationKicker: 'OPEN TO CONVERSATION',
    partnerTitle: ['Stay curious.', 'Stay connected.'],
    writeEmail: 'Write an Email',
    footerEyebrow: 'MESTING / PERSONAL DIGITAL SPACE',
    footerTitle: ['Let the next project', 'begin with a conversation.'],
    startConversation: 'Start a Conversation',
    explore: 'Explore',
    projects: 'Projects',
    about: 'About',
    music: 'Music',
    connect: 'Connect',
    email: 'Email',
    copyright: 'Mesting Personal Space',
    quickNavAria: 'Quick navigation',
    backToTop: 'Back to top'
  },
  zh: {
    heroEyebrow: 'MESTING / 个人数字空间 · 2026',
    heroTitle: ['代码、界面与声音。', '在这里持续生长。'],
    exploreProjects: '浏览作品',
    aboutSpace: '认识这个空间',
    disciplinesAria: '创作方向',
    marqueeAria: '可拖动的创意灵感卡片流',
    quote: ['我想把这个空间做成', '一处持续流动的作品，', '而不是展示柜。'],
    signature: 'Mesting，持续制作中',
    keywordsAria: '数字空间关键词',
    avatarAlt: 'Mesting 3D 数字分身',
    exploreSpaceAria: '探索这个空间',
    offerings: [
      {
        index: '01 / 精选作品',
        title: '作品档案',
        lines: ['从概念页面到真实可用的交互体验。', '记录已经完成、也仍在继续演化的项目。'],
        meta: '持续更新',
        action: '查看作品'
      },
      {
        index: '02 / 思考与声音',
        title: '思考与声音',
        lines: ['把正在形成的判断、阅读片段与播放列表放在一起。', '不急着定义，但值得被保留下来。'],
        meta: '随时发生',
        action: '阅读笔记'
      }
    ],
    notesKicker: '来自这个空间的几条记录',
    notesTitle: ['创作里那些', '不必很快回答的事。'],
    previousNote: '上一条记录',
    nextNote: '下一条记录',
    projectsKicker: '精选作品',
    projectsTitle: ['作品不是终点，', '而是继续对话的开始。'],
    viewProjectAria: '查看',
    openProject: '打开项目',
    archiveKicker: '思考档案',
    notesCount: '篇记录',
    archiveTitle: ['把走过的路径，', '整理成可以再次打开的思考。'],
    minRead: '分钟阅读',
    fullArchive: '完整档案',
    articlesCount: '篇文章',
    archiveEntryTitle: '进入完整思考档案',
    archiveEntryText: '按分类浏览所有文章、学习记录与实践笔记。',
    conversationKicker: '保持交流',
    partnerTitle: ['保持好奇，', '也保持联系。'],
    writeEmail: '写一封邮件',
    footerEyebrow: 'MESTING / 个人数字空间',
    footerTitle: ['让下一次创作，', '从一场对话开始。'],
    startConversation: '开始交流',
    explore: '浏览',
    projects: '作品',
    about: '关于',
    music: '音乐',
    connect: '联系',
    email: '邮箱',
    copyright: 'Mesting 个人数字空间',
    quickNavAria: '快捷导航',
    backToTop: '回到顶部'
  }
}

const copy = computed(() => homeCopy[isChinese.value ? 'zh' : 'en'])

const handleAvatarReady = () => {
  avatarReady.value = true
}

const handleAvatarError = () => {
  avatarReady.value = false
  avatarFailed.value = true
}

const marqueeAssets = [
  {
    src: 'https://videos.pexels.com/video-files/37013442/15681498_3840_2160_30fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
    alt: 'glowing circuit current'
  },
  {
    src: 'https://videos.pexels.com/video-files/10288594/10288594-hd_1920_1080_25fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif',
    alt: 'scrolling circuit pathways'
  },
  {
    src: 'https://videos.pexels.com/video-files/11041434/11041434-hd_1920_1080_30fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif',
    alt: 'monochrome data matrix'
  },
  {
    src: 'https://videos.pexels.com/video-files/6466100/6466100-uhd_3840_2160_30fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
    alt: 'blue signal interface'
  },
  {
    src: 'https://videos.pexels.com/video-files/36405803/15438012_1920_1080_30fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
    alt: 'connected processor core'
  },
  {
    src: 'https://videos.pexels.com/video-files/30308684/12992536_1920_1080_24fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
    alt: 'three dimensional network'
  },
  {
    src: 'https://videos.pexels.com/video-files/29882131/12828950_1920_1080_25fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
    alt: 'neon circuit loop'
  },
  {
    src: 'https://videos.pexels.com/video-files/34645078/14683767_3840_2160_30fps.mp4',
    trailSrc: 'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
    alt: 'digital data field'
  }
]

const spaceNotes = computed(() => isChinese.value
  ? [
      { index: '01', title: '视觉不是装饰', meta: '让页面自己说出它想成为的样子。', text: '设计的价值不只是“更好看”，而在于让人愿意停下来，再多看一会。' },
      { index: '02', title: '让作品保持开放', meta: '每个项目都可以继续生长。', text: '完成不是终点。使用、反馈与重新燃起的好奇心，会让作品变得更加完整。' },
      { index: '03', title: '慢一点也是进度', meta: '把仍在形成的想法留下来。', text: '有些答案不需要立刻出现。先记录、先观察，时间会替我们补上另一半。' },
      { index: '04', title: '声音是一条线索', meta: '先听见，再重新看见。', text: '音乐常常会替画面打开一扇门，也让日常里细小的片段更容易被记住。' },
      { index: '05', title: '忠于自己的好奇', meta: '不必把自己缩成一个标签。', text: '技术、图像、文字和声音可以同时存在，只要它们来自同一种真诚。' }
    ]
  : [
      { index: '01', title: 'Visuals Are Not Decoration', meta: 'Let the page reveal how it wants to feel.', text: 'Design is not only about looking better. It should make someone want to pause and stay a little longer.' },
      { index: '02', title: 'Keep the Work Open', meta: 'Every project can continue to grow.', text: 'Completion is not the end. Good work becomes more complete through use, feedback, and renewed curiosity.' },
      { index: '03', title: 'Slower Is Still Progress', meta: 'Keep the ideas that are still taking shape.', text: 'Some answers do not need to arrive immediately. Record first, observe first, and let time complete the other half.' },
      { index: '04', title: 'Sound Is a Clue', meta: 'Listen first, then see again.', text: 'Music often opens a door for an image and makes small fragments of everyday life easier to remember.' },
      { index: '05', title: 'Stay True to Curiosity', meta: 'Do not reduce yourself to one label.', text: 'Technology, images, words, and sound can coexist. What matters is that they come from the same sincerity.' }
    ])

const articleArchive = computed(() => [...articles.value]
  .sort((a, b) => (a.order || a.id || 0) - (b.order || b.id || 0)))
const articlePreview = computed(() => articleArchive.value
  .slice(0, 3)
  .map(article => localizeArticle(article, isChinese.value)))

const projects = computed(() => [
  {
    index: isChinese.value ? '01 / 原生音乐产品' : '01 / NATIVE MUSIC PRODUCT',
    title: 'Mesting Music',
    description: isChinese.value
      ? '使用 Flutter 打造的原生 Android 音乐产品，连接发现、播放、主题装扮、云端同步与一起听。'
      : 'A native Android music product built with Flutter, connecting discovery, playback, themes, cloud sync, and shared listening.',
    kind: 'flutter',
    anchor: 'project-mesting-music',
    to: '/flutter-music-case'
  },
  {
    index: isChinese.value ? '02 / 数字体验' : '02 / DIGITAL EXPERIENCE',
    title: isChinese.value ? 'Vivo 概念重构' : 'Vivo Concept Rebuild',
    description: isChinese.value
      ? '将品牌叙事、页面节奏与动态体验重新组织成一条连续的浏览路径。'
      : 'Brand storytelling, rhythm, and motion reorganized into one continuous browsing experience.',
    image: 'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
    anchor: 'project-vivo-concept-rebuild',
    to: '/vivo-case'
  },
  {
    index: isChinese.value ? '03 / 海外落地页' : '03 / GLOBAL LANDING',
    title: isChinese.value ? '海外品牌实验' : 'Global Brand Experiment',
    description: isChinese.value
      ? '为不同文化语境下的用户，寻找更直接、更有辨识度的表达方式。'
      : 'A more direct and distinctive visual language designed for audiences across different cultural contexts.',
    image: 'https://motionsites.ai/assets/hero-automation-machines-preview-DlTveRIN.gif',
    anchor: 'project-global-brand-experiment',
    to: '/foreign-case'
  }
])

let revealObserver = null
let heroVideoObserver = null
let marqueeObserver = null
let marqueeMediaObserver = null
let noteCarouselObserver = null
let projectImageObserver = null
let marqueeFrame = 0
let marqueeLastFrame = 0
let marqueeOffset = 0
let marqueeLoopWidth = 0
let marqueeVelocity = 0
let marqueePointerId = null
let marqueeDragStartX = 0
let marqueeDragStartOffset = 0
let marqueeLastPointerX = 0
let marqueeLastPointerTime = 0
let marqueeDragFrame = 0
let marqueePendingPointerX = 0
let marqueeReducedMotion = false
let marqueeIsVisible = true
let marqueeLastPaint = 0
let heroVideoIsVisible = true
let pageIsScrolling = false
let carouselTimer = 0
let lastTrailTime = 0
let trailId = 0
let projectMotionCleanups = []
let marqueeCardMotionCleanup = null
let resetMarqueeCardMotion = null
let marqueeHovering = false
let avatarWarmupTimer = 0
let avatarWarmupIdleHandle = 0
let avatarModelPrefetched = false
const trailTimers = new Set()

const prefetchAvatarModel = () => {
  if (avatarModelPrefetched || document.hidden) return

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.saveData || /(^|-)2g/.test(connection?.effectiveType || '')) return

  const hint = document.createElement('link')
  hint.rel = 'prefetch'
  hint.as = 'fetch'
  hint.href = avatarModelUrl
  hint.crossOrigin = 'anonymous'
  document.head.append(hint)
  avatarModelPrefetched = true
}

const wrapMarqueeOffset = (value) => {
  if (!marqueeLoopWidth) return value
  return ((value % marqueeLoopWidth) + marqueeLoopWidth) % marqueeLoopWidth
}

const usesNativeMarqueeScroll = () => marqueeStaticPreviews.value

const renderMarquee = () => {
  if (!marqueeTrack.value) return
  if (usesNativeMarqueeScroll()) {
    marqueeTrack.value.style.removeProperty('transform')
    return
  }
  marqueeTrack.value.style.transform = `translate3d(${-marqueeOffset}px, 0, 0)`
}

const syncMarqueePreviewMode = () => {
  const shouldUseStaticPreviews = window.matchMedia('(max-width: 767px)').matches
  if (marqueeStaticPreviews.value === shouldUseStaticPreviews) return

  marqueeStaticPreviews.value = shouldUseStaticPreviews
  marqueeOffset = 0
  marqueeVelocity = 0
  stopMarqueeAnimation()

  nextTick(() => {
    measureMarquee()
    setupMarqueeCardMotion()
    setupMarqueeMobileVideos()
    if (!usesNativeMarqueeScroll()) startMarqueeAnimation()
  })
}

const measureMarquee = () => {
  const firstGroup = marqueeTrack.value?.firstElementChild
  if (!firstGroup) return
  if (usesNativeMarqueeScroll()) {
    renderMarquee()
    return
  }
  const previousWidth = marqueeLoopWidth
  marqueeLoopWidth = firstGroup.getBoundingClientRect().width
  if (previousWidth && marqueeLoopWidth) marqueeOffset = (marqueeOffset / previousWidth) * marqueeLoopWidth
  marqueeOffset = wrapMarqueeOffset(marqueeOffset)
  renderMarquee()
}

const animateMarquee = (time) => {
  if (!marqueeLastFrame) marqueeLastFrame = time
  if (time - marqueeLastPaint < 32) {
    marqueeFrame =
      marqueeIsVisible && !document.hidden && !pageIsScrolling
        ? window.requestAnimationFrame(animateMarquee)
        : 0
    return
  }
  const elapsed = Math.min((time - marqueeLastFrame) / 1000, 0.05)
  marqueeLastFrame = time
  marqueeLastPaint = time

  if (!marqueeDragging.value && !marqueeHovering && !document.hidden && !pageIsScrolling) {
    if (Math.abs(marqueeVelocity) > 1) {
      marqueeOffset += marqueeVelocity * elapsed
      marqueeVelocity *= Math.pow(0.045, elapsed)
    } else if (!marqueeReducedMotion) {
      marqueeVelocity = 0
      marqueeOffset += 30 * elapsed
    }
    marqueeOffset = wrapMarqueeOffset(marqueeOffset)
    renderMarquee()
  }

  marqueeFrame =
    marqueeIsVisible && !document.hidden && !pageIsScrolling
      ? window.requestAnimationFrame(animateMarquee)
      : 0
}

const startMarqueeAnimation = () => {
  if (
    marqueeFrame ||
    usesNativeMarqueeScroll() ||
    !marqueeIsVisible ||
    !marqueeMounted.value ||
    document.hidden ||
    pageIsScrolling
  ) return
  marqueeLastFrame = 0
  marqueeLastPaint = 0
  marqueeFrame = window.requestAnimationFrame(animateMarquee)
}

const stopMarqueeAnimation = () => {
  if (marqueeFrame) window.cancelAnimationFrame(marqueeFrame)
  marqueeFrame = 0
  marqueeLastFrame = 0
}

const handlePageVisibility = () => {
  if (document.hidden) {
    stopMarqueeAnimation()
    heroVideo.value?.pause()
  } else {
    startMarqueeAnimation()
    if (heroVideoIsVisible && !pageIsScrolling) {
      heroVideo.value?.play().catch(() => {})
    }
  }
}

const handleScrollState = (event) => {
  pageIsScrolling = Boolean(event.detail?.scrolling)
  if (pageIsScrolling) {
    stopMarqueeAnimation()
    heroVideo.value?.pause()
    return
  }

  startMarqueeAnimation()
  if (heroVideoIsVisible && !document.hidden) {
    heroVideo.value?.play().catch(() => {})
  }
}

const beginMarqueeDrag = (event) => {
  if (usesNativeMarqueeScroll()) return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  resetMarqueeCardMotion?.()
  marqueeHovering = false
  measureMarquee()
  marqueePointerId = event.pointerId
  marqueeDragging.value = true
  marqueeVelocity = 0
  marqueeDragStartX = event.clientX
  marqueeDragStartOffset = marqueeOffset
  marqueeLastPointerX = event.clientX
  marqueeLastPointerTime = performance.now()
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

const moveMarqueeDrag = (event) => {
  if (usesNativeMarqueeScroll()) return
  if (!marqueeDragging.value || event.pointerId !== marqueePointerId) return
  const now = performance.now()
  const elapsed = Math.max(now - marqueeLastPointerTime, 8)
  const pointerDelta = event.clientX - marqueeLastPointerX
  const instantVelocity = -(pointerDelta / elapsed) * 1000
  marqueeVelocity = (marqueeVelocity * 0.55) + (instantVelocity * 0.45)
  marqueeLastPointerX = event.clientX
  marqueeLastPointerTime = now
  marqueePendingPointerX = event.clientX

  if (!marqueeDragFrame) {
    marqueeDragFrame = requestAnimationFrame(() => {
      marqueeDragFrame = 0
      marqueeOffset = wrapMarqueeOffset(
        marqueeDragStartOffset - (marqueePendingPointerX - marqueeDragStartX)
      )
      renderMarquee()
    })
  }
}

const finishMarqueeDrag = (event) => {
  if (usesNativeMarqueeScroll()) return
  if (!marqueeDragging.value || event.pointerId !== marqueePointerId) return
  if (marqueeDragFrame) {
    cancelAnimationFrame(marqueeDragFrame)
    marqueeDragFrame = 0
    marqueeOffset = wrapMarqueeOffset(
      marqueeDragStartOffset - (event.clientX - marqueeDragStartX)
    )
    renderMarquee()
  }
  marqueeDragging.value = false
  marqueeVelocity = Math.max(-1800, Math.min(1800, marqueeVelocity))
  if (Math.abs(marqueeVelocity) < 36) marqueeVelocity = 0
  marqueePointerId = null
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

const nextNote = () => {
  activeNote.value = (activeNote.value + 1) % spaceNotes.value.length
}

const previousNote = () => {
  activeNote.value = (activeNote.value - 1 + spaceNotes.value.length) % spaceNotes.value.length
}

const pauseCarousel = () => {
  if (carouselTimer) window.clearInterval(carouselTimer)
  carouselTimer = 0
}

const resumeCarousel = () => {
  if (carouselTimer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  carouselTimer = window.setInterval(nextNote, 4200)
}

const spawnTrail = (event) => {
  if (window.matchMedia('(pointer: coarse)').matches) return
  const now = performance.now()
  if (now - lastTrailTime < 90) return
  lastTrailTime = now
  const bounds = event.currentTarget.getBoundingClientRect()
  const id = ++trailId
  const item = {
    id,
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
    rotation: Math.round(Math.random() * 20 - 10),
    src: marqueeAssets[id % marqueeAssets.length].trailSrc
  }
  trailItems.value = [...trailItems.value, item]
  const timer = window.setTimeout(() => {
    trailItems.value = trailItems.value.filter(trail => trail.id !== id)
    trailTimers.delete(timer)
  }, 1100)
  trailTimers.add(timer)
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const destroyMarqueeCardMotion = () => {
  marqueeCardMotionCleanup?.()
  marqueeCardMotionCleanup = null
  resetMarqueeCardMotion = null
  marqueeHovering = false
}

const destroyMarqueeMobileVideos = () => {
  marqueeMediaObserver?.disconnect()
  marqueeMediaObserver = null
  marqueeActiveVideoIndexes.value = new Set()
}

const setupMarqueeMobileVideos = () => {
  destroyMarqueeMobileVideos()

  // Desktop keeps the complete looping reel. On phones, the poster remains
  // visible until a card is close to the scroll viewport, then only those
  // nearby cards receive a real video element to decode and play.
  if (!usesNativeMarqueeScroll() || !marqueeTrack.value) return

  const cards = [...marqueeTrack.value.querySelectorAll('.oddy-marquee-card')]
  if (!('IntersectionObserver' in window)) {
    marqueeActiveVideoIndexes.value = new Set(
      cards.map(card => Number(card.dataset.cardIndex))
    )
    return
  }

  marqueeMediaObserver = new IntersectionObserver(entries => {
    const nextActiveIndexes = new Set(marqueeActiveVideoIndexes.value)

    entries.forEach(entry => {
      const assetIndex = Number(entry.target.dataset.cardIndex)
      if (!Number.isInteger(assetIndex)) return
      if (entry.isIntersecting) nextActiveIndexes.add(assetIndex)
      else nextActiveIndexes.delete(assetIndex)
    })

    marqueeActiveVideoIndexes.value = nextActiveIndexes
  }, {
    root: marqueeSection.value,
    rootMargin: '0px 128px',
    threshold: 0.01
  })

  cards.forEach(card => marqueeMediaObserver.observe(card))
}

const setupMarqueeCardMotion = () => {
  destroyMarqueeCardMotion()

  if (
    !marqueeTrack.value ||
    usesNativeMarqueeScroll() ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  const track = marqueeTrack.value
  const cards = [...track.querySelectorAll('.oddy-marquee-card')]
  const inners = cards.map(card => card.querySelector('.oddy-marquee-card-inner'))
  const media = cards.map(card => card.querySelector('.oddy-marquee-media'))
  const captions = cards.map(card => card.querySelector('.oddy-marquee-caption'))
  const glints = cards.map(card => card.querySelector('.oddy-marquee-glint'))
  const focuses = cards.map(card => card.querySelector('.oddy-marquee-focus'))
  let activeCard = null

  const activeMotion = {
    rotationXTo: null,
    rotationYTo: null,
    imageXTo: null,
    imageYTo: null,
    focusXTo: null,
    focusYTo: null
  }

  const resetMotionTargets = (immediate = false) => {
    const duration = immediate ? 0 : 0.46

    marqueeHovering = false
    activeCard = null
    track.classList.remove('has-card-focus')
    cards.forEach(card => {
      card.classList.remove(
        'is-hovered',
        'is-neighbor-left',
        'is-neighbor-right',
        'is-neighbor-far-left',
        'is-neighbor-far-right',
        'is-muted'
      )
      card.style.removeProperty('--pointer-x')
      card.style.removeProperty('--pointer-y')
    })

    gsap.to(inners, {
      rotationX: 0,
      rotationY: 0,
      z: 0,
      duration,
      ease: 'power3.out',
      overwrite: true
    })
    gsap.to(media, {
      x: 0,
      y: 0,
      scale: 1,
      duration,
      ease: 'power3.out',
      overwrite: true
    })
    gsap.to(captions, {
      autoAlpha: 0,
      y: 16,
      duration: immediate ? 0 : 0.24,
      ease: 'power2.out',
      overwrite: true
    })
    gsap.to(glints, {
      autoAlpha: 0,
      duration: immediate ? 0 : 0.24,
      overwrite: true
    })
    gsap.to(focuses, {
      autoAlpha: 0,
      scale: 0.72,
      duration: immediate ? 0 : 0.2,
      overwrite: true
    })
  }

  const connectQuickMotion = card => {
    const cardIndex = cards.indexOf(card)
    const inner = inners[cardIndex]
    const video = media[cardIndex]
    const focus = focuses[cardIndex]

    activeMotion.rotationXTo = gsap.quickTo(inner, 'rotationX', {
      duration: 0.42,
      ease: 'power3.out'
    })
    activeMotion.rotationYTo = gsap.quickTo(inner, 'rotationY', {
      duration: 0.42,
      ease: 'power3.out'
    })
    activeMotion.imageXTo = gsap.quickTo(video, 'x', {
      duration: 0.5,
      ease: 'power3.out'
    })
    activeMotion.imageYTo = gsap.quickTo(video, 'y', {
      duration: 0.5,
      ease: 'power3.out'
    })
    activeMotion.focusXTo = gsap.quickTo(focus, 'x', {
      duration: 0.3,
      ease: 'power3.out'
    })
    activeMotion.focusYTo = gsap.quickTo(focus, 'y', {
      duration: 0.3,
      ease: 'power3.out'
    })
  }

  const activateCard = card => {
    if (activeCard === card || marqueeDragging.value) return

    if (activeCard) resetMotionTargets()
    activeCard = card
    marqueeHovering = true
    track.classList.add('has-card-focus')

    const activeCenter = card.getBoundingClientRect().left + card.getBoundingClientRect().width * 0.5
    const positionedCards = cards
      .map(candidate => {
        const bounds = candidate.getBoundingClientRect()
        return {
          candidate,
          delta: bounds.left + bounds.width * 0.5 - activeCenter
        }
      })
      .filter(item => item.candidate !== card)
    const cardsOnLeft = positionedCards.filter(item => item.delta < 0).sort((a, b) => b.delta - a.delta)
    const cardsOnRight = positionedCards.filter(item => item.delta > 0).sort((a, b) => a.delta - b.delta)

    cards.forEach(candidate => {
      candidate.classList.remove(
        'is-hovered',
        'is-neighbor-left',
        'is-neighbor-right',
        'is-neighbor-far-left',
        'is-neighbor-far-right',
        'is-muted'
      )
      if (candidate !== card) candidate.classList.add('is-muted')
    })

    card.classList.remove('is-muted')
    card.classList.add('is-hovered')
    cardsOnLeft[0]?.candidate.classList.add('is-neighbor-left')
    cardsOnLeft[0]?.candidate.classList.remove('is-muted')
    cardsOnLeft[1]?.candidate.classList.add('is-neighbor-far-left')
    cardsOnLeft[1]?.candidate.classList.remove('is-muted')
    cardsOnRight[0]?.candidate.classList.add('is-neighbor-right')
    cardsOnRight[0]?.candidate.classList.remove('is-muted')
    cardsOnRight[1]?.candidate.classList.add('is-neighbor-far-right')
    cardsOnRight[1]?.candidate.classList.remove('is-muted')

    const cardIndex = cards.indexOf(card)
    connectQuickMotion(card)
    gsap.to(inners[cardIndex], {
      z: 42,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto'
    })
    gsap.to(media[cardIndex], {
      scale: 1.055,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto'
    })
    gsap.fromTo(captions[cardIndex], {
      autoAlpha: 0,
      y: 18
    }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.42,
      delay: 0.04,
      ease: 'power3.out',
      overwrite: true
    })
    gsap.to(glints[cardIndex], {
      autoAlpha: 1,
      duration: 0.3,
      overwrite: true
    })
    gsap.to(focuses[cardIndex], {
      autoAlpha: 1,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.7)',
      overwrite: true
    })
  }

  const handlePointerOver = event => {
    const card = event.target.closest?.('.oddy-marquee-card')
    if (card && track.contains(card)) activateCard(card)
  }

  const handlePointerMove = event => {
    if (!activeCard || marqueeDragging.value) return
    const bounds = activeCard.getBoundingClientRect()
    const localX = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left))
    const localY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))
    const normalizedX = localX / Math.max(bounds.width, 1) - 0.5
    const normalizedY = localY / Math.max(bounds.height, 1) - 0.5

    activeCard.style.setProperty('--pointer-x', `${((normalizedX + 0.5) * 100).toFixed(1)}%`)
    activeCard.style.setProperty('--pointer-y', `${((normalizedY + 0.5) * 100).toFixed(1)}%`)
    activeMotion.rotationXTo?.(normalizedY * -6)
    activeMotion.rotationYTo?.(normalizedX * 8)
    activeMotion.imageXTo?.(normalizedX * -10)
    activeMotion.imageYTo?.(normalizedY * -8)
    activeMotion.focusXTo?.(localX)
    activeMotion.focusYTo?.(localY)
  }

  const handlePointerLeave = () => resetMotionTargets()

  track.addEventListener('pointerover', handlePointerOver)
  track.addEventListener('pointermove', handlePointerMove, { passive: true })
  track.addEventListener('pointerleave', handlePointerLeave)
  resetMarqueeCardMotion = () => resetMotionTargets()

  marqueeCardMotionCleanup = () => {
    track.removeEventListener('pointerover', handlePointerOver)
    track.removeEventListener('pointermove', handlePointerMove)
    track.removeEventListener('pointerleave', handlePointerLeave)
    resetMotionTargets(true)
    gsap.killTweensOf([...inners, ...media, ...captions, ...glints, ...focuses])
  }
}

const setupProjectMotion = () => {
  projectMotionCleanups.forEach(cleanup => cleanup())
  projectMotionCleanups = []

  if (
    !homeRoot.value ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  homeRoot.value.querySelectorAll('.oddy-project-visual').forEach(visual => {
    const rotationXTo = gsap.quickTo(visual, 'rotationX', {
      duration: 0.5,
      ease: 'power3.out'
    })
    const rotationYTo = gsap.quickTo(visual, 'rotationY', {
      duration: 0.5,
      ease: 'power3.out'
    })
    const scaleTo = gsap.quickTo(visual, 'scale', {
      duration: 0.42,
      ease: 'power3.out'
    })
    let releaseTimer = null

    gsap.set(visual, {
      transformPerspective: 1200,
      transformOrigin: '0% 50%'
    })

    const keepTransformReady = () => {
      if (releaseTimer) {
        window.clearTimeout(releaseTimer)
        releaseTimer = null
      }
      visual.style.willChange = 'transform'
    }

    const handlePointerMove = event => {
      const bounds = visual.getBoundingClientRect()
      const pointerX = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5
      const pointerY = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5

      rotationXTo(pointerY * -4)
      rotationYTo(pointerX * 5)
    }

    const handlePointerEnter = () => {
      keepTransformReady()
      scaleTo(1.008)
    }

    const handlePointerLeave = () => {
      rotationXTo(0)
      rotationYTo(0)
      scaleTo(1)
      releaseTimer = window.setTimeout(() => {
        visual.style.removeProperty('will-change')
        releaseTimer = null
      }, 650)
    }

    const handlePointerDown = event => {
      if (event.button !== 0) return
      keepTransformReady()
      scaleTo(0.992)
    }

    const handlePointerUp = () => {
      scaleTo(1.008)
    }

    visual.addEventListener('pointermove', handlePointerMove)
    visual.addEventListener('pointerenter', handlePointerEnter)
    visual.addEventListener('pointerleave', handlePointerLeave)
    visual.addEventListener('pointerdown', handlePointerDown)
    visual.addEventListener('pointerup', handlePointerUp)
    visual.addEventListener('pointercancel', handlePointerLeave)

    projectMotionCleanups.push(() => {
      if (releaseTimer) window.clearTimeout(releaseTimer)
      visual.removeEventListener('pointermove', handlePointerMove)
      visual.removeEventListener('pointerenter', handlePointerEnter)
      visual.removeEventListener('pointerleave', handlePointerLeave)
      visual.removeEventListener('pointerdown', handlePointerDown)
      visual.removeEventListener('pointerup', handlePointerUp)
      visual.removeEventListener('pointercancel', handlePointerLeave)
      gsap.killTweensOf(visual)
      visual.style.removeProperty('will-change')
    })
  })
}

onMounted(() => {
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Home sections reset after leaving so the reveal is available every
        // time readers return to them, without a page refresh.
        const shouldReveal = entry.isIntersecting && entry.intersectionRatio >= 0.01
        entry.target.classList.toggle('is-visible', shouldReveal)
      })
    }, { threshold: 0.01, rootMargin: '0px 0px -2% 0px' })
    homeRoot.value?.querySelectorAll('.oddy-reveal').forEach(element => revealObserver.observe(element))

    marqueeIsVisible = false
    marqueeObserver = new IntersectionObserver(([entry]) => {
      marqueeIsVisible = entry?.isIntersecting ?? false
      if (marqueeIsVisible) {
        marqueeMounted.value = true
        nextTick(() => {
          measureMarquee()
          setupMarqueeCardMotion()
          setupMarqueeMobileVideos()
          startMarqueeAnimation()
        })
      } else {
        stopMarqueeAnimation()
        destroyMarqueeCardMotion()
        destroyMarqueeMobileVideos()
        marqueeMounted.value = false
      }
    }, { rootMargin: '420px 0px' })
    if (marqueeSection.value) marqueeObserver.observe(marqueeSection.value)

    heroVideoObserver = new IntersectionObserver(([entry]) => {
      heroVideoIsVisible = entry?.isIntersecting ?? false
      if (heroVideoIsVisible && !document.hidden && !pageIsScrolling) {
        heroVideo.value?.play().catch(() => {})
      } else {
        heroVideo.value?.pause()
      }
    }, { rootMargin: '80px 0px' })
    if (heroVideo.value) heroVideoObserver.observe(heroVideo.value)

    noteCarouselObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) resumeCarousel()
      else pauseCarousel()
    }, { rootMargin: '180px 0px' })
    const notesSection = homeRoot.value?.querySelector('.oddy-notes')
    if (notesSection) noteCarouselObserver.observe(notesSection)

    projectImageObserver = new IntersectionObserver(entries => {
      const nextActiveImages = new Set(activeProjectImages.value)
      entries.forEach(entry => {
        const projectTitle = entry.target.dataset.projectImage
        if (!projectTitle) return
        if (entry.isIntersecting) nextActiveImages.add(projectTitle)
        else nextActiveImages.delete(projectTitle)
      })
      activeProjectImages.value = nextActiveImages
    }, { rootMargin: '360px 0px' })
    homeRoot.value
      ?.querySelectorAll('[data-project-image]')
      .forEach(element => projectImageObserver.observe(element))
  } else {
    homeRoot.value?.querySelectorAll('.oddy-reveal').forEach(element => element.classList.add('is-visible'))
    avatarVisible.value = true
    marqueeMounted.value = true
    marqueeIsVisible = true
    activeProjectImages.value = new Set(
      projects.value.filter(project => project.image).map(project => project.anchor)
    )
    resumeCarousel()
    nextTick(() => {
      measureMarquee()
      setupMarqueeCardMotion()
      setupMarqueeMobileVideos()
      startMarqueeAnimation()
    })
  }

  window.addEventListener('resize', measureMarquee, { passive: true })
  window.addEventListener('resize', syncMarqueePreviewMode, { passive: true })

  // The card has an instant still preview. Warm the original model early while
  // the first screen is settling, so its decode and shader compilation do not
  // wait until the reader reaches the avatar on a return scroll.
  avatarWarmupTimer = window.setTimeout(() => {
    const warmAvatar = () => {
      avatarWarmupIdleHandle = 0
      preloadAvatarComponent()
      prefetchAvatarModel()
      avatarVisible.value = true
    }

    if ('requestIdleCallback' in window) {
      avatarWarmupIdleHandle = window.requestIdleCallback(warmAvatar, { timeout: 1200 })
    } else {
      warmAvatar()
    }
  }, 280)

  marqueeReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  measureMarquee()
  document.addEventListener('visibilitychange', handlePageVisibility)
  document.addEventListener('mesting:scroll-state', handleScrollState)
  nextTick(setupProjectMotion)
  startMarqueeAnimation()
})

onUnmounted(() => {
  revealObserver?.disconnect()
  heroVideoObserver?.disconnect()
  marqueeObserver?.disconnect()
  destroyMarqueeMobileVideos()
  noteCarouselObserver?.disconnect()
  projectImageObserver?.disconnect()
  window.removeEventListener('resize', measureMarquee)
  window.removeEventListener('resize', syncMarqueePreviewMode)
  if (avatarWarmupTimer) window.clearTimeout(avatarWarmupTimer)
  if (avatarWarmupIdleHandle && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(avatarWarmupIdleHandle)
  }
  document.removeEventListener('visibilitychange', handlePageVisibility)
  document.removeEventListener('mesting:scroll-state', handleScrollState)
  heroVideo.value?.pause()
  stopMarqueeAnimation()
  if (marqueeDragFrame) window.cancelAnimationFrame(marqueeDragFrame)
  destroyMarqueeCardMotion()
  pauseCarousel()
  projectMotionCleanups.forEach(cleanup => cleanup())
  projectMotionCleanups = []
  trailTimers.forEach(timer => window.clearTimeout(timer))
  trailTimers.clear()
})
</script>

<style>
@import '../css/HomeOddy.css';
</style>
