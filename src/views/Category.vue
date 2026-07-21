<template>
  <div class="category-page">
    <div class="container">
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

      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          首页
        </router-link>
        <span class="breadcrumb-separator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
        <span class="breadcrumb-current">{{ categoryName }}</span>
      </nav>

      <!-- 分类标题 - 全新设计 -->
      <header class="category-header">
        <div class="header-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
        <div class="header-content">
          <div class="category-badge">
            <span class="badge-icon">{{ categoryIcon }}</span>
            <span class="badge-text">{{ filteredArticles.length }} 篇记录</span>
          </div>
          <h1 class="category-title">{{ categoryName }}</h1>
          <p class="category-description">{{ categoryDescription }}</p>
          <div class="header-stats">
            <div class="stat-item">
              <div class="stat-icon">📖</div>
              <div class="stat-info">
                <span class="stat-value">{{ totalReadTime }}</span>
                <span class="stat-label">总阅读时长</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-value">{{ thisMonthCount }}</span>
                <span class="stat-label">本月新增</span>
              </div>
            </div>
          </div>
        </div>
        <button v-if="['学习记录', 'CSS', 'JavaScript', 'Vue', '前端开发', '后端开发'].includes(categoryName)" @click="showAddForm = true" class="btn-add-new">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>新建记录</span>
        </button>
      </header>

      <!-- 添加学习记录表单 -->
      <div v-if="showAddForm" class="add-form-overlay">
        <div class="add-form-container">
          <div class="form-header">
            <div class="form-header-left">
              <div class="form-icon">✨</div>
              <div>
                <h2 class="form-title">创建学习记录</h2>
                <p class="form-subtitle">记录你的学习历程和心得</p>
              </div>
            </div>
            <button @click="showAddForm = false" class="btn-close-form">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="add-form">
            <div class="form-row">
              <div class="form-group">
                <label for="title">
                  <span class="label-icon">📝</span>
                  标题
                </label>
                <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  placeholder="输入学习记录标题..."
                  required
                >
              </div>
              <div class="form-group">
                <label>
                  <span class="label-icon">📎</span>
                  上传文件
                </label>
                <div class="file-upload-area" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleFileDrop">
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".md,.docx,.doc"
                    @change="handleFileChange"
                    style="display: none"
                  >
                  <div v-if="!uploadedFile" class="upload-placeholder">
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p class="upload-text">点击或拖拽文件</p>
                    <p class="upload-hint">支持 .md .docx .doc</p>
                  </div>
                  <div v-else class="uploaded-file">
                    <div class="file-type-icon">📄</div>
                    <div class="file-info">
                      <p class="file-name">{{ uploadedFile.name }}</p>
                      <p class="file-size">{{ formatFileSize(uploadedFile.size) }}</p>
                    </div>
                    <button type="button" @click.stop="removeFile" class="btn-remove-file">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="excerpt">
                <span class="label-icon">💡</span>
                摘要
              </label>
              <textarea
                id="excerpt"
                v-model="formData.excerpt"
                placeholder="描述学习内容和心得体会..."
                rows="4"
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddForm = false" class="btn-cancel">
                取消
              </button>
              <button type="submit" class="btn-submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                保存记录
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 文章列表 - 全新卡片设计 -->
      <section class="articles-section">
        <div v-if="filteredArticles.length > 0" class="article-grid">
          <article 
            v-for="(article, index) in filteredArticles" 
            :key="article.id" 
            class="article-card"
            :class="getCardTheme(index)"
          >
            <div class="card-header">
              <div class="card-number">{{ getArticleNumber(article.id) }}</div>
              <div class="card-badges">
                <span class="badge" :class="getBadgeClass(article.category)">
                  {{ article.category }}
                </span>
                <span class="badge date-badge">
                  {{ formatDate(article.date) }}
                </span>
              </div>
            </div>
            
            <div class="card-body">
              <h2 class="card-title">{{ article.title }}</h2>
              <div class="card-excerpt" v-html="renderExcerpt(article)"></div>
              
              <div v-if="article.file" class="card-file">
                <div class="file-type">{{ getFileType(article.file.name) }}</div>
                <span class="file-name">{{ article.file.name }}</span>
              </div>
              
              <div class="card-footer">
                <div class="card-meta">
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ article.readTime }} 分钟
                  </span>
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    {{ article.category }}
                  </span>
                </div>
                
                <div class="card-actions">
                  <button @click="showDeleteDialog(article)" class="btn-card-action delete-action" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                  <router-link :to="`/article/${article.id}?fromCategory=${categoryName}`" class="btn-card-action view-action" title="查看详情">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </router-link>
                </div>
              </div>
            </div>
            
            <div class="card-decoration">
              <div class="decoration-dot dot-1"></div>
              <div class="decoration-dot dot-2"></div>
              <div class="decoration-dot dot-3"></div>
            </div>
          </article>
        </div>
        
        <div v-else class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">📚</div>
            <div class="empty-decoration">
              <div class="deco-circle deco-1"></div>
              <div class="deco-circle deco-2"></div>
              <div class="deco-circle deco-3"></div>
            </div>
          </div>
          <h3 class="empty-title">暂无学习记录</h3>
          <p class="empty-description">开始记录你的学习旅程吧！</p>
          <router-link to="/" class="btn-back-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            返回首页
          </router-link>
        </div>
      </section>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click="cancelDelete">
      <div class="delete-confirm-dialog" @click.stop>
        <div class="delete-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="delete-confirm-content">
          <h3>确认删除</h3>
          <p>确定要删除学习记录「{{ articleToDelete?.title }}」吗？</p>
          <p class="delete-warning">此操作不可恢复</p>
        </div>
        <div class="delete-confirm-actions">
          <button @click="cancelDelete" class="btn-cancel-delete">取消</button>
          <button @click="confirmDelete" class="btn-confirm-delete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useArticles } from '../utils/articlesStore'
