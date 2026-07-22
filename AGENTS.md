# David 个人网站：文章发布模板（强制执行）

本文件适用于本仓库及所有子目录。新增或修改文章时，必须遵守以下模板。

## 内容原则

1. 文章正文必须来自 David 提供的原始 PDF、Markdown 或其他明确来源；不得自行编写一篇“看起来相似”的替代文章。
2. 可以修正错别字、标点和排版，也可以为双语界面翻译，但不得改变原文的技术结论、版本关系、数据、限制或致谢。
3. 来源不清楚时先核对文件标题、目录与正文，再决定文章归属；不能只按文件名猜测。
4. 首页 Article 区只展示已经获得原始材料并完成核对的正式文章，不放占位文章或虚构文章。

## 文章页面固定结构

每篇文章使用 `app/articles/data.ts` 中的统一数据模型，并由 `app/articles/[slug]/page.tsx` 渲染：

1. 顶栏左侧只显示“左箭头 + Article / 文章”，链接固定返回 `/#articles`。
2. 顶栏右侧只保留语言切换按钮；不得出现 David 品牌字样或第二个 Articles 链接。
3. 首屏按顺序显示：文章标题、摘要、来源说明。
4. 不显示 `AGENT · PRESENTATION · WORKFLOW`、`OPENCLAW · EVIDENCE · RESEARCH` 或其他 eyebrow / 分类标签。
5. 正文使用编号章节；章节内部可使用段落、小标题、有序或无序列表、代码块。
6. 页脚只保留版权信息；不得出现 “Read more articles / 阅读更多文章”。

## 双语模板

- 所有可见文章字段同时提供 `zh` 与 `en` 版本；代码块保持原始内容，不做无意义翻译。
- 中文版本优先忠实于原文，英文版本是对应翻译，不得扩写为另一篇文章。
- 语言状态继续使用 `html[data-lang]` 与 `david-site-language-v2`，同一时间只显示一种语言。

## 字体与渲染

1. 拉丁文字使用本地 Nunito；中文使用官方包 `chiron-go-round-tc-webfont-truetype` 提供的 `Chiron GoRound TC WS`（昭源環方），并通过 Unicode range 子集按需加载。
2. 字体必须由构建产物自托管，不得引用开发机绝对路径或运行时第三方字体 CDN。
3. 长文章正文不得进入逐帧动画，不得永久设置 `will-change`，不得套用滚动容器 transform。
4. 保持 `font-synthesis: none`、抗锯齿与全站相同的字体回退逻辑；避免 `text-rendering: geometricPrecision` 造成长页面重绘压力。

## 性能与验收

发布前必须完成：

- `npm run lint`
- `npm run build`
- `node --test tests/rendered-html.test.mjs`
- 桌面端和移动端检查顶栏位置、中文字体、长文滚动、代码块横向滚动和返回链接
- 确认构建产物不存在 `file:///`、本地盘符字体路径、eyebrow 标签或 “Read more articles”
