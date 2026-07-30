<template>
  <div
    ref="articleRoot"
    :class="[
      'article-detail',
      'editorial-article',
      { 'is-flutter-retrospective': isFlutterRetrospective }
    ]"
  >
    <PortfolioHeader />

    
    <div v-if="article" class="article-container">
      <!-- 自定义弹窗组件 -->
      <CustomAlert
        v-if="showAlert"
        :visible="showAlert"
        :title="alertConfig.title"
        :message="alertConfig.message"
        :type="alertConfig.type"
        :show-cancel="alertConfig.showCancel"
        :confirm-text="alertConfig.confirmText"
        :cancel-text="alertConfig.cancelText"
        @confirm="handleAlertConfirm"
        @cancel="handleAlertCancel"
        @close="handleAlertClose"
      />

      <!-- 文章主体 -->
      <article class="article-content">
        <div class="article-toolbar">
          <!-- 返回按钮 -->
          <div class="back-nav">
            <router-link to="/articles" class="back-link article-list-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>{{ copy.backArchive }}</span>
            </router-link>
          </div>

          <!-- 操作按钮 -->
          <div class="article-actions">
            <button @click="toggleEditMode" :class="['action-btn', isEditable ? 'active' : '']">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>{{ isEditable ? copy.cancelEdit : copy.edit }}</span>
            </button>
            <button @click="saveChanges" :disabled="!hasChanges" :class="['action-btn', 'save-btn', hasChanges ? 'has-changes' : '']">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <span>{{ copy.save }}</span>
            </button>
            <button @click="showDeleteConfirm = true" class="action-btn delete-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>{{ copy.delete }}</span>
            </button>
          </div>
        </div>

        <!-- 文章头部 -->
        <header class="article-header">
          <p class="editorial-article-kicker">THINKING ARCHIVE / {{ localizedArticle.category }}</p>
          <h1 
            class="article-title" 
            :contenteditable="isEditable"
            spellcheck="false"
            @blur="handleTitleBlur"
            @input="handleTitleInput"
          >{{ localizedArticle.title }}</h1>
          <p 
            class="article-excerpt"
            :contenteditable="isEditable"
            spellcheck="false"
            @blur="handleExcerptBlur"
            @input="handleExcerptInput"
          >{{ localizedArticle.excerpt }}</p>
          <div class="article-meta-top">
            <span class="meta-item">
              {{ article.date }}
            </span>
            <span class="meta-item">
              {{ localizedArticle.category }}
            </span>
            <span class="meta-item">
              {{ localizedArticle.readTime }} {{ copy.minRead }}
            </span>
          </div>
        </header>

        <!-- 文章内容 -->
        <div class="article-body">
          <!-- 渲染Markdown内容 -->
          <div 
            v-if="localizedArticle.isMarkdown && !isEditable"
            class="markdown-content"
          >
            <div v-html="renderedContent"></div>
          </div>
          <!-- 编辑模式或非Markdown内容 -->
          <div 
            v-else
            ref="contentRef"
            v-html="isEditable ? localizedArticle.content : articleDisplayContent"
            class="markdown-content"
            :contenteditable="isEditable"
            spellcheck="false"
            @blur="handleContentBlur"
            @input="handleContentInput"
            @mouseup="handleTextSelection"
            @keyup="handleTextSelection"
          ></div>
        </div>

        <!-- 浮动工具栏 -->
        <div 
          v-if="showToolbar && isEditable" 
          class="floating-toolbar"
          :style="{ top: toolbarPosition.top + 'px', left: toolbarPosition.left + 'px' }"
        >
          <button @click="formatText('bold')" class="toolbar-btn" :title="copy.bold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button @click="formatText('italic')" class="toolbar-btn" :title="copy.italic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button @click="formatText('strikeThrough')" class="toolbar-btn" :title="copy.strike">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="M4 6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4"/>
              <path d="M4 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4"/>
            </svg>
          </button>
          <div class="toolbar-divider"></div>
          <button @click="formatText('insertUnorderedList')" class="toolbar-btn" :title="copy.unorderedList">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button @click="formatText('insertOrderedList')" class="toolbar-btn" :title="copy.orderedList">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="10" y1="6" x2="21" y2="6"/>
              <line x1="10" y1="12" x2="21" y2="12"/>
              <line x1="10" y1="18" x2="21" y2="18"/>
              <path d="M4 6h1v4"/>
              <path d="M4 10h2"/>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
            </svg>
          </button>
          <div class="toolbar-divider"></div>
          <button @click="formatText('formatBlock', 'h2')" class="toolbar-btn" :title="copy.heading2">
            <span class="toolbar-text">H2</span>
          </button>
          <button @click="formatText('formatBlock', 'h3')" class="toolbar-btn" :title="copy.heading3">
            <span class="toolbar-text">H3</span>
          </button>
          <button @click="formatText('formatBlock', 'p')" class="toolbar-btn" :title="copy.paragraph">
            <span class="toolbar-text">P</span>
          </button>
          <div class="toolbar-divider"></div>
          <button @click="formatText('createLink')" class="toolbar-btn" :title="copy.insertLink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          <button @click="formatText('removeFormat')" class="toolbar-btn" :title="copy.clearFormatting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </article>
    </div>

    <div v-else class="not-found">
      <div class="not-found-content">
        <div class="not-found-icon">📄</div>
        <h2>{{ copy.notFoundTitle }}</h2>
        <p>{{ copy.notFoundText }}</p>
        <router-link to="/articles" class="btn-back">
          {{ copy.backArchive }}
        </router-link>
      </div>
    </div>

    <footer class="editorial-article-footer">
      <router-link to="/articles">{{ copy.backArchive }} <span>↖</span></router-link>
      <span>Mesting / Thinking Archive</span>
    </footer>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ copy.confirmDelete }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ copy.confirmDeleteText }}</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteConfirm = false" class="btn-secondary">{{ copy.cancel }}</button>
          <button @click="confirmDelete" class="btn-danger">{{ copy.delete }}</button>
        </div>
      </div>
    </div>

    <!-- 链接输入对话框 -->
    <div v-if="showLinkDialog" class="modal-overlay" @click="showLinkDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ copy.insertLink }}</h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ copy.linkAddress }}</label>
            <input v-model="linkUrl" type="url" placeholder="https://example.com" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLinkDialog = false" class="btn-secondary">{{ copy.cancel }}</button>
          <button @click="insertLink" class="btn-primary">{{ copy.insert }}</button>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <button 
      v-if="showBackToTop" 
      class="back-to-top" 
      @click="scrollToTop"
      :aria-label="copy.backToTop"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5"/>
        <path d="M5 12l7-7 7 7"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticles } from '../utils/articlesStore'
