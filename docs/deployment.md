# 部署与验证

正式网站：[crystaldavid.github.io](https://crystaldavid.github.io/)。

代码仓库：[CrystalDavid/CrystalDavid.github.io](https://github.com/CrystalDavid/CrystalDavid.github.io)。发布分支为 `main`。

## GitHub 发布

发布入口为 [pages.yml](../.github/workflows/pages.yml)，仓库 Pages 的构建来源使用 GitHub Actions。

1. 检查工作区，保留无关修改，并按 [视觉规范](typography.md) 和 [维护规则](../AGENTS.md) 完成修改。
2. 提交后普通推送至 `main`。如有远端更新，先整合再推送，不强推覆盖。
3. 非纯 Markdown 的变更触发自动发布；也可手动运行工作流。纯 Markdown 修改只同步仓库文档，不重复构建网站。
4. GitHub 使用 Node.js 24 执行 `npm ci`、`npm run check`、`npm run build`、`npm test`，随后仅上传 `dist/`。
5. `deploy` 任务在 `main` 上通过 `github-pages` 环境发布。对应提交的 build 和 deploy 均成功，且正式网站核对通过后，才算发布完成。

本地仓库保持浅历史和正常远端跟踪关系。仅按整合需要获取额外历史，不默认拉取所有分支或完整历史。

## 本地检查与预览

需要检查源码或界面时，使用 Node.js 24 在仓库根目录执行：

```powershell
npm ci
npm run check
npm run build
npm test
npm run preview
```

修改过程中的即时预览使用 `npm run dev`。构建结果通过 HTTP 服务查看，不能直接双击 HTML 验证路由。

本地依赖和生成目录 `node_modules/`、`dist/`、`.astro/` 可按需生成。GitHub 在独立环境中安装和构建，本机不必常驻开发服务或保留这些目录。

## 验证范围

[tests/site.test.mjs](../tests/site.test.mjs) 通过 Node.js 内置测试工具检查构建结果，覆盖：

- 三篇公开文章的完整英文内容、元数据、来源及返回锚点。
- 论文与文章的公开范围、arXiv 和 Notes 入口，以及非公开资料和 PDF 的排除。
- 本地资源、链接、章节锚点、固定浅色设置及必要的字体许可证。
- 浏览器脚本体积，包括内联脚本；上限为原始 40,000 bytes、gzip 15,000 bytes。

涉及界面或交互的修改，还需核对首页、三篇文章及 404 的桌面和手机显示：字体与间距符合规范，无整页横向溢出，配图完整，目录、复制、返回锚点及页面切换正常；浅色和深色浏览器偏好下均保持白色背景。检查键盘导航、减少动态效果偏好及禁用 JavaScript 时的阅读能力。

部署后在正式域名复核受影响页面和资源，确认对应的 Actions 运行成功。纯文档修改检查事实、链接及 `git diff --check` 即可，无需安装依赖或运行构建。

## 发布配置与文件范围

Astro 的 `site` 和工作流构建变量 `SITE_URL` 使用 `https://crystaldavid.github.io`，部署在域名根路径，不添加仓库名作为 base。更换域名时，同步构建变量、`astro.config.mjs` 默认地址、`public/robots.txt` 和社交分享图中的域名。

页面源码、包清单与锁文件、Astro/UnoCSS/TypeScript 配置、当前资源与许可证、测试和工作流均属于维护必需文件。测试与开发依赖不进入 Pages 产物。公开内容遵守 [研究资料来源](research-sources.md)；本机路径、CV、凭据和私人源资料不得进入产物。

如需修复错误发布，提交修正或撤销对应变更后重新发布，保留无关修改，不重写远端历史。
