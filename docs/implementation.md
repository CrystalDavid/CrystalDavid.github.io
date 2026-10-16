# 实现与内容依据

## 视觉与布局

以用户确认的 https://markwwen.github.io/ 截图为布局基准：居中的左侧个人信息，以及右侧紧凑的研究/项目条目。浅色使用纯白背景、深蓝标题和蓝色链接；深色使用 #111111 背景、#b8b8b8 正文、#c6dced 标题和 #7cb7df 链接。使用旧站 Nunito 字体，栏目不使用表情，姓名副行显示 (Dawei HUANG)。左栏仅保留学校、专业和圆润线条的邮件/GitHub 图标，不再单独展示身份或邮箱文字。

论文与项目的资源链接采用胶囊圆角。研究兴趣列表与简介正文共用正文颜色变量，浅色为 #595959、深色为 #b8b8b8。语言按钮和全站版权页脚均已移除。

桌面内容区 960px：左栏 232px、列间距 78px、右栏 650px。顶部间距 64px。左栏使用 CSS sticky；右栏随浏览器文档原生滚动，没有虚拟滚轮、逐帧 transform 或滚动动画循环。1000px 及以下使用单栏，520px 及以下的条目缩略图与文字上下排列。

头像是 CrystalDavid 的现有 GitHub 头像，下载地址由 GitHub 用户 API 返回，静态托管在 public/media/avatar.png。

## 内容迁移

来源：David 提供的旧版个人网站。原目录保持不变。

个人身份、学校、专业、邮箱、GitHub、PPT-Agent 体验地址、跑步与羽毛球爱好、1000 米 3:05 的成绩来自旧主页。旧站没有入学与毕业日期，因此没有复述可能随时间变化的“大四”，也没有新增导师、学历时间、奖项或个人贡献声明。

从旧站 app/articles/data.ts 实际导出的 articles 数组迁移三篇正式文章；没有迁入其中未使用的旧 PPT-Agent 版本。三篇文章的标题、摘要、来源、替代文本、18 个章节、100 个内容块（含列表、代码、限制和致谢）完整保留。

- prome-group-robust-learning：arXiv:2608.13190，旧站明确以 v1 为准。
- ppt-agent-report：CrystalDavid/PPT-Agent。
- openclaw-evidence-tracker：CrystalDavid/OpenClaw-Evidence-Tracker。

ProME 展示在 Publications & Manuscripts 中，保留旧文章关于训练群体标签、带群体标签的验证集、跨协议实验报告和代码开放状态的边界。Evidence Tracker 原文团队致谢保留。

新增 GRA-Flow 与 RECAST 研究笔记，原有三篇内容不变。目前共五篇文章、25 个章节、116 个内容块。原始双语数据保留，所有页面仅输出英文，包括标题、摘要、正文、替代文本、元数据与无障碍标签。论文标题、作者及图示来自用户提供的三份 PDF，投稿状态来自所提供 CV 的第 1 页：

- ProME：第三作者，已投稿 Neurocomputing；保留 arXiv:2608.13190 链接。
- GRA-Flow：第二作者，准备投稿 Pattern Recognition。
- RECAST：第三作者，已投稿 ICCBD+AI 2026；正式标题为 Controlled Residual Transport for Frozen-Backbone All-in-One Image Restoration。

论文 PDF 位于 `public/papers/`，逐文件 SHA-256 与提供的原件一致。RECAST 封面提取自第 3 页图 1；GRA-Flow 封面提取自第 10 页图 2。新增笔记的依据和限制见 `docs/research-sources.md`。

## 技术

技术方案来自 kyswtn.com：Astro 静态生成、UnoCSS、ClientRouter、链接预取、View Transitions、本地字体。参考提交 25e66b8faaae1d8a29d16aa86aade45ecded3c31。框架更新到 Astro 7.4.0；未复制参考作者的私有内容、账户或基础设施配置。

链接悬停/获得焦点时预取相应页面。左栏不参与页面淡入淡出，正文退出 120ms、进入 180ms。减少动态效果偏好关闭平滑锚点滚动与页面过渡。没有 React hydration、GSAP、ScrollMagic 或 smooth-scrollbar。

网站固定英文，不读取旧版语言存储键。颜色全部由 `src/styles/global.css` 的语义变量与 `prefers-color-scheme: dark` 控制，不需要 JavaScript、定时器或存储状态。浏览器改变网页配色偏好后立即更新，ClientRouter 页面切换也保持当前外观。`BaseLayout.astro` 声明 `color-scheme: light dark`，并提供对应的两个 `theme-color` 元数据。论文图和项目截图保留原有颜色。

文章返回链接准确对应首页各条目的 article-card 锚点。目录用 IntersectionObserver 标识章节，不执行逐帧布局扫描。代码块支持复制。页面切换前清理监听和观察器，切换后重新初始化。

禁用 JavaScript 时，英文主页、完整文章、来源链接与返回链接仍然可读可用，深浅色仍然自动跟随浏览器偏好。

## 字体与资源

英文 Nunito 的 latin 与 latin-ext 文件直接复制旧站；代码块使用 Ubuntu Mono。Nunito latin 在首屏本地预加载，使用 font-display: block，不引入整页隐藏脚本。Noto Sans SC 子集仅保留作非英文字符后备，不再预加载。字体、真实项目截图、论文图和头像均由本站提供。字体 OFL 许可证位于 public/fonts。

没有第三方字体 CDN、追踪器、登录或运行时后端依赖。

## 构建

npm run check 检查 Astro/TypeScript；npm run build 输出七个静态页面、站点地图与资源；npm test 核对完整英文文章、英文元数据、本地资源/链接/锚点、语言控件和页脚的移除，以及包含内联脚本的浏览器脚本体积。dist 与 node_modules 是生成目录。

新版保存到 `redesign/astro-homepage-2026-10-16`，基于原仓库 main 的历史提交。该分支不包含旧版 Next.js 部署工作流；现有 main 和 GitHub Pages 配置保留。正式切换网站需要后续明确授权与适用于 Astro dist 的部署配置。
