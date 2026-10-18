# 实现与内容依据

## 视觉与布局

以用户确认的 https://markwwen.github.io/ 截图为布局基准：居中的左侧个人信息，以及右侧紧凑的研究/项目条目。保留蓝色配色并固定浅色：纯白背景、#444444 正文、#043361 姓名/标题/图标、#3399cc 链接和 #006699 链接悬停色。控件与选择高亮沿用蓝色主题。浏览器标签页采用用户选定的 01 优化版圆润闪电，透明底、#3399cc 实心图形。按标签页实效反馈，闪电在各规格画布内等比放大 12%，保留透明底、原有曲线、蓝色及居中。共享布局使用 favicon-lightning-large.svg 和新的 large-16/32 PNG 文件名更新缓存，同时更新根目录包含 16/32/48px 图层的 favicon.ico；SVG 与 16px PNG 继续保留微尺寸轮廓补偿。所有页面和客户端文章导航共用这些声明，不增加运行时脚本，也不恢复原 D 字母图案。使用旧站 Nunito 字体，栏目不使用表情，姓名副行显示 (Dawei HUANG)。左栏仅保留学校、专业和 24px 的实心邮件/GitHub 图标，不再单独展示身份或邮箱文字。邮件保留圆角外形与镂空折线，GitHub 使用实心品牌图形。

论文与项目的资源链接采用胶囊圆角。原 #595959、#333333 和 #777777 均统一为 #444444，包括正文、学校、目录、作者、辅助信息及代码；连同深蓝 #043361、链接蓝 #3399cc，全站默认文字色共三种。普通 strong 继承颜色，作者本人继续用深蓝。语言按钮和全站版权页脚均已移除。

首页所有论文/项目缩略图均不再叠加名称标签。论文条目仅展示标题、作者、投稿状态及资源链接，不显示额外的短说明；PPT-Agent 与 Evidence Tracker 的首页短说明也已移除，仅保留名称、类别与链接。文章页摘要与正文保留。图片完整显示，不裁切流程图或界面边缘。

PPT-Agent 首页配图 `public/media/ppt-agent-welcome.png` 是 2026-10-16 从现有 Demo `https://lambent-zabaione-8eab6b.netlify.app/` 截取的 900×600 单张欢迎界面，未拼接或虚构界面。文章内仍使用原有真实的设计/日志截图。Evidence Tracker 首页及文章封面改用 `public/media/evidence-tracker-workflow.svg`：根据现有文章“Goals and responsibility boundaries”“Architecture and six tools”以及全文检索/规则复核部分绘制的概括性流程图，表达输入、论文身份核对、全文证据检索、支持度审查与可审计报告。它不是测量结果或产品截图，保留 RED/BLOCKED 等失败状态，不新增效果承诺。

桌面内容区 960px：左栏 232px、列间距 78px、右栏 650px。顶部间距 64px。左栏使用 CSS sticky；右栏随浏览器文档原生滚动，没有虚拟滚轮、逐帧 transform 或滚动动画循环。1000px 及以下使用单栏，520px 及以下的条目缩略图与文字上下排列。

完整视觉规范统一维护在 [typography.md](typography.md)。资源胶囊及 Copy 按钮均使用 Nunito 14px，代码正文及工具栏标签也使用 Nunito、字号为 16px；侧栏目录与学校文字同为 Nunito 16px/1.7、400 字重。首页与文章的 26px 标题共用 --line-heading (1.3)，作者/投稿信息共用 --line-meta (1.65)。段落间距共用 --paragraph-gap (18px)，文章摘要和状态下方共用 --auxiliary-gap (16px)，文章 h3 上方使用 --subheading-gap (24px)。其余布局、字号及内容边界保持。

所有论文作者列表与文章页作者信息统一为 16px，均不换行、不缩小字体、不加省略号。桌面长名单可以超出条目文字列，向右侧留白延伸；屏幕空间不足时仅作者行可横向滚动，手机同样保持单行，页面整体不横向溢出。

