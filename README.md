# Mesting · 个人博客与音乐空间

一个以个人作品展示为核心的 Vue 3 博客，同时内置完整的音乐空间。网页端提供博客、作品与音乐播放体验；同一套音乐页面可同步打包为 Android App。

## 亮点

### 博客与作品展示

- 首页、文章列表、分类、文章详情与关于页
- 深浅色阅读体验与响应式布局
- 首页动态视觉、平滑过渡和作品信息展示

### 音乐空间

- 本地音乐、歌词文件与封面展示
- 在线搜索、试听与歌单发现
- 我的喜欢、每日推荐、已创建歌单与播放队列
- 胶囊迷你播放器、完整歌词播放页、进度条角色与多种播放模式
- 桌面歌词：支持显示、锁定、样式、字号与自定义颜色
- 经典、小新、Hello Kitty、库洛米等主题；动态主题包含场景素材与角色动画
- 自适应手机竖屏、平板与桌面端的不同背景构图

### Android App

- 使用 Capacitor 将 Vue 音乐空间打包为 Android 应用
- 原生通知栏媒体控制、后台播放、桌面歌词悬浮层与启动页
- Android 工程、图标、启动资源与原生服务代码均保留在本仓库

## 技术栈

| 范围 | 技术 |
| --- | --- |
| 网页界面 | Vue 3、Vue Router、HTML5、CSS3、JavaScript |
| 构建工具 | Vite |
| 动画与交互 | CSS Animation、GSAP |
| 音乐能力 | HTML Audio、Media Session、歌词同步与播放队列 |
| Android App | Capacitor 8、Android / Java 原生服务 |

## 项目结构

```text
个人博客/
├─ public/
│  ├─ music/                 # 本地音乐文件
│  ├─ lyrics/                # LRC 歌词文件
│  └─ images/                # 封面、主题、角色与启动图资源
├─ src/
│  ├─ components/            # 博客、播放器、歌词与主题组件
│  ├─ composables/           # 播放、歌单、进度条、背景等状态逻辑
│  ├─ config/                # 主题与视觉配置
│  ├─ services/              # 在线音乐与封面服务
│  ├─ views/                 # 页面视图
│  └─ css/                   # 页面与播放器样式
├─ android/                  # Capacitor Android 工程与原生功能
├─ tests/                    # 播放逻辑校验
├─ capacitor.config.json     # App 配置
└─ vite.config.js            # 网页构建配置
```

## 本地运行

### 环境

- Node.js 18 或更高版本
- npm

### 启动开发环境

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址即可预览。

### 构建网页版本

```bash
npm run build
```

构建产物位于 `dist/`，可部署到静态托管平台。

### 校验播放器逻辑

```bash
npm run verify:player
```

## 打包 Android APK

需要先安装 Android Studio、Android SDK 与 JDK。

```bash
npm install
npm run android:apk
```

该命令会先构建网页、同步到 Android 工程，再生成调试版 APK。输出位置通常为：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

若需要发布到应用商店，请用 Android Studio 打开 `android/` 目录，并生成已签名的 Release 包。

## 部署网页

```bash
npm run build
git add .
git commit -m "feat: update site"
git push origin main
```

将 `dist/` 目录部署至你已配置的静态托管服务即可。若仓库已连接 GitHub Pages、Vercel 或 Netlify，推送到 `main` 后会自动触发更新。

## 资源说明

本仓库内的音乐、封面、主题插画与角色素材仅用于个人项目演示与学习，请勿将其用于未经授权的商业发布或二次分发。

---

Made with Vue 3 · Vite · Capacitor
