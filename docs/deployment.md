# 正式网站部署

正式网址：https://crystaldavid.github.io/

仓库：https://github.com/CrystalDavid/CrystalDavid.github.io

用户于 2026-10-17 明确授权把 Astro 新版发布到正式网址。正式分支为 `main`，旧版 Next.js 保留在 Git 历史中。迁移前远端 main 已在 `d799ef18b75d1940d2f5b6d2e0630822e1918e68` 清空旧站；迁移保留此提交和之前历史，不强推覆盖。

## 发布流程

1. 在工作分支修改，遵守 [视觉规范](typography.md) 与 `AGENTS.md`。
2. 运行 `npm run check`、`npm run build`、`npm test`，并检查桌面/手机布局及文章导航。
3. 获取最新远端 main，整合已验证修改，使用普通推送保留历史。
4. `.github/workflows/pages.yml` 在 main 的非纯 Markdown 变更后自动运行；也可在 Actions 中手动运行。纯文档修改不重复部署。
5. 流程使用 Node.js 24、npm ci，依次执行检查、构建及测试，仅上传 `dist/`。
6. deploy 任务仅允许 main，通过 `github-pages` 环境发布。仓库 Pages 的构建来源设置为 GitHub Actions (`workflow`)。
7. 必须确认对应提交的 build/deploy 均成功，再访问正式网址验证结果。不能只凭推送成功认定上线。

Astro `site` / 构建的 `SITE_URL` 使用 `https://crystaldavid.github.io`，此用户主页仓库部署在根路径，不添加仓库名作为 base。站点地图、canonical 与 robots 均指向正式域名。

## 公开范围

- 首页、三篇公开文章、ProME PDF 及公开配图进入 dist。
- GRA-Flow、RECAST 仅保留列表，不生成笔记页、PDF 或 sitemap 项。
- `.private/`、本机路径、CV、凭据、源码草稿和依赖目录不得进入 Pages 上传产物。
- Sites 预览为独立历史对比站，版本见 [preview.md](preview.md)。正式发布不自动同步它。

## 首次 Astro 正式发布记录

- 日期：2026-10-17（Asia/Shanghai）。
- 发布提交：`657b1e61d60187302c7fd4cff0c3392e07c09bb7`，已包含最新 main 历史及经过验证的 Astro 源码。
- Actions：[38940733759](https://github.com/CrystalDavid/CrystalDavid.github.io/actions/runs/38940733759)，build 与 deploy 均成功。
- Pages：public，GitHub Actions 构建，HTTPS 已启用。
- 正式域名五页 × 1440/390px 验收通过；四项样式统一、文章导航、资源状态及暂不公开资料的 404 均已核对。

## 回退

优先在 main 上撤销有问题的应用提交并重新运行发布，保留后续无关修改。也可按明确的发布需求恢复已验证版本的源文件后提交。不要 reset/force-push main，不要为修复展示问题恢复暂不公开资料。

## 参考

- [Astro 的 GitHub Pages 部署说明](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages API 与构建来源](https://docs.github.com/en/rest/pages/pages)

发布完成后的具体提交、Actions 运行及线上验收记入 [verification.md](verification.md)。
