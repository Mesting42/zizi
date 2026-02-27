# GitHub Pages 部署指南

本指南说明如何将个人博客项目部署到 GitHub Pages，并确保所有功能（包括 vivo 案例和音乐功能）能够正常访问。

## 项目结构说明

部署前请确保项目包含以下文件结构：

```
个人博客/
├── public/                    # 静态资源（必须包含）
│   ├── css/                   # 公共 CSS 文件
│   ├── js/                    # 公共 JS 文件
│   ├── images/                # 图片资源
│   ├── music/                 # 音乐文件
│   ├── lyrics/                # 歌词文件
│   └── vivo/                  # vivo 案例文件
├── src/                       # 源代码
├── dist/                      # 构建输出目录
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 部署方式

### 方式一：部署到 GitHub Pages 根路径（推荐）

如果你的 GitHub 用户名是 `username`，并且你使用 `username.github.io` 这个仓库，项目将部署到根路径。

**配置步骤：**

1. 确保 `vite.config.js` 中的 `base` 设置为 `/`：

```javascript
export default defineConfig({
  plugins: [vue()],
  base: '/', // 根路径部署
  // ... 其他配置
})
```

2. 构建项目：

```bash
npm run build
```

3. 将 `dist` 目录推送到 GitHub 仓库的 `gh-pages` 分支：

```bash
git add dist
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

4. 在 GitHub 仓库设置中：
   - 进入 Settings → Pages
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `gh-pages` 和 `/ (root)`

5. 访问地址：`https://username.github.io/`

### 方式二：部署到 GitHub Pages 子路径

如果你的仓库名不是 `username.github.io`，而是 `my-blog`，项目将部署到子路径。

**配置步骤：**

1. 修改 `vite.config.js` 中的 `base` 为你的仓库名：

```javascript
export default defineConfig({
  plugins: [vue()],
  base: '/my-blog/', // 替换为你的仓库名
  // ... 其他配置
})
```

2. 构建项目：

```bash
npm run build
```

3. 将 `dist` 目录推送到 GitHub 仓库的 `gh-pages` 分支：

```bash
git add dist
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

4. 在 GitHub 仓库设置中：
   - 进入 Settings → Pages
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `gh-pages` 和 `/ (root)`

5. 访问地址：`https://username.github.io/my-blog/`

## 自动化部署脚本

### 使用 npm 脚本简化部署

在 `package.json` 中添加部署脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && git add dist && git commit -m 'Deploy to GitHub Pages' && git subtree push --prefix dist origin gh-pages"
  }
}
```

然后使用以下命令部署：

```bash
npm run deploy
```

### 使用 GitHub Actions 自动部署

1. 在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. 将代码推送到 `main` 分支，GitHub Actions 会自动构建和部署

## 验证部署

部署完成后，访问以下地址验证：

### 博客功能

1. **首页**：`https://username.github.io/` 或 `https://username.github.io/my-blog/`
2. **文章列表**：`https://username.github.io/articles` 或 `https://username.github.io/my-blog/articles`
3. **关于我**：`https://username.github.io/about` 或 `https://username.github.io/my-blog/about`

### Vivo 案例

1. **Vivo 案例页面**：`https://username.github.io/vivo-case` 或 `https://username.github.io/my-blog/vivo-case`
2. **直接访问 vivo 网站**：`https://username.github.io/vivo/index.html` 或 `https://username.github.io/my-blog/vivo/index.html`

### 音乐功能

1. **音乐首页**：`https://username.github.io/music` 或 `https://username.github.io/my-blog/music`
2. **歌单详情**：`https://username.github.io/music/playlist/:id` 或 `https://username.github.io/my-blog/music/playlist/:id`
3. **音乐播放器**：`https://username.github.io/music/player` 或 `https://username.github.io/my-blog/music/player`
4. **黑胶唱片播放器**：`https://username.github.io/music/vinyl` 或 `https://username.github.io/my-blog/music/vinyl`

## 资源文件说明

### 必须上传的资源

部署时，确保以下资源文件已正确上传到 `public` 目录：

#### 图片资源 (`public/images/`)

- 文章封面图片
- 歌单封面图片
- 音乐专辑封面
- 默认占位图片

#### 音乐资源 (`public/music/`)

- 所有音乐文件（.mp3, .aac 等格式）
- 确保文件路径正确引用

#### 歌词资源 (`public/lyrics/`)

- 歌词文件（.lrc 格式）
- 文件名与音乐文件对应

#### Vivo 案例 (`public/vivo/`)

- vivo 响应式网站的所有文件
- 包含 index.html、CSS、图片等资源

## 常见问题

### 1. vivo 案例无法访问

**原因**：`base` 路径配置不正确

**解决**：

- 根路径部署：`base: '/'`
- 子路径部署：`base: '/仓库名/'`

### 2. 页面空白或资源 404

**原因**：路径配置错误或资源路径不正确

**解决**：

- 检查 `vite.config.js` 中的 `base` 配置
- 确保所有资源使用相对路径或绝对路径正确
- 检查 `public` 目录中的资源是否被正确复制到 `dist` 目录

### 3. 音乐文件无法播放

**原因**：音乐文件路径错误或文件未上传

**解决**：

- 确保音乐文件在 `public/music/` 目录
- 检查音乐文件路径是否正确（相对于 public 目录）
- 确保大文件已正确上传到 GitHub（GitHub 有文件大小限制）

### 4. 图片无法显示

**原因**：图片路径错误或文件未上传

**解决**：

- 确保图片文件在 `public/images/` 目录
- 检查图片引用路径是否正确
- 确保图片格式支持（jpg, png, jpeg, webp）

### 5. 路由跳转失败

**原因**：Vue Router 的 history 模式需要服务器配置

**解决**：当前项目使用 `createWebHistory`，GitHub Pages 会自动处理

## 注意事项

1. **public 目录**：`public/` 目录下的所有文件会在构建时直接复制到 `dist/` 目录
2. **路径一致性**：确保 `base` 配置与实际部署路径一致
3. **缓存问题**：部署后可能需要清除浏览器缓存才能看到最新内容
4. **HTTPS**：GitHub Pages 默认使用 HTTPS，确保所有资源都支持 HTTPS
5. **文件大小限制**：GitHub 对单个文件有 100MB 限制，对仓库有 1GB 限制
6. **音乐文件**：音乐文件较大，建议使用压缩格式（如 AAC）并控制文件大小

## 推荐部署流程

### 首次部署

1. 根据你的仓库名设置 `base` 配置
2. 确保所有资源文件已放入 `public` 目录
3. 本地测试：`npm run build && npm run preview`
4. 推送到 GitHub 并触发部署
5. 验证所有功能正常（博客、音乐、vivo 案例）

### 后续更新

1. 修改代码
2. 本地测试：`npm run dev`
3. 运行 `npm run deploy` 或推送到 main 分支（如果使用 GitHub Actions）
4. 等待部署完成（通常 1-2 分钟）
5. 验证更新内容

## 其他部署平台

### Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署，无需额外配置

### Netlify

1. 将项目推送到 GitHub
2. 在 Netlify 中导入项目
3. 设置构建命令：`npm run build`
4. 设置发布目录：`dist`

---

**部署完成后，请确保测试所有功能（博客、音乐、vivo 案例）是否正常工作。**
