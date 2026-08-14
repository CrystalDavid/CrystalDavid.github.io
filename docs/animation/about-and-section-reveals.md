# About 与章节显现

## About 逐字由浅变深

`CharacterStory` 为中英文分别生成 `.char-reveal-story`。英文按单词包裹，避免单词内部断行；每个字符仍是 `.char-reveal-glyph`。

`WickretRuntime` 每次只选择当前语言的 story。初始 opacity 为 0.2，进入 About 场景后用 GSAP 把一个 progress 从 0 推到 1。字符透明度按移动前沿计算：

```text
fadeWindow = max(12, round(characterCount × 0.035))
cursor = progress × (characterCount + fadeWindow)
opacity = 0.2 + clamp((cursor - index) / fadeWindow) × 0.8
```

透明度变化达到 0.005 时才写 style。运行时记录 `completedGlyphIndex`：新完成的字符只写一次 1，未来字符保持初始化的 0.2，每帧只循环约一个 `fadeWindow` 大小的移动前沿。英文字符数明显多于中文，因此禁止重新改回 `for (index = 0; index < count; index++)` 的全量每帧扫描。离开上方时一次性重置为浅色，越过下方时一次性固定为全深；语言切换后通过 `david:layout` 选择并初始化新 story。

## 章节翻字

`data-top-flip` 标题按字符拆分成 `.flip-char-mask > span`。每字延迟为 `index × 14 + 20ms`，从 `translateY(-112%) rotateX(-108deg)` 进入。900ms 后恢复成普通文本节点并移除临时合成状态，避免后续滚动时英文持续处于字符级纹理层。

章节标题固定 `font-kerning: none`。逐字 span 无法跨节点做字偶距，如果还原成普通文本时重新启用 Nunito kerning，标题宽度会瞬间变化约半像素，滚动中表现为英文跳一下；固定模式可保证动画前后字宽一致。

## 通用 section reveal

`data-reveal-section` 由 IntersectionObserver 触发，root margin 为底部 -8%，threshold 0.06。非重复 section 首次显示后取消观察。Article 使用 `data-reveal-repeat`：正常滚动由 ScrollMagic enter/leave 切换，真实矩形只在初始化和 `david:layout` 时做一次兜底同步，不能在每个滚动帧强制布局。

Article 卡片保留错峰的 opacity + translateY 入场，不对整张卡片执行 blur 过渡。卡片数量增加后，大面积滤镜会在滚动进入区域时触发额外离屏栅格化，属于应避免的全局性能回退。

减少动态效果模式下所有内容直接进入完成状态，不能保持 opacity 0。