import { marked } from 'marked'
import TurndownService from 'turndown'
import CustomAlert from '../components/CustomAlert.vue'
import PortfolioHeader from '../components/PortfolioHeader.vue'
import { useLocale } from '../composables/useLocale'
import { localizeArticle } from '../utils/articleTranslations'

// 配置marked以获得更好的渲染效果
marked.setOptions({
  breaks: true,  // 启用换行符
  gfm: true,     // 启用GitHub Flavored Markdown
  headerIds: true,
  mangle: false  // 不转义标题中的特殊字符
})

// 配置Turndown以将HTML转换回Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
})

const route = useRoute()
const router = useRouter()
const { articles, getArticleById, updateArticle, deleteArticle } = useArticles()
const { isChinese } = useLocale()
const copy = computed(() => isChinese.value
  ? {
      backArchive: '返回思考档案',
      cancelEdit: '取消编辑',
      edit: '编辑',
      save: '保存',
      delete: '删除',
      minRead: '分钟阅读',
      bold: '加粗',
      italic: '斜体',
      strike: '删除线',
      unorderedList: '无序列表',
      orderedList: '有序列表',
      heading2: '标题 2',
      heading3: '标题 3',
      paragraph: '段落',
      insertLink: '插入链接',
      clearFormatting: '清除格式',
      notFoundTitle: '文章未找到',
      notFoundText: '抱歉，您查找的文章不存在。',
      confirmDelete: '确认删除',
      confirmDeleteText: '确定要删除这篇文章吗？此操作无法撤销。',
      cancel: '取消',
      linkAddress: '链接地址',
      insert: '插入',
      backToTop: '回到顶部',
      success: '成功',
      updateSuccess: '文章更新成功！',
      deleted: '文章已删除',
      confirm: '确定'
    }
  : {
      backArchive: 'Back to Thinking Archive',
      cancelEdit: 'Cancel Editing',
      edit: 'Edit',
      save: 'Save',
      delete: 'Delete',
      minRead: 'MIN READ',
      bold: 'Bold',
      italic: 'Italic',
      strike: 'Strikethrough',
      unorderedList: 'Bulleted list',
      orderedList: 'Numbered list',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      paragraph: 'Paragraph',
      insertLink: 'Insert Link',
      clearFormatting: 'Clear Formatting',
      notFoundTitle: 'Article Not Found',
      notFoundText: 'The article you are looking for does not exist.',
      confirmDelete: 'Delete Article?',
      confirmDeleteText: 'This action cannot be undone.',
      cancel: 'Cancel',
      linkAddress: 'Link Address',
      insert: 'Insert',
      backToTop: 'Back to top',
      success: 'Success',
      updateSuccess: 'Article updated successfully.',
      deleted: 'Article deleted.',
      confirm: 'Confirm'
    })

