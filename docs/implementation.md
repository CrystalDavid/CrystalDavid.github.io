# 网站实现说明

## 结构

网站使用 Astro 静态生成、UnoCSS 和 ClientRouter。依赖版本由包清单和锁文件管理；浏览器只需要静态 HTML、样式、资源和少量导航脚本。

| 位置 | 职责 |
| --- | --- |
| `src/pages/index.astro` | 首页介绍、研究兴趣、论文、项目和个人兴趣 |
| `src/pages/articles/[slug].astro` | 从公开文章数据生成正文页面 |
| `src/pages/404.astro` | 未找到页面 |
| `src/layouts/BaseLayout.astro` | 页面框架、元数据、字体预加载、favicon 和路由 |
| `src/components/` | 个人信息侧栏、文章目录、作者列表和图标 |
| `src/data/` | 个人资料、论文列表及公开文章 |
| `src/styles/global.css` | 全站视觉与响应式规则 |
| `src/scripts/site.ts` | 目录当前项、代码复制与页面切换生命周期 |
| `public/` | 本地字体、许可证、图片、图标、分享图和 robots |

表中路径均相对于仓库根目录。颜色、字号、行高、间距和断点只在 [视觉规范](typography.md) 维护。

## 页面与交互

桌面采用左侧 sticky 个人信息栏和右侧内容栏，小屏幕使用单栏。页面原生滚动；作者名单和代码长行在各自区域内横向滚动，不让整页横向溢出。

首页论文条目展示配图、标题、作者、投稿状态及可用资源入口；项目条目展示单张配图、名称、类别及链接。配图完整显示，不叠加名称标签。文章页面保留摘要、正文、来源和目录。

全站只输出英文，并固定浅色背景。外观由 CSS 和页面元数据控制，不依赖脚本或保存的主题偏好。

ClientRouter 负责站内页面切换，可预取链接使用 hover 策略。正文使用 View Transitions，侧栏不参与淡入淡出；减少动态效果偏好会关闭平滑锚点滚动和页面过渡。

目录由 IntersectionObserver 标识当前章节。切换页面前清理观察器和页面事件，切换后重新初始化。Copy 使用 Clipboard API，并提供兼容回退及成功/失败提示。禁用 JavaScript 时，完整文章、来源链接及返回链接仍然可读可用。

## 内容与路由

公开文章由 `src/data/articles.json` 生成：

| 内容 | 路径 |
| --- | --- |
| ProME | `/articles/prome-group-robust-learning/` |
| PPT-Agent | `/articles/ppt-agent-report/` |
| Evidence Tracker | `/articles/openclaw-evidence-tracker/` |

加上首页和 404，构建生成五个 HTML 页面。文章返回链接定位到首页的 `/#article-card-<slug>`；章节目录使用 `#section-<序号>`。这些公开 slug 和锚点需保持稳定。

论文列表与文章正文分开存储。`publications.json` 中的 `notesAvailable` 控制论文的笔记入口；只有公开文章数据生成文章路由。论文署名、资料依据及公开范围见 [研究资料来源](research-sources.md)。

## 字体与资源

界面和代码使用本地 Nunito。latin 文件在共享布局中预加载，latin-ext 按 CSS 字符范围匹配。`→` 由 Noto Sans SC 后备显示，该字体不预加载。保持现有字体文件及 `font-display: block`，优先保证字体统一和排版稳定；许可证位于 `public/fonts/`。

头像、论文插图与项目图片由本站提供。图片用途如下：

| 资源 | 用途与依据 |
| --- | --- |
| `public/media/avatar.png` | CrystalDavid 的 GitHub 头像 |
| `public/media/prome-framework.webp` | ProME 两阶段方法框架 |
| `public/media/gra-flow-correction.webp` | GRA-Flow 第 10 页图 2 的修正分解 |
| `public/media/recast-framework.webp` | RECAST 第 3 页图 1 的方法框架 |
| `public/media/ppt-agent-welcome.png` | PPT-Agent 首页使用的单张真实欢迎界面 |
| `public/media/ppt-agent-report.webp` | PPT-Agent 文章使用的设计与日志界面，无损 WebP |
| `public/media/evidence-tracker-workflow.svg` | 根据项目文章绘制的工作流示意图 |

Evidence Tracker 示意图表示论文身份核对、全文证据检索、支持度审查与审计报告，包含 RED/BLOCKED 等失败状态；它是流程说明，不是产品截图或实验结果。

共享布局统一声明 SVG、PNG 和 ICO 闪电图标。社交分享图为 `public/social.png`。站点无第三方字体 CDN、追踪器、登录或运行时后端依赖。

构建、测试和线上核对步骤见 [部署说明](deployment.md)。
