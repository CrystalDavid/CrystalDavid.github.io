# 浏览器运行时架构

## 启动顺序

1. `apps/web/app/layout.tsx` 中的内联脚本在首次绘制前恢复 `david-site-language-v2`，并给根节点设置 `data-lang`。
2. 同一脚本预解码 Nunito 与 Noto Sans SC。成功或 4 秒兜底后设置 `fonts-ready` 并只派发一次 `david:fonts-ready`。
3. `MotionController` 建立文字结构和 IntersectionObserver，但首屏文字必须等到 `fonts-ready` 后才开始入场，防止动画在隐藏页面中提前结束。
4. `SmoothScroll` 等字体稳定后测量页面。桌面细指针环境初始化 smooth-scrollbar；移动端、粗指针或 `prefers-reduced-motion` 使用原生滚动。
5. `SmoothScroll` 通过一次性 `david:scroll-ready` 交付运行时对象。虚拟滚动的每帧 `y`、`deltaY` 数值使用 `subscribe()` 直接传给 `WickretRuntime`，不在每帧创建快照对象或 `CustomEvent`。
6. `WickretRuntime` 初始化 ScrollMagic 与 GSAP 2，接管逐字显色、wave、视差、章节进入和指针反馈。

## 核心组件职责

| 文件 | 职责 | 不应承担 |
| --- | --- | --- |
| `layout.tsx` | 元数据、字体预载、首次语言和字体门控 | 页面动画编排 |
| `motion-controller.tsx` | 语言切换、首屏/章节一次性入场、IntersectionObserver | 连续滚动测量 |
| `smooth-scroll.tsx` | 原生/虚拟滚动选择、锚点、滚动数据源 | 具体章节动画 |
| `scroll-runtime-events.ts` | 滚动运行时类型 | 动画参数 |
| `wickret-runtime.tsx` | 连续滚动效果与 ScrollMagic scenes | 字体加载 |
| `packages/site-contract` | 稳定参数和跨模块契约 | DOM 查询和 React 组件 |

## 渲染层约束

- smooth-scrollbar 只能变换一个 `.scroll-content` 合成表面。
- `.scroll-content` 使用 `will-change: transform`、`backface-visibility: hidden` 和 `transform-style: preserve-3d`，避免低速尾段反复整页重绘。
- 不得给所有文字节点永久添加 `will-change`；一次性动画结束后必须清除。
- 高频滚动路径不得创建对象事件、执行全页查询或逐帧读取布局。需要布局读取时应在初始化、IntersectionObserver 回调或明确的 `david:layout` 中完成。
- 标题 wave 只变换外层 shell；标题字形、翻字节点和指针跟随节点位于内层，避免同一 transform 属性竞争并减少英文重栅格化。
- `is-scrolling` 的闲置检测使用单个 rAF 循环；pointer reset 仅在滚动 burst 开始时执行一次。About 的 GSAP ticker 只更新移动前沿，不全量扫描英文字符。
- 长文章使用原生页面流，不套 smooth-scrollbar，也不运行逐帧文字动画。

## 运行时状态

| 根节点状态 | 含义 |
| --- | --- |
| `fonts-loading` | 首次字体仍在解码，正文暂不可见 |
| `fonts-ready` | 字体可见，允许首屏入场和滚动测量 |
| `native-scroll` | 当前使用浏览器原生滚动 |
| `virtual-scroll` | 当前使用 smooth-scrollbar |
| `is-scrolling` | 正在滚动或处于 140ms 尾段，暂时禁用指针追随 |

添加 `?qa` 时，运行时会在根节点暴露 `data-qa-scroll-y` 与 `data-qa-about-progress`，只用于浏览器验收。
