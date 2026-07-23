import { pptAgentReport } from "./ppt-agent-report";

export type ArticleText = {
  zh: string;
  en: string;
};

export type ArticleBlock =
  | ({ type: "paragraph" } & ArticleText)
  | ({ type: "subheading" } & ArticleText)
  | { type: "list"; ordered?: boolean; items: ArticleText[] }
  | { type: "code"; language: string; code: string };

export type ArticleSection = {
  headingZh: string;
  headingEn: string;
  blocks: ArticleBlock[];
};

export type Article = {
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  sourceLabelZh: string;
  sourceLabelEn: string;
  sourceHref: string;
  coverImage: string;
  coverAltZh: string;
  coverAltEn: string;
  sections: ArticleSection[];
};

const pair = (zh: string, en: string): ArticleText => ({ zh, en });

const legacyArticles: Article[] = [
  {
    slug: "ppt-agent-report",
    titleZh: "PPT-Agent 报告",
    titleEn: "PPT-Agent Report",
    summaryZh:
      "内容驱动而非模板驱动：从需求澄清、资料调研到大纲、策划、渲染和导出，每个阶段都有可审核的交付物。",
    summaryEn:
      "Content-driven rather than template-driven: every stage from discovery and research to outlining, planning, rendering and export produces a reviewable deliverable.",
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
              "传统 PPT 生成工具经常从主题直接跳到成品页面，用固定模板填充内容，既缺少中间审核环节，也容易产生空洞、缺乏逻辑的结果。",
              "Conventional PPT generators often jump from a topic straight to finished slides and fill a fixed template. They provide no meaningful review point and tend to produce hollow, weakly structured content.",
            ),
          },
          {
            type: "list",
            items: [
              pair("分阶段渐进式生成", "Generate progressively in explicit stages"),
              pair("每个阶段都有明确的交付物", "Produce a concrete deliverable at every stage"),
              pair("用户可以在关键节点介入审核", "Let the user review the work at key checkpoints"),
              pair("由内容决定布局，而不是让模板决定内容", "Let content determine layout instead of forcing content into a template"),
            ],
          },
          {
            type: "subheading",
            ...pair("模拟专业团队的工作流", "A workflow modeled on a professional presentation team"),
          },
          {
            type: "paragraph",
            ...pair(
              "完整流程是：需求澄清 → 资料调研 → 大纲规划 → 策划稿 → 设计稿 → 复核。",
              "The complete flow is: requirements clarification → research → outline planning → planning draft → design draft → review.",
            ),
          },
        ],
      },
      {
        headingZh: "Stage 1：访谈阶段",
        headingEn: "Stage 1: Interview",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "目标是通过多轮对话深度理解用户需求，并生成可供后续阶段直接使用的调研底稿。",
              "The goal is to understand the user through a multi-turn conversation and produce a research brief that later stages can consume directly.",
            ),
          },
          {
            type: "list",
            ordered: true,
            items: [
              pair("Step 1.0：广度搜索", "Step 1.0: Broad search"),
              pair("Step 1.1：第一轮追问，锁定场景与受众", "Step 1.1: First follow-up to identify the setting and audience"),
              pair("Step 1.2：深度搜索", "Step 1.2: Deep search"),
              pair("Step 1.3：第二轮追问，挖掘核心亮点", "Step 1.3: Second follow-up to identify the core differentiators"),
              pair("Step 1.4：第三轮追问，框定边界与约束", "Step 1.4: Third follow-up to define constraints"),
              pair("Step 1.5：生成调研底稿", "Step 1.5: Generate the research brief"),
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
            ...pair("追问 Prompt 的原则", "Principles for follow-up prompts"),
          },
          {
            type: "list",
            items: [
              pair("语气自然亲切，像真人对话，不使用列表式提问", "Use a natural conversational tone instead of interrogating with a form"),
              pair("先简短回应用户的主题，再提出有引导性的问题", "Acknowledge the topic briefly before asking a guided question"),
              pair("给出 2–3 个具体选项，降低回答负担", "Offer two or three concrete options to reduce effort"),
              pair("一次只问一个核心问题，可附带一个小的补充问题", "Ask one core question at a time, with at most one small follow-up"),
              pair("基于调研结果给出具体到“比如……”的亮点方向", "Turn research into concrete directions illustrated with examples"),
              pair("最后确认汇报时长、页数、现有素材和必须包含或避免的内容", "Finally confirm duration, slide count, available material and required or prohibited content"),
            ],
          },
          {
            type: "subheading",
            ...pair("深度搜索的结构化输出", "Structured output from deep search"),
          },
          {
            type: "code",
            language: "json",
            code: `{
  "required_sections": [
    { "name": "板块名", "key_content": ["内容1"], "importance": "high/medium" }
  ],
  "key_metrics": ["指标1", "指标2"],
  "best_practices": ["做法1", "做法2"],
  "common_pitfalls": ["坑1", "坑2"]
}`,
          },
          {
            type: "subheading",
            ...pair("调研底稿", "Research brief"),
          },
          {
            type: "code",
            language: "json",
            code: `{
  "research_brief": {
    "topic_summary": "主题一句话概括",
    "audience": "受众描述",
    "purpose": "演示目的",
    "scene": "具体场景",
    "time_limit": "时间限制",
    "page_count": "页数建议",
    "core_highlights": ["亮点1", "亮点2"],
    "key_facts": ["事实1", "事实2"],
    "recommended_sections": [
      { "title": "章节标题", "goal": "说明什么", "priority": "high/medium/low" }
    ],
    "available_materials": "用户手头素材描述",
    "risks_and_gaps": ["风险或缺口1"],
    "style_suggestion": "建议的表达风格"
  }
}`,
          },
          {
            type: "paragraph",
            ...pair(
              "这一阶段的独到之处，是用“搜索 → 追问 → 再搜索 → 再追问”的循环不断摸清用户意图；信息从宽到窄、从模糊到具体，并始终以 JSON 保存中间结果。",
              "The distinctive idea is the search → question → search → question loop. It progressively narrows ambiguity and stores every intermediate result as reusable JSON.",
            ),
          },
        ],
      },
      {
        headingZh: "Stage 2：大纲阶段",
        headingEn: "Stage 2: Outline",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "目标是基于调研底稿生成层次清晰的 PPT 大纲，并在大纲阶段就明确每页的结论、作用和推荐表达形式。",
              "The goal is to turn the research brief into a clear presentation outline while defining each slide’s conclusion, role and recommended visual form early.",
            ),
          },
          {
            type: "list",
            ordered: true,
            items: [
              pair("结论先行：每个部分先给出核心观点", "Lead with the conclusion in every section"),
              pair("以上统下：上层观点总结下层内容", "Make upper-level claims summarize the details below"),
              pair("归类分组：同层内容属于同一逻辑范畴", "Group peer items within one logical category"),
              pair("逻辑递进：按时间、重要性、因果或并列关系组织", "Use time, priority, causality or parallel structure to establish progression"),
            ],
          },
          {
            type: "code",
            language: "json",
            code: `{
  "ppt_outline": {
    "cover": { "title": "主标题", "sub_title": "副标题" },
    "table_of_contents": { "title": "目录", "sections": ["第一部分标题"] },
    "parts": [{
      "part_title": "章节标题",
      "part_goal": "这一部分要说明什么",
      "pages": [{
        "page_number": 1,
        "title": "页面标题",
        "goal": "这一页的结论或作用",
        "key_points": ["要点1", "要点2"],
        "suggested_visual": "建议的视觉表达形式"
      }]
    }],
    "end_page": { "title": "总结与展望", "key_takeaways": ["核心结论1"] },
    "total_pages": 8,
    "narrative_flow": "整体叙事逻辑一句话概括"
  }
}`,
          },
          {
            type: "paragraph",
            ...pair(
              "金字塔原理被具体写进 Prompt；每页的 goal 明确页面目的，suggested_visual 提前考虑表达方式，并通过 refineOutline 接口让用户按反馈继续调整。",
              "The pyramid principle is encoded directly in the prompt. Each slide goal makes its purpose explicit, suggested_visual introduces visual thinking early, and refineOutline keeps revision available.",
            ),
          },
        ],
      },
      {
        headingZh: "Stage 3：策划稿阶段",
        headingEn: "Stage 3: Planning draft",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "策划稿填补大纲与设计稿之间的空白。它不急着排版，而是先明确每页的信息层级、表达方式、证据建议和设计注意事项。",
              "The planning draft fills the gap between outline and design. Before layout, it defines information hierarchy, visual expression, evidence suggestions and design constraints for every slide.",
            ),
          },
          {
            type: "code",
            language: "json",
            code: `{
  "page_number": 1,
  "title": "页面标题",
  "goal": "这页最想让观众记住什么",
  "core_messages": ["核心信息1", "核心信息2", "核心信息3"],
  "evidence_suggestions": ["数据来源1", "数据来源2"],
  "visual_type": "推荐表达方式",
  "layout_direction": "信息层级与布局方向描述",
  "keywords": ["关键词1", "关键词2"],
  "design_notes": "设计注意事项"
}`,
          },
          {
            type: "list",
            items: [
              pair("根据内容特点选择表达方式，不套用固定模板", "Choose visual forms from content rather than a fixed template"),
              pair("明确主要信息与次要信息", "Distinguish primary from secondary information"),
              pair("让下一阶段的 AI 可以直接依据策划卡执行", "Give the next AI stage an executable planning card"),
              pair("支持单页调整，而不是每次推翻整套内容", "Allow per-slide revision instead of restarting the whole deck"),
            ],
          },
        ],
      },
      {
        headingZh: "Stage 4–5：渲染与导出",
        headingEn: "Stages 4–5: Render and export",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "渲染阶段把策划卡转化为 1280×720px 的 HTML 演示页面；导出阶段再将页面交付为 PDF 或 HTML。",
              "Rendering turns each planning card into a 1280×720 HTML slide, and export delivers the result as PDF or HTML.",
            ),
          },
          {
            type: "code",
            language: "html",
            code: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1280px; height: 720px; overflow: hidden; }
