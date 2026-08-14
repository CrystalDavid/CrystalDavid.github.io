# 动效清单（不可静默删除）

以下清单继承提交 `82d0bc5` 的产品效果。任何重构、字体调整或布局迁移都必须逐项核对。

| 区域 | 效果 | 触发 | 实现入口 | 移动/减弱动态 |
| --- | --- | --- | --- | --- |
| 全站字体 | 字体解码后才显示正文 | 首次加载，最长 4 秒 | `layout.tsx` | 保留 |
| Hero 标题 | 单词从偏移、旋转、缩放、透明状态汇聚入场 | `fonts-ready` 后双 rAF；切换语言时重播对应副标题 | `motion-controller.tsx` + `.center-magnet-ready` | reduce 时立即完成 |
| Hero 彩色圆点 | 从屏幕下方向上循环漂浮 | Hero 与视口相交 | `floating-decor.tsx` + `dot-rise` | reduce 时静止 |
| About 标题 | 由下向上 36px 淡入 | IntersectionObserver | `.experience-profile-section.is-visible` | 立即显示 |
| About 正文 | 三段文字连续逐字由 20% 变为 100% 不透明度 | ScrollMagic `triggerHook: 0.82` | `WickretRuntime.renderAbout` | 立即全深 |
| 章节标题 | 每个字从上方翻入 | 章节进入视口 | `data-top-flip` + `.flip-char-mask` | 立即显示 |
| Hero/章节标题 wave | 外层随滚动速度产生最高约 ±4° 的 Y 轴倾斜并快速平滑回正，文字内层保持稳定 | 桌面虚拟滚动且标题外层可见 | `.hero-wave-shell` / `.chapter-wave-shell` + `data-scroll-wave` + `SCROLL_WAVE` | 移动/reduce 关闭 |
| Agent 图标 | 章节标题入场时按延迟进入/环绕 | 章节进入 | CSS `.orbit-object` | 立即稳定 |
| 章节指针反馈 | 标题和轨道轻微跟随指针 | 桌面细指针且未滚动 | `data-wickret-pointer` | 移动/reduce 关闭 |
| PPT-Agent 图片 | 从 -80px 到 +80px 的滚动视差 | 桌面虚拟滚动 | `data-feature-scroll` + ScrollMagic | 移动/reduce 回到 0 |
| 产品文字/按钮 | 向上淡入，分层延迟 | 产品区可见 | `.feature-screen.is-visible` | 立即显示 |
| Article 卡片 | 区域进入时按卡片索引依次向上淡入；不使用大面积 blur，避免滚动进入时掉帧 | ScrollMagic 可见性同步 | `.article-gallery-section.is-visible` | 保留简化状态 |
| Hover/Focus | 导航下划线、按钮反色、页脚品牌揭示 | 鼠标/键盘交互 | `globals.css` | 触摸不依赖 hover |

## 删除或改变动效的条件

只有在 David 明确要求删除/替换某项动效时才可修改产品效果。技术重构不得被解释为删除授权。改变触发时机、持续时间、位移、透明度、断点或减少动态行为时，必须同步更新本表和对应专题文档。