const article = ref(null)
const articleRoot = ref(null)
const localizedArticle = computed(() => localizeArticle(article.value, isChinese.value))
const localizedField = (field) => isChinese.value ? field : `${field}En`
const contentRef = ref(null)
const isEditable = ref(false)
const hasChanges = ref(false)
const showDeleteConfirm = ref(false)
const showLinkDialog = ref(false)
const linkUrl = ref('')
const showToolbar = ref(false)
const toolbarPosition = ref({ top: 0, left: 0 })
const showBackToTop = ref(false)
let scrollFrame = 0
let flutterRevealFrame = 0
let flutterRevealObserver = null

const isFlutterRetrospective = computed(() => Number(article.value?.id) === 1001)

const clearFlutterArticleMotion = () => {
  if (flutterRevealFrame) {
    cancelAnimationFrame(flutterRevealFrame)
    flutterRevealFrame = 0
  }

  flutterRevealObserver?.disconnect()
  flutterRevealObserver = null
  articleRoot.value?.classList.remove('flutter-retro-motion-ready')
}

const getFlutterMotionType = (element) => {
  if (element.classList.contains('flutter-retro-overview')) return 'overview'
  if (element.classList.contains('flutter-retro-visual')) {
    return element.classList.contains('flutter-retro-visual--reverse') ? 'visual-reverse' : 'visual'
  }
  if (element.classList.contains('flutter-retro-timeline')) return 'timeline'
  if (
    element.classList.contains('flutter-retro-principles')
    || element.classList.contains('flutter-retro-capability-list')
    || element.classList.contains('flutter-retro-checklist')
    || element.classList.contains('flutter-retro-tech-list')
  ) return 'list'
  if (element.tagName === 'BLOCKQUOTE') return 'quote'
  if (/^H[2-4]$/.test(element.tagName)) return 'heading'
  return 'text'
}

const getFlutterViewportOverlap = (element) => {
  const bounds = element.getBoundingClientRect()
  return Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0))
}

const updateFlutterRevealVisibility = (element) => {
  const bounds = element.getBoundingClientRect()
  const overlap = getFlutterViewportOverlap(element)
  const enterOverlap = Math.min(72, Math.max(26, bounds.height * 0.1))
  const exitOverlap = Math.min(16, Math.max(5, bounds.height * 0.025))
  const isVisible = element.classList.contains('is-flutter-visible')

  // Use separate entry and exit distances. Transforming a partly visible card
  // changes its own bounds; a single zero-threshold observer can otherwise
  // immediately toggle it back and forth while the reader is standing still.
  if (!isVisible && overlap >= enterOverlap) {
    element.classList.add('is-flutter-visible')
  } else if (isVisible && overlap <= exitOverlap) {
    element.classList.remove('is-flutter-visible')
  }
}

