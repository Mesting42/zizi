# 个人博客

基于 Vue3 + Vite 构建的现代个人博客系统，集成了博客文章展示和音乐播放器功能。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - Vue.js 官方路由管理器
- **Vite** - 下一代前端构建工具
- **HTML5** - 语义化标记
- **CSS3** - 现代样式和动画
- **JavaScript (ES6+)** - 现代 JavaScript 特性

## 项目结构

```
个人博客/
├── public/                    # 静态资源
│   ├── css/                   # 公共 CSS 文件
│   │   ├── clear-data.css     # 数据清除页面样式
│   │   └── loading.css        # 加载动画样式
│   ├── js/                    # 公共 JS 文件
│   │   └── clear-data.js      # 数据清除功能
│   ├── images/                # 图片资源
│   ├── music/                 # 音乐文件
│   └── lyrics/                # 歌词文件
├── src/
│   ├── assets/               # 资源文件
│   │   ├── css/              # CSS 样式文件
│   │   │   ├── reset.css     # CSS 重置
│   │   │   └── global.css    # 全局样式
│   │   └── images/           # 图片资源
│   ├── components/           # 公共组件
│   │   ├── Header.vue        # 头部导航组件
│   │   └── Footer.vue        # 页脚组件
│   ├── composables/          # 组合式函数
│   │   ├── usePlayer.js      # 音乐播放器逻辑
│   │   └── usePlaylists.js   # 歌单管理逻辑
│   ├── css/                  # 页面样式文件（拆分后）
│   │   ├── About.css
│   │   ├── ArticleDetail.css
│   │   ├── ArticleList.css
│   │   ├── Category.css
│   │   ├── ForeignCase.css
│   │   ├── Home.css
│   │   ├── Music.css
│   │   ├── MusicPlayer.css
│   │   ├── PlaylistDetail.css
│   │   ├── VinylPlayer.css
│   │   └── VivoCase.css
│   ├── router/               # 路由配置
│   │   └── index.js          # 路由定义
│   ├── views/                # 页面组件
│   │   ├── Home.vue          # 首页
│   │   ├── ArticleList.vue   # 文章列表页
│   │   ├── ArticleDetail.vue # 文章详情页
│   │   ├── Category.vue      # 文章分类页
│   │   ├── About.vue         # 关于我页面
│   │   ├── ForeignCase.vue   # 国外案例页
│   │   ├── VivoCase.vue      # Vivo案例页
│   │   ├── Music.vue         # 音乐首页
│   │   ├── MusicPlayer.vue   # 音乐播放器页
│   │   ├── PlaylistDetail.vue # 歌单详情页
│   │   └── VinylPlayer.vue   # 黑胶唱片播放器页
│   ├── App.vue               # 根组件
│   └── main.js               # 应用入口
├── scripts/                  # 脚本工具
│   └── split-css.js          # CSS 拆分脚本
├── clear-data.html           # 数据清除页面
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

## 功能特性

### 博客功能
- 📝 博客文章展示
- 📂 文章分类筛选
- 🔍 文章详情查看
- 👤 个人介绍页面
- 🎨 响应式设计
- 🚀 快速加载
- 📱 移动端适配

### 音乐功能
- 🎵 本地音乐播放
- 🎶 歌单管理系统
  - 创建自定义歌单
  - 从收藏添加歌曲
  - 编辑歌单信息（名称、描述、封面）
- ❤️ 歌曲收藏功能
- 🎼 歌词同步显示
- 🎧 多种播放模式（列表循环、单曲循环、随机播放）
- 💿 黑胶唱片播放器界面
- 🔊 音量控制和进度拖动
- 📊 播放统计

### 主题功能
- 🌓 暗黑/明亮模式切换
- 🎨 现代化 UI 设计
- ✨ 流畅的动画效果

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 页面说明

### 博客页面

#### 首页 (/)
- 展示博客简介
- 显示最新文章
- 提供导航入口

#### 文章列表 (/articles)
- 展示所有文章
- 支持分类筛选
- 显示文章摘要

#### 文章详情 (/article/:id)
- 显示完整文章内容
- 文章元信息（日期、分类、阅读时间）
- 返回列表导航

#### 文章分类 (/category/:name)
- 按分类展示文章
- 分类导航

#### 关于我 (/about)
- 个人简介
- 技能展示
- 联系方式
- 兴趣爱好

### 音乐页面

#### 音乐首页 (/music)
- 推荐歌单展示
- 我的歌单列表
- 每日推荐歌曲
- 音乐搜索功能

#### 歌单详情 (/music/playlist/:id)
- 歌单信息展示
- 歌曲列表管理
- 添加歌曲到歌单
- 播放全部歌曲

#### 音乐播放器 (/music/player)
- 完整播放器界面
- 黑胶唱片动画
- 歌词同步显示
- 播放控制

#### 黑胶唱片播放器 (/music/vinyl)
- 沉浸式播放体验
- 黑胶唱片视觉效果
- 歌词展示

## 自定义配置

### 修改端口

在 `vite.config.js` 中修改 `server.port`：

```javascript
server: {
  port: 3000, // 修改为你想要的端口
  open: true
}
```

### 修改主题颜色

在 `src/assets/css/global.css` 中修改 CSS 变量：

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  /* ... 其他颜色变量 */
}
```

### 添加音乐文件

1. 将音乐文件放入 `public/music/` 目录
2. 将歌词文件（.lrc 格式）放入 `public/lyrics/` 目录
3. 将封面图片放入 `public/images/` 目录
4. 在 `src/composables/usePlaylists.js` 的 `getAllUploadedMusic` 函数中添加音乐信息

## 数据管理

### 本地存储

项目使用 localStorage 存储以下数据：
- **music-user-playlists** - 用户创建的歌单
- **music-player-state** - 播放器状态（收藏、播放进度等）
- **music-play-counts** - 歌曲播放次数统计

### 数据清除

访问 `clear-data.html` 页面可以清除所有本地存储的数据。

## 代码拆分

项目已进行代码优化，将 Vue 文件中的 CSS 拆分到独立的 CSS 文件：

```bash
# 运行 CSS 拆分脚本
node scripts/split-css.js
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 开发建议

1. **组件开发**：使用 Vue 3 Composition API 编写组件
2. **样式管理**：使用 CSS 变量管理主题颜色
3. **代码规范**：遵循 Vue 3 官方风格指南
4. **性能优化**：使用 Vite 的按需加载和代码分割功能
5. **状态管理**：使用 Composables 管理共享状态

## 后续计划

- [x] 添加音乐播放器功能
- [x] 实现歌单管理系统
- [x] 添加暗黑模式
- [ ] 添加文章搜索功能
- [ ] 实现文章评论系统
- [ ] 添加标签系统
- [ ] 集成 Markdown 编辑器
- [ ] 实现文章归档
- [ ] 添加 RSS 订阅
- [ ] SEO 优化
- [ ] 后端数据持久化

## 部署

### 部署到 GitHub Pages

1. 在 `vite.config.js` 中设置 `base` 路径：
```javascript
export default defineConfig({
  base: '/你的仓库名/',
  // ...
})
```

2. 构建项目：
```bash
npm run build
```

3. 将 `dist` 目录内容推送到 GitHub Pages

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎联系！

---

用 ❤️ 和 Vue3 构建
