# Hero 入场动画

## 产品效果

`David`、`个人开发者`、`Independent Developer` 被拆成 `.magnet-word`。每个词初始为透明、缩放 0.28，并带有 `--magnet-x`、`--magnet-y` 和 `--magnet-rotate`；随后以错开的延迟汇聚到正常位置。视觉上形成由下方/斜向上浮并吸附到中心的效果。

CSS 时序：

- opacity：720ms，使用每词 `--magnet-delay`。
- transform：920ms，曲线 `cubic-bezier(0.16, 1.2, 0.34, 1)`。
- 进入完成后 1180ms 添加 `motion-settled`，移除 `will-change` 和 transition。

## 正确触发顺序

```text
字体预载/解码
  → html.fonts-ready
  → david:fonts-ready
  → MotionController 双 requestAnimationFrame
  → 添加 text-motion-entered
  → 1180ms 后 motion-settled
```

首屏正文在 `fonts-loading` 时不可见。因此绝对不能在 `fonts-ready` 之前启动动画，否则代码虽然执行了，用户看到的却是已经结束的静态标题。这正是本规范要防止的回归。

## 语言切换

初次加载按已保存语言显示。用户在 Hero 区切换语言时，新的 `.lang-zh` 或 `.lang-en` 会移除已完成状态并重播入场；`David` 不重复闪烁。减少动态效果环境只切换文字，不播放位移。

## 实现位置与参数

- DOM 建立和触发：`apps/web/app/motion-controller.tsx`。
- 字体门控：`apps/web/app/layout.tsx`。
- 样式：`apps/web/app/globals.css` 中 `.center-magnet-ready`。
- 结束时间：`packages/site-contract/src/index.ts` 的 `HERO_ENTRANCE.settleAfterMs`。

验收时用硬刷新观察，而不是只在热更新后的页面判断；同时检查默认英文、保存中文后刷新、Hero 内语言切换三种路径。
