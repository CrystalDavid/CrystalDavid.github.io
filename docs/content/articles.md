# 正式文章与来源清单

首页只展示已经获得并核对权威来源、完成双语整理且拥有真实封面的文章。文章统一由 `apps/web/app/articles/[slug]/page.tsx` 渲染，数据入口为 `apps/web/app/articles/data.ts`。

| 路由 slug | 文章 | 权威来源 | 封面 |
| --- | --- | --- | --- |
| `prome-group-robust-learning` | ProME: Prototype-Margin Environments with Repair-Aware Selection for Group-Robust Learning | `https://arxiv.org/abs/2608.13190` | 论文 Fig. 2，经等比缩放并转为 `public/media/prome-framework.webp`，保留原图透明背景 |
| `ppt-agent-report` | PPT-Agent Report | `https://github.com/CrystalDavid/PPT-Agent.git` | `public/media/ppt-agent-report.png` |
| `openclaw-evidence-tracker` | Research Evidence Tracker: Implementation and Evolution | 项目原始材料中记录的 GitHub 来源 | `public/media/evidence-tracker-report.png` |

## ProME 内容边界

- 标题、作者、日期、方法、实验数字、理论条件、数据可用性和代码开放状态均以 arXiv v1（2026-08-13）为准。
- 主表的基线来自各自原论文协议，页面必须明确称为“已发表结果的跨协议报告”，不能写成统一设置下的严格受控复现。
- 必须说明 Stage 1 不用训练群体标签，但 Stage 2 使用带群体标注的验证集完成分类器拟合、调参与选择；不得概括成“完全不需要群体标签”。
- 论文写明代码将在接收后公开。在真实仓库出现前只能链接 arXiv，不得虚构 GitHub 地址。
- 理论部分必须保留“没有声称有限样本经验风险到总体风险保证”这一边界。

## 新增文章检查

1. 在 `data.ts` 的 `articles` 数组中显式加入，确保主页卡片与静态路由同时生成。
2. 中英文标题、摘要、章节、来源标签与封面替代文本必须成对存在。
3. 封面必须来自原始材料或可核验项目界面，压缩后仍需清晰；不得用空白占位图。
4. 更新 `apps/web/tests/rendered-html.test.mjs` 的文章数量、路由、来源和关键事实断言。
5. 构建后打开主页与文章页，检查返回链接准确落到 `/#article-card-<slug>`。
