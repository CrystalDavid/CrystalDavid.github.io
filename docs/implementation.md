# 实现与内容依据

## 视觉与布局

以用户确认的 https://markwwen.github.io/ 截图为布局基准：居中的左侧个人信息，以及右侧紧凑的研究/项目条目。已按用户最新要求恢复原蓝色配色并固定浅色：纯白背景、#595959 正文、#043361 姓名/标题/图标、#3399cc 链接和 #006699 链接悬停色。控件、选择高亮与 favicon 同步恢复；撤回灰色版本新增的链接下划线。使用旧站 Nunito 字体，栏目不使用表情，姓名副行显示 (Dawei HUANG)。左栏仅保留学校、专业和 24px 的实心邮件/GitHub 图标，不再单独展示身份或邮箱文字。邮件保留圆角外形与镂空折线，GitHub 使用实心品牌图形。

论文与项目的资源链接采用胶囊圆角。研究兴趣列表与简介正文共用 #595959 正文颜色。语言按钮和全站版权页脚均已移除。

首页所有论文/项目缩略图均不再叠加名称标签。论文条目仅展示标题、作者、投稿状态及资源链接，不显示额外的短说明；项目说明与文章正文保留。图片完整显示，不裁切流程图或界面边缘。

PPT-Agent 首页配图 `public/media/ppt-agent-welcome.png` 是 2026-10-16 从现有 Demo `https://lambent-zabaione-8eab6b.netlify.app/` 截取的 900×600 单张欢迎界面，未拼接或虚构界面。文章内仍使用原有真实的设计/日志截图。Evidence Tracker 首页及文章封面改用 `public/media/evidence-tracker-workflow.svg`：根据现有文章“Goals and responsibility boundaries”“Architecture and six tools”以及全文检索/规则复核部分绘制的概括性流程图，表达输入、论文身份核对、全文证据检索、支持度审查与可审计报告。它不是测量结果或产品截图，保留 RED/BLOCKED 等失败状态，不新增效果承诺。

桌面内容区 960px：左栏 232px、列间距 78px、右栏 650px。顶部间距 64px。左栏使用 CSS sticky；右栏随浏览器文档原生滚动，没有虚拟滚轮、逐帧 transform 或滚动动画循环。1000px 及以下使用单栏，520px 及以下的条目缩略图与文字上下排列。

首页简介、研究兴趣与生活板块正文从 16px 增至 17px，行高 1.7；项目说明从 15px 增至 16px，行高 1.6；论文作者/投稿状态和项目类型从 14px 增至 15px。文章正文和摘要各增加 1px，正文桌面 18px、手机 17px，摘要 18px；作者信息 15px。标题、字体、颜色和控件字号保留。

首页板块使用 `flow-root` 阻止子元素外边距穿透，末项不保留底部外边距；相邻板块间距统一为 48px，1000px 及以下为 40px。此前桌面为 20/28/42px、手机为 20/28/32px。正文板块标题下方留白从 15px 改为 18px；论文/项目标题下到首条的间距为 24px。文章章节间距从 35px 增至桌面 44px、单栏 40px。

头像是 CrystalDavid 的现有 GitHub 头像，下载地址由 GitHub 用户 API 返回，静态托管在 public/media/avatar.png。

## 内容迁移

来源：David 提供的旧版个人网站。原目录保持不变。

个人身份、学校、专业、邮箱、GitHub、PPT-Agent 体验地址、跑步与羽毛球爱好、1000 米 3:05 的成绩来自旧主页。旧站没有入学与毕业日期，因此没有复述可能随时间变化的“大四”，也没有新增导师、学历时间、奖项或个人贡献声明。

从旧站 app/articles/data.ts 实际导出的 articles 数组迁移三篇正式文章；没有迁入其中未使用的旧 PPT-Agent 版本。三篇文章的标题、摘要、来源、替代文本、18 个章节、100 个内容块（含列表、代码、限制和致谢）完整保留。

- prome-group-robust-learning：arXiv:2608.13190，旧站明确以 v1 为准。
- ppt-agent-report：CrystalDavid/PPT-Agent。
- openclaw-evidence-tracker：CrystalDavid/OpenClaw-Evidence-Tracker。

ProME 展示在 Publications & Manuscripts 中，保留旧文章关于训练群体标签、带群体标签的验证集、跨协议实验报告和代码开放状态的边界。Evidence Tracker 原文团队致谢保留。

