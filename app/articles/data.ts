export type ArticleSection = {
  headingZh: string;
  headingEn: string;
  bodyZh: string;
  bodyEn: string;
};

export type Article = {
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  metaZh: string;
  metaEn: string;
  sections: ArticleSection[];
};

export const articles: Article[] = [
  {
    slug: "ppt-agent-report",
    titleZh: "PPT-Agent 技术报告",
    titleEn: "PPT-Agent Technical Report",
    summaryZh: "一个由内容驱动、允许逐阶段审阅，并最终交付可编辑演示文稿的智能体工作流。",
    summaryEn: "A content-first agent workflow that supports staged review and delivers editable presentations.",
    metaZh: "智能体 · 演示文稿 · 工作流",
    metaEn: "AGENT · PRESENTATION · WORKFLOW",
    sections: [
      {
        headingZh: "为什么不是套模板",
        headingEn: "Why it is not a template engine",
        bodyZh: "传统生成器常常直接跳到最终页面：结构固定、论证薄弱，也缺少审阅入口。PPT-Agent 先理解内容，再决定每一页应该表达什么，最后才选择布局与视觉形式。",
        bodyEn: "Traditional generators often jump straight to final slides, producing fixed structures, weak reasoning and no review point. PPT-Agent understands the content first, decides what each page must communicate, and only then chooses layout and visual form.",
      },
      {
        headingZh: "逐阶段生成",
        headingEn: "Progressive generation",
        bodyZh: "流程依次经过需求访谈、资料调研、金字塔式大纲、策划稿、设计稿与最终渲染。每个阶段都产生明确的结构化产物，用户可以检查、修改或回退。",
        bodyEn: "The workflow moves through requirements, research, a pyramid-structured outline, planning, design and final rendering. Every stage produces an explicit structured artifact that can be reviewed, edited or rolled back.",
      },
      {
        headingZh: "搜索与追问形成闭环",
        headingEn: "A search-and-question loop",
        bodyZh: "访谈不是一次性表单。智能体会根据回答继续提出问题，并通过宽搜与深搜补足事实、案例和引用，最后把上下文整理为研究简报 JSON。",
        bodyEn: "The interview is not a one-shot form. The agent asks follow-up questions, combines broad and deep search to fill factual gaps, and consolidates the context into a research-brief JSON artifact.",
      },
      {
        headingZh: "策划稿是关键中间层",
        headingEn: "The planning draft is the key layer",
        bodyZh: "策划稿把内容结构翻译为信息层级、视觉形式、来源和设计说明。它把推理与排版解耦，让设计不再依赖固定模板，也让后续修改更加可控。",
        bodyEn: "The planning draft translates content structure into information hierarchy, visual form, sources and design notes. It decouples reasoning from layout, removes dependence on fixed templates and makes later revisions controllable.",
      },
      {
        headingZh: "渲染与交付",
        headingEn: "Rendering and delivery",
        bodyZh: "页面以 1280×720 的 HTML 画布渲染，再导出为 PDF 或 HTML。当前重点是提升可编辑性、图片上传与身份化设计，并通过分层提示词控制个性化程度。",
        bodyEn: "Slides render on a 1280×720 HTML canvas and export to PDF or HTML. The next priorities are richer editability, image upload and identity-aware design controlled through gated prompt layers.",
      },
    ],
  },
  {
    slug: "openclaw-evidence-tracker",
    titleZh: "证据链追踪插件技术报告",
    titleEn: "Evidence-Chain Tracker Technical Report",
    summaryZh: "把文献发现与证据核验分开，让每个结论都可以审计、追踪和复现。",
    summaryEn: "Separating literature discovery from evidence verification so every claim remains auditable, traceable and reproducible.",
    metaZh: "OPENCLAW · 证据 · 研究",
    metaEn: "OPENCLAW · EVIDENCE · RESEARCH",
    sections: [
      {
        headingZh: "发现不等于证据",
        headingEn: "Discovery is not evidence",
        bodyZh: "搜索模型负责生成候选文献，证据追踪器则独立核验论文身份、全文与具体主张。这样可以避免把搜索摘要、模型转述或错误页码直接当作证据。",
        bodyEn: "A search model proposes candidate papers while the tracker independently verifies paper identity, full text and individual claims. Search snippets, model paraphrases and invented page numbers never become evidence by default.",
      },
      {
        headingZh: "六个可组合工具",
        headingEn: "Six composable tools",
        bodyZh: "插件提供会话启动、文献搜索、引用记录、证据核验、报告生成和状态查询六类工具。它们形成清晰状态机，同时保留失败记录和每一步的审计信息。",
        bodyEn: "The plugin exposes tools for session startup, literature search, citation recording, evidence verification, report generation and status inspection. Together they form an explicit state machine that preserves failures and audit details.",
      },
      {
        headingZh: "跨来源规范化",
        headingEn: "Cross-source normalization",
        bodyZh: "系统检索 arXiv、PubMed、Europe PMC、OpenAlex、Crossref、Semantic Scholar 与 DBLP，并利用规范标识符去重，把同名冲突隔离处理。",
        bodyEn: "The system searches arXiv, PubMed, Europe PMC, OpenAlex, Crossref, Semantic Scholar and DBLP, then deduplicates with canonical identifiers and isolates ambiguous title conflicts.",
      },
      {
        headingZh: "原子主张与混合检索",
        headingEn: "Atomic claims and hybrid retrieval",
        bodyZh: "每次只核验一条原子主张。全文下载后先校验论文身份，再结合 BM25、哈希向量、数字匹配、页码提示与查询扩展寻找最相关的证据片段。",
        bodyEn: "Each verification targets one atomic claim. After download, the tracker confirms document identity and combines BM25, hash vectors, numeric matching, page hints and query expansion to retrieve the strongest passages.",
      },
      {
        headingZh: "明确的证据等级",
        headingEn: "Explicit evidence grades",
        bodyZh: "核验结果分为支持、部分支持、矛盾与未找到，并映射到绿色、黄色、红色和阻塞状态。最终 Markdown 报告同时保留成功与失败，确保读者能够复查。",
        bodyEn: "Verification outcomes are ENTAILMENT, PARTIAL, CONTRADICTION or NOT_FOUND, mapped to GREEN, YELLOW, RED and BLOCKED states. The final Markdown report keeps both successes and failures so readers can reproduce the audit.",
      },
    ],
  },
  {
    slug: "evidence-grading",
    titleZh: "可信智能体的证据分级",
    titleEn: "Evidence Grading for Trustworthy Agents",
    summaryZh: "把来源质量、结论强度和人工复核组合为可执行的判断规则。",
    summaryEn: "Turning source quality, claim strength and human review into actionable judgment rules.",
    metaZh: "信任 · 来源 · 评估",
    metaEn: "TRUST · SOURCES · EVALUATION",
    sections: [
      { headingZh: "先分离事实与判断", headingEn: "Separate facts from judgments", bodyZh: "可靠系统必须明确哪些内容来自来源，哪些内容是模型推断。", bodyEn: "Reliable systems make a visible distinction between sourced facts and model inference." },
      { headingZh: "让不确定性可操作", headingEn: "Make uncertainty actionable", bodyZh: "分级不是装饰，而是决定自动执行、请求复核或停止流程。", bodyEn: "Grades are operational controls that decide whether to proceed, request review or stop." },
    ],
  },
  {
    slug: "human-ai-handoffs",
    titleZh: "设计人机交接",
    titleEn: "Designing Human–AI Handoffs",
    summaryZh: "在自动化与人工判断之间建立清晰、可逆的交接点。",
    summaryEn: "Building clear and reversible handoff points between automation and human judgment.",
    metaZh: "人机 · 产品 · 流程",
    metaEn: "HUMAN + AI · PRODUCT · FLOW",
    sections: [
      { headingZh: "交接是一种界面", headingEn: "A handoff is an interface", bodyZh: "好的交接会提供上下文、候选方案和下一步，而不是把问题丢给用户。", bodyEn: "A good handoff supplies context, options and a next action instead of simply dumping a problem on the user." },
      { headingZh: "默认可撤销", headingEn: "Reversible by default", bodyZh: "高风险动作需要预览、确认和恢复路径。", bodyEn: "High-impact actions need preview, confirmation and a recovery path." },
    ],
  },
  {
    slug: "statistics-to-product",
    titleZh: "从统计学习到产品判断",
    titleEn: "From Statistical Learning to Product Judgment",
    summaryZh: "模型指标只有与真实决策、成本和用户体验连接时才有意义。",
    summaryEn: "Model metrics matter only when connected to real decisions, costs and user experience.",
    metaZh: "数据科学 · 产品 · 决策",
    metaEn: "DATA SCIENCE · PRODUCT · DECISIONS",
    sections: [
      { headingZh: "指标不是目标", headingEn: "Metrics are not the goal", bodyZh: "离线分数无法替代真实场景中的风险、延迟和可解释性。", bodyEn: "Offline scores cannot replace real-world risk, latency and interpretability." },
      { headingZh: "从决策倒推模型", headingEn: "Work backward from decisions", bodyZh: "先定义错误的代价，再选择阈值、数据和评估方式。", bodyEn: "Define the cost of errors first, then choose thresholds, data and evaluation." },
    ],
  },
  {
    slug: "ai-tools-notes",
    titleZh: "AI 工具使用心得",
    titleEn: "Notes on Using AI Tools",
    summaryZh: "真正影响效率的不是工具数量，而是任务边界、上下文质量和验证习惯。",
    summaryEn: "The real gains come from clear task boundaries, good context and disciplined verification.",
    metaZh: "AI 工具 · 工作流 · 笔记",
    metaEn: "AI TOOLS · WORKFLOW · NOTES",
    sections: [
      { headingZh: "工具不是工作流", headingEn: "A tool is not a workflow", bodyZh: "先定义输入、输出和验收方式，再决定把哪一步交给 AI。", bodyEn: "Define inputs, outputs and acceptance checks before deciding which step belongs to AI." },
      { headingZh: "上下文决定上限", headingEn: "Context sets the ceiling", bodyZh: "好的上下文比更长的提示词更重要。", bodyEn: "Useful context matters more than a longer prompt." },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