import { marked } from 'marked'
import CustomAlert from '../components/CustomAlert.vue'

// 配置marked以获得更好的渲染效果
marked.setOptions({
  breaks: true,  // 启用换行符
  gfm: true,     // 启用GitHub Flavored Markdown
  headerIds: true,
  mangle: false  // 不转义标题中的特殊字符
})

const route = useRoute()
const { articles, addArticle, deleteArticle } = useArticles()

// 文件输入框引用
const fileInput = ref(null)

// 表单显示状态
const showAddForm = ref(false)

// 删除确认状态
const showDeleteConfirm = ref(false)
const articleToDelete = ref(null)

// 表单数据
const formData = ref({
  title: '',
  excerpt: ''
})

// 上传的文件
const uploadedFile = ref(null)

// 文件内容
const fileContent = ref('')

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

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件拖拽
const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件
const processFile = (file) => {
  const validTypes = ['.md', '.docx', '.doc']
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

  if (!validTypes.includes(fileExtension)) {
    showCustomAlert({
      title: '提示',
      message: '只支持 .md、.docx 或 .doc 文件',
      type: 'warning',
      showCancel: false,
      confirmText: '确定'
    })
    return
  }

  uploadedFile.value = file

  // 如果标题为空，使用文件名作为标题
  if (!formData.value.title.trim()) {
    formData.value.title = file.name.replace(/\.[^/.]+$/, '')
  }

  // 读取文件内容
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      let content = e.target.result
      
      console.log('文件读取完成，原始内容长度:', content ? content.length : 0)
      
      // 检查是否有乱码（如果包含'白菜你哼'这样的乱码）
      if (content.includes('白菜你哼')) {
        // 乱码处理
        content = content.replace(/白菜你哼/g, '脚本')
      }
      
      fileContent.value = content
      console.log('fileContent.value 保存后长度:', fileContent.value ? fileContent.value.length : 0)
      
      // 如果摘要为空，使用文件内容的前200个字符
      if (!formData.value.excerpt.trim()) {
        formData.value.excerpt = content.substring(0, 200) + (content.length > 200 ? '...' : '')
      }
    } catch (error) {
      console.error('文件内容处理错误:', error)
      showCustomAlert({
        title: '错误',
        message: '文件内容处理失败，请重试',
        type: 'error',
        showCancel: false,
        confirmText: '确定'
      })
    }
  }

  reader.onerror = (e) => {
    console.error('文件读取错误:', e)
    showCustomAlert({
      title: '错误',
      message: '文件读取失败，请重试',
      type: 'error',
      showCancel: false,
      confirmText: '确定'
    })
  }

  reader.onabort = (e) => {
    console.error('文件读取被中止:', e)
    showCustomAlert({
      title: '错误',
      message: '文件读取被中止，请重试',
      type: 'error',
      showCancel: false,
      confirmText: '确定'
    })
  }

  if (fileExtension === '.md') {
    // 显式指定UTF-8编码，确保正确读取中文内容
    console.log('开始读取文件:', file.name, '大小:', file.size, '字节')
    console.log('文件类型:', file.type)
    // 使用readAsText方法读取文件，显式指定UTF-8编码
    reader.readAsText(file, 'UTF-8')
  } else {
    // 对于 Word 文件，暂时只显示文件信息
    if (!formData.value.excerpt.trim()) {
      formData.value.excerpt = `已上传文件：${file.name}（${formatFileSize(file.size)}）`
    }
  }
}

