---
title: Hexo + ParticleX 迁移预览
date: 2026-05-25 00:00:00
tags:
  - Hexo
  - ParticleX
  - Blog
categories:
  - Article
description: 这是一篇用于验证 Hexo 文章页、ParticleX 主题、标签和 Article 入口联动的预览文章。
comments: true
---

这篇文章用于验证新的 Hexo 工作流是否能生成类似 ParticleX 的文章详情页。

当前迁移策略是先保留原有静态页面和交互能力，再逐步把真正的文章内容交给 Hexo 管理。这样首页、Article、About、Agent、Musings、夜间模式、管理员模式和留言墙不会在第一步迁移时丢失。

后续管理员上传 Word 或 PDF 时，理想流程是把文件转换成 Markdown，写入 `source/_posts`，再由 GitHub Actions 自动构建和部署。

## 预期效果

- Article 页面继续显示现有 GitHub Issues 内容。
- Hexo 文章会追加到 Article 页面入口列表。
- 点击 Hexo 文章入口后，进入 `/2026/05/25/hexo-particlex-preview/` 这种 ParticleX 风格详情页。
- 评论系统可以通过 ParticleX 的 `giscus`、`gitalk`、`waline` 或 `twikoo` 配置打开。
