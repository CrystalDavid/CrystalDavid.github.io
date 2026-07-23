import type { Article, ArticleText } from "./data";

const pair = (zh: string, en: string): ArticleText => ({ zh, en });

export const pptAgentReport: Article = {
  slug: "ppt-agent-report",
  titleZh: "PPT-Agent 报告",
  titleEn: "PPT-Agent Report",
  summaryZh:
    "以内容驱动的六阶段工作流，把需求澄清、调研、大纲、策划稿和 SVG 设计稿逐步转化为可继续编辑的 PPTX。",
  summaryEn:
    "A content-driven six-stage workflow that turns discovery, research, outlining, planning and SVG design into an editable PPTX.",
  sourceLabelZh: "GitHub：CrystalDavid/PPT-Agent.git",
  sourceLabelEn: "GitHub: CrystalDavid/PPT-Agent.git",
  sourceHref: "https://github.com/CrystalDavid/PPT-Agent.git",
  coverImage: "/media/ppt-agent-report.png",
  coverAltZh: "PPT-Agent 页面渲染与 AI 输出日志界面",
  coverAltEn: "PPT-Agent page rendering and AI output log interface",
  sections: [
    {
      headingZh: "核心设计理念",
      headingEn: "Core design philosophy",
      blocks: [
        {
          type: "subheading",
          ...pair("内容驱动，而非模板驱动", "Content-driven, not template-driven"),
        },
        {
          type: "paragraph",
          ...pair(
            "传统 PPT 生成工具经常从主题直接跳到成品页面，用固定模板填充内容，缺少中间审核环节；结果容易空洞、缺乏逻辑，而且最终页面通常只能作为图片或 PDF 使用，后期修改困难。",
            "Conventional PPT generators often jump straight from a topic to finished slides, fill fixed templates and omit meaningful review stages. The result can be hollow, weakly structured and difficult to edit beyond a static image or PDF.",
          ),
        },
        {
          type: "list",
          items: [
            pair("分阶段渐进式生成", "Generate progressively in explicit stages"),
            pair("每个阶段都有明确交付物", "Produce a concrete deliverable at every stage"),
            pair("用户可以在关键节点介入审核", "Let the user review every important decision"),
            pair("由内容决定布局，而不是由模板决定内容", "Let content determine layout rather than the reverse"),
            pair("使用 SVG 作为设计稿中间格式", "Use SVG as the intermediate design representation"),
            pair("把 SVG 转换为 PowerPoint 原生对象，导出可编辑 PPTX", "Convert SVG into native PowerPoint objects and export an editable PPTX"),
          ],
        },
        {
          type: "subheading",
          ...pair("模拟专业团队的工作流", "A workflow modelled on a professional team"),
        },
        {
          type: "paragraph",
          ...pair(
            "完整工作流是：需求澄清 → 资料调研 → 大纲规划 → 策划稿 → SVG 设计稿 → 可编辑 PPTX → 复核。",
            "The complete workflow is: requirements → research → outline → planning draft → SVG design → editable PPTX → review.",
          ),
        },
      ],
    },
    {
      headingZh: "六大核心阶段",
      headingEn: "The six core stages",
      blocks: [
        {
          type: "subheading",
          ...pair("Stage 1：访谈阶段", "Stage 1: Interview"),
        },
        {
          type: "paragraph",
          ...pair(
            "目标是通过多轮对话深度理解用户需求，并生成后续阶段可以直接使用的调研底稿。",
            "The goal is to understand the user through multiple rounds of conversation and produce a research brief that later stages can use directly.",
          ),
        },
        {
          type: "list",
          ordered: true,
          items: [
            pair("Step 1.0：广度搜索", "Step 1.0: Broad search"),
            pair("Step 1.1：第一轮追问，锁定场景与受众", "Step 1.1: First follow-up to identify the setting and audience"),
            pair("Step 1.2：深度搜索", "Step 1.2: Deep search"),
            pair("Step 1.3：第二轮追问，挖掘核心亮点", "Step 1.3: Second follow-up to uncover the strongest angle"),
            pair("Step 1.4：第三轮追问，框定边界与约束", "Step 1.4: Third follow-up to define boundaries and constraints"),
            pair("Step 1.5：生成调研底稿", "Step 1.5: Produce the research brief"),
          ],
        },
        {
          type: "subheading",
          ...pair("广度搜索的结构化输出", "Structured output from broad search"),
        },
        {
          type: "code",
          language: "json",
          code: `{
  "topic_summary": "主题一句话概括",
  "typical_scenes": ["场景1", "场景2"],
  "typical_audiences": ["受众1", "受众2"],
  "common_sections": ["板块1", "板块2"],
  "typical_styles": ["风格1", "风格2"]
}`,
        },
        {
          type: "subheading",
          ...pair("第一轮追问 Prompt", "Prompt for the first follow-up"),
        },
        {
          type: "code",
          language: "text",
          code: `- 语气自然亲切，像真人对话，不要列表式提问
- 先简短回应用户主题，再抛出有引导性的问题
- 问题要具体，给出 2-3 个方向让用户容易回答
- 一次只问一个核心问题`,
        },
        {
          type: "subheading",
          ...pair("深度搜索的结构化输出", "Structured output from deep search"),
        },
        {
          type: "code",
          language: "json",
          code: `{
  "required_sections": [],
  "key_metrics": [],
  "best_practices": [],
  "common_pitfalls": []
}`,
        },
        {
          type: "paragraph",
          ...pair(
            "第二轮追问根据深度调研结果给出具体亮点方向，帮助用户把模糊想法变成明确意图；第三轮继续确认时长、页数、已有素材、必须包含或避免的内容、视觉偏好和特殊要求。",
            "The second follow-up turns research into concrete directions that help the user clarify a vague idea. The third confirms duration, page count, available assets, required or forbidden content, visual preferences and special constraints.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "访谈阶段采用“搜索 → 追问 → 再搜索 → 再追问”的循环，从宽到窄逐步收集信息，并以结构化数据保存中间结果，为用户减轻表达负担。",
            "The interview follows a search → question → deeper search → question loop. It narrows the problem progressively, stores intermediate results as structured data and reduces the user’s effort.",
          ),
        },
        {
          type: "subheading",
          ...pair("Stage 2：调研底稿阶段", "Stage 2: Research brief"),
        },
        {
          type: "paragraph",
          ...pair(
            "这一阶段把访谈结果整理成后续生成可直接使用的调研底稿（research_brief）。用户既可以修改整体底稿，也可以只修改其中一个部分。",
            "This stage turns the interview into a directly reusable research_brief. The user can revise the whole brief or change only one part.",
          ),
        },
        {
          type: "list",
          items: [
            pair("主题概括、目标受众、演示目的与使用场景", "Topic, audience, purpose and setting"),
            pair("时间与页数要求、核心亮点", "Duration, page count and core highlights"),
            pair("关键事实与证据、推荐章节", "Key facts, evidence and recommended sections"),
            pair("已有素材、风险与信息缺口、建议表达风格", "Available assets, risks, information gaps and recommended style"),
          ],
        },
        {
          type: "subheading",
          ...pair("Stage 3：大纲阶段", "Stage 3: Outline"),
        },
        {
          type: "paragraph",
          ...pair(
            "大纲基于调研底稿生成，并把金字塔原理直接写进 Prompt：结论先行、以上统下、归类分组、逻辑递进。",
            "The outline is generated from the research brief with four pyramid-principle rules embedded in the prompt: lead with conclusions, support higher-level ideas, group peers and maintain a clear progression.",
          ),
        },
        {
          type: "list",
          items: [
            pair("每页明确页面标题和页面目标", "Define a title and goal for every slide"),
            pair("列出核心要点", "List the core points"),
            pair("提前建议视觉表达形式", "Recommend a visual treatment in advance"),
            pair("支持整体修改，也支持针对单页调整", "Support both full-outline and single-slide revisions"),
          ],
        },
        {
          type: "subheading",
          ...pair("Stage 4：策划稿阶段", "Stage 4: Planning draft"),
        },
        {
          type: "paragraph",
          ...pair(
            "策划稿填补大纲到设计稿之间的信息层。它明确每页最需要观众记住的结论、主次信息、视觉表达、证据建议、布局方向和设计注意事项。",
            "The planning draft fills the gap between an outline and visual design. It defines the key takeaway, information hierarchy, visual treatment, evidence, layout direction and design notes for every slide.",
          ),
        },
        {
          type: "code",
          language: "json",
          code: `{
  "page_number": 1,
  "title": "页面标题",
  "goal": "页面最重要的结论",
  "core_messages": ["核心信息1", "核心信息2"],
  "evidence_suggestions": ["证据建议"],
  "visual_type": "推荐表达方式",
  "layout_direction": "布局方向",
  "keywords": ["关键词"],
  "design_notes": "设计注意事项"
}`,
        },
        {
          type: "subheading",
          ...pair("Stage 5：SVG 设计稿阶段", "Stage 5: SVG design"),
        },
        {
          type: "paragraph",
          ...pair(
            "系统把策划卡转化为 1280×720 的规范化 SVG，并在浏览器中直接预览。当前版本不再让 AI 生成 HTML 页面。",
            "The system turns each planning card into a normalized 1280×720 SVG and previews it directly in the browser. The current version no longer asks the AI to generate HTML slides.",
          ),
        },
        {
          type: "code",
          language: "xml",
          code: `<svg xmlns="http://www.w3.org/2000/svg"
  width="1280"
  height="720"
  viewBox="0 0 1280 720">
</svg>`,
        },
        {
          type: "list",
          items: [
            pair("支持 svg、g、rect、circle、ellipse、line、text、tspan，以及少量 path、polygon、polyline", "Support svg, g, rect, circle, ellipse, line, text, tspan and limited path, polygon and polyline elements"),
            pair("禁用 foreignObject、image、复杂 CSS、class、图标字体、filter、mask、clipPath、script 与 iframe", "Disallow foreignObject, image, complex CSS, classes, icon fonts, filters, masks, clip paths, scripts and iframes"),
            pair("每个文字块使用独立 text 元素，并提供 data-w 与 data-h", "Represent every text block with its own text element and data-w / data-h bounds"),
            pair("默认使用浅色或白色背景，保持信息层级、视觉秩序与左右平衡", "Prefer light backgrounds with clear hierarchy, visual order and balanced composition"),
            pair("所有可见内容位于安全区，组件不能互相遮挡", "Keep all visible content inside the safe area without component overlap"),
          ],
        },
        {
          type: "paragraph",
          ...pair(
            "AI 生成 SVG 后，程序会提取并清理内容，补充字体和文字边界，把越界文本调整回安全区，检查尺寸和禁用元素，并对硬性错误调用 AI 自动修复。不完整的 SVG 会被要求重新生成。",
            "After generation, the program extracts and sanitizes the SVG, supplies fonts and text bounds, returns overflow to the safe area, checks dimensions and forbidden elements, and asks the AI to repair hard failures. Incomplete SVG output is regenerated.",
          ),
        },
        {
          type: "subheading",
          ...pair("Stage 6：导出与项目恢复", "Stage 6: Export and project recovery"),
        },
        {
          type: "paragraph",
          ...pair(
            "当前版本支持导出可编辑 PPTX、PDF、HTML 预览文件和完整会话文件 .pptagent.json。",
            "The current version exports editable PPTX, PDF, HTML previews and complete .pptagent.json session files.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "可编辑 PPTX 使用 SVG → PowerPoint 原生 DrawingML 对象 → PPTX 的转换链路。rect 转换为矩形或圆角矩形，circle / ellipse 转换为椭圆，line 转换为原生线条，path / polygon / polyline 转换为自定义几何，text / tspan 转换为原生文本框。",
            "Editable PPTX export follows SVG → native PowerPoint DrawingML → PPTX. Rectangles, ellipses, lines, paths and text are converted into their corresponding editable PowerPoint objects.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "完整会话会保存访谈消息、调研底稿、大纲、策划稿、已生成的 SVG 页面和当前工作流阶段，用户可以下次导入并继续修改。",
            "A complete session stores interview messages, research brief, outline, planning draft, generated SVG pages and current workflow stage so the project can be restored and edited later.",
          ),
        },
      ],
    },
    {
      headingZh: "第一版与当前版本的区别",
      headingEn: "From the first version to the current version",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            pair("从策划稿直接生成 HTML，改为生成规范化 SVG，再转换为 DrawingML 和可编辑 PPTX", "Replace direct HTML generation with normalized SVG, DrawingML conversion and editable PPTX export"),
            pair("新增可编辑 PPTX 导出", "Add editable PPTX export"),
            pair("浏览器预览和 PowerPoint 导出统一使用同一份 SVG，保证所见即所得", "Use the same SVG for browser preview and PowerPoint export to preserve what-you-see-is-what-you-get"),
            pair("从主要依赖 Prompt，升级为 Prompt 引导、程序规范化、SVG 校验和 AI 自动修复共同保障", "Combine prompt guidance with program normalization, SVG validation and AI repair"),
            pair("优化用户与系统的交互逻辑，让右侧栏及时反馈操作状态", "Improve interaction and provide timely status feedback in the right panel"),
            pair("优化 PPT-Agent 的整体美学设计", "Refine PPT-Agent’s visual design"),
            pair("优化网页前端界面设计", "Refine the web interface"),
            pair("优化输入框输入逻辑", "Improve input behaviour"),
            pair("新增欢迎界面、项目导入与 .pptagent.json 完整会话导出", "Add a welcome screen, project import and complete .pptagent.json session export"),
          ],
        },
      ],
    },
    {
      headingZh: "核心创新点",
      headingEn: "Core innovations",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            pair("分阶段工作流：渐进构建、明确交付物与审核点，并允许随时返回已完成阶段修改", "Staged workflow with progressive construction, explicit deliverables, review points and reversible stages"),
            pair("策划稿中间层：明确每页核心结论、信息层级和视觉表达", "A planning layer that defines each slide’s conclusion, hierarchy and visual treatment"),
            pair("搜索与追问循环：AI 先建立背景，再从宽到窄理解用户真实意图", "A search-and-question loop that narrows from background knowledge to the user’s real intent"),
            pair("SVG 设计中间表示：可以预览、检查、修复并转换为 PowerPoint 原生对象", "SVG as an intermediate representation that can be previewed, checked, repaired and converted to native PowerPoint objects"),
            pair("SVG 转 DrawingML 和可编辑 PPTX：不依赖整页截图，文字和主要图形可以继续编辑", "SVG-to-DrawingML conversion that preserves editable text and shapes instead of flattening each slide"),
            pair("Prompt 与程序校验结合：Prompt 负责方向，程序负责规范化、边界检查与修复", "Prompt guidance combined with deterministic normalization, boundary checks and repair"),
            pair("多层次修改：支持整体修改、单页修改和单页重新生成", "Multi-level revision across the whole deck, a single slide or regeneration"),
            pair("项目会话恢复：保存完整过程并支持导入旧项目继续完善", "Session recovery that preserves the complete workflow for later continuation"),
            pair("可视化 AI 日志：显示生成和修改状态，减少长任务中的不确定感", "Visible AI logs that expose generation and revision status during long-running work"),
          ],
        },
      ],
    },
    {
      headingZh: "当前限制与后续方向",
      headingEn: "Current limitations and next steps",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            pair("为保证可编辑性，SVG 暂不支持复杂 CSS、滤镜、外部图片和部分高级 SVG 功能", "To preserve editability, SVG currently excludes complex CSS, filters, external images and some advanced features"),
            pair("复杂路径转换为 PowerPoint 自定义几何时仍可能出现细节差异", "Complex paths may still differ when converted to PowerPoint custom geometry"),
            pair("当前重叠检测使用文本框边界估算，仍可能误判或漏判", "Overlap detection estimates text bounds and may still produce false positives or misses"),
            pair("尚未支持图片等不同格式的文件导入", "Image and other file-format imports are not yet supported"),
            pair("当前 PPT 风格仍不可调，同一会话中的风格需要保持一致", "Presentation style is not yet adjustable and must remain consistent within a session"),
          ],
        },
      ],
    },
  ],
};