首页板块使用 `flow-root` 阻止子元素外边距穿透，末项不保留底部外边距。普通相邻板块间距为 48px，1000px 及以下为 40px。此前虽然容器间距相同，图片阴影占用下方留白，使 Projects 与 Beyond Research 看起来更靠近上一张图；现在论文/项目板块之后额外增加 8px，分别为桌面 56px、平板 48px。520px 及以下图片排在文字上方，最后一项以文字或按钮结尾，因此统一为 40px，不再补偿图片阴影。正文栏目标题下留白 18px，论文/项目栏目标题至首条 24px；文章章节也共用 48/40px 基础间距。

头像是 CrystalDavid 的现有 GitHub 头像，下载地址由 GitHub 用户 API 返回，静态托管在 public/media/avatar.png。

## 内容迁移

来源：David 提供的旧版个人网站。原目录保持不变。

个人身份、学校、专业、邮箱、GitHub、PPT-Agent 体验地址、跑步与羽毛球爱好、1000 米 3:05 的成绩来自旧主页。旧站没有入学与毕业日期，因此没有复述可能随时间变化的“大四”，也没有新增导师、学历时间、奖项或个人贡献声明。

从旧站 app/articles/data.ts 实际导出的 articles 数组迁移三篇正式文章；没有迁入其中未使用的旧 PPT-Agent 版本。三篇文章的标题、摘要、来源、替代文本、18 个章节、100 个内容块（含列表、代码、限制和致谢）完整保留。

- prome-group-robust-learning：arXiv:2608.13190，旧站明确以 v1 为准。
- ppt-agent-report：CrystalDavid/PPT-Agent。
- openclaw-evidence-tracker：CrystalDavid/OpenClaw-Evidence-Tracker。

ProME 展示在 Publications & Manuscripts 中，保留旧文章关于训练群体标签、带群体标签的验证集、跨协议实验报告和代码开放状态的边界。Evidence Tracker 原文团队致谢保留。

先前曾新增 GRA-Flow 与 RECAST 研究笔记，现按用户要求暂不公开。当前公开三篇文章、18 个章节、100 个内容块；用户于 2026-10-18 明确要求永久删除两篇本地草稿，不再保留或重建 `.private/`。删除执行状态见验证记录。当前 `src/data/articles.json` 只包含三篇公开文章，所有页面仅输出英文。三篇论文的列表信息保留，标题、作者及图示来自用户提供的 PDF，投稿状态来自 CV 第 1 页：

- ProME：第三作者，已投稿 Neurocomputing；保留 arXiv:2608.13190 链接。
- GRA-Flow：第二作者，准备投稿 Pattern Recognition。
- RECAST：第三作者，已投稿 ICCBD+AI 2026；正式标题为 Controlled Residual Transport for Frozen-Backbone All-in-One Image Restoration。

本站不托管论文 PDF：ProME 的网站副本已从 `public/papers/` 移除，首页 PDF 与文章页 Paper PDF 入口、数据中的 pdf 字段及其类型均已删除。ProME 保留 arXiv 与 Notes，论文原文由访客在 arXiv 下载。2026-10-18 本地清理前检查时，GRA-Flow/RECAST 的两份私人 PDF 副本已不在工作目录；本轮不处理 D 盘源 PDF 或 CV。`publications.json` 将公开列表标题与配图独立存储；GRA-Flow/RECAST 继续保持 `notesAvailable: false`，首页标题和图片均无链接，不生成空按钮行；旧 PDF、Notes 地址返回 404，站点地图不收录两篇。本地两份草稿文件的删除已获明确授权，但被工具策略拒绝，当前残留仍在被忽略的 `.private/`，不会同步到 Sites 或 GitHub。

撤下的是当前网站和当前源码中的完整资料；已公开过的 Git 历史及访客保存的副本不能通过这次常规提交追溯撤回。未改写历史或修改原站。RECAST 展示图仍来自第 3 页图 1，GRA-Flow 展示图仍来自第 10 页图 2。

## 技术

技术方案来自 kyswtn.com：Astro 静态生成、UnoCSS、ClientRouter、链接预取、View Transitions、本地字体。参考提交 25e66b8faaae1d8a29d16aa86aade45ecded3c31。框架更新到 Astro 7.4.0；未复制参考作者的私有内容、账户或基础设施配置。

