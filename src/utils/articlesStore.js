// 文章数据存储管理
import { ref, watch } from 'vue'

// 从 localStorage 加载数据
const loadArticles = () => {
  const saved = localStorage.getItem('blog_articles')
  if (saved) {
    try {
      console.log('从localStorage读取的原始数据长度:', saved.length)
      const parsed = JSON.parse(saved)
      // 检查每篇文章的content长度
      parsed.forEach((article, index) => {
        if (article.content) {
          console.log(`文章[${index}] "${article.title}" content长度:`, article.content.length)
        }
      })
      return parsed
    } catch (e) {
      console.error('Failed to parse articles from localStorage:', e)
      return getDefaultArticles()
    }
  }
  return getDefaultArticles()
}

// 默认文章数据
const getDefaultArticles = () => [
  {
    id: 1,
    order: 1,
    title: 'Vue3 Composition API 完全指南',
    excerpt: '深入了解 Vue3 的 Composition API，从 setup 函数、ref、reactive 到 computed、watch，全面掌握响应式编程的核心概念。通过实际案例演示如何组织代码逻辑，提升代码的可维护性和复用性。',
    date: '2024-01-15',
    category: 'Vue',
    readTime: 10,
    content: `
      <h2>什么是 Composition API？</h2>
      <p>Composition API 是 Vue3 引入的一套新的 API，它提供了一种<mark>更灵活</mark>的方式来组织组件逻辑。与 Options API 相比，Composition API 允许我们更好地组织代码，提高代码的可重用性。</p>
      
      <h2>核心概念</h2>
      <h3>1. ref 和 reactive</h3>
      <p>ref 和 reactive 是创建响应式数据的两种主要方式。<mark>ref 用于基本类型</mark>，reactive 用于对象类型。</p>
      
      <pre><code>import { ref, reactive } from 'vue'

// 使用 ref 创建响应式数据
const count = ref(0)
const name = ref('Vue')

// 使用 reactive 创建响应式对象
const state = reactive({
  count: 0,
  name: 'Vue'
})</code></pre>
      
      <h3>2. computed</h3>
      <p>computed 用于创建计算属性，它会自动追踪依赖，并在依赖变化时重新计算。</p>
      
      <pre><code>const doubled = computed(() => count.value * 2)</code></pre>
      
      <h3>3. watch 和 watchEffect</h3>
      <p>watch 用于监听特定数据的变化，watchEffect 会自动追踪其回调函数中使用的所有响应式数据。</p>
      
      <pre><code>watch(count, (newValue, oldValue) => {
  console.log(\`count 从 \${oldValue} 变为 \${newValue}\`)
})

watchEffect(() => {
  console.log(\`count 的值是: \${count.value}\`)
})</code></pre>
      
      <h2>优势</h2>
      <ul>
        <li>更好的逻辑组织</li>
        <li>更灵活的代码复用</li>
        <li>更好的 TypeScript 支持</li>
        <li>更小的打包体积</li>
      </ul>
    `
  },
  {
    id: 2,
    order: 2,
    title: '现代 CSS 技巧与实践',
    excerpt: '探索 CSS 的最新特性，包括 Flexbox、Grid 布局、CSS 变量、动画和过渡效果。学习如何构建现代化的网页布局，掌握响应式设计的最佳实践，打造美观且高性能的用户界面。',
    date: '2024-01-10',
    category: 'CSS',
    readTime: 8,
    content: `
      <h2>CSS Grid 布局</h2>
      <p>CSS Grid 是一个<mark>强大的二维布局系统</mark>，可以轻松创建复杂的网页布局。</p>
      
      <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}</code></pre>
      
      <h2>Flexbox 弹性布局</h2>
      <p>Flexbox 是一维布局系统，非常适合用于创建<mark>灵活的组件布局</mark>。</p>
      
      <pre><code>.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}</code></pre>
      
      <h2>CSS 变量</h2>
      <p>CSS 变量（自定义属性）允许我们在 CSS 中定义可重用的值，提高代码的可维护性。</p>
      
      <pre><code>:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --spacing: 1rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}</code></pre>
      
      <h2>现代 CSS 特性</h2>
      <ul>
        <li>CSS 自定义属性</li>
        <li>CSS Grid 和 Flexbox</li>
        <li>CSS 动画和过渡</li>
        <li>CSS 滤镜和混合模式</li>
      </ul>
    `
  },
  {
    id: 3,
    order: 3,
    title: 'JavaScript 异步编程详解',
    excerpt: '从回调函数到 Promise，再到 Async/Await 语法糖，全面掌握 JavaScript 异步编程的演进历程。深入理解事件循环机制，学会处理复杂的异步场景，编写更优雅的异步代码。',
    date: '2024-01-05',
    category: 'JavaScript',
    readTime: 12,
    content: `
      <h2>异步编程基础</h2>
      <p>JavaScript 是单线程语言，异步编程是处理耗时操作的关键。</p>
      
      <h2>Promise</h2>
      <p>Promise 是处理异步操作的一种优雅方式，它代表了一个异步操作的最终完成或失败。</p>
      
      <h2>Async/Await</h2>
      <p>Async/Await 是基于 Promise 的语法糖，让异步代码看起来像同步代码一样清晰。</p>
      
      <h2>事件循环</h2>
      <p>理解事件循环机制对于掌握 JavaScript 异步编程至关重要。</p>
      
      <h2>最佳实践</h2>
      <ul>
        <li>始终处理错误</li>
        <li>避免回调地狱</li>
        <li>合理使用 Promise.all</li>
        <li>理解微任务和宏任务</li>
      </ul>
    `
  },
  {
    id: 4,
    order: 4,
    title: '前端性能优化实战',
    excerpt: '从资源加载优化、代码分割、懒加载到渲染性能优化，全方位提升用户体验。学习使用 Chrome DevTools 进行性能分析，掌握关键性能指标（KPI）的优化策略，让网页飞起来。',
    date: '2024-01-02',
    category: '性能优化',
    readTime: 15,
    content: `
      <h2>性能优化概述</h2>
      <p>前端性能优化是提升用户体验的关键，涉及资源加载、渲染、交互等多个方面。</p>
      
      <h2>资源加载优化</h2>
      <ul>
        <li>代码分割和懒加载</li>
        <li>图片优化和懒加载</li>
        <li>使用 CDN 加速资源</li>
        <li>启用 HTTP/2 和 HTTP/3</li>
      </ul>
      
      <h2>渲染性能优化</h2>
      <ul>
        <li>减少 DOM 操作</li>
        <li>使用虚拟滚动</li>
        <li>避免强制同步布局</li>
        <li>合理使用 CSS 动画</li>
      </ul>
      
      <h2>性能分析工具</h2>
      <p>使用 Chrome DevTools 进行性能分析，关注关键性能指标（KPI）。</p>
    `
  },
  {
    id: 5,
    order: 5,
    title: 'Vite 构建工具深入浅出',
    excerpt: '了解 Vite 的核心原理，基于 ES Modules 的极速开发服务器和 Rollup 的高效打包。对比传统构建工具的优势，学习插件系统、环境配置和部署优化，大幅提升开发效率和构建速度。',
    date: '2023-12-28',
    category: '工具',
    readTime: 10,
    content: `
      <h2>Vite 简介</h2>
      <p>Vite 是新一代前端构建工具，基于 ES Modules 提供极速的开发体验。</p>
      
      <h2>核心特性</h2>
      <ul>
        <li>极速的冷启动</li>
        <li>即时的模块热更新</li>
        <li>基于 Rollup 的高效打包</li>
        <li>丰富的插件生态</li>
      </ul>
      
      <h2>与传统构建工具对比</h2>
      <p>Vite 相比 Webpack 等传统工具，在开发体验和构建速度上有显著优势。</p>
      
      <h2>最佳实践</h2>
      <ul>
        <li>合理配置环境变量</li>
        <li>使用插件扩展功能</li>
        <li>优化生产环境构建</li>
        <li>配置代码分割策略</li>
      </ul>
    `
  },
  {
    id: 6,
    order: 6,
    title: 'Vue3 学习笔记',
    excerpt: '记录 Vue3 的学习过程，包括 Composition API、响应式原理、组件通信等核心概念。通过实际案例练习，加深对 Vue3 特性的理解和应用。',
    date: '2024-01-20',
    category: '学习记录',
    readTime: 15,
    content: `
      <h2>Vue3 核心特性</h2>
      <p>Vue3 引入了许多新特性，其中最显著的是 Composition API。</p>
      
      <h2>Composition API</h2>
      <p>Composition API 提供了一种更灵活的方式来组织组件逻辑，使代码更易于维护和复用。</p>
      
      <h2>响应式原理</h2>
      <p>Vue3 使用 Proxy 替代了 Vue2 的 Object.defineProperty，提供了更全面的响应式支持。</p>
    `
  },
  {
    id: 7,
    order: 7,
    title: 'CSS Grid 布局练习',
    excerpt: '通过实际项目练习 CSS Grid 布局，掌握网格布局的核心概念和常用技巧。学习如何创建复杂的网页布局，提高页面的响应式能力。',
    date: '2024-01-18',
    category: '学习记录',
    readTime: 10,
    content: `
      <h2>CSS Grid 基础</h2>
      <p>CSS Grid 是一个二维布局系统，可以轻松创建复杂的网页布局。</p>
      
      <h2>常用属性</h2>
      <ul>
        <li>grid-template-columns</li>
        <li>grid-template-rows</li>
        <li>grid-gap</li>
        <li>grid-area</li>
      </ul>
      
      <h2>实战案例</h2>
      <p>通过构建一个响应式的作品集页面，练习 CSS Grid 的应用。</p>
    `
  }
]

