# 响应式规范

## 核心断点

- `> 720px`：桌面布局、细指针条件满足时启用虚拟滚动和完整 Wickret 动效。
- `≤ 720px`：紧凑布局、原生滚动、关闭标题 wave 与桌面视差。
- 粗指针、移动设备 UA 或 `prefers-reduced-motion: reduce`：即使宽度较大也使用原生滚动。

## 移动端规则

- 顶栏仍固定，但导航间距、字号和语言按钮都缩小；可访问点击高度不能被进一步压缩。
- Hero 宽度为 `calc(100vw - 28px)`，身份副标题允许合理换行。
- 产品区改为单列，图片与说明按阅读顺序排列。
- Article 卡片改为单列。
- 页脚变为两列加跨列联系区。
- `[data-scroll-wave]` 强制 `transform: none`，避免移动浏览器文字重采样。

## 视口高度

CSS 默认使用 `100svh`。桌面端 `MotionController` 把实际 `documentElement.clientHeight` 写入 `--app-viewport-height`，resize 后同步并派发 `david:layout`。移动端不写死 JS 高度，避免地址栏收缩导致跳动。

## 验收宽度

至少检查：1440×900、1920×1080、390×844、430×932。中英文各检查一次，且要覆盖语言切换后的 Hero、About 换行、产品按钮和页脚邮箱。
