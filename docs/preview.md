# 独立公开预览

- 预览网址：https://david-astro-preview-20261016.g2811459442.chatgpt.site
- 原网站：https://crystaldavid.github.io/
- 访问权限：public，任何人无需登录即可访问。
- 内容来源：`redesign/astro-homepage-2026-10-16` 的 `3719e94f494a0cf931b1aa73d2eb107683890873`（侧栏与学校字体一致、最低字号 16px、统一深灰文字）。
- 预览方式：Sites 独立静态站点，发布 Astro `dist/`。与原 GitHub Pages 的部署完全分开。
- 发布结果：2026-10-17，版本 8，Sites 返回 succeeded。未登录浏览器复核首页 390/1440px 与 ProME 文章均返回 200；实际只出现 16/18/22/26/32px 五档字号和三种常驻文字色。侧栏目录与学校文字匹配，原 #595959 文字统一为 #444444。既有板块间距和资料暂不公开规则保持，整页无横向溢出。

## Sites 身份

以下 ID 是维护所需的站点标识，不包含凭据。后续更新复用此站点，不要重复创建。

- Project：`appgprj_6ad22c1702188191820ed43099eda69d`
- Version：`appgprj_6ad22c1702188191820ed43099eda69d~appgver_790d750c21488191b44f6302d3a6b80b`
- Deployment：`appgdep_6ad2588645dc8191aa536e43f48abdae`
- Sites source commit：`e4cc4ec1b480cc13a440743d95393410db7ca3bc`

预览应用代码与上述分支提交一致，仅调整独立域名的 canonical/站点地图元数据、禁止预览被搜索引擎收录，并添加 Sites hosting manifest。搜索引擎规则不限制访客访问。公开内容包括三篇完整文章和 ProME PDF；两篇暂不公开稿件的笔记、PDF 及本机私有目录均不进入当前构建。发布记录等维护文档不影响页面输出。

GitHub 分支与预览之间没有自动发布工作流。后续先在本分支完成修改，再按 Sites 技能的现有站点流程，使用上述 project_id 同步预览源码、构建和发布；保持公开权限。原仓库 main 及 GitHub Pages 发布配置应保持不变。
