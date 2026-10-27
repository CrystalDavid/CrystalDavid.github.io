# 网站实现说明

## 结构

网站使用 Astro 静态生成、UnoCSS、浏览器原生导航和本地 Nunito 字体。依赖版本由包清单和锁文件管理；访客下载静态 HTML、样式、资源及少量导航高亮脚本。

| 位置 | 职责 |
| --- | --- |
| `src/pages/index.astro` | About Me、Education、Research Interests、Publications、Projects |
| `src/pages/404.astro` | 未找到页面及返回首页入口 |
| `src/layouts/BaseLayout.astro` | 页面框架、元数据、字体预加载和 favicon |
| `src/components/Sidebar.astro` | 头像、姓名、Email/GitHub 图标与栏目导航 |
| `src/components/Education.astro` | 教育时间轴 |
| `src/components/Thumbnail.astro` | 响应式缩略图与 SVG 展示 |
| `src/assets/` | 论文与 PPT-Agent 原始图片、构建时加内容哈希的 Nunito core / supplement 字体 |
| `src/components/Authors.astro` | 作者顺序与本人姓名强调 |
| `src/data/site.ts` | 个人信息、教育经历、导航和项目资料 |
| `src/data/publications.json` | 论文标题、署名、配图和 arXiv 地址 |
| `src/styles/global.css` | 全站视觉与响应式规则 |
| `src/scripts/site.ts` | 根据栏目位置更新导航当前项 |
| `public/` | 按需加载的扩展字体与许可证、图片、图标、分享图和 robots |

构建仅生成首页和 404 两个 HTML 页面，站点地图仅收录首页。小体积公共样式在构建时内联到 HTML，避免首次渲染等待额外的样式表请求；字体与图片仍使用独立缓存资源。数值设计规则统一维护在 [视觉规范](typography.md)。

## 页面与交互

桌面为左侧 sticky 个人资料和导航、右侧原生滚动内容；小屏幕导航在个人信息下方自然换行。导航顺序与正文一致，使用 `#about`、`#education`、`#interests`、`#publications`、`#projects`。404 中的导航链接指向首页对应位置。

Education 使用时间轴布局，桌面按年份、分隔线、南科大校徽、学校及学位专业排列。学校全称 Southern University of Science and Technology 与完整学位专业 Bachelor’s degree in Data Science and Big Data Technology 均直接显示。学位名称始终保持单行，桌面可向右侧留白延伸，窄屏只在学位行内横向滚动；手机将年份独立放在上方。侧栏使用编号导航，当前项高亮。栏目在滚动范围允许时对齐桌面头像上沿或单栏顶部留白；页尾留白与 About Me 上方的布局留白相同。板块保持实际内容高度，接近页尾的锚点遵循浏览器的滚动范围限制。样式及尺寸见 [视觉规范](typography.md)。

论文只展示标题、作者、配图及可用外链；项目展示单张配图、名称、类别和 Code/Demo 链接。所有论文及项目标题均为无链接的蓝黑色文字；ProME 通过 arXiv 按钮访问外部预印本页，项目图片及 Code 按钮指向 GitHub。About Me 中的学校名称为普通正文，不带链接。侧栏导航保持加粗，About Me 正文和研究兴趣使用普通字重。作者名单在自身区域横向滚动。

导航通过浏览器原生 hash 直接定位章节。IntersectionObserver 观察标题是否越过顶部定位线，以及最后一个项目是否到达页尾留白线，仅在越过这些边界时读取位置并更新 aria-current；到达页底时高亮 Projects，离开页底时恢复栏目位置判断。requestAnimationFrame 合并同一帧中的观察回调。ResizeObserver 在布局尺寸改变后更新观察范围，字体就绪、窗口变化和历史页面恢复时也会校准。没有逐帧滚动监听、滚轮接管或持续运行的动画循环。直接链接、键盘操作和浏览器前进后退均保留原生行为。

