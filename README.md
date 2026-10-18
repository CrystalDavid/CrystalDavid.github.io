# David 的个人网站

以 markwwen.github.io 为布局参考的双栏英文个人网站，沿用旧站 Nunito 字体。固定白色背景，使用原来的深蓝标题和蓝色链接；浏览器或系统切换深色外观时，网页仍保持浅色。桌面左栏固定，右栏按浏览器原生方式滚动；手机自动变为单栏。

## 日常修改与发布

平时只修改 `src/` 中的内容和 `public/` 中的资源，然后把修改提交并推送到 GitHub 的 `main`。GitHub Actions 会自行安装依赖、检查、构建及部署；不要求电脑上运行网站或保留开发依赖。具体内容文件见下方表格。

本地 Git 按用户要求仅保留最新已同步版本的快照，保留正常的提交和上传能力；旧版本不占用本地对象库，GitHub 上的已有历史未重写。后续不默认拉取全部历史或旧分支。

## 本地预览（可选）

在 Windows 中双击 `start.cmd`，会启动开发服务器并打开浏览器。

也可以在本目录运行：

```powershell
npm ci
npm run dev
```

默认地址为 `http://127.0.0.1:4321/`。要求 Node.js 22.22+；开发环境已用 Node.js 24 验证。

`node_modules/` 是本地开发和构建工具，`dist/` 是生成的网站，`.astro/` 是 Astro 生成的缓存和类型文件；三者均可重新生成，可以在不需要本地检查或预览时删除以节省空间。需要本地检查时先运行 `npm ci`，再运行开发或构建命令；双击 `start.cmd` 也会在依赖缺失时自动安装。请保留 `package.json`、`package-lock.json`、源码、当前资源、许可证、文档、`.git/` 当前快照及远端配置、`.private/` 私人笔记。实际清理结果见 [验证记录](docs/verification.md)。

## 构建与验证

```powershell
npm run check
npm run build
npm test
npm run preview
```

`dist/` 是完整的静态网站，可以部署到 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。用 HTTP 服务器预览，不要直接双击生成的 HTML。

正式网站：[crystaldavid.github.io](https://crystaldavid.github.io/)。`main` 是正式发布分支，`.github/workflows/pages.yml` 使用 Node.js 24 安装锁定依赖，完成检查、构建和内容验证后，仅发布 `dist/`。旧版 Next.js 留在远端 Git 历史中，不再使用 `apps/web/out` 发布路径。发布、验证与回退方式见 [部署说明](docs/deployment.md)。

此前的公开对比预览：[David — Astro Preview](https://david-astro-preview-20261016.g2811459442.chatgpt.site)。这是独立 Sites 站点，GitHub Pages 发布不会自动更新它；对外展示以正式网站为准。该预览的版本信息见 [预览记录](docs/preview.md)。

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
| 三篇公开文章的原始数据（网站只渲染英文字段） | `src/data/articles.json` |
| 论文作者、投稿状态、arXiv 链接 | `src/data/publications.json` |
| 文章类型与阅读时间计算 | `src/data/articles.ts` |
| 左栏与文章目录 | `src/components/Sidebar.astro` |
| 颜色、字体、响应式布局 | `src/styles/global.css` |
| 标签页圆润闪电图标及声明 | `public/favicon-lightning-large.svg`、`public/favicon-lightning-large-*.png`、`public/favicon.ico`、`src/layouts/BaseLayout.astro` |
| 滚动目录与复制 | `src/scripts/site.ts` |
| 项目图片、论文插图和字体 | `public/media/`、`public/fonts/` |
| 暂不公开的两篇笔记及来源说明（仅本机，不提交） | `.private/` |

公开文章 slug 会生成 `/articles/<slug>/`，文章返回链接定位到首页对应的条目。GRA-Flow、RECAST 目前仅保留标题、作者、投稿状态和配图，不生成笔记页、下载按钮、标题/图片链接或站点地图记录。

本站不托管论文 PDF，也不显示 PDF 下载按钮。ProME 保留 arXiv 入口和 Notes，论文下载由访客在 arXiv 完成；原 `public/papers/prome.pdf` 网站副本已移除，原始论文文件未修改。

英文统一使用旧站原有的 Nunito 文件，包括代码正文、工具栏标签和 Copy 按钮。代码示例中的中文说明已译为英文，保留键名、结构、缩进、换行与局部横向滚动。现有 Nunito 文件没有箭头字形，正文保留原来的 `→`，继续由 Noto Sans SC 后备字体显示。字体文件、预加载和 `font-display: block` 均保持，优先维持稳定字形和排版；Noto Sans SC 不预加载。使用字体的许可证已保留。原始文章数据中的中文字段保留用于溯源，不生成隐藏中文正文，也不再读取旧版语言缓存。

配色集中在 `src/styles/global.css` 的 CSS 变量中，使用 `color-scheme: only light` 固定浅色。页面元数据声明浅色和白色浏览器主题色，不包含深色媒体查询；禁用 JavaScript 也保持浅色。

论文栏目包含 ProME、GRA-Flow 和 RECAST，作者顺序依据论文，投稿状态依据提供的 CV。GRA-Flow 和 RECAST 的完整笔记及来源说明仅保留在本机 `.private/`，不进入构建或 Git 当前版本；该目录现已不含 PDF 副本。用户明确要求重新公开前，不恢复资源入口或页面。此前已发布的 Git 历史不因当前版本的删除自动清除。

首页论文、PPT-Agent 和 Evidence Tracker 均不显示额外的短说明，全部配图移除名称标签；左栏使用实心邮件/GitHub 图标。PPT-Agent 展示在线 Demo 的单张真实欢迎界面，Evidence Tracker 使用依据项目文章绘制的 SVG 工作流示意图。文章页摘要与正文保留。图片来源与含义见 `docs/implementation.md`。

## 视觉规范

完整的字体、颜色、字号、行高、间距与响应式规则统一维护在 **[视觉规范](docs/typography.md)**。这是视觉设计的唯一规范入口；`AGENTS.md` 要求后续修改遵守并同步更新它，README 只保留入口，避免多份数值漂移。

默认正式域名沿用旧站 `https://crystaldavid.github.io`。更换域名时，设置 `SITE_URL` 后构建，并同步 `public/robots.txt` 和社交分享图中的域名。本站按域名根路径部署。

详细说明见 [实现依据](docs/implementation.md)、[验证记录](docs/verification.md) 与 [视觉规范](docs/typography.md)。
