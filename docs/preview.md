# 独立公开预览

- 预览网址：https://david-astro-preview-20261016.g2811459442.chatgpt.site
- 原网站：https://crystaldavid.github.io/
- 访问权限：public，任何人无需登录即可访问。
- 内容来源：`redesign/astro-homepage-2026-10-16` 的 `e04261d7df724fea18bfbee50d342afe2ee54a5f`（作者名单保持单行，移除两个项目的首页说明）。
- 预览方式：Sites 独立静态站点，发布 Astro `dist/`。与原 GitHub Pages 的部署完全分开。
- 发布结果：2026-10-17，版本 6，Sites 返回 succeeded。未登录浏览器在 390/1440px 复核作者单行、项目说明移除、白色背景和整页无横向溢出，首页返回 200。GRA-Flow/RECAST 继续只展示列表，PDF/Notes 不进入当前构建；字号和板块间距保持不变。

## Sites 身份

以下 ID 是维护所需的站点标识，不包含凭据。后续更新复用此站点，不要重复创建。

- Project：`appgprj_6ad22c1702188191820ed43099eda69d`
- Version：`appgprj_6ad22c1702188191820ed43099eda69d~appgver_dbc643d0a3a08191ba0e6aecf2477151`
- Deployment：`appgdep_6ad24df03f608191ad24ce776f407f72`
- Sites source commit：`18b31f72a79fe356af1b6670061c721f060a6829`

预览应用代码与上述分支提交一致，仅调整独立域名的 canonical/站点地图元数据、禁止预览被搜索引擎收录，并添加 Sites hosting manifest。搜索引擎规则不限制访客访问。公开内容包括三篇完整文章和 ProME PDF；两篇暂不公开稿件的笔记、PDF 及本机私有目录均不进入当前构建。发布记录等维护文档不影响页面输出。

GitHub 分支与预览之间没有自动发布工作流。后续先在本分支完成修改，再按 Sites 技能的现有站点流程，使用上述 project_id 同步预览源码、构建和发布；保持公开权限。原仓库 main 及 GitHub Pages 发布配置应保持不变。
