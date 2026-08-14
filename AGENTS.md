# David 个人网站：文章发布模板（强制执行）

本文件适用于本仓库及所有子目录。新增或修改文章时，必须遵守以下模板。

## 内容原则

1. 文章正文必须来自 David 提供的原始 PDF、Markdown 或其他明确来源；不得自行编写一篇“看起来相似”的替代文章。
2. 可以修正错别字、标点和排版，也可以为双语界面翻译，但不得改变原文的技术结论、版本关系、数据、限制或致谢。
3. 来源不清楚时先核对文件标题、目录与正文，再决定文章归属；不能只按文件名猜测。
4. 首页 Article 区只展示已经获得原始材料并完成核对的正式文章，不放占位文章或虚构文章。

## 文章页面固定结构

每篇文章使用 `app/articles/data.ts` 中的统一数据模型，并由 `app/articles/[slug]/page.tsx` 渲染：

1. 顶栏左侧只显示“左箭头 + Article / 文章”，链接固定返回 `/#article-card-<slug>`，准确定位到主页中当前文章的卡片。
2. 顶栏右侧只保留语言切换按钮；不得出现 David 品牌字样或第二个 Articles 链接。
3. 首屏按顺序显示：文章标题、摘要、可点击的项目 GitHub 来源链接。
4. 不显示 `AGENT · PRESENTATION · WORKFLOW`、`OPENCLAW · EVIDENCE · RESEARCH` 或其他 eyebrow / 分类标签。
5. 正文使用编号章节；章节内部可使用段落、小标题、有序或无序列表、代码块。
6. 页脚只保留版权信息；不得出现 “Read more articles / 阅读更多文章”。

## 双语模板

- 所有可见文章字段同时提供 `zh` 与 `en` 版本；代码块保持原始内容，不做无意义翻译。
- 中文版本优先忠实于原文，英文版本是对应翻译，不得扩写为另一篇文章。
- 语言状态继续使用 `html[data-lang]` 与 `david-site-language-v2`，同一时间只显示一种语言。
- 每篇文章必须提供真实封面图、双语替代文本和对应项目 GitHub 链接；主页卡片不得使用空白占位图。

## 字体与渲染

1. 全站字体组合固定为英文 `Nunito`、中文 `Noto Sans SC`，不再提供 URL 字体对比参数或用 `sessionStorage` 记忆字体版本。字体栈顺序固定为英文在前、中文在后，再回退到 `PingFang SC`、`Microsoft YaHei UI`、`Microsoft YaHei` 与通用无衬线字体。
2. 两套字体必须由 `public/fonts` 自托管并在首屏预载，不得引用开发机绝对路径或运行时第三方字体 CDN。Noto Sans SC 使用 Google Fonts CSS2 API 按本站全部发布字符生成的 400–700 可变 WOFF2 子集，并保留 OFL 许可证。页面必须等待 Nunito 与 Noto Sans SC 完成首次解码后再显示文字，避免回退字体切换造成字宽、换行和滚动范围跳变；字体失败兜底不得超过 8 秒。
3. 长文章正文不得进入逐帧动画，不得永久设置 `will-change`，不得套用滚动容器 transform。
4. 中文排版使用独立标尺：Noto Sans SC 正文 400、导航与界面 600、标题及强调 600；不要把中文标题机械设置成 Nunito 的 700/800。中文正文标准字距约 `0.025em`，大标题约 `0.035em–0.055em`，以保持笔画分离。全站保持 `font-synthesis: none` 与抗锯齿；只有超大展示标题使用 `text-rendering: optimizeSpeed` 和 `contain: layout style`，长文章正文不得使用。
5. Wickret 实测桌面滚动参数固定为 smooth-scrollbar 8.x、`damping: 0.06`、`renderByPixels: false`、`continuousScrolling: false`、`delegateTo: container`。滚动内容只能有一个永久合成层；禁止给文字附加持续运行的滚动 skew/wave，禁止在滚动帧内逐字写入内联样式或无条件重启指针 GSAP tween。

## 性能与验收

发布前必须完成：

- `npm run lint`
- `npm run build`
- `node --test tests/rendered-html.test.mjs`
- 桌面端和移动端检查顶栏位置、中文字体、长文滚动、代码块横向滚动和返回链接
- 确认构建产物不存在 `file:///`、本地盘符字体路径、eyebrow 标签或 “Read more articles”
