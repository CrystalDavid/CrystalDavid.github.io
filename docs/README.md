# 网站设计与实现

这里介绍旧版个人网站的布局、动效、排版和运行方式。先从 [项目介绍](../README.md) 启动本地预览，再按关注的效果阅读对应实现。

## 动效与交互

- [完整动效清单](animation/inventory.md)：效果、触发条件、代码入口与移动端表现。
- [Hero 入场](animation/hero-entrance.md)：字体加载、标题汇聚与首屏时序。
- [滚动机制](animation/scrolling.md)：桌面虚拟滚动、锚点与滚动参数。
- [文字和章节显现](animation/about-and-section-reveals.md)：逐字显色、翻字与卡片入场。

## 视觉与内容

- [字体排版](ui/typography.md)：Nunito、Noto Sans SC 和双语层级。
- [颜色与布局](ui/color-and-layout.md)：页面结构和视觉参数。
- [响应式](ui/responsive.md)：桌面、移动和减少动态效果偏好。
- [文章结构](content/articles.md)：文章来源、数据模型与路由。

## 开发

- [Monorepo](architecture/monorepo.md)：应用与共享包的组织。
- [浏览器运行时](architecture/runtime.md)：字体、滚动与动画协作。
- [构建与部署](architecture/deployment.md)：静态导出和 Pages 工作流。
- [测试方法](quality/testing.md) · [修改检查](quality/change-checklist.md)