先前曾新增 GRA-Flow 与 RECAST 研究笔记，现按用户要求暂不公开。当前公开三篇文章、18 个章节、100 个内容块；两篇草稿及原始双语内容仅保留本机 `.private/articles.json`。当前 `src/data/articles.json` 只包含三篇公开文章，所有页面仅输出英文。三篇论文的列表信息保留，标题、作者及图示来自用户提供的 PDF，投稿状态来自 CV 第 1 页：

- ProME：第三作者，已投稿 Neurocomputing；保留 arXiv:2608.13190 链接。
- GRA-Flow：第二作者，准备投稿 Pattern Recognition。
- RECAST：第三作者，已投稿 ICCBD+AI 2026；正式标题为 Controlled Residual Transport for Frozen-Backbone All-in-One Image Restoration。

`public/papers/` 仅保留 ProME PDF。另外两份网站副本移入 `.private/papers/`，移动前后 SHA-256 一致，源 PDF 和 CV 未修改。`publications.json` 将公开列表标题与配图独立存储；GRA-Flow/RECAST 没有 `pdf` 字段且 `notesAvailable: false`。首页标题和图片均无链接，不生成空按钮行；旧 PDF、Notes 地址返回 404，站点地图不收录两篇。原始笔记及其来源说明保存在本机被忽略的 `.private/`，不会同步到 Sites。

撤下的是当前网站和当前源码中的完整资料；已公开过的 Git 历史及访客保存的副本不能通过这次常规提交追溯撤回。未改写历史或修改原站。RECAST 展示图仍来自第 3 页图 1，GRA-Flow 展示图仍来自第 10 页图 2。

## 技术

技术方案来自 kyswtn.com：Astro 静态生成、UnoCSS、ClientRouter、链接预取、View Transitions、本地字体。参考提交 25e66b8faaae1d8a29d16aa86aade45ecded3c31。框架更新到 Astro 7.4.0；未复制参考作者的私有内容、账户或基础设施配置。

链接悬停/获得焦点时预取相应页面。左栏不参与页面淡入淡出，正文退出 120ms、进入 180ms。减少动态效果偏好关闭平滑锚点滚动与页面过渡。没有 React hydration、GSAP、ScrollMagic 或 smooth-scrollbar。

网站固定英文，不读取旧版语言存储键。颜色由 `src/styles/global.css` 的浅色变量控制，已删除深色模式覆盖。CSS 声明 `color-scheme: only light`，`BaseLayout.astro` 声明浅色及唯一的 #ffffff 主题色，不需要 JavaScript、定时器或存储状态。浏览器偏好改变、刷新和 ClientRouter 页面切换均保持白色背景。论文图和项目截图保留原有颜色。

文章返回链接准确对应首页各条目的 article-card 锚点。目录用 IntersectionObserver 标识章节，不执行逐帧布局扫描。代码块支持复制。页面切换前清理监听和观察器，切换后重新初始化。

禁用 JavaScript 时，英文主页、完整文章、来源链接与返回链接仍然可读可用，并保持浅色外观。

## 字体与资源

英文 Nunito 的 latin 与 latin-ext 文件直接复制旧站；代码块使用 Ubuntu Mono。Nunito latin 在首屏本地预加载，使用 font-display: block，不引入整页隐藏脚本。Noto Sans SC 子集仅保留作非英文字符后备，不再预加载。字体、真实项目截图、论文图和头像均由本站提供。字体 OFL 许可证位于 public/fonts。

没有第三方字体 CDN、追踪器、登录或运行时后端依赖。

## 构建

npm run check 检查 Astro/TypeScript；npm run build 输出首页、404、三篇公开文章共五个静态页面，以及站点地图与资源；npm test 核对完整英文文章、英文元数据、本地资源/链接/锚点、暂不公开稿件的 PDF/页面/站点地图排除、语言控件和页脚的移除，以及包含内联脚本的浏览器脚本体积。dist 与 node_modules 是生成目录。

新版保存到 `redesign/astro-homepage-2026-10-16`，基于原仓库 main 的历史提交。该分支不包含旧版 Next.js 部署工作流；现有 main 和 GitHub Pages 配置保留。正式切换网站需要后续明确授权与适用于 Astro dist 的部署配置。

为公开对比提供独立 Sites 预览，地址与维护信息见 `docs/preview.md`。预览使用单独的站点身份和源码仓库，保持 public 权限，不影响原 GitHub Pages；本分支推送不会自动更新该预览。