// 创建响应式文章数据
const articles = ref(loadArticles())

// 监听数据变化，自动保存到 localStorage
watch(articles, (newArticles) => {
  try {
    // 检查每篇文章的content长度
    newArticles.forEach((article, index) => {
      if (article.content) {
        console.log(`保存前文章[${index}] "${article.title}" content长度:`, article.content.length)
      }
    })

    const articlesJson = JSON.stringify(newArticles)
    console.log('保存到localStorage的数据长度:', articlesJson.length)
    localStorage.setItem('blog_articles', articlesJson)
    console.log('数据保存成功')
    // 验证保存的数据是否完整
    const savedData = localStorage.getItem('blog_articles')
    console.log('从localStorage读取的数据长度:', savedData ? savedData.length : 0)
    console.log('数据保存是否完整:', savedData && savedData.length === articlesJson.length)
  } catch (error) {
    console.error('localStorage保存失败:', error)
    alert('数据保存失败，可能是数据量过大')
  }
}, { deep: true })



// 导出文章数据和相关方法
export function useArticles() {
  return {
    articles,
    addArticle: (article) => {
      console.log('addArticle 被调用，article.content 长度:', article.content ? article.content.length : 0)

      // 生成新的ID：基于现有文章的最大ID + 1
      const maxId = articles.value.length > 0
        ? Math.max(...articles.value.map(a => a.id))
        : 0
      article.id = maxId + 1

      // 生成order编号：基于现有文章的最大order + 1
      const maxOrder = articles.value.length > 0
        ? Math.max(...articles.value.map(a => a.order || 0))
        : 0
      article.order = maxOrder + 1

      articles.value.push(article)
      console.log('文章已添加到数组，当前文章数量:', articles.value.length)
    },
    getArticleById: (id) => {
      return articles.value.find(article => article.id === parseInt(id))
    },
    getArticlesByCategory: (category) => {
      return articles.value.filter(article => article.category === category)
    },
    updateArticle: (id, updates) => {
      const index = articles.value.findIndex(article => article.id === id)
      if (index !== -1) {
        articles.value[index] = { ...articles.value[index], ...updates }
      }
    },
    deleteArticle: (id) => {
      const index = articles.value.findIndex(article => article.id === id)
      if (index !== -1) {
        const deletedArticle = articles.value[index]
        const deletedOrder = deletedArticle.order || 0

        // 删除文章
        articles.value.splice(index, 1)

        // 更新所有order大于被删除文章order的文章，将其order减1
        articles.value.forEach(article => {
          if (article.order > deletedOrder) {
            article.order -= 1
          }
        })
      }
    }
  }
}