// 移除文件
const removeFile = () => {
  uploadedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 简单的Markdown到HTML转换
const convertMarkdownToHtml = (markdown) => {
  try {
    console.log('开始转换Markdown，长度:', markdown.length)
    
    // 使用简单的字符串替换来转换基本Markdown格式
    let html = markdown
      // 转换标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 转换粗体
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // 转换斜体
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // 转换无序列表
      .replace(/^\s*\-\s*(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
      // 转换有序列表
      .replace(/^\s*\d+\.\s*(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gims, '<ol>$1</ol>')
      // 转换段落
      .replace(/^(?!<h[1-6]>)(?!<ul>)(?!<ol>)(?!<li>)(.*$)/gim, '<p>$1</p>')
      // 转换换行
      .replace(/\n/gim, '<br>')
    
    console.log('转换完成，HTML长度:', html.length)
    console.log('HTML前100个字符:', html.substring(0, 100))
    return html
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return markdown
  }
}

// 提交表单
const handleSubmit = () => {
  // 检查标题和摘要是否填写
  const title = formData.value.title?.trim() || ''
  const excerpt = formData.value.excerpt?.trim() || ''
  
  if (!title || !excerpt) {
    showCustomAlert({
      title: '提示',
      message: '请填写完整信息：标题和摘要不能为空',
      type: 'warning',
      showCancel: false,
      confirmText: '确定'
    })
    return
  }

  // 直接使用原始Markdown内容
  let content = fileContent.value || `
# ${formData.value.title}

${formData.value.excerpt}

${uploadedFile.value ? `## 附件
${uploadedFile.value.name}` : ''}
  `
  
  console.log('提交时 content 长度:', content ? content.length : 0)
  console.log('提交时 fileContent.value 长度:', fileContent.value ? fileContent.value.length : 0)

  const newArticle = {
    title: formData.value.title,
    excerpt: formData.value.excerpt,
    date: new Date().toISOString().split('T')[0],
    category: categoryName.value,
    readTime: 0, // 默认阅读时长为0分钟
    content: content,
    isMarkdown: true, // 标记这是Markdown内容
    file: uploadedFile.value ? {
      name: uploadedFile.value.name,
      size: uploadedFile.value.size,
      type: uploadedFile.value.type
    } : null
  }

  addArticle(newArticle)

  // 重置表单
  formData.value = {
    title: '',
    excerpt: ''
  }
  uploadedFile.value = null
  fileContent.value = '' // 重置文件内容

  // 关闭表单
  showAddForm.value = false

  // 确保 categoryName 是字符串
  const categoryNameStr = typeof categoryName.value === 'string' ? categoryName.value : '未知分类'
  // 使用自定义弹窗替代默认alert
  showCustomAlert({
    title: '成功',
    message: `${categoryNameStr}记录添加成功！`,
    type: 'success',
    showCancel: false,
    confirmText: '确定'
  })
}

// 显示删除确认对话框
const showDeleteDialog = (article) => {
  articleToDelete.value = article
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = () => {
  if (articleToDelete.value) {
    deleteArticle(articleToDelete.value.id)
    showDeleteConfirm.value = false
    articleToDelete.value = null
    // 使用自定义弹窗替代默认alert
    showCustomAlert({
      title: '成功',
      message: '学习记录已删除',
      type: 'success',
      showCancel: false,
      confirmText: '确定'
    })
  }
}

// 取消删除
const cancelDelete = () => {
  showDeleteConfirm.value = false
  articleToDelete.value = null
}

// 分类信息映射
const categoryInfo = {
  'Vue': {
    icon: '⚡',
    description: '渐进式JavaScript框架，专注于构建用户界面'
  },
  'JavaScript': {
    icon: '📜',
    description: 'Web开发的基石，支持面向对象和函数式编程'
  },
  'CSS': {
    icon: '🎨',
    description: '层叠样式表，负责网页的视觉表现和布局'
  },
  '学习记录': {
    icon: '📚',
    description: '记录学习历程，分享技术心得和实践经验'
  }
}

// 当前分类名称
const categoryName = computed(() => {
  const name = route.params.name
  return typeof name === 'string' ? name : '未知分类'
})

// 当前分类图标
const categoryIcon = computed(() => {
  return categoryInfo[categoryName.value]?.icon || '📁'
})

// 当前分类描述
const categoryDescription = computed(() => {
  return categoryInfo[categoryName.value]?.description || '该分类的文章列表'
})

// 筛选当前分类的文章
const filteredArticles = computed(() => {
  return articles.value
    .filter(article => article.category === categoryName.value)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
})

// 获取文章的编号（基于当前分类下的文章顺序）
const getArticleNumber = (articleId) => {
  const index = filteredArticles.value.findIndex(article => article.id === articleId)
  return index + 1
}

// 获取文件类型
const getFileType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  const types = {
    'md': 'MD',
    'docx': 'DOCX',
    'doc': 'DOC'
  }
  return types[ext] || 'FILE'
}

// 计算总阅读时间
const totalReadTime = computed(() => {
  const totalMinutes = filteredArticles.value.reduce((sum, article) => sum + (article.readTime || 0), 0)
  
  if (totalMinutes < 60) {
    return `${totalMinutes}分钟`
  } else {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (minutes > 0) {
      return `${hours}小时${minutes}分钟`
    } else {
      return `${hours}小时`
    }
  }
})

// 计算本月新增数量
const thisMonthCount = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return filteredArticles.value.filter(article => {
    const articleDate = new Date(article.date)
    return articleDate.getMonth() === currentMonth && articleDate.getFullYear() === currentYear
  }).length
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 渲染摘要（支持Markdown）
const renderExcerpt = (article) => {
  if (!article) return ''
  
  const content = article.excerpt || ''
  
  if (article.isMarkdown && content) {
    try {
      let html = marked(content)
      // 转义script标签，防止内容被截断
      html = html.replace(/<script/gi, '&lt;script')
      return html
    } catch (error) {
      console.error('Markdown渲染摘要错误:', error)
      return `<p>${content}</p>`
    }
  }
  
  // 非Markdown内容，直接返回HTML转义后的内容
  return `<p>${content}</p>`
}

// 获取卡片主题
const getCardTheme = (index) => {
  const themes = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5']
  return themes[index % themes.length]
}

// 获取徽章样式
const getBadgeClass = (category) => {
  const classes = {
    'Vue': 'badge-vue',
    'JavaScript': 'badge-js',
    'CSS': 'badge-css',
    '学习记录': 'badge-learning'
  }
  return classes[category] || 'badge-default'
}

// 组件挂载时不设置body背景，由App.vue统一管理
onMounted(() => {
  // 不再设置body背景样式，让App.vue统一管理
  if (route.query.create === '1' && ['学习记录', 'CSS', 'JavaScript', 'Vue', '前端开发', '后端开发'].includes(categoryName.value)) {
    showAddForm.value = true
  }
})

// 组件卸载时不恢复body背景，让App.vue统一管理
onUnmounted(() => {
  // 不再清除body背景样式
})
</script>
<style scoped>
@import '../css/Category.css';
</style>

