# 测试与视觉验收

## 自动化命令

在仓库根目录执行：

```bash
npm run lint
npm run build
npm run test:rendered
```

`npm test` 会先构建再运行 rendered HTML 契约测试，适合最终验收。测试文件位于 `apps/web/tests/rendered-html.test.mjs`，检查：

- 字体文件、许可证、哈希、加载顺序和 4 秒兜底。
- 中英文字体标尺和动效 hook。
- smooth-scrollbar/ScrollMagic/GSAP 的锁定版本与参数。
- 直接滚动订阅通道，不允许恢复逐帧 CustomEvent。
- Hero 的 `fonts-ready` 门控和语言重播。
- `apps/web` 与 `packages/site-contract` 的 workspace 边界。
- 三篇正式文章、真实封面、双语结构、权威来源和返回链接；ProME 页面必须链接 arXiv:2608.13190。

## 桌面视觉验收

1. 清空或分别设置语言 localStorage，硬刷新首页。
2. 确认 Hero 入场可见，圆点持续向上漂浮。
3. 英文界面快速向下/向上滚动至少三次，重点观察所有标题、正文与松手尾段。
4. About 进入时三段文字连续由浅变深；切换语言后当前语言重新正确渲染。
5. 章节标题翻入，Hero/章节外层 wave 快速滚动时可达到约 4°，文字字形保持稳定；停止后连续回到 0。
6. PPT 图片视差、按钮 hover/focus、Article 卡片和页脚链接正常。

## 移动视觉验收

在 390×844 与 430×932 检查中英文：原生滚动、无 wave、Hero 不溢出、导航可用、About 行距正常、产品区单列、文章卡和邮箱不截断。

## 静态产物安全

构建后搜索并确认不存在 `file:///`、`C:\\`、`D:\\`、字体 CDN、临时测试标记、虚构文章、eyebrow 标签或 “Read more articles”。
