<template>
  <div class="article-detail">

    
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
            <router-link v-if="route.query.fromCategory && route.query.fromCategory !== '全部'" :to="`/category/${route.query.fromCategory}`" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>返回{{ route.query.fromCategory }}</span>
            </router-link>
            <router-link to="/articles" class="back-link article-list-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>返回文章列表</span>
            </router-link>
          </div>

          <!-- 操作按钮 -->
          <div class="article-actions">
            <button @click="toggleEditMode" :class="['action-btn', isEditable ? 'active' : '']">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>{{ isEditable ? '取消编辑' : '编辑' }}</span>
            </button>
            <button @click="saveChanges" :disabled="!hasChanges" :class="['action-btn', 'save-btn', hasChanges ? 'has-changes' : '']">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <span>保存</span>
            </button>
            <button @click="showDeleteConfirm = true" class="action-btn delete-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>删除</span>
            </button>
          </div>
        </div>

        <!-- 文章头部 -->
        <header class="article-header">
          <div class="article-meta-top">
            <span class="meta-item">
              <span class="meta-icon">📅</span>
              {{ article.date }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📁</span>
              {{ article.category }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              {{ article.readTime }} 分钟阅读
            </span>
          </div>
          <h1 
            class="article-title" 
            :contenteditable="isEditable"
            spellcheck="false"
            @blur="handleTitleBlur"
            @input="handleTitleInput"
          >{{ article.title }}</h1>
          <p 
            class="article-excerpt"
            :contenteditable="isEditable"
            spellcheck="false"
            @blur="handleExcerptBlur"
            @input="handleExcerptInput"
          >{{ article.excerpt }}</p>
        </header>

        <!-- 文章内容 -->
        <div class="article-body">
          <!-- 渲染Markdown内容 -->
          <div 
            v-if="article.isMarkdown && !isEditable"
            class="markdown-content"
          >
            <div v-html="renderedContent"></div>
          </div>
          <!-- 编辑模式或非Markdown内容 -->
          <div 
            v-else
            ref="contentRef"
            v-html="article.content" 
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
          <button @click="formatText('bold')" class="toolbar-btn" title="加粗">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button @click="formatText('italic')" class="toolbar-btn" title="斜体">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button @click="formatText('strikeThrough')" class="toolbar-btn" title="删除线">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="M4 6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4"/>
              <path d="M4 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4"/>
            </svg>
          </button>
          <div class="toolbar-divider"></div>
          <button @click="formatText('insertUnorderedList')" class="toolbar-btn" title="无序列表">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button @click="formatText('insertOrderedList')" class="toolbar-btn" title="有序列表">
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
          <button @click="formatText('formatBlock', 'h2')" class="toolbar-btn" title="标题2">
            <span class="toolbar-text">H2</span>
          </button>
          <button @click="formatText('formatBlock', 'h3')" class="toolbar-btn" title="标题3">
            <span class="toolbar-text">H3</span>
          </button>
          <button @click="formatText('formatBlock', 'p')" class="toolbar-btn" title="段落">
            <span class="toolbar-text">P</span>
          </button>
          <div class="toolbar-divider"></div>
          <button @click="formatText('createLink')" class="toolbar-btn" title="插入链接">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          <button @click="formatText('removeFormat')" class="toolbar-btn" title="清除格式">
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
        <h2>文章未找到</h2>
        <p>抱歉，您查找的文章不存在</p>
        <router-link to="/articles" class="btn-back">
          返回文章列表
        </router-link>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-body">
          <p>确定要删除这篇文章吗？此操作无法撤销。</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteConfirm = false" class="btn-secondary">取消</button>
          <button @click="confirmDelete" class="btn-danger">删除</button>
        </div>
      </div>
    </div>

    <!-- 链接输入对话框 -->
    <div v-if="showLinkDialog" class="modal-overlay" @click="showLinkDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>插入链接</h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>链接地址</label>
            <input v-model="linkUrl" type="url" placeholder="https://example.com" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLinkDialog = false" class="btn-secondary">取消</button>
          <button @click="insertLink" class="btn-primary">插入</button>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <button 
      v-if="showBackToTop" 
      class="back-to-top" 
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5"/>
        <path d="M5 12l7-7 7 7"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticles } from '../utils/articlesStore'
import { marked } from 'marked'
import TurndownService from 'turndown'
import CustomAlert from '../components/CustomAlert.vue'

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

const article = ref(null)
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
  title: '提示',
  message: '',
  type: 'info',
  showCancel: false,
  confirmText: '确定',
  cancelText: '取消'
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
import { watch } from 'vue'
watch(() => article.value?.content, (newContent) => {
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

// 切换编辑模式
const toggleEditMode = () => {
  console.log('toggleEditMode, 当前 isEditable:', isEditable.value)
  console.log('originalData.value.content 长度:', originalData.value?.content?.length)
  console.log('article.value.content 长度:', article.value?.content?.length)
  
  isEditable.value = !isEditable.value
  if (!isEditable.value) {
    // 退出编辑模式，恢复原始内容
    if (article.value) {
      article.value.title = originalData.value.title
      article.value.excerpt = originalData.value.excerpt
      article.value.content = originalData.value.content
      console.log('恢复后 article.value.content 长度:', article.value.content.length)
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
    article.value.title = e.target.textContent
  }
}

// 处理摘要输入
const handleExcerptInput = () => {
  hasChanges.value = true
}

// 处理摘要失焦
const handleExcerptBlur = (e) => {
  if (article.value) {
    article.value.excerpt = e.target.textContent
  }
}

// 处理内容输入
const handleContentInput = () => {
  hasChanges.value = true
}

// 处理内容失焦
const handleContentBlur = () => {
  if (contentRef.value && article.value) {
    article.value.content = contentRef.value.innerHTML
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

  // 将HTML内容转换回Markdown
  const markdownContent = turndownService.turndown(article.value.content)

  // 更新文章
  updateArticle(article.value.id, {
    title: article.value.title,
    excerpt: article.value.excerpt,
    content: article.value.content,
    markdownContent: markdownContent,
    readTime: Math.ceil(markdownContent.length / 100)
  })

  // 更新原始数据
  originalData.value = {
    title: article.value.title,
    excerpt: article.value.excerpt,
    content: article.value.content
  }

  hasChanges.value = false
  isEditable.value = false
  // 使用自定义弹窗替代默认alert
  showCustomAlert({
    title: '成功',
    message: '文章更新成功！',
    type: 'success',
    showCancel: false,
    confirmText: '确定'
  })
}

// 确认删除
const confirmDelete = () => {
  if (article.value) {
    deleteArticle(article.value.id)
    showDeleteConfirm.value = false
    // 使用自定义弹窗替代默认alert
    showCustomAlert({
      title: '成功',
      message: '文章已删除',
      type: 'success',
      showCancel: false,
      confirmText: '确定'
    }, () => {
      // 返回上一页
      if (route.query.fromCategory && route.query.fromCategory !== '全部') {
        router.push(`/category/${route.query.fromCategory}`)
      } else {
        router.push('/articles')
      }
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
    if (article.value.isMarkdown && article.value.content) {
      try {
        renderedContent.value = marked(article.value.content)
      } catch (error) {
        console.error('Markdown渲染错误:', error)
        renderedContent.value = `<p>Markdown渲染错误: ${error.message}</p>`
      }
    }
    
    // 保存原始数据
    originalData.value = {
      title: article.value.title,
      excerpt: article.value.excerpt,
      content: article.value.content
    }
  }

  // 不再设置body背景样式，让App.vue统一管理

  // 添加点击外部事件监听
  document.addEventListener('click', handleClickOutside)
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true })
  nextTick(() => handleScroll())
})

onUnmounted(() => {
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = 0
  }

  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>
<style scoped>
@import '../css/ArticleDetail.css';
</style>