const setupFlutterArticleMotion = () => {
  clearFlutterArticleMotion()

  if (!isFlutterRetrospective.value || isEditable.value || !contentRef.value) return

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const specialSelector = [
    '.flutter-retro-overview',
    '.flutter-retro-visual',
    '.flutter-retro-principles',
    '.flutter-retro-capability-list',
    '.flutter-retro-checklist',
    '.flutter-retro-timeline',
    '.flutter-retro-tech-list'
  ].join(',')
  const specialNodes = Array.from(contentRef.value.querySelectorAll(specialSelector))
  const textNodes = Array.from(contentRef.value.children)
    .filter(element => element.matches('h2, h3, h4, p, blockquote, pre'))
  const nodes = [...new Set([...textNodes, ...specialNodes])]

  if (!nodes.length) return

  nodes.forEach((element, index) => {
    element.classList.add('flutter-retro-reveal')
    element.dataset.flutterMotion = getFlutterMotionType(element)
    element.style.setProperty('--flutter-motion-order', `${index % 6}`)
  })
  articleRoot.value?.classList.add('flutter-retro-motion-ready')

  if (reducedMotion || !('IntersectionObserver' in window)) {
    nodes.forEach(element => element.classList.add('is-flutter-visible'))
    return
  }

  flutterRevealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        // Keep observing every block so leaving and re-entering the viewport
        // replays the transition without requiring a page refresh.
        updateFlutterRevealVisibility(entry.target)
      })
    },
    {
      threshold: [0, 0.04, 0.12],
      rootMargin: '0px 0px -6% 0px'
    }
  )

  flutterRevealFrame = requestAnimationFrame(() => {
    flutterRevealFrame = 0
    nodes.forEach(element => {
      updateFlutterRevealVisibility(element)
      flutterRevealObserver?.observe(element)
    })
  })
}

const insertBefore = (content, marker, snippet) => {
  if (!content.includes(marker)) return content
  return content.replace(marker, `${snippet}\n${marker}`)
}

const addClassToFirstListAfter = (content, marker, tag, className) => {
  const markerIndex = content.indexOf(marker)
  if (markerIndex === -1) return content

  const openingTag = `<${tag}>`
  const listIndex = content.indexOf(openingTag, markerIndex + marker.length)
  if (listIndex === -1) return content

  return `${content.slice(0, listIndex)}<${tag} class="${className}">${content.slice(listIndex + openingTag.length)}`
}

const getFlutterArticleVisualCopy = (chinese) => chinese
  ? {
      overviewEyebrow: 'PRODUCT REBUILD / 2026',
      overviewTitle: '先看成果，再进入重构细节。',
      overviewText: '这篇复盘从真实产品界面出发，解释一款网页音乐模块如何成长为持续运行的 Flutter Android 应用。',
      stats: [
        ['43', '项可见能力'],
        ['25', '套视觉主题'],
        ['3', '种播放器形态'],
        ['6', '层产品能力']
      ],
      pathLabel: '阅读路径',
      path: ['产品判断', '播放内核', '视觉系统', '云端与关系'],
      discoverKicker: '01 / DISCOVER',
      discoverTitle: '先找到此刻想听的声音。',
      discoverText: '发现页没有堆满全部功能，而是用推荐、搜索与状态入口缩短从“打开应用”到“开始播放”的距离。',
      discoverCaption: '发现音乐 / 状态推荐',
      discoverAlt: 'Mesting Music 发现音乐页面',
      moodAlt: 'Mesting Music 状态推荐页面',
      playbackKicker: '02 / PLAYBACK',
      playbackTitle: '页面会切换，声音不会重启。',
      playbackText: '全屏播放器、歌单与常驻迷你播放器观察同一份播放状态，视觉重建不再影响声音。',
      playbackCaption: 'Liquid Spectrum 播放器 / 个人歌单',
      playerAlt: 'Mesting Music Liquid Spectrum 全屏播放器',
      playlistAlt: 'Mesting Music 个人歌单详情',
      themeKicker: '03 / VISUAL IDENTITY',
      themeTitle: '主题不是换一张背景图。',
      themeText: '角色、场景、播放器、强调色、明暗模式与动效等级被组织成同一个可降级的视觉系统。',
      themeCaption: '蜡笔小新 / 库洛米 / Hello Kitty 主题系统',
      shinchanAlt: 'Mesting Music 蜡笔小新主题',
      kuromiAlt: 'Mesting Music 库洛米主题',
      kittyAlt: 'Mesting Music Hello Kitty 主题',
      connectionKicker: '04 / CLOUD & CONNECTION',
      connectionTitle: '音乐档案可以被恢复，也可以被分享。',
      connectionText: '账号资料、关注关系与消息服务建立在音乐行为之上，让收藏、身份和一起听自然连接。',
      connectionCaption: '个人音乐空间 / 好友与私信',
      profileAlt: 'Mesting Music 个人音乐空间',
      chatAlt: 'Mesting Music 好友私信页面'
    }
  : {
      overviewEyebrow: 'PRODUCT REBUILD / 2026',
      overviewTitle: 'See the product before entering the implementation.',
      overviewText: 'This retrospective uses real product screens to explain how a web music module grew into a persistent Flutter application for Android.',
      stats: [
        ['43', 'visible capabilities'],
        ['25', 'visual themes'],
        ['3', 'player forms'],
        ['6', 'product layers']
      ],
      pathLabel: 'Reading path',
      path: ['Product decisions', 'Playback core', 'Visual system', 'Cloud & connection'],
      discoverKicker: '01 / DISCOVER',
      discoverTitle: 'Find the right sound for the moment.',
      discoverText: 'Discovery avoids exposing every feature at once. Recommendations, search, and listening states shorten the path from opening the app to pressing play.',
      discoverCaption: 'Discover Music / listening-state entry points',
      discoverAlt: 'Mesting Music Discover screen',
      moodAlt: 'Mesting Music listening status screen',
      playbackKicker: '02 / PLAYBACK',
      playbackTitle: 'Screens change. The sound keeps going.',
      playbackText: 'The full player, playlists, and persistent mini player observe the same playback truth, so rebuilding the interface never restarts the music.',
      playbackCaption: 'Liquid Spectrum player / personal playlist',
      playerAlt: 'Mesting Music Liquid Spectrum full player',
      playlistAlt: 'Mesting Music personal playlist',
      themeKicker: '03 / VISUAL IDENTITY',
      themeTitle: 'A theme is more than a background.',
      themeText: 'Characters, scenes, player forms, accent colors, brightness, and motion tiers belong to one visual system that can gracefully scale down.',
      themeCaption: 'Crayon Shin-chan / Kuromi / Hello Kitty theme systems',
      shinchanAlt: 'Mesting Music Crayon Shin-chan theme',
      kuromiAlt: 'Mesting Music Kuromi theme',
      kittyAlt: 'Mesting Music Hello Kitty theme',
      connectionKicker: '04 / CLOUD & CONNECTION',
      connectionTitle: 'A music archive can be restored—and shared.',
      connectionText: 'Profiles, follows, and messages grow from listening behavior, connecting collections, identity, and shared listening without becoming a separate social product.',
      connectionCaption: 'Personal soundspace / friends and messages',
      profileAlt: 'Mesting Music personal soundspace',
      chatAlt: 'Mesting Music friend chat screen'
    }

