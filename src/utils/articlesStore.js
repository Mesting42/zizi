// 文章数据存储管理
import { ref, watch } from 'vue'

// 从 localStorage 加载数据
const loadArticles = () => {
  const saved = localStorage.getItem('blog_articles')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (!Array.isArray(parsed)) return getDefaultArticles()

      // 旧版本可能只把当时可见的一篇文章写入本地缓存。保留用户对文章的
      // 修改与新增内容，同时把缺失的内置文章补回，避免一次旧缓存覆盖档案库。
      const defaults = getDefaultArticles()
      const defaultIds = new Set(defaults.map(article => String(article.id)))
      const savedById = new Map(parsed.map(article => [String(article.id), article]))
      const restoredDefaults = defaults.map(defaultArticle => {
        const savedArticle = savedById.get(String(defaultArticle.id)) || {}
        const shouldRefreshBuiltIn = defaultArticle.builtInRevision
          && (savedArticle.builtInRevision || 0) < defaultArticle.builtInRevision

        return {
          ...defaultArticle,
          ...(shouldRefreshBuiltIn ? {} : savedArticle),
          // 内置档案的顺序由当前版本统一维护，避免旧缓存把新文章挤回末尾。
          order: defaultArticle.order
        }
      })
      const customArticles = parsed.filter(article => !defaultIds.has(String(article.id)))
      const merged = [...restoredDefaults, ...customArticles]
        .sort((a, b) => (a.order || a.id || 0) - (b.order || b.id || 0))

      if (merged.length !== parsed.length) {
        localStorage.setItem('blog_articles', JSON.stringify(merged))
      }

      return merged
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
    id: 1001,
    order: 1,
    builtInRevision: 1,
    title: 'Mesting Music：一次 Flutter 原生重构复盘',
    excerpt: '这不是一次把网页界面翻译成 Flutter Widget 的迁移，而是一次从播放内核、信息架构、主题系统、云端资料到好友共听的完整产品重构。本文复盘关键判断、设计细节、技术选择、性能取舍与真正踩过的坑。',
    date: '2026-07-29',
    category: 'Flutter',
    readTime: 20,
    content: `
      <blockquote>
        <p>重构不是把旧页面换一种语言再写一遍，而是保留已经被验证的产品记忆，重新决定什么才应该成为系统的骨架。</p>
      </blockquote>

      <h2>一、为什么要从 Web 走向 Flutter</h2>
      <p>Mesting Music 最初只是个人数字空间中的音乐模块。随着完整播放器、歌词、队列、主题、歌单、悬浮歌词和 Android 媒体控制陆续加入，它已经不再是一张网页，而是一款需要持续运行、跨页面保持状态、与系统媒体能力深度协作的音乐产品。</p>
      <p>Vue 与 Capacitor 版本证明了产品方向，但 WebView 也暴露出边界：复杂主题与视频背景叠加后容易掉帧；页面、音频元素、本地存储和原生桥接之间存在多份状态；后台播放、通知栏、锁屏控制、返回手势和应用生命周期需要不断补丁式适配。于是我决定使用 Flutter 进行独立 Android 原生重构，<mark>不复用旧页面，不用 WebView 包裹界面，只把旧版本当成交互规格和产品经验</mark>。</p>

      <h2>二、先重构产品，再重构代码</h2>
      <p>动手之前，我先把产品重新整理成六层能力：推荐与发现、完整播放、收藏与音乐档案、主题与播放器装扮、账号与好友共听、云端与 Android 原生能力。首页也从“展示很多功能”改成四个稳定入口：推荐、发现音乐、我的喜欢、我的。</p>
      <p>四个页面共享一个常驻的迷你播放器。用户从歌单进入播放器，再进入歌词、队列或好友页面时，声音不会中断，当前歌曲也不会因为 Widget 重建而丢失。这个决定看起来像界面布局，实际上定义了整个应用的状态边界。</p>

      <h3>我坚持的六条设计原则</h3>
      <ul>
        <li><strong>音乐优先：</strong>视觉可以有情绪，但不能遮挡播放、搜索和队列操作。</li>
        <li><strong>单一播放真相：</strong>页面只订阅状态，不各自保存一套“当前歌曲”。</li>
        <li><strong>队列代表意图：</strong>点击一首歌只播放它；“添加到队列”不应立刻切歌；“播放全部”才建立完整队列。</li>
        <li><strong>装扮是系统：</strong>主题不只是颜色，还包含背景、明暗模式、播放器形态、角色和动效等级。</li>
        <li><strong>连接自然发生：</strong>好友、状态与一起听从音乐行为延伸，而不是独立塞进一个社交模块。</li>
        <li><strong>本地先可靠：</strong>网络、云端或第三方音源失败时，本地收藏、歌单和基础播放仍然可用。</li>
      </ul>

      <h2>三、播放内核：把声音移出页面生命周期</h2>
      <p>重构中最重要的不是某个播放器界面，而是建立唯一、持续存在的播放内核。界面通过 Riverpod 读取状态并发出意图，<code>MestingAudioHandler</code> 负责队列、当前媒体项、循环与随机模式，再由 <code>just_audio</code> 执行真正的音频播放。</p>

      <pre><code>Flutter UI
  → Riverpod Providers
  → Playback Controller
  → MestingAudioHandler
  → just_audio / audio_session
  → Android Media Service</code></pre>

      <p><code>audio_service</code> 把同一份播放状态连接到后台服务、通知栏、锁屏和耳机按键；<code>audio_session</code> 处理来电、其他音频抢占、拔出耳机与音量策略。这样，无论用户停留在哪个页面，系统看到的歌曲、进度和播放按钮都与应用内部一致。</p>

      <h3>队列与历史为什么必须分开</h3>
      <p>旧版本里最容易出错的是“上一首”和“下一首”。随机模式下，上一首不能重新随机；队列消费后，也不能再用当前列表猜测用户刚才听过什么。因此新架构把待播队列、当前索引与真实播放历史分开管理：下一首优先消费用户明确加入的队列；上一首回到真实历史；队列为空时才按当前来源和播放模式续播。</p>
      <p>错误音源也不能让播放器无限跳过。每次失败都有上限和可恢复状态，避免坏链接形成循环。这些规则没有炫目的视觉，却决定了播放器是否值得信任。</p>

      <h2>四、信息架构：让 43 项能力仍然容易理解</h2>
      <p>最终产品包含 43 项可见能力，但我没有把它们全部摆在首页，而是按用户目标组织：</p>
      <ul>
        <li><strong>推荐与发现：</strong>个性推荐、每日推荐、私人混合、时间与状态入口、本地和在线搜索。</li>
        <li><strong>完整播放：</strong>播放模式、队列、歌词、进度跳转、预取、通知栏与后台连续播放。</li>
        <li><strong>收藏与音乐档案：</strong>喜欢、个人歌单、最近播放、听歌排行与跨设备恢复。</li>
        <li><strong>主题与装扮：</strong>25 套静态/动态主题、三种播放器、角色进度条、自定义图片和静音视频背景。</li>
        <li><strong>账号、好友与一起听：</strong>资料、关注关系、私信、语音消息、状态与同步播放。</li>
        <li><strong>云端与原生能力：</strong>资料同步、应用内更新、系统分享、返回手势、通知与生命周期恢复。</li>
      </ul>
      <p>每个功能都必须回答一个问题：用户此刻是想找到音乐、控制音乐、保存音乐、表达自己，还是和别人建立连接？如果不能回答，它就不应该占据一级入口。</p>

      <h2>五、视觉系统：25 套主题不是 25 张背景图</h2>
      <p>视觉上保留了经典、蜡笔小新、Hello Kitty、库洛米四组角色语言，并允许用户选择静态场景、动态场景或自定义图片与静音循环视频。主题配置同时决定背景、明暗模式、卡片材质、强调色、启动页、歌单封面、进度角色与动效等级。</p>
      <p>播放器本身也可以在经典黑胶、流光唱片和星环脉冲之间切换。切换播放器不会中断歌曲，因为播放状态与视觉渲染完全解耦。角色可以沿进度条移动，主题人物可以出现在场景中，但所有装饰都必须避开主要操作区，并在低性能设备上自动降级。</p>
      <p>设计过程中，我没有把手机界面当作桌面界面的缩小版。手机强调单手操作、底部导航、胶囊播放器和抽屉；更宽的屏幕则允许歌词、队列与完整控制同时出现。<mark>响应式设计不是缩放，而是重新分配注意力</mark>。</p>

      <h2>六、数据层：本地可靠，云端可恢复</h2>
      <p>结构化数据使用 Drift 保存。歌曲、收藏、歌单、歌单曲目与在线歌曲快照分别建模，Repository 负责读写，页面不直接操作数据库。在线歌曲加入个人歌单时会保存必要快照，避免下次启动时因为接口不可用而整首歌消失。</p>
      <p>主题选择、明暗模式和轻量设置使用 SharedPreferences；账号资料、收藏、歌单、好友关系与聊天由 CloudBase 服务层同步。设计目标不是“所有东西都依赖云端”，而是本地先完成操作，网络恢复后再同步；换设备或应用分身登录后，可以恢复属于这个账号的资料。</p>
      <p>路由由 <code>go_router</code> 管理，播放壳层保持常驻。状态由 <code>flutter_riverpod</code> 按领域拆分，页面只监听自己需要的那一小段数据，避免一次播放进度变化让整页重新构建。</p>

      <h2>七、性能不是最后补救，而是主题系统的一部分</h2>
      <p>旧版本的卡顿让我明确了一件事：动效不能只讨论“好不好看”，还要知道何时应该停止。Flutter 版把性能策略放进主题配置：</p>
      <ul>
        <li>离开视口的动画、视频背景和高频绘制自动暂停。</li>
        <li>大图延迟解码并按显示尺寸加载，列表尽量复用组件。</li>
        <li>完整动效、自动推荐和省电静态三档可切换，低性能设备主动降级。</li>
        <li>播放进度等高频状态只更新需要它的局部组件。</li>
        <li>预取下一首但不一次性加载整份媒体库，减少启动压力。</li>
        <li>应用进入后台后保留声音，暂停不必要的视觉动画与视频。</li>
      </ul>
      <p>这也是为什么播放服务与界面必须分开：视觉可以降级、重建或暂停，声音不能因此中断。</p>

      <h2>八、迁移过程：先搭脊柱，再恢复表情</h2>
      <ol>
        <li><strong>盘点行为：</strong>记录旧版每个页面真正完成了什么，而不是照着截图复制。</li>
        <li><strong>定义模型：</strong>先确定 Track、Playlist、Favorite、PlaybackSnapshot、LyricsDocument 和 ThemePreset。</li>
        <li><strong>重建播放脊柱：</strong>完成本地播放、全局队列、三种模式、后台媒体会话与状态恢复。</li>
        <li><strong>恢复音乐档案：</strong>接入 Drift、收藏、歌单、歌词与播放历史。</li>
        <li><strong>重建视觉语言：</strong>把旧 CSS 动效转换为 Flutter 动画和可降级的主题渲染器。</li>
        <li><strong>补齐云端与关系：</strong>最后再加入账号、好友、聊天、一起听和应用内更新。</li>
        <li><strong>真实设备验证：</strong>重点测试后台切换、锁屏、耳机、断网、重启、长列表和低性能模式。</li>
      </ol>

      <h2>九、使用到的核心技术</h2>
      <ul>
        <li><strong>Flutter / Dart：</strong>统一构建 Android 界面、动画与业务模型。</li>
        <li><strong>Riverpod：</strong>管理播放、歌词、歌单、主题和账号等跨页面状态。</li>
        <li><strong>go_router：</strong>组织页面路径、深链和常驻播放器壳层。</li>
        <li><strong>just_audio：</strong>本地文件与在线音源播放、队列、跳转、循环和随机。</li>
        <li><strong>audio_service：</strong>后台服务、通知栏、锁屏控制与系统媒体会话。</li>
        <li><strong>audio_session：</strong>音频焦点、来电打断、耳机与其他应用声音协调。</li>
        <li><strong>Drift / SQLite：</strong>收藏、歌单、曲目关系、播放快照与本地迁移。</li>
        <li><strong>SharedPreferences：</strong>保存主题和轻量偏好。</li>
        <li><strong>CloudBase 服务层：</strong>账号、资料、收藏、歌单、好友、聊天与跨设备恢复。</li>
        <li><strong>Android 原生能力：</strong>通知、系统分享、返回手势、后台生命周期与应用内更新。</li>
      </ul>

      <h2>十、这次重构真正改变了什么</h2>
      <p>最终改变的不只是技术栈。旧版先有页面，再设法让状态穿过页面；Flutter 版先建立持续存在的播放与数据系统，再让不同界面去观察它。旧版主题更像装饰层，Flutter 版把主题变成可以控制场景、播放器、角色与性能的产品能力。</p>
      <p>我也更确定了 Mesting Music 的方向：它不是追求“功能最多”的播放器，而是一个能记住听歌习惯、允许表达视觉身份，也能把一首歌自然分享给朋友的个人声音空间。</p>
      <blockquote>
        <p>重构完成的标志，不是所有旧页面都重新出现，而是用户不再感觉到页面、网络和系统之间的边界。</p>
      </blockquote>
    `
  },
  {
    id: 1,
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
    order: 7,
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
    order: 8,
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