在支持 overflow-clip-margin 的浏览器中，导航使用布局与绘制包含，将当前项更新的独立绘制范围限制在导航内，不对正文提升图层。裁剪留白覆盖键盘焦点轮廓；不支持时保留普通导航绘制，避免裁掉焦点提示。

首页与 404 之间使用普通文档导航，栏目点击直接定位，不添加平滑跳转、整页淡入淡出或惯性滚动。所有页面固定浅色，仅输出英文，并尊重减少动态效果偏好。禁用 JavaScript 时栏目锚点和外链仍正常工作；脚本只负责当前栏目的视觉提示。

## 字体与资源

本地 Nunito 使用固定字重，分为常用英文 core、Latin supplement 和 latin-ext。两份 core 覆盖完整 ASCII、常用英文标点及原有箭头/符号，其余字符保存在补充字体中，通过 unicode-range 按需选择；不能按当前文案任意删除将来可能使用的字符。页面高优先级预加载实际使用的 core 字体，字体和样式使用相同的构建资源地址；内容哈希使字体更新能正确失效缓存。补充字体不预加载。使用的字重及加载规则见 [视觉规范](typography.md)。

core 和 supplement 从固定字重的 Nunito Latin 经 ttfautohint 1.8.4.16-eb64（ttfautohint-py 0.6.1）处理，再用 fontTools 分集。处理使用 `--increase-x-height=0 --stem-width-mode=sss`，将横向笔画厚度及字形对齐区域尽可能对齐整数像素，保留抗锯齿、原有轮廓数据、字宽、字距和垂直度量。core 保留字距、连字与本地化字形（`layout_features=['kern', 'liga', 'locl']`），supplement 保留全部布局特性；两者均保留像素对齐指令和原字符映射，两个集合的字符并集与原 Latin 字体一致。core 中的普通 `1/2` 等字符仍可直接显示；排版不使用 OpenType 自动分数格式。许可证保存在 `public/fonts/`。

保留 `font-display: block` 和 `font-synthesis: none`。临时后备使用本机 Arial，分别校准普通文字、紧凑标签和数字，通过 size-adjust 与字体度量覆盖减少加载时的换行和位置变化；不增加后备字体网络请求，加载完成后统一使用 Nunito。latin-ext 和 Noto Sans SC 后备按字符需要加载。主内容、侧栏及条目文字区域保持不透明白色背景，不对正文使用 transform、图层提升或透明度动画。404 返回箭头使用现有 SVG 图标，避免为单个箭头字形加载后备字体。

| 图片 | 用途 |
| --- | --- |
| `public/media/avatar.png` | CrystalDavid 的 GitHub 头像 |
| `public/media/sustech-emblem.png` | 南方科技大学官方校徽，用于教育经历 |
| `src/assets/prome-framework.webp` | ProME 两阶段方法框架 |
| `src/assets/gra-flow-correction.webp` | GRA-Flow 第 10 页图 2 的修正分解 |
| `src/assets/recast-framework.webp` | RECAST 第 3 页图 1 的方法框架 |
| `src/assets/ppt-agent-welcome.png` | PPT-Agent 单张真实欢迎界面 |
| `public/media/evidence-tracker-workflow.svg` | Evidence Tracker 的证据核查与审计流程示意图 |

Evidence Tracker 图示包含失败状态，是流程说明，不是产品截图或实验结果。全部配图完整显示，不叠加标签。论文与 PPT-Agent 图片通过 Astro Image 在构建时生成响应式 WebP；浏览器按显示宽度及像素密度选择版本，外框尺寸固定，延迟加载不会改变页面布局。原始素材保留在源码中。页面共享透明蓝色闪电 SVG、PNG 和 ICO；社交分享图为 `public/social.png`。无第三方字体 CDN、追踪器、登录或运行时后端。

南科大校徽来自[官网学校标识页](https://www.sustech.edu.cn/zh/school_logo.html)的[原始 PNG](https://www.sustech.edu.cn/uploads/logo1.png)，保留原始文件、色彩和比例，仅在本地静态托管并按布局尺寸显示，不重绘或改色。

本地查看、构建和测试命令见 [README](../README.md)。