const buildFlutterOverview = (visualCopy) => `
  <section class="flutter-retro-overview flutter-retro-wide">
    <div class="flutter-retro-overview-copy">
      <span class="flutter-retro-eyebrow">${visualCopy.overviewEyebrow}</span>
      <h2>${visualCopy.overviewTitle}</h2>
      <p>${visualCopy.overviewText}</p>
      <div class="flutter-retro-reading-path" aria-label="${visualCopy.pathLabel}">
        <span>${visualCopy.pathLabel}</span>
        <div>${visualCopy.path.map((item) => `<em>${item}</em>`).join('')}</div>
      </div>
    </div>
    <div class="flutter-retro-stats">
      ${visualCopy.stats.map(([value, label]) => `
        <div class="flutter-retro-stat">
          <strong>${value}</strong>
          <span>${label}</span>
        </div>
      `).join('')}
    </div>
  </section>
`

const buildFlutterVisual = ({
  kicker,
  title,
  text,
  caption,
  images,
  variant = ''
}) => `
  <figure class="flutter-retro-visual flutter-retro-wide ${variant}">
    <div class="flutter-retro-visual-copy">
      <span class="flutter-retro-eyebrow">${kicker}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <figcaption>${caption}</figcaption>
    </div>
    <div class="flutter-retro-phone-stage">
      ${images.map((image, index) => `
        <div class="flutter-retro-phone flutter-retro-phone--${index + 1}">
          <img
            src="${image.src}"
            alt="${image.alt}"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          >
        </div>
      `).join('')}
    </div>
  </figure>
`

