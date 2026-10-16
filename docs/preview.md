# 独立公开预览

- 预览网址：https://david-astro-preview-20261016.g2811459442.chatgpt.site
- 原网站：https://crystaldavid.github.io/
- 访问权限：public，任何人无需登录即可访问。
- 内容来源：`redesign/astro-homepage-2026-10-16` 的 `6e49b2370894129ed97eca4f177bcf69ecb260f9`（按钮单独使用 14px，其余五档文字字号与统一深灰保持）。
- 预览方式：Sites 独立静态站点，发布 Astro `dist/`。与原 GitHub Pages 的部署完全分开。
- 发布结果：2026-10-17，版本 9，Sites 返回 succeeded。未登录 Edge 复核首页 320/390/1440px 与 ProME 文章 390/1440px 均返回 200，所有资源按钮和 Copy 均为 14px/21px。学校、目录及其他辅助文字仍为 16px，正文为 18px、#444444。固定白色背景，无整页横向溢出或运行时异常。

## Sites 身份

以下 ID 是维护所需的站点标识，不包含凭据。后续更新复用此站点，不要重复创建。

- Project：`appgprj_6ad22c1702188191820ed43099eda69d`
- Version：`appgprj_6ad22c1702188191820ed43099eda69d~appgver_2ec05331ad588191bed19615444fc200`
- Deployment：`appgdep_6ad25b31c1948191b863610ef28a666c`
- Sites source commit：`6982095e89542704ad19f38a5c4b9d524264fa38`

预览应用代码与上述分支提交一致，仅调整独立域名的 canonical/站点地图元数据、禁止预览被搜索引擎收录，并添加 Sites hosting manifest。搜索引擎规则不限制访客访问。公开内容包括三篇完整文章和 ProME PDF；两篇暂不公开稿件的笔记、PDF 及本机私有目录均不进入当前构建。发布记录等维护文档不影响页面输出。

GitHub 分支与预览之间没有自动发布工作流。后续先在本分支完成修改，再按 Sites 技能的现有站点流程，使用上述 project_id 同步预览源码、构建和发布；保持公开权限。原仓库 main 及 GitHub Pages 发布配置应保持不变。
