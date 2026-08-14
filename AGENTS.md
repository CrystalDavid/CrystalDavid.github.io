# David 个人网站：工程与内容规范（强制执行）

本文件适用于本仓库及所有子目录。任何代码、样式、动画、内容、架构或构建修改都必须遵守本文件。

## 文档核对与同步（每次修改都必须执行）

1. 开始修改前，先阅读 `docs/README.md`、`docs/quality/change-checklist.md`，以及与改动有关的 architecture、ui、animation 文档。
2. 修改首页、字体、布局或滚动时，必须逐项核对 `docs/animation/inventory.md`；技术重构和字体调整都不构成删除既有动效的授权。
3. 新增、删除或改变功能、动效、参数、字号、颜色、断点、目录、依赖、运行顺序、测试或构建命令时，同一批修改必须更新 `docs/` 对应文件。
4. 修改完成后必须再次按 `docs/quality/change-checklist.md` 验收。代码和文档有差异时，先确认真实产品意图，再同步修正两者；不得只改测试来掩盖差异。
5. 对站点有长期价值的新实现必须写清楚“效果、触发、参数、代码入口、降级方式和验收方法”，防止后续误删。

## 内容原则

1. 文章正文必须来自 David 提供的原始 PDF、Markdown 或其他明确来源；不得自行编写一篇“看起来相似”的替代文章。
2. 可以修正错别字、标点和排版，也可以为双语界面翻译，但不得改变原文的技术结论、版本关系、数据、限制或致谢。
3. 来源不清楚时先核对文件标题、目录与正文，再决定文章归属；不能只按文件名猜测。
4. 首页 Article 区只展示已经获得原始材料并完成核对的正式文章，不放占位文章或虚构文章。

## 文章页面固定结构

每篇文章使用 `apps/web/app/articles/data.ts` 中的统一数据模型，并由 `apps/web/app/articles/[slug]/page.tsx` 渲染：

1. 顶栏左侧只显示“左箭头 + Article / 文章”，链接固定返回 `/#article-card-<slug>`，准确定位到主页中当前文章的卡片。
2. 顶栏右侧只保留语言切换按钮；不得出现 David 品牌字样或第二个 Articles 链接。
3. 首屏按顺序显示：文章标题、摘要、可点击的权威来源链接（项目文章使用 GitHub，论文使用 arXiv/DOI）。
4. 不显示 `AGENT · PRESENTATION · WORKFLOW`、`OPENCLAW · EVIDENCE · RESEARCH` 或其他 eyebrow / 分类标签。
5. 正文使用编号章节；章节内部可使用段落、小标题、有序或无序列表、代码块。
6. 页脚只保留版权信息；不得出现 “Read more articles / 阅读更多文章”。

## 双语模板

- 所有可见文章字段同时提供 `zh` 与 `en` 版本；代码块保持原始内容，不做无意义翻译。
- 中文版本优先忠实于原文，英文版本是对应翻译，不得扩写为另一篇文章。
- 语言状态继续使用 `html[data-lang]` 与 `david-site-language-v2`，同一时间只显示一种语言。
- 每篇文章必须提供真实封面图、双语替代文本和对应权威来源链接；主页卡片不得使用空白占位图，也不得为尚未公开的代码虚构 GitHub 地址。

## 字体与渲染

1. 全站字体组合固定为英文 `Nunito`、中文 `Noto Sans SC`，不再提供 URL 字体对比参数或用 `sessionStorage` 记忆字体版本。字体栈顺序固定为英文在前、中文在后，再回退到 `PingFang SC`、`Microsoft YaHei UI`、`Microsoft YaHei` 与通用无衬线字体。
2. 两套字体必须由 `apps/web/public/fonts` 自托管并在首屏预载，不得引用开发机绝对路径或运行时第三方字体 CDN。Noto Sans SC 使用 Google Fonts CSS2 API 按本站全部发布字符生成的 400–700 可变 WOFF2 子集，并保留 OFL 许可证。页面必须等待 Nunito 与 Noto Sans SC 完成首次解码后再显示文字，避免回退字体切换造成字宽、换行和滚动范围跳变；字体失败兜底不得超过 4 秒。
3. 长文章正文不得进入逐帧动画，不得永久设置 `will-change`，不得套用滚动容器 transform。
4. 中文排版使用独立标尺：Noto Sans SC 正文 500、导航与界面 700、标题及强调 700；字号需要与对应的 Nunito 层级保持相同的视觉份量，不得为了容纳内容而整体缩小中文。中文正文标准字距约 `0.025em`，大标题约 `0.035em–0.055em`，以保持笔画分离。全站保持 `font-synthesis: none` 与抗锯齿，长文章正文不得使用逐帧文字效果。
5. 首页非字体动效以提交 `82d0bc5` 的效果清单为基线：桌面滚动固定使用 smooth-scrollbar 8.x、`damping: 0.06`、`renderByPixels: false`、`continuousScrolling: false`、`delegateTo: container`；保留单一 `.scroll-content` 合成层、Hero 字词汇聚入场与圆点上浮、关于我逐字由浅变深、章节翻字、标题滚动 wave、特性区视差、Article 显现与指针反馈。后续字体调整或重构不得删除、合并或静默改写这些动效。
6. Hero 入场必须在 `fonts-ready` 后启动；否则页面仍处于隐藏状态，动画会在用户看不到时结束。中文和英文硬刷新都必须可见，语言切换时重播新语言副标题。
7. 每帧虚拟滚动数据使用 `ScrollRuntimeReadyDetail.subscribe()` 直接订阅，不得恢复逐帧 `david:virtual-scroll` CustomEvent。wave 必须使用 `packages/site-contract` 的限幅和平滑参数；桌面峰值约 ±4°，并且只能变换 `.hero-wave-shell` / `.chapter-wave-shell` 外层，不能直接逐帧重采样标题文字。
8. 英文 About 逐字显色每帧只能更新当前 reveal frontier；滚动开始时的 pointer reset 每个滚动 burst 只能触发一次；Article 的矩形可见性读取只能发生在初始化或布局更新中，不得回到每滚动帧全量扫描、重复创建 GSAP tween 或强制布局。

## Monorepo 架构

1. `apps/web` 是唯一可运行和部署的业务应用；页面、组件、文章、CSS、静态资源和应用测试都归这里。
2. `packages/site-contract` 保存不依赖页面 DOM 的可复用契约和稳定参数。依赖方向只能是 `apps/web -> packages/*`，公共包不得反向导入应用。
3. 根 `package.json` 只负责 npm workspaces 和统一脚本，不放 React/Next 业务依赖。
4. 新建公共包必须有真实复用边界；不得把单个组件机械拆包。目录变化必须同步更新 `docs/architecture/monorepo.md`、部署路径和测试路径。
5. `.next`、`out`、日志、临时脚本、截图、性能采样等生成物不得提交；删除文件前必须确认它是可再生且不包含用户资料。

## 性能与验收

发布前必须完成：

- `npm run lint`
- `npm run build`
- `npm run test:rendered`
- 桌面端和移动端检查顶栏位置、中文字体、长文滚动、代码块横向滚动和返回链接
- 桌面英文连续快速上下滚动，确认所有字体和松手尾段无明显跳动；中英文硬刷新确认 Hero 入场可见
- 逐项核对 `docs/animation/inventory.md`，并确认本次有感知或架构变化已同步到 `docs/`
- 确认构建产物不存在 `file:///`、本地盘符字体路径、eyebrow 标签或 “Read more articles”
