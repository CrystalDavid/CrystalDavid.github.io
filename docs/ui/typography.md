# 字体与字号规范

## 字体家族

| 语言/用途 | 字体 | 文件 | 字重 |
| --- | --- | --- | --- |
| 拉丁文字 | Nunito | `apps/web/public/fonts/nunito-latin*.woff2` | 400–800 |
| 中文 | Noto Sans SC | `apps/web/public/fonts/noto-sans-sc-site.woff2` | 400–700，正文实际 500，UI/标题 700 |
| 中文系统回退 | PingFang SC → Microsoft YaHei UI → Microsoft YaHei | 系统字体 | 仅字体失败时 |
| 代码 | Cascadia Code → SFMono-Regular → Consolas | 系统等宽 | 400 |

必须保持 Nunito 在字体栈前、Noto Sans SC 在后，这样英文不会被 CJK 字体替换。全站保持 `font-synthesis: none`。字体自托管、首屏预载，并在显示正文前完成首次解码；不得改回第三方运行时字体 CDN。

## 桌面首页字号

| 元素 | 英文 | 中文 | 字重 |
| --- | --- | --- | --- |
| 品牌 David | 22px | 同英文 | 800 |
| 顶栏导航 | 15px | 17px | 700 |
| Hero `David` | `clamp(74px, 7.9vw, 120px)` | 同英文 | 800 |
| Hero 身份副标题 | Hero 的 0.69em | Hero 的 0.70em | 700 |
| About 标题 | `clamp(52px, 6vw, 82px)` | `clamp(60px, 6.4vw, 96px)` | 700 |
| About 正文 | `clamp(19px, 1.7vw, 23px)` | `clamp(21px, 1.75vw, 25px)` | 500 |
| 章节标题 | `clamp(80px, 7.4vw, 114px)` | `clamp(86px, 7.8vw, 124px)` | 700 |
| 产品标题 | 31px | 34px | 800 / 700 |
| 产品说明 | 25px | 26px | 500 |
| 产品按钮 | 14px，172×60 | 16px，190×64 | 700 |
| Article 标题 | `clamp(64px, 6vw, 92px)` | `clamp(72px, 6.4vw, 100px)` | 700 |
| 文章卡标题 | 20px | 22px | 700 |
| 页脚分组标题 | 17px | 18px | 800 / 700 |
| 页脚链接 | 16px | 17px | 600 |
| 联系邮箱 | `clamp(25px, 2.6vw, 42px)` | 同英文 | 800 |

## 移动首页字号（≤720px）

| 元素 | 英文 | 中文 |
| --- | --- | --- |
| 品牌 | 19px | 19px |
| 顶栏导航 | 10px | 11.5px |
| Hero 主标题 | `clamp(54px, 16.4vw, 76px)` | 同主标尺 |
| Hero 副标题 | 0.55em | 0.60em |
| About 标题 | 50px | 52px |
| About 正文 | 18px | 18px |
| 章节标题 | `clamp(53px, 15vw, 72px)` | `clamp(56px, 15.5vw, 76px)` |
| 产品标题/说明 | 26px / 19px | 27px / 19px |
| 产品按钮 | 默认移动尺寸 | 15px，182×58 |
| Article 标题 | 48px | 52px |
| 页脚分组标题/链接 | 13px / 14px | 15px / 15px |

## 中文排版不变量

- 中文正文不能为了容纳内容被整体缩小，优先调整容器宽度、间距或换行。
- 中文正文行高约 1.72–1.92，字距约 0.025em–0.03em。
- 中文大标题字距约 0.035em–0.055em，保证笔画分离和视觉份量。
- 字号或字重改变后必须同时检查 About、产品按钮、文章卡片和页脚，而不是只看 Hero。
