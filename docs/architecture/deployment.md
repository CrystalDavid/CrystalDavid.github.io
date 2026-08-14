# 构建与部署

## 输出方式

- Next.js 配置：`apps/web/next.config.ts`。
- 输出模式：`output: "export"`。
- 静态产物：`apps/web/out`。
- 图片：`images.unoptimized: true`，适配 GitHub Pages 静态托管。
- 路由：`trailingSlash: true`，文章路径可直接静态访问。

## GitHub Pages

`.github/workflows/pages.yml` 在 `main` 推送或手动触发时执行：

1. Node 22 + `npm ci`。
2. 根目录 `npm run build`。
3. 上传 `apps/web/out`。
4. 部署到 GitHub Pages。

站点使用用户主页域名 `https://crystaldavid.github.io/`，因此当前不设置 `basePath`。如果未来改为项目子路径，必须同时核对字体、图片、文章链接和锚点。

## 发布前检查

```bash
npm ci
npm run lint
npm test
```

不得提交 `.next`、`out`、日志、临时性能采样或本地截图。静态产物只由 CI 生成。
