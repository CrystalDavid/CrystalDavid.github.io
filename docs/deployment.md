# 正式网站部署

正式网址：https://crystaldavid.github.io/

仓库：https://github.com/CrystalDavid/CrystalDavid.github.io

用户于 2026-10-17 明确授权把 Astro 新版发布到正式网址。正式分支为 `main`，旧版 Next.js 保留在远端 Git 历史中。迁移前远端 main 已在 `d799ef18b75d1940d2f5b6d2e0630822e1918e68` 清空旧站；迁移保留此提交和之前历史，不强推覆盖。2026-10-18 按用户要求将本地仓库精简为最新快照，未改写 GitHub 历史。

## 发布流程

1. 在工作分支修改，遵守 [视觉规范](typography.md) 与 `AGENTS.md`。
2. 内容修改可以由 GitHub Actions 运行 `npm run check`、`npm run build`、`npm test`。涉及界面或交互时，临时运行 `npm ci` 后进行本地检查，并检查桌面/手机布局及文章导航；不需要长期保留本地依赖与构建目录。
3. 仅获取需要的远端 main，整合修改，使用普通推送保留远端历史。此本地仓库采用浅历史，不默认 `fetch --unshallow` 或拉取旧分支；遇到并行修改时仅按需获取足够深度来整合。
4. `.github/workflows/pages.yml` 在 main 的非纯 Markdown 变更后自动运行；也可在 Actions 中手动运行。纯文档修改不重复部署。
5. 流程使用 Node.js 24、npm ci，依次执行检查、构建及测试，仅上传 `dist/`。
6. deploy 任务仅允许 main，通过 `github-pages` 环境发布。仓库 Pages 的构建来源设置为 GitHub Actions (`workflow`)。
7. 必须确认对应提交的 build/deploy 均成功，再访问正式网址验证结果。不能只凭推送成功认定上线。

Astro `site` / 构建的 `SITE_URL` 使用 `https://crystaldavid.github.io`，此用户主页仓库部署在根路径，不添加仓库名作为 base。站点地图、canonical 与 robots 均指向正式域名。

## 本地空间与历史

`node_modules/`、`dist/`、`.astro/` 只服务本地检查、构建和预览，可以删除。GitHub 在独立的运行环境中依照 `package-lock.json` 安装依赖并生成 `dist/`，不读取本地这三个目录。源码、`package.json`、锁文件、部署工作流、当前资源及许可证必须保留。

`tests/site.test.mjs` 也必须保留：`package.json` 的 `npm test` 指向它，工作流在构建后、上传前执行四项站点检查。文件约 7.1 KB，不上传到 Pages，不增加网页加载体积。测试中的 `.private` 路径用于断言构建产物不含该目录，并不读取已删除的本地草稿。

本地历史清理前先确认最新源码已正常推送，再将 `main` 缩短为深度 1，移除其他本地分支引用与过期 reflog，并回收不再可达的对象。保留 `origin` 和 `main` 的跟踪关系，不新建与远端无关的根提交，不强推 GitHub。以后提交会自然产生新版本；仅在用户要求时再次清理历史。

当前旧 commit-graph 缓存的删除被工具策略拦截；已在本地配置中禁用读取和重建该缓存。Git 完整性检查通过，当前源码及正常提交、推送不受影响；该设置不影响 GitHub Actions。

## 公开范围

- 首页、三篇公开文章及公开配图进入 dist；不托管或打包任何 PDF，ProME 原文通过 arXiv 入口访问。
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
