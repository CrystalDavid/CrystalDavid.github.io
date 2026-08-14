# 平滑滚动与文字稳定性

## 桌面滚动参数

参数集中在 `packages/site-contract/src/index.ts`：

```ts
SMOOTH_SCROLLBAR_OPTIONS = {
  damping: 0.06,
  renderByPixels: false,
  continuousScrolling: false,
  alwaysShowTracks: false,
}
```

`delegateTo` 固定为 `.smooth-scroll-content` 容器。`renderByPixels: false` 保留 Wickret 风格的小数位缓动；`.scroll-content` 必须保持单一合成表面。

## 高频数据通道

smooth-scrollbar listener 计算 `y`、`deltaY` 两个数值参数，通过 `ScrollRuntimeReadyDetail.subscribe()` 直接通知 `WickretRuntime`。只在初始化时派发一次 `david:scroll-ready`，高频路径不额外创建快照对象。

禁止恢复每帧 `new CustomEvent("david:virtual-scroll")`：快速上下滚动会制造短生命周期对象和事件分发开销，容易与文字重采样叠加成跳动。

## 标题 wave

2026-08-15 对 Wickret 线上站点实测：一次快速滚动时 `.wt-hero-header` 的首帧矩阵约对应 3.94°，随后随 smooth-scrollbar 的小数位速度连续收敛。本站按这个可感知幅度设置：

- `deltaToDegrees: 0.15`
- `maxDegrees: 4`
- attack 1，release 0.78
- 小于 0.01° 时回到精确 0 并停止 rAF

Wickret 变换的是标题外层，`h1` 本身保持 `transform: none`。本站必须采用同样分层：`data-scroll-wave` 只放在 `.hero-wave-shell` / `.chapter-wave-shell`，实际文字留在内层，并以中心点 `50% 50%` 为变换原点。这样既保留约 4° 的幅度，也避免 Nunito 字形每帧重栅格化。wave 只处理当前可见外层，空闲时不持续写 transform，移动端和减少动态效果环境仍关闭。

## ScrollMagic 场景

- About：`triggerHook: 0.82`，持续范围为 section 高度 + 视口高；进入时 1.05s 逐字显色。
- PPT 图片：`duration: "200%"`，Y 从 -80 到 +80。
- Article：section 与视口相交时切换 `is-visible`。

## 稳定性不变量

- 字体必须先稳定，再初始化虚拟滚动测量。
- 滚动容器使用 `backface-visibility: hidden` 与 `transform-style: preserve-3d`。
- 高频回调里不做 `querySelectorAll`、不创建逐帧事件、不永久提升每个文字节点。
- About 英文逐字显色只写入“新完成字符 + 当前 fade frontier”，不允许每帧循环全部英文 glyph。
- `pointerResets` 只在一次滚动 burst 从静止切换为滚动时执行；Article 的 `getBoundingClientRect()` 只在初始化或 `david:layout` 时兜底，正常滚动由 ScrollMagic enter/leave 管理。
- 章节翻字前后固定 `font-kerning: none`，避免逐字 span 还原为普通文本时发生亚像素宽度变化。
- `is-scrolling` 后 140ms 自动移除；滚动期间禁用 pointer-follow，避免两个 transform 系统争抢同一元素。
- 移动端使用原生滚动并关闭 wave。

## 浏览器验收

在英文界面连续快速向下、向上滚动，观察 Hero、About、章节标题、产品文案和页脚。要求文字形状稳定，没有整行横跳、字体替换或明显倾斜抽动；松手后的缓动应连续收敛。再切换中文重复检查，确保优化没有破坏中文排版。
