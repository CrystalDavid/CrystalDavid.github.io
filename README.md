# David 的个人网站

正式网站：[crystaldavid.github.io](https://crystaldavid.github.io/)。

这是一个英文单页个人网站，使用 Nunito 字体、白色背景、海军蓝标题、蓝黑正文和蓝色链接。桌面左侧个人信息与栏目导航采用 sticky 布局，右侧原生滚动；小屏幕使用单栏和换行导航。

## 修改与发布

修改源码和资源后，提交并推送到 GitHub 的 `main`。GitHub Actions 会安装锁定依赖，完成检查、构建和测试后发布静态网站。仅修改 Markdown 文档不会触发部署。完整流程见 [部署说明](docs/deployment.md)。

| 修改内容 | 文件 |
| --- | --- |
| 个人信息、教育经历、项目、联系方式 | `src/data/site.ts` |
| 首页文字与栏目结构 | `src/pages/index.astro` |
| 论文标题、作者、配图和 arXiv 地址 | `src/data/publications.json` |
| 左栏与栏目导航 | `src/components/Sidebar.astro` |
| 教育布局 | `src/components/Education.astro` |
| 独立选择教育和导航样式 | `src/data/presentation.ts`；任一项设为 `classic` 即可恢复该处原版 |
| 字体、颜色、间距与响应式布局 | `src/styles/global.css` |
| 页面元数据与 favicon 声明 | `src/layouts/BaseLayout.astro` |
| 导航当前项与页面切换 | `src/scripts/site.ts` |
| 图片、字体与图标 | `public/` |

首页依次展示 About Me、Education、Research Interests、Publications 和 Projects。构建仅生成首页与 404，站点地图收录首页。论文保留标题、作者、配图及已有 arXiv 外链，项目提供 Code/Demo。公开内容及资料使用边界见 [研究资料来源](docs/research-sources.md)。

## 本地预览（可选）

建议使用与 GitHub Actions 一致的 Node.js 24，项目最低要求为 Node.js 22.22。

```powershell
npm ci
npm run dev
```

默认预览地址为 `http://127.0.0.1:4321/`。构建与验证命令见 [部署说明](docs/deployment.md)。

`node_modules/`、`dist/` 和 `.astro/` 可按需生成，不必长期保留。GitHub 独立安装依赖和构建；源码、当前资源与许可证、包清单和锁文件、配置、`.github/workflows/pages.yml`、`tests/` 必须保留。

`tests/site.test.mjs` 由发布流程执行，检查内容、链接、公开范围与浏览器脚本体积，不进入访客下载的网站文件。

## 文档

- [视觉规范](docs/typography.md)：全站字体、颜色、字号、行高与间距的唯一规范。
- [实现说明](docs/implementation.md)：代码结构、页面行为、字体加载与配图。
- [部署说明](docs/deployment.md)：发布、验证和本地开发方式。
- [研究资料来源](docs/research-sources.md)：研究依据、署名及公开范围。
- [AGENTS.md](AGENTS.md)：修改本项目时遵守的维护规则。

## 技术与参考

使用 Astro 静态生成、UnoCSS、ClientRouter、View Transitions 和本地字体。依赖版本以 `package.json` 与 `package-lock.json` 为准。

布局参考 [Weihuang Wen 的主页](https://markwwen.github.io/)；技术参考 [Kyaw 的网站](https://kyswtn.com/)及其[源代码](https://github.com/kyswtn/kyswtn.com)。