const buildFlutterRetrospectiveContent = (content, chinese) => {
  if (!content) return ''

  const visualCopy = getFlutterArticleVisualCopy(chinese)
  const headings = chinese
    ? {
        playback: '<h2>三、播放内核：把声音移出页面生命周期</h2>',
        architecture: '<h2>四、信息架构：让 43 项能力仍然容易理解</h2>',
        data: '<h2>六、数据层：本地可靠，云端可恢复</h2>',
        performance: '<h2>七、性能不是最后补救，而是主题系统的一部分</h2>',
        migration: '<h2>八、迁移过程：先搭脊柱，再恢复表情</h2>',
        technology: '<h2>九、使用到的核心技术</h2>',
        principles: '<h3>我坚持的六条设计原则</h3>'
      }
    : {
        playback: '<h2>3. The Playback Core: Moving Sound Beyond the Widget Lifecycle</h2>',
        architecture: '<h2>4. Information Architecture for 43 Capabilities</h2>',
        data: '<h2>6. Data: Reliable Locally, Recoverable from the Cloud</h2>',
        performance: '<h2>7. Performance Is Part of the Theme System</h2>',
        migration: '<h2>8. The Migration Sequence: Build the Spine Before the Expression</h2>',
        technology: '<h2>9. Core Technology Choices</h2>',
        principles: '<h3>Six Principles Behind the Rebuild</h3>'
      }

  const discoverVisual = buildFlutterVisual({
    kicker: visualCopy.discoverKicker,
    title: visualCopy.discoverTitle,
    text: visualCopy.discoverText,
    caption: visualCopy.discoverCaption,
    images: [
      { src: '/generated/flutter-music/real-screens/discover.jpg', alt: visualCopy.discoverAlt },
      { src: '/generated/flutter-music/real-screens/mood-status.jpg', alt: visualCopy.moodAlt }
    ]
  })

  const playbackVisual = buildFlutterVisual({
    kicker: visualCopy.playbackKicker,
    title: visualCopy.playbackTitle,
    text: visualCopy.playbackText,
    caption: visualCopy.playbackCaption,
    variant: 'flutter-retro-visual--reverse flutter-retro-visual--night',
    images: [
      { src: '/generated/flutter-music/real-screens/player-liquid.jpg', alt: visualCopy.playerAlt },
      { src: '/generated/flutter-music/real-screens/playlist-detail.jpg', alt: visualCopy.playlistAlt }
    ]
  })

  const themeVisual = buildFlutterVisual({
    kicker: visualCopy.themeKicker,
    title: visualCopy.themeTitle,
    text: visualCopy.themeText,
    caption: visualCopy.themeCaption,
    variant: 'flutter-retro-visual--triple flutter-retro-visual--rose',
    images: [
      { src: '/generated/flutter-music/real-screens/theme-shinchan.jpg', alt: visualCopy.shinchanAlt },
      { src: '/generated/flutter-music/real-screens/theme-kuromi.jpg', alt: visualCopy.kuromiAlt },
      { src: '/generated/flutter-music/real-screens/theme-kitty.jpg', alt: visualCopy.kittyAlt }
    ]
  })

  const connectionVisual = buildFlutterVisual({
    kicker: visualCopy.connectionKicker,
    title: visualCopy.connectionTitle,
    text: visualCopy.connectionText,
    caption: visualCopy.connectionCaption,
    variant: 'flutter-retro-visual--reverse flutter-retro-visual--blue',
    images: [
      { src: '/generated/flutter-music/real-screens/profile-home.jpg', alt: visualCopy.profileAlt },
      { src: '/generated/flutter-music/real-screens/chat.jpg', alt: visualCopy.chatAlt }
    ]
  })

  let enhanced = `${buildFlutterOverview(visualCopy)}${content}`
  enhanced = insertBefore(enhanced, headings.playback, discoverVisual)
  enhanced = insertBefore(enhanced, headings.architecture, playbackVisual)
  enhanced = insertBefore(enhanced, headings.data, themeVisual)
  enhanced = insertBefore(enhanced, headings.performance, connectionVisual)
  enhanced = addClassToFirstListAfter(enhanced, headings.principles, 'ul', 'flutter-retro-principles')
  enhanced = addClassToFirstListAfter(enhanced, headings.architecture, 'ul', 'flutter-retro-capability-list')
  enhanced = addClassToFirstListAfter(enhanced, headings.performance, 'ul', 'flutter-retro-checklist')
  enhanced = addClassToFirstListAfter(enhanced, headings.migration, 'ol', 'flutter-retro-timeline')
  enhanced = addClassToFirstListAfter(enhanced, headings.technology, 'ul', 'flutter-retro-tech-list')

  return enhanced
}

const articleDisplayContent = computed(() => {
  if (!isFlutterRetrospective.value) return localizedArticle.value?.content || ''
  return buildFlutterRetrospectiveContent(localizedArticle.value?.content || '', isChinese.value)
})

// 监听滚动，控制回到顶部按钮显示
const handleScroll = () => {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    const scrollElement = document.scrollingElement || document.documentElement
    const scrollTop =
      window.scrollY ||
      scrollElement.scrollTop ||
      document.body.scrollTop ||
      0

    showBackToTop.value = scrollTop > 200
  })
}

