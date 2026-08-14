# Monorepo 架构

## 目录边界

```text
.
├─ apps/
│  └─ web/                    # 可独立运行和部署的 Next.js 网站
│     ├─ app/                 # 页面、组件、样式和浏览器运行时
│     ├─ public/              # 字体、图片等静态资源
│     ├─ tests/               # 静态导出契约测试
│     └─ package.json
├─ packages/
│  └─ site-contract/          # 可复用且不依赖页面 DOM 的站点契约
│     ├─ src/index.ts         # 滚动、首屏和 wave 的稳定参数
│     └─ tsconfig.json        # 公共包独立类型检查
├─ docs/                      # 设计与工程规范
├─ .github/workflows/         # GitHub Pages 部署
└─ package.json               # npm workspaces 与统一命令
```

## 判断标准

当前结构符合本项目所需的标准 monorepo 形式：

- `apps/web` 是“可运行的业务应用”，拥有 Next.js 配置、页面、资源和端到端导出测试。
- `packages/site-contract` 是“可复用的公共包”，集中保存跨运行时需要共享、不可漂移的参数。
- 根包只负责编排 workspaces 和统一命令，不承载 React/Next 业务依赖。
- 应用可以依赖公共包；公共包不得反向导入 `apps/web`。

## 依赖方向

```text
root scripts ──> apps/web ──> packages/site-contract
                         └──> external libraries
```

禁止循环依赖。只有在两个以上业务模块确实共享且接口稳定时，才新增公共包；不能为了“看起来像 monorepo”把单个页面组件拆成无意义包。

## 文件归位规则

- 页面、组件、CSS、文章数据：`apps/web/app`。
- 字体、图片、许可证：`apps/web/public`。
- 浏览器导出契约测试：`apps/web/tests`。
- 不依赖具体 DOM 的共享常量、类型和算法：`packages/*`。
- 产品规范和决策记录：`docs`。
- `.next`、`out`、`node_modules`、日志和临时截图是生成物，不得提交。

## 根命令

在仓库根目录运行：

```bash
npm run dev
npm run lint
npm run build
npm test
```

根脚本通过 npm workspaces 把命令转发到 `@david/web`，不要求进入子目录。
