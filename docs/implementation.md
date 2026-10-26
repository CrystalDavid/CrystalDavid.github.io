# 网站实现说明

## 结构

网站使用 Astro 静态生成、UnoCSS、ClientRouter 和本地 Nunito 字体。依赖版本由包清单和锁文件管理；访客下载静态 HTML、样式、资源及少量导航脚本。

| 位置 | 职责 |
| --- | --- |
| `src/pages/index.astro` | About Me、Education、Research Interests、Publications、Projects |
| `src/pages/404.astro` | 未找到页面及返回首页入口 |
| `src/layouts/BaseLayout.astro` | 页面框架、元数据、字体预加载、favicon 和路由 |
| `src/components/Sidebar.astro` | 头像、姓名、Email/GitHub 图标与栏目导航 |
| `src/components/Education.astro` | 教育时间轴及可切回的经典布局 |
| `src/components/Authors.astro` | 作者顺序与本人姓名强调 |
| `src/data/site.ts` | 个人信息、教育经历、导航和项目资料 |
| `src/data/presentation.ts` | 独立选择教育和导航样式 |
| `src/data/publications.json` | 论文标题、署名、配图和 arXiv 地址 |
| `src/styles/global.css` | 全站视觉与响应式规则 |
| `src/scripts/site.ts` | 导航当前项及页面切换生命周期 |
| `public/` | 字体与许可证、图片、图标、分享图和 robots |

构建仅生成首页和 404 两个 HTML 页面，站点地图仅收录首页。数值设计规则统一维护在 [视觉规范](typography.md)。

## 页面与交互

桌面为左侧 sticky 个人资料和导航、右侧原生滚动内容；小屏幕导航在个人信息下方自然换行。导航顺序与正文一致，使用 `#about`、`#education`、`#interests`、`#publications`、`#projects`。404 中的导航链接指向首页对应位置。

Education 使用时间轴布局，桌面按年份、分隔线、南科大校徽、学校及学位专业排列。学校全称 Southern University of Science and Technology 与完整学位专业 Bachelor’s degree in Data Science and Big Data Technology 均直接显示。手机将年份独立放在上方，为下方完整文字留出空间。侧栏使用经典编号链接导航。`src/data/presentation.ts` 可独立选择 Education 的 `timeline` / `classic` 和导航的 `classic` / `buttons`；两个组件在构建时选择对应结构，无运行时切换依赖。样式细节及切换方法见 [视觉规范](typography.md)。

论文只展示标题、作者、配图及可用外链；项目展示单张配图、名称、类别和 Code/Demo 链接。所有论文及项目标题均为无链接的深蓝色文字；ProME 通过 arXiv 按钮访问外部预印本页，项目图片及 Code 按钮指向 GitHub。About Me 中的学校名称为普通正文，不带链接。侧栏导航、About Me 正文和研究兴趣使用加粗字重。作者名单在自身区域横向滚动。

导航原生改变 hash 并定位章节。脚本使用 passive 滚动监听和 requestAnimationFrame 合并更新，每帧最多检查五个板块；仅当前项变化时更新 `aria-current`。点击靠近页尾的栏目后保持所选项，手动滚动时恢复位置跟踪；直接链接、浏览器历史恢复和窗口变化均重新校准。页面切换前取消动画帧和事件监听，切换后初始化。

ClientRouter 处理站内切换，正文保留轻量 View Transitions。所有页面固定浅色，仅输出英文。减少动态效果偏好关闭平滑滚动和过渡；禁用 JavaScript 时栏目锚点和外链仍正常工作。

## 字体与资源

保留本地 Nunito 的 latin 预加载、latin-ext 字符范围与 `font-display: block`。缺字使用现有 Noto Sans SC 后备，不预加载；许可证在 `public/fonts/`。

| 图片 | 用途 |
| --- | --- |
| `public/media/avatar.png` | CrystalDavid 的 GitHub 头像 |
| `public/media/sustech-emblem.png` | 南方科技大学官方校徽，用于教育经历 |
| `public/media/prome-framework.webp` | ProME 两阶段方法框架 |
| `public/media/gra-flow-correction.webp` | GRA-Flow 第 10 页图 2 的修正分解 |
| `public/media/recast-framework.webp` | RECAST 第 3 页图 1 的方法框架 |
| `public/media/ppt-agent-welcome.png` | PPT-Agent 单张真实欢迎界面 |
| `public/media/evidence-tracker-workflow.svg` | Evidence Tracker 的证据核查与审计流程示意图 |

Evidence Tracker 图示包含失败状态，是流程说明，不是产品截图或实验结果。全部配图完整显示，不叠加标签。页面共享透明蓝色闪电 SVG、PNG 和 ICO；社交分享图为 `public/social.png`。无第三方字体 CDN、追踪器、登录或运行时后端。

南科大校徽来自[官网学校标识页](https://www.sustech.edu.cn/zh/school_logo.html)的[原始 PNG](https://www.sustech.edu.cn/uploads/logo1.png)，保留原始文件、色彩和比例，仅在本地静态托管并按布局尺寸显示，不重绘或改色。

本地查看、构建和测试命令见 [README](../README.md)。