// 回到顶部
const scrollToTop = () => {
  const targets = [
    'window',
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.querySelector('.app-main'),
    document.querySelector('.main-content'),
    document.querySelector('.article-detail'),
    document.querySelector('.article-container')
  ]
    .filter(Boolean)
    // 去重
    .filter((el, index, arr) => arr.indexOf(el) === index)

  const scrollWithBehavior = (el) => {
    // window
    if (el === 'window') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        window.scrollTo(0, 0)
      }
      return
    }

    // 其他可滚动元素
    if (typeof el.scrollTo === 'function') {
      try {
        el.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        el.scrollTop = 0
      }
    } else {
      el.scrollTop = 0
    }
  }

  targets.forEach(scrollWithBehavior)
}

// 自定义弹窗状态
const showAlert = ref(false)

// 弹窗配置
const alertConfig = ref({
  title: copy.value.confirm,
  message: '',
  type: 'info',
  showCancel: false,
  confirmText: copy.value.confirm,
  cancelText: copy.value.cancel
})

// 弹窗回调函数
const alertCallback = ref(null)

// 显示自定义弹窗
const showCustomAlert = (config, callback = null) => {
  alertConfig.value = { ...alertConfig.value, ...config }
  alertCallback.value = callback
  showAlert.value = true
}

// 处理弹窗确认
const handleAlertConfirm = () => {
  showAlert.value = false
  if (alertCallback.value) {
    alertCallback.value()
  }
}

// 处理弹窗取消
const handleAlertCancel = () => {
  showAlert.value = false
  if (alertCallback.value) {
    alertCallback.value('cancel')
  }
}

// 处理弹窗关闭
const handleAlertClose = () => {
  showAlert.value = false
}

// 原始数据，用于比较是否有变化
const originalData = ref({
  title: '',
  excerpt: '',
  content: ''
})

// 渲染Markdown内容
const renderedContent = ref('')

// 监听文章内容变化，重新渲染Markdown
watch(() => localizedArticle.value?.content, (newContent) => {
  if (newContent) {
    try {
      console.log('渲染前 content 长度:', newContent.length)
      let rendered = marked(newContent)
      // 转义script标签，防止内容被截断
      rendered = rendered.replace(/<script/gi, '&lt;script')
      renderedContent.value = rendered
      console.log('渲染后 renderedContent 长度:', renderedContent.value.length)
    } catch (error) {
      console.error('Markdown渲染错误:', error)
      renderedContent.value = `<p>Markdown渲染错误: ${error.message}</p>`
    }
  }
}, { immediate: true })

// 切换语言时同步当前语言的编辑基准，避免取消编辑后恢复到另一种语言
watch(isChinese, () => {
  if (!article.value || isEditable.value) return

  originalData.value = {
    title: localizedArticle.value.title,
    excerpt: localizedArticle.value.excerpt,
    content: localizedArticle.value.content
  }
  hasChanges.value = false
})

watch(
  [articleDisplayContent, isEditable],
  setupFlutterArticleMotion,
  { flush: 'post' }
)

// 切换编辑模式
const toggleEditMode = () => {
  console.log('toggleEditMode, 当前 isEditable:', isEditable.value)
  console.log('originalData.value.content 长度:', originalData.value?.content?.length)
      console.log('localizedArticle.value.content 长度:', localizedArticle.value?.content?.length)
  
  isEditable.value = !isEditable.value
  if (!isEditable.value) {
    // 退出编辑模式，恢复原始内容
    if (article.value) {
      article.value[localizedField('title')] = originalData.value.title
      article.value[localizedField('excerpt')] = originalData.value.excerpt
      article.value[localizedField('content')] = originalData.value.content
      console.log('恢复后 localizedArticle.value.content 长度:', localizedArticle.value.content.length)
    }
    hasChanges.value = false
  }
}

// 处理标题输入
const handleTitleInput = () => {
  hasChanges.value = true
}

// 处理标题失焦
const handleTitleBlur = (e) => {
  if (article.value) {
    article.value[localizedField('title')] = e.target.textContent
  }
}

// 处理摘要输入
const handleExcerptInput = () => {
  hasChanges.value = true
}

// 处理摘要失焦
const handleExcerptBlur = (e) => {
  if (article.value) {
    article.value[localizedField('excerpt')] = e.target.textContent
  }
}

