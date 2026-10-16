# David 的个人网站

以 markwwen.github.io 为布局参考的双栏英文个人网站，沿用旧站 Nunito 字体。固定白色背景，使用原来的深蓝标题和蓝色链接；浏览器或系统切换深色外观时，网页仍保持浅色。桌面左栏固定，右栏按浏览器原生方式滚动；手机自动变为单栏。

## 启动

在 Windows 中双击 `start.cmd`，会启动开发服务器并打开浏览器。

也可以在本目录运行：

```powershell
npm install
npm run dev
```

默认地址为 `http://127.0.0.1:4321/`。要求 Node.js 22.22+；开发环境已用 Node.js 24 验证。

## 构建与验证

```powershell
npm run check
npm run build
npm test
npm run preview
```

`dist/` 是完整的静态网站，可以部署到 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。用 HTTP 服务器预览，不要直接双击生成的 HTML。

新版独立保存在 `redesign/astro-homepage-2026-10-16` 分支，原版保留在 `main`。此分支不包含自动发布工作流，不会改变现有 GitHub Pages 网站。后续要正式上线时，需另行配置 Astro 的 `dist/` 发布流程，不能沿用旧版的 `apps/web/out` 路径。

公开在线预览：[David — Astro Preview](https://david-astro-preview-20261016.g2811459442.chatgpt.site)。任何人都能打开，无需登录。此独立 Sites 站点用于与 [原网站](https://crystaldavid.github.io/) 对比；GitHub 分支更新后需单独重新发布预览。发布信息见 `docs/preview.md`。

## 技术与参考

- 排版参考 [Weihuang Wen 的主页](https://markwwen.github.io/)：左侧个人信息固定，右侧内容自然滚动。
- 技术参考 [Kyaw 的网站](https://kyswtn.com/) 和 [源代码](https://github.com/kyswtn/kyswtn.com)：Astro、UnoCSS、`ClientRouter`、View Transitions、本地字体和静态内容。
- 参考仓库的 Astro 5 已更新为 Astro 7.4，使用相同的轻量架构。没有引入旧站的 Next.js、React hydration、GSAP、ScrollMagic 或虚拟滚动库。
- 拉取并检查的参考提交：`25e66b8faaae1d8a29d16aa86aade45ecded3c31`。本项目重新实现布局与交互，未复制参考作者的个人内容或私有 notes 子模块。

## 内容在哪里修改

| 内容 | 文件 |
| --- | --- |
| 个人信息、项目、联系方式 | `src/data/site.ts` |
| 首页文字与栏目结构 | `src/pages/index.astro` |
| 五篇文章的原始数据（网站只渲染英文字段） | `src/data/articles.json` |
| 论文作者、投稿状态、PDF 链接 | `src/data/publications.json` |
| 文章类型与阅读时间计算 | `src/data/articles.ts` |
| 左栏与文章目录 | `src/components/Sidebar.astro` |
| 颜色、字体、响应式布局 | `src/styles/global.css` |
| 滚动目录与复制 | `src/scripts/site.ts` |
| 项目图片、论文插图和字体 | `public/media/`、`public/fonts/` |
| 三篇论文 PDF | `public/papers/` |

文章 slug 会生成 `/articles/<slug>/`，文章返回链接定位到首页对应的条目。请保留已有 slug，避免旧链接失效。

英文使用旧站原有的 Nunito 文件，代码块使用 Ubuntu Mono。Noto Sans SC 仍作为源代码等非英文字符的后备字体，但不再预加载。各字体许可证已保留。原始文章数据中的中文字段保留用于溯源，不生成隐藏中文正文，也不再读取旧版语言缓存。

配色集中在 `src/styles/global.css` 的 CSS 变量中，使用 `color-scheme: only light` 固定浅色。页面元数据声明浅色和白色浏览器主题色，不包含深色媒体查询；禁用 JavaScript 也保持浅色。

论文栏目包含 ProME、GRA-Flow 和 RECAST，作者顺序依据论文，投稿状态依据提供的 CV。两篇新增研究笔记基于本次提供的 PDF；论文下载文件与原文件保持一致。

默认正式域名沿用旧站 `https://crystaldavid.github.io`。更换域名时，设置 `SITE_URL` 后构建，并同步 `public/robots.txt` 和社交分享图中的域名。本站按域名根路径部署。

详细说明见 `docs/implementation.md` 与 `docs/verification.md`。当前字体颜色、字号及其用途见 `docs/typography.md`。