链接悬停/获得焦点时预取相应页面。左栏不参与页面淡入淡出，正文退出 120ms、进入 180ms。减少动态效果偏好关闭平滑锚点滚动与页面过渡。没有 React hydration、GSAP、ScrollMagic 或 smooth-scrollbar。

网站固定英文，不读取旧版语言存储键。颜色由 `src/styles/global.css` 的浅色变量控制，已删除深色模式覆盖。CSS 声明 `color-scheme: only light`，`BaseLayout.astro` 声明浅色及唯一的 #ffffff 主题色，不需要 JavaScript、定时器或存储状态。浏览器偏好改变、刷新和 ClientRouter 页面切换均保持白色背景。论文图和项目截图保留原有颜色。

文章返回链接准确对应首页各条目的 article-card 锚点。目录用 IntersectionObserver 标识章节，不执行逐帧布局扫描。代码块支持复制。页面切换前清理监听和观察器，切换后重新初始化。

禁用 JavaScript 时，英文主页、完整文章、来源链接与返回链接仍然可读可用，并保持浅色外观。

## 字体与资源

英文 Nunito 的 latin 与 latin-ext 文件直接复制旧站，全站文字统一使用，包括代码正文、语言标签和 Copy。2026-10-18 按用户要求，将 PPT-Agent 三处代码示例中的中文字符串和提示词译为英文；JSON 键名、结构及代码缩进、换行保持，通过 pre 的局部横向滚动容纳长行。两份 Nunito 文件均没有箭头字形，正文继续保留原来的 `→`，由 Noto Sans SC 后备显示，不改成 ASCII 拼接符号或系统字体。

用户明确优先保证字体统一和稳定体验：字体文件与加载策略均保持。Nunito latin 在首屏本地预加载，使用 font-display: block，不切换为 swap，不引入整页隐藏脚本。Noto Sans SC 不预加载，但 PPT-Agent 和 Evidence Tracker 中的 `→` 仍会触发该字体；此次英文翻译不宣称消除了后备字体请求。字体、真实项目截图、论文图和头像均由本站提供。使用字体的 OFL 许可证位于 public/fonts。

没有第三方字体 CDN、追踪器、登录或运行时后端依赖。

2026-10-18 删除当前页面和构建均未引用的两张旧项目图片，以及不再使用的旧版中文字体子集生成脚本；现有字体文件和加载方式保持。后续资源清理应先检查源码与构建引用，再验证保留页面及资源的内容一致，不能只按最近访问次数删除字体、许可证或分享图。

## 构建

npm run check 检查 Astro/TypeScript；npm run build 输出首页、404、三篇公开文章共五个静态页面，以及站点地图与资源；npm test 核对完整英文文章、英文元数据、本地资源/链接/锚点、全站 PDF 文件与下载入口的排除、ProME 的 arXiv 和 Notes 入口、暂不公开稿件的页面/站点地图排除、语言控件和页脚的移除，以及包含内联脚本的浏览器脚本体积。dist 与 node_modules 是生成目录。

2026-10-18 用户选择以 GitHub 构建部署为主，本地仅保留当前版本。开发依赖、构建产物和 `.astro/` 可删除，源码、锁文件与发布工作流仍保留；GitHub 会独立安装依赖并构建。当前本地 Git 已收拢为单个最新快照，清理旧分支引用、reflog 和旧对象，远端历史保持。上轮删除生成目录的操作被自动审批拒绝，后续检查时这些目录已不存在，不将其记作本轮删除；失效的 Git 索引缓存仍禁用。本轮删除本地启动脚本 `start.cmd`，保留云端部署所必需的 `.github/workflows/pages.yml`、配置、锁文件和测试。实际核验见 [verification.md](verification.md)。

用户于 2026-10-17 明确要求将新版发布至正式网站。`main` 发布当前 Astro 版本，`.github/workflows/pages.yml` 使用 Node.js 24 运行 npm ci、check、build、test，再通过 GitHub Pages 发布 dist。迁移保留 main 的既有提交历史，原 Next.js 代码不进入当前构建。部署维护见 [deployment.md](deployment.md)。

此前的独立 Sites 对比预览继续保持 public 权限，地址与版本信息见 [preview.md](preview.md)。GitHub Pages 是正式展示入口；其发布不会自动同步独立预览。