// 处理内容输入
const handleContentInput = () => {
  hasChanges.value = true
}

// 处理内容失焦
const handleContentBlur = () => {
  if (contentRef.value && article.value) {
    article.value[localizedField('content')] = contentRef.value.innerHTML
  }
}

// 处理文本选择
const handleTextSelection = () => {
  if (!isEditable.value) {
    showToolbar.value = false
    return
  }

  const selection = window.getSelection()
  if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    
    toolbarPosition.value = {
      top: rect.top + scrollY - 50,
      left: rect.left + (rect.width / 2) - 200
    }
    showToolbar.value = true
  } else {
    showToolbar.value = false
  }
}

// 格式化文本
const formatText = (command, value = null) => {
  if (command === 'createLink') {
    showLinkDialog.value = true
    return
  }

  document.execCommand(command, false, value)
  hasChanges.value = true
  nextTick(() => {
    handleTextSelection()
  })
}

// 插入链接
const insertLink = () => {
  if (linkUrl.value) {
    document.execCommand('createLink', false, linkUrl.value)
    hasChanges.value = true
    showLinkDialog.value = false
    linkUrl.value = ''
  }
}

// 保存更改
const saveChanges = () => {
  if (!article.value) return

  const titleField = localizedField('title')
  const excerptField = localizedField('excerpt')
  const contentField = localizedField('content')
  const markdownField = localizedField('markdownContent')
  const readTimeField = localizedField('readTime')
  const editedTitle = article.value[titleField] || localizedArticle.value.title
  const editedExcerpt = article.value[excerptField] || localizedArticle.value.excerpt
  const editedContent = contentRef.value?.innerHTML
    || article.value[contentField]
    || localizedArticle.value.content

  // 将当前语言的 HTML 内容转换回 Markdown
  const markdownContent = turndownService.turndown(editedContent)

  // 更新文章
  updateArticle(article.value.id, {
    [titleField]: editedTitle,
    [excerptField]: editedExcerpt,
    [contentField]: editedContent,
    [markdownField]: markdownContent,
    [readTimeField]: Math.ceil(markdownContent.length / 100),
    ...(!isChinese.value ? { translationOverride: true } : {})
  })

  // 更新原始数据
  originalData.value = {
    title: editedTitle,
    excerpt: editedExcerpt,
    content: editedContent
  }

  hasChanges.value = false
  isEditable.value = false
  // 使用自定义弹窗替代默认alert
  showCustomAlert({
    title: copy.value.success,
    message: copy.value.updateSuccess,
    type: 'success',
    showCancel: false,
    confirmText: copy.value.confirm
  })
}

// 确认删除
const confirmDelete = () => {
  if (article.value) {
    deleteArticle(article.value.id)
    showDeleteConfirm.value = false
    // 使用自定义弹窗替代默认alert
    showCustomAlert({
      title: copy.value.success,
      message: copy.value.deleted,
      type: 'success',
      showCancel: false,
      confirmText: copy.value.confirm
    }, () => {
      router.push('/articles')
    })
  }
}

// 点击其他地方隐藏工具栏
const handleClickOutside = (e) => {
  if (!e.target.closest('.floating-toolbar')) {
    showToolbar.value = false
  }
}

onMounted(() => {
  const id = parseInt(route.params.id)
  article.value = getArticleById(id)

  if (article.value) {
    // 立即渲染Markdown内容
    if (localizedArticle.value.isMarkdown && localizedArticle.value.content) {
      try {
        renderedContent.value = marked(localizedArticle.value.content)
      } catch (error) {
        console.error('Markdown渲染错误:', error)
        renderedContent.value = `<p>Markdown渲染错误: ${error.message}</p>`
      }
    }
    
    // 保存原始数据
    originalData.value = {
      title: localizedArticle.value.title,
      excerpt: localizedArticle.value.excerpt,
      content: localizedArticle.value.content
    }
  }

  // 不再设置body背景样式，让App.vue统一管理

  // 添加点击外部事件监听
  document.addEventListener('click', handleClickOutside)
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true })
  nextTick(() => {
    handleScroll()
    setupFlutterArticleMotion()
  })
})

onUnmounted(() => {
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = 0
  }

  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
  clearFlutterArticleMotion()
})
</script>
<style scoped>
@import '../css/ArticleDetail.css';
</style>
<style>
@import '../css/ArticleDetailEditorial.css';
</style>