.slide { width: 1280px; height: 720px; padding: 48px 56px; }
</style>
</head>
<body>
  <div class="slide"><!-- 内容放这里 --></div>
</body>
</html>`,
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
              pair("分阶段工作流：渐进式构建，每个阶段都有交付物和审核点", "A staged workflow with a deliverable and review point at every step"),
              pair("策划稿中间层：补足大纲到设计稿之间的信息层级与表达方式", "A planning layer that bridges outline, hierarchy and visual expression"),
              pair("搜索—追问循环：先建立直觉，再针对性追问，降低用户负担", "A search-and-question loop that builds context before asking focused questions"),
              pair("专用 Prompt：各阶段拥有明确的输入与 JSON 输出", "Dedicated prompts with explicit inputs and JSON outputs"),
              pair("Temperature 分层：搜索 0.4–0.5、对话 0.7–0.8、生成 0.6", "Stage-specific temperature: 0.4–0.5 for search, 0.7–0.8 for dialogue and 0.6 for generation"),
              pair("渐进式披露：只展示当前阶段需要的操作", "Progressive disclosure that exposes only the controls needed now"),
              pair("可视化、可回退的进度：阶段完成后有明确反馈，并允许返回修改", "Visible, reversible progress with clear feedback after each stage"),
              pair("多层次修改：支持整体、单页和局部修改", "Revision at deck, slide and local levels"),
            ],
          },
        ],
      },
      {
        headingZh: "改进方向",
        headingEn: "Areas for improvement",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              pair("最终输出的可编辑性仍然不足，用户缺少后期修改空间", "Final output needs substantially better editability"),
              pair("尚不支持用户上传图片等不同格式的文件", "The system does not yet support user-supplied images and other file types"),
              pair("需要根据用户身份、偏好和风格自动调整生成策略", "Generation should adapt to user identity, preferences and style"),
              pair("可通过多组 Prompt 与门控策略匹配不同人群", "Multiple prompt sets and a gating strategy could serve distinct user groups"),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "openclaw-evidence-tracker",
    titleZh: "科研证据链插件：当前实现与版本演进",
    titleEn: "Research Evidence Tracker: Implementation and Evolution",
    summaryZh:
      "为 OpenClaw 科研 Agent 增加可检查、可追踪、可复现的全文证据审计能力，并透明保留失败与阻塞。",
    summaryEn:
      "A full-text evidence audit layer for OpenClaw research agents that remains inspectable, traceable and reproducible while preserving failures and blockers.",
    sourceLabelZh: "GitHub：CrystalDavid/OpenClaw-Evidence-Tracker.git",
    sourceLabelEn: "GitHub: CrystalDavid/OpenClaw-Evidence-Tracker.git",
    sourceHref: "https://github.com/CrystalDavid/OpenClaw-Evidence-Tracker.git",
    coverImage: "/media/evidence-tracker-report.png",
    coverAltZh: "科研证据链插件能力演进对比图",
    coverAltEn: "Research evidence tracker capability evolution comparison",
    sections: [
      {
        headingZh: "项目目标与职责边界",
        headingEn: "Goals and responsibility boundaries",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "项目的目标不是让 Agent 写出“看起来专业”的报告，而是让每一条科研结论都能够被检查、追踪和复现。",
              "The project is not designed merely to make an agent produce a professional-looking report. Its purpose is to make every research claim inspectable, traceable and reproducible.",
            ),
          },
          {
            type: "list",
            ordered: true,
            items: [
              pair("区分 Agent 推理与真实材料中的直接证据", "Separate agent reasoning from direct evidence in source material"),
              pair("验证引用论文是否真实存在、身份是否正确", "Verify that cited papers exist and have the correct identity"),
              pair("打开上传 PDF 和外部论文全文，检查 Claim 是否被原文支持", "Open uploaded and external PDFs and test claims against the full text"),
              pair("为每条 Claim 提供来源、页码、证据片段、支持度和理由", "Attach source, page, passage, support level and reasoning to every claim"),
              pair("保留错误、证据不足与下载阻塞，不允许为了美化报告而替换失败证据", "Preserve errors, weak evidence and download blockers instead of laundering failures"),
            ],
          },
          {
            type: "paragraph",
            ...pair(
              "OpenClaw / DeepSeek Agent 负责阅读源论文、检索候选文献、提出三个研究 Idea 并拆分 Claim；evidence-tracker 插件负责论文身份管理、真实全文下载、证据定位、独立判定与报告生成。搜索结果、摘要和 Agent 写入的 Context 只能作为线索，不能直接成为 GREEN 证据。",
              "The OpenClaw / DeepSeek agent reads the source paper, discovers candidates, proposes three ideas and decomposes claims. The evidence tracker owns paper identity, full-text retrieval, passage location, independent judgment and reporting. Search results, abstracts and agent-written context are clues only; they cannot become GREEN evidence by themselves.",
            ),
          },
        ],
      },
      {
        headingZh: "系统架构与六个工具",
        headingEn: "Architecture and six tools",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "用户通过 QQBot 上传 PDF，并用简单提示词启动任务。Agent 定位原始上传文件、启动 evidence session、阅读研究目标与局限、检索外部英文论文、生成三个新 Idea、拆成原子 Claim，再逐条调用插件。",
              "A user uploads a PDF through QQBot and starts the task with a simple request. The agent locates the original upload, starts an evidence session, reads goals and limitations, searches external English papers, creates three new ideas, decomposes them into atomic claims and calls the plugin claim by claim.",
            ),
          },
          {
            type: "list",
            ordered: true,
            items: [
              pair("start_evidence_tracking：启动会话并解析源 PDF", "start_evidence_tracking: start a session and parse the source PDF"),
              pair("search_literature：发现外部学术文献", "search_literature: discover external academic literature"),
              pair("record_citation：记录原子 Claim 与来源类型", "record_citation: record an atomic claim and source type"),
              pair("verify_evidence_chain：核验真实全文证据", "verify_evidence_chain: verify evidence against real full text"),
              pair("generate_evidence_report：生成透明审计报告", "generate_evidence_report: generate a transparent audit report"),
              pair("get_session_status：检查会话状态", "get_session_status: inspect session status"),
            ],
          },
          {
            type: "paragraph",
            ...pair(
              "发现阶段优先使用 evidence-tracker、paper-search、scientify 的 arXiv / OpenAlex 等专业学术检索能力。发现器只负责扩大候选覆盖率，最终判定必须由 evidence-tracker 独立完成。",
              "Discovery favors dedicated academic tools such as evidence-tracker, paper-search and scientify’s arXiv / OpenAlex capabilities. Discoverers increase candidate coverage; the tracker still makes the final independent judgment.",
            ),
          },
        ],
      },
      {
        headingZh: "一次完整任务的十个步骤",
        headingEn: "Ten steps in a complete task",
        blocks: [
          {
            type: "subheading",
            ...pair("1. 启动证据链会话", "1. Start the evidence session"),
          },
          {
            type: "paragraph",
            ...pair(
              "start_evidence_tracking 必须接收 source_paper、source_pdf_path 和 idea_title。插件立即逐页解析上传 PDF；解析成功后才能继续。新 session 会关闭上一个活动会话、清理上次全文缓存，并重新执行外部检索，避免证据串线。",
              "start_evidence_tracking requires source_paper, source_pdf_path and idea_title. The plugin immediately parses the uploaded PDF page by page. A new session closes the previous one, clears full-text caches and repeats external searches to prevent evidence leakage across tasks.",
            ),
          },
          {
            type: "subheading",
            ...pair("2. 发现外部文献", "2. Discover external literature"),
          },
          {
            type: "paragraph",
            ...pair(
              "search_literature 并行查询 arXiv、PubMed、Europe PMC、OpenAlex、Crossref、Semantic Scholar 和 DBLP。查询无结果、API 超时或限流都不等价于“论文不存在”。",
              "search_literature queries arXiv, PubMed, Europe PMC, OpenAlex, Crossref, Semantic Scholar and DBLP in parallel. No result, timeout or rate limit is not proof that a paper does not exist.",
            ),
          },
          {
            type: "subheading",
            ...pair("3. 注册、去重与身份隔离", "3. Register, deduplicate and isolate identities"),
          },
          {
            type: "paragraph",
            ...pair(
              "统一注册表保存标题、作者、年份、期刊或会议、DOI、arXiv ID、PMID / PMCID、数据库命中、候选 PDF、下载记录、全文 SHA256 和身份冲突。canonical_id 优先使用 DOI、arXiv ID、PMID、PMCID，最后才回退到规范化标题哈希。强标识符冲突时禁止合并。",
              "A unified registry stores titles, authors, year, venue, DOI, arXiv ID, PMID / PMCID, database hits, candidate PDFs, download attempts, full-text SHA256 and identity conflicts. canonical_id prefers DOI, arXiv ID, PMID and PMCID before falling back to a normalized-title hash. Conflicting strong identifiers are never merged.",
            ),
          },
          {
            type: "subheading",
            ...pair("4. 生成 Idea 并拆分 Claim", "4. Generate ideas and decompose claims"),
          },
          {
            type: "paragraph",
            ...pair(
              "Idea 可以来自源论文的 limitation、future work、失败案例、未覆盖场景、性能瓶颈、baseline、外部新方法、跨领域迁移或 Agent 的合理推理。但 Idea 本身不是证据；一条 Claim 只能表达一个结论并对应一篇论文，组合 Claim 会被拆分。",
              "Ideas may come from limitations, future work, failures, uncovered settings, bottlenecks, baselines, external methods, cross-domain transfer or reasonable agent inference. An idea is not evidence. Each claim must express one conclusion about one paper; compound claims are split.",
            ),
          },
          {
            type: "subheading",
            ...pair("5. 记录 Claim 与来源类型", "5. Record claims and source types"),
          },
          {
            type: "paragraph",
            ...pair(
              "record_citation 强制指定 uploaded_pdf 或 external_literature，并记录 cited_source、source_url、context、page_hint 和 section_hint。Context 只是检索提示。若 uploaded_pdf Claim 实际引用外部论文，插件会纠正来源类型并重新下载。replace_citation_id 只能修正同一 Claim、同一论文的元数据，不能换 Claim、换论文或洗白失败状态。",
              "record_citation requires uploaded_pdf or external_literature plus cited_source, source_url, context, page_hint and section_hint. Context is only a retrieval hint. If an uploaded_pdf claim actually cites another paper, the plugin corrects the source type and downloads it. replace_citation_id may fix metadata for the same claim and paper but cannot swap claims, papers or failed outcomes.",
            ),
          },
          {
            type: "subheading",
            ...pair("6. 核验上传 PDF", "6. Verify the uploaded PDF"),
          },
          {
            type: "paragraph",
            ...pair(
              "插件只使用 session 启动时真实解析的 PDF，不相信 Agent 提供的引句、页码或 Context。它在整篇文档中检索最相关片段，再交给 LLM 做语义蕴含判断，最终输出真实页码、证据片段、召回方式、支持度与理由。",
              "The plugin uses only the PDF actually parsed when the session started. It does not trust agent-supplied quotes, pages or context. It searches the whole document, sends top passages to an LLM for entailment judgment and returns real pages, passages, retrieval method, support and reasoning.",
            ),
          },
          {
            type: "subheading",
            ...pair("7. 核验外部论文", "7. Verify external papers"),
          },
          {
            type: "paragraph",
            ...pair(
              "插件先通过 DOI、arXiv、标题和作者年份多源确认论文身份，再尝试 citation URL、arXiv、OpenAlex、Semantic Scholar、Unpaywall、Crossref、Europe PMC / PMC、DataCite、HAL、bioRxiv / medRxiv、OpenReview、ACL Anthology、PMLR、CVF、NeurIPS 等合法全文路径。下载后强制检查首页标题、DOI 与 arXiv ID；错误 PDF 会被删除并标记 IDENTITY_CONFLICT。",
              "The tracker first confirms identity from DOI, arXiv, title and author-year signals. It then tries legal full-text paths including citation URLs, arXiv, OpenAlex, Semantic Scholar, Unpaywall, Crossref, Europe PMC / PMC, DataCite, HAL, bioRxiv / medRxiv, OpenReview, ACL Anthology, PMLR, CVF and NeurIPS. Every download must pass first-page title, DOI and arXiv checks; wrong PDFs are deleted and marked IDENTITY_CONFLICT.",
            ),
          },
          {
            type: "subheading",
            ...pair("8. 混合全文检索与语义判断", "8. Hybrid full-text retrieval and semantic judgment"),
          },
          {
            type: "paragraph",
            ...pair(
              "逐页文本被切成有重叠的块，再通过 BM25、轻量哈希向量、数值匹配、页码 / 章节提示和 LLM 查询扩展进行多路召回。融合后的片段被判为 ENTAILMENT、PARTIAL、CONTRADICTION 或 NOT_FOUND。这里的向量召回是轻量哈希向量，不是外部 Embedding 模型。",
              "Page text is split into overlapping chunks and retrieved through BM25, lightweight hash vectors, numeric matching, page / section hints and LLM query expansion. Fused candidates are judged as ENTAILMENT, PARTIAL, CONTRADICTION or NOT_FOUND. The vector path uses lightweight hashing, not an external embedding model.",
            ),
          },
          {
            type: "subheading",
            ...pair("9. 确定性规则复核", "9. Deterministic rule review"),
          },
          {
            type: "paragraph",
            ...pair(
              "LLM 判断之后还会执行通用规则：强证明或强性能语言如果没有同等强度的原文表述，GREEN 降为 YELLOW；Claim 中的精确数值没有出现在全文证据中时同样降级；未经实验验证的新 Idea 不能仅凭类比判绿。小数、百分比和千位分隔数值会作为完整 token 标准化比较，例如 24.06% 不会再被截断为 06%。",
              "After the LLM judgment, deterministic rules downgrade unsupported proof or performance language, missing exact numbers and untested new ideas. Decimal, percentage and thousands-separated values are normalized as complete tokens, so 24.06% is no longer truncated to 06%.",
            ),
          },
          {
            type: "subheading",
            ...pair("10. 输出可审计状态", "10. Emit auditable states"),
          },
          {
            type: "paragraph",
            ...pair(
              "最终报告同时保留成功、失败与工程阻塞，确保任何读者都能复查实际证据，而不是只看到被美化的结论。",
              "The final report preserves successes, scientific failures and engineering blockers so readers can inspect the actual evidence instead of a polished subset.",
            ),
          },
        ],
      },
      {
        headingZh: "GREEN / YELLOW / RED / BLOCKED",
        headingEn: "GREEN / YELLOW / RED / BLOCKED",
        blocks: [
          {
            type: "list",
            items: [
              pair("GREEN：实际 PDF 直接陈述或实验展示精确 Claim，且结论强度没有超过证据", "GREEN: the real PDF directly states or demonstrates the exact claim without overstatement"),
              pair("YELLOW：全文只支持更弱结论、部分关系、方法类比、迁移依据或合理推断", "YELLOW: the full text supports only a weaker conclusion, partial relation, analogy, transfer rationale or inference"),
              pair("RED：全文不支持、与 Claim 矛盾、引用错误、严重夸大，或论文身份错误 / 不存在", "RED: the full text does not support the claim, contradicts it, is wrongly cited, overstated or has a false identity"),
              pair("BLOCKED：所有配置的下载与重试路径耗尽后仍无法获得可审核全文；它是工程状态，不伪装成科学判断", "BLOCKED: all configured retrieval paths are exhausted without auditable full text; this is an engineering state, not a scientific verdict"),
            ],
          },
          {
            type: "paragraph",
            ...pair(
              "报告默认生成结构化 Markdown，包含研究 Idea、Claim、Citation、来源类型、实际页码、证据片段、召回方式、支持度、状态与判定理由。RED 与 BLOCKED 必须原样保留。",
              "The report is structured Markdown containing ideas, claims, citations, source types, actual pages, passages, retrieval methods, support, states and reasons. RED and BLOCKED entries must remain unchanged.",
            ),
          },
        ],
      },
      {
        headingZh: "当前限制",
        headingEn: "Current limitations",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              pair("混合检索仍以 BM25 和轻量哈希向量为主，尚未接入高质量科学语义 Embedding", "Hybrid retrieval still relies on BM25 and lightweight hash vectors rather than scientific semantic embeddings"),
              pair("扫描版 PDF、复杂双栏、公式和表格可能降低抽取质量", "Scanned PDFs, complex columns, formulas and tables may reduce extraction quality"),
              pair("开放获取路径受站点策略、限流和网络波动影响，真实论文仍可能进入 BLOCKED", "Open-access retrieval is affected by site policy, rate limits and network conditions, so real papers may remain BLOCKED"),
              pair("LLM 蕴含判断仍可能误判，因此报告必须保留实际片段、页码和支持度供人工复核", "LLM entailment can still be wrong, so reports must retain passages, pages and support for human review"),
              pair("官方技术页面、代码仓库和数据集需要独立的可信来源类型与审计规则", "Official technical pages, code repositories and datasets need their own trusted-source types and audit rules"),
            ],
          },
        ],
      },
      {
        headingZh: "四次重大版本演进",
        headingEn: "Four major version changes",
        blocks: [
          {
            type: "subheading",
            ...pair("v1：元数据验证原型", "v1: Metadata-validation prototype"),
          },
          {
            type: "paragraph",
            ...pair(
              "v1 注册五个工具，主要通过 DOI、arXiv 与标题确认论文存在，并依据摘要和 LLM 判断 Claim。它不会真正打开上传 PDF，也没有稳定的外部全文核验、明确 source_type、统一注册表或身份冲突处理，因此还不是严格的全文审计系统。",
              "v1 registered five tools and verified paper existence mainly from DOI, arXiv and titles, then judged claims from abstracts and an LLM. It did not open uploaded PDFs, reliably inspect external full text, define source_type or manage a canonical registry and conflicts.",
            ),
          },
          {
            type: "subheading",
            ...pair("v2：打通真实交互与 PDF 交付", "v2: Real interaction and PDF delivery"),
          },
          {
            type: "paragraph",
            ...pair(
              "v2 把插件接入本地 OpenClaw 与 QQBot，修复工具不可见和调用不稳定，增加 Markdown → HTML / PDF、Evidence Table、支持度、错误类型和确定性降级规则。但核心仍依赖元数据、摘要与 Agent Context，PDF 证据并未真正全文审核。",
              "v2 connected the plugin to OpenClaw and QQBot, stabilized tool visibility, added Markdown → HTML / PDF, evidence tables, support values, error types and deterministic downgrades. Verification still relied on metadata, abstracts and agent context rather than real full-text review.",
            ),
          },
          {
            type: "subheading",
            ...pair("v3：多源检索、Markdown 报告和质量门槛", "v3: Multi-source search, Markdown reports and quality gates"),
          },
          {
            type: "paragraph",
            ...pair(
              "v3 将 search_literature 公开为第六个工具，扩展 Semantic Scholar、OpenAlex、Crossref、Europe PMC、DBLP 和 arXiv fallback，修复 APA / venue / arXiv 标题提取，加入多源身份查找、重试、至少 15 条 Citation 和至少 6 条外部文献的门槛，并改用高质量中文 Markdown。其局限是 PDF 内证据仍受 Agent Context 影响，外部支持关系仍主要基于摘要。",
              "v3 exposed search_literature as a sixth tool, expanded multi-source discovery and arXiv fallback, improved citation parsing, retries and quality gates of at least 15 citations and six external papers, and moved to polished Chinese Markdown. Uploaded evidence still depended too much on context, and external support still leaned on abstracts.",
            ),
          },
          {
            type: "subheading",
            ...pair("v4：真实全文证据审计系统", "v4: A real full-text evidence audit system"),
          },
          {
            type: "list",
            ordered: true,
            items: [
              pair("强制解析真实上传 PDF，不再因 Agent 写入页码或 Context 而判绿", "Parse the real uploaded PDF and stop trusting agent-provided pages or context"),
              pair("多源确认外部论文身份，并下载真实 PDF 逐页核验", "Confirm external identity across sources and verify downloaded PDFs page by page"),
              pair("下载后检查首页标题、DOI 与 arXiv，隔离 IDENTITY_CONFLICT", "Validate first-page title, DOI and arXiv and isolate IDENTITY_CONFLICT"),
              pair("用 canonical ID 统一注册与严格去重", "Unify registration and deduplication with canonical IDs"),
              pair("强制 source_type，自动纠正来源身份", "Require source_type and correct mismatched source identity"),
              pair("拆分原子 Claim，禁止替换 Claim / 论文来洗白失败", "Split atomic claims and prevent failure laundering by replacing claims or papers"),
              pair("融合 BM25、哈希向量、数值匹配、位置提示与查询扩展", "Fuse BM25, hash vectors, numeric matching, location hints and query expansion"),
              pair("把 BLOCKED 独立为透明工程状态", "Treat BLOCKED as a transparent engineering state"),
              pair("治理 session 缓存，重新检索、重新下载并重新校验", "Govern session caches through fresh search, download and identity validation"),
              pair("修复 24.06% 等小数百分比被截断的问题", "Fix truncation of decimal percentages such as 24.06%"),
            ],
          },
          {
            type: "paragraph",
            ...pair(
              "v4 把项目从“多源摘要验证器”升级为“带论文身份管理、真实全文下载、逐页证据定位和透明工程状态的证据审计系统”。",
              "v4 upgrades the project from a multi-source abstract checker into an evidence audit system with paper identity management, real full-text retrieval, page-level passage location and transparent engineering states.",
            ),
          },
        ],
      },
      {
        headingZh: "特别鸣谢",
        headingEn: "Acknowledgements",
        blocks: [
          {
            type: "paragraph",
            ...pair(
              "感谢杨林易老师的精心指导和严厉指正；感谢队友王新宇完成项目从 0 到 0.8 的框架搭建；感谢 Codex 与 Claude Code 对后续实现与迭代的大力支持。",
              "Thanks to Professor Yang Linyi for careful guidance and rigorous feedback, to teammate Wang Xinyu for building the project from 0 to 0.8, and to Codex and Claude Code for supporting later implementation and iteration.",
            ),
          },
        ],
      },
    ],
  },
];

export const articles: Article[] = [pptAgentReport, legacyArticles[1]];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
