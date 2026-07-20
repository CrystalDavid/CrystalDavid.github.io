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
  meta: string;
  sections: ArticleSection[];
};

export const articles: Article[] = [
  {
    slug: "ai-tools-notes",
    titleZh: "AI 工具使用心得",
    titleEn: "Notes on Using AI Tools",
    summaryZh:
      "从 Gemini、Codex 到 Claude Code：真正影响效率的不是工具数量，而是任务边界、上下文质量和验证习惯。",
    summaryEn:
      "From Gemini and Codex to Claude Code: the real gains come from clear task boundaries, good context and disciplined verification.",
    meta: "AI TOOLS · WORKFLOW · NOTES",
    sections: [
      {
        headingZh: "工具不是工作流",
        headingEn: "A tool is not a workflow",
        bodyZh:
          "模型能力越强，越容易让人把“能生成”误认为“已完成”。我更愿意先定义输入、输出和验收方式，再决定把哪一步交给 AI。这样工具变化时，工作方法仍然成立。",
        bodyEn:
          "Powerful models make it easy to confuse generation with completion. I define inputs, outputs and acceptance checks first, then decide which step belongs to AI.",
      },
      {
        headingZh: "上下文决定上限",
        headingEn: "Context sets the ceiling",
        bodyZh:
          "高质量上下文不是把所有资料一次塞进去，而是提供当前决策真正需要的证据、约束和已有状态。上下文越可审计，模型的回答越容易被检查。",
        bodyEn:
          "Good context is not a giant dump. It is the evidence, constraints and current state needed for the decision at hand—and it should remain auditable.",
      },
      {
        headingZh: "验证是最后一公里",
        headingEn: "Verification is the last mile",
        bodyZh:
          "代码要构建和测试，研究结论要回到来源，视觉结果要在真实设备上检查。只有经过验证的输出，才有资格进入下一步。",
        bodyEn:
          "Code needs builds and tests, claims need sources, and visual work needs real-device review. Only verified output should move forward.",
      },
    ],
  },
  {
    slug: "ppt-agent",
    titleZh: "PPT-Agent 实现思路",
    titleEn: "How I Built PPT-Agent",
    summaryZh:
      "从需求访谈到可编辑 PPTX，一套把内容策划、页面设计、局部修改和最终交付串起来的七阶段工作流。",
    summaryEn:
      "A seven-stage workflow from requirements interview to editable PPTX, connecting content planning, visual design, revision and delivery.",
    meta: "AGENT · PRESENTATION · SYSTEM",
    sections: [
      {
        headingZh: "从表达目标开始",
        headingEn: "Start with the communication goal",
        bodyZh:
          "PPT-Agent 的第一步不是选模板，而是询问受众、场景、时长和希望促成的行动。只有明确表达目标，页面数量和视觉风格才有意义。",
        bodyEn:
          "PPT-Agent begins with audience, setting, time and desired action—not a template. Page count and visual style only make sense after that.",
      },
      {
        headingZh: "把生成拆成可检查阶段",
        headingEn: "Make generation inspectable",
        bodyZh:
          "系统把任务拆为访谈、调研、大纲、页级策划、视觉生成、复核和导出。每一步都有结构化产物，失败时只返工局部，不必整套重来。",
        bodyEn:
          "The system separates interview, research, outline, page planning, visual generation, review and export. Each stage has a structured artifact.",
      },
      {
        headingZh: "交付必须可继续编辑",
        headingEn: "Delivery must stay editable",
        bodyZh:
          "最终文件不是一组截图。文字、形状和图表仍然能够在 PowerPoint 中修改，这让 AI 生成从演示效果走向真实生产。",
        bodyEn:
          "The final deck is not a stack of screenshots. Text, shapes and charts remain editable in PowerPoint, making the output useful in production.",
      },
    ],
  },
  {
    slug: "openclaw-evidence",
    titleZh: "OpenClaw 证据链追踪",
    titleEn: "Evidence Trails in OpenClaw",
    summaryZh:
      "为科研 Agent 增加来源核验、证据分级与可追踪的研究过程，让结论和引用之间始终存在清晰路径。",
    summaryEn:
      "Adding source validation, evidence grading and traceable research steps to a research agent so claims remain connected to their evidence.",
    meta: "OPENCLAW · EVIDENCE · RESEARCH",
    sections: [
      {
        headingZh: "为什么需要证据链",
        headingEn: "Why evidence trails matter",
        bodyZh:
          "Agent 可以很快给出流畅答案，但流畅并不等于可靠。证据链记录每个关键判断依赖了什么来源、来源质量如何，以及是否经过交叉验证。",
        bodyEn:
          "Agents can produce fluent answers quickly, but fluency is not reliability. An evidence trail records the sources, their quality and cross-check status.",
      },
      {
        headingZh: "让来源成为结构化数据",
        headingEn: "Treat sources as structured data",
        bodyZh:
          "系统把标题、作者、时间、链接、摘录和支持的具体主张一起保存。这样来源不再是报告末尾的装饰，而是推理过程的一部分。",
        bodyEn:
          "Titles, authors, dates, links, excerpts and supported claims are stored together. Sources become part of reasoning instead of decoration.",
      },
      {
        headingZh: "保留人的判断位置",
        headingEn: "Keep a place for human judgment",
        bodyZh:
          "当来源冲突、时效性不足或结论影响较大时，系统应主动升级给人，而不是继续用更肯定的语气掩盖不确定性。",
        bodyEn:
          "When sources conflict, age poorly or carry high impact, the system should escalate to a person instead of hiding uncertainty behind confident prose.",
      },
    ],
  },
  {
    slug: "evidence-grading",
    titleZh: "可信 Agent 的证据分级",
    titleEn: "Evidence Grading for Trustworthy Agents",
    summaryZh:
      "不是所有来源都应拥有同样权重。用来源类型、直接性、时效性和一致性帮助 Agent 管理不确定性。",
    summaryEn:
      "Not all sources deserve equal weight. Source type, directness, recency and agreement help an agent manage uncertainty.",
    meta: "TRUST · SOURCES · EVALUATION",
    sections: [
      {
        headingZh: "先区分事实与判断",
        headingEn: "Separate fact from judgment",
        bodyZh:
          "事实主张需要可核验的原始来源；解释和建议则需要展示假设。先区分两者，才能选择合适的证据标准。",
        bodyEn:
          "Factual claims need verifiable primary sources, while interpretation needs visible assumptions. Different claims require different standards.",
      },
      {
        headingZh: "分级不是简单打分",
        headingEn: "Grading is more than a score",
        bodyZh:
          "单一分数会掩盖信息。更有效的方法是同时记录来源类型、与主张的距离、发布时间和其他来源是否一致。",
        bodyEn:
          "A single score hides information. It is more useful to record source type, distance from the claim, recency and agreement with other sources.",
      },
    ],
  },
  {
    slug: "human-ai-handoffs",
    titleZh: "人与 AI 的协作节点",
    titleEn: "Designing Human–AI Handoffs",
    summaryZh:
      "好的 Agent 不是删除人，而是把人的判断安排在最有价值的节点：定义目标、处理例外和承担最终责任。",
    summaryEn:
      "A good agent does not remove people. It places human judgment where it adds the most value: goals, exceptions and accountability.",
    meta: "HUMAN + AI · PRODUCT · FLOW",
    sections: [
      {
        headingZh: "自动化高频，保留高风险",
        headingEn: "Automate frequency, preserve high-risk judgment",
        bodyZh:
          "重复、可逆、容易验证的步骤适合自动化；影响大、信息不足或需要价值判断的步骤应该明确交还给人。",
        bodyEn:
          "Repetitive, reversible and verifiable work is suitable for automation. High-impact or value-laden decisions should return to a person.",
      },
      {
        headingZh: "交接必须带着状态",
        headingEn: "A handoff needs state",
        bodyZh:
          "Agent 交给人的不应只有一句“请确认”，还应包括已完成的工作、证据、未解决问题和可选择的下一步。",
        bodyEn:
          "An agent should hand over completed work, evidence, unresolved questions and available next steps—not just a request to confirm.",
      },
    ],
  },
  {
    slug: "statistics-to-product",
    titleZh: "从统计学习到产品判断",
    titleEn: "From Statistical Learning to Product Judgment",
    summaryZh:
      "模型指标只回答了一部分问题。真正的产品判断还要考虑数据质量、用户成本、错误后果与可解释性。",
    summaryEn:
      "Model metrics answer only part of the question. Product judgment also depends on data quality, user cost, error impact and explainability.",
    meta: "DATA SCIENCE · PRODUCT · DECISIONS",
    sections: [
      {
        headingZh: "指标需要语境",
        headingEn: "Metrics need context",
        bodyZh:
          "准确率提升并不自动等于用户体验提升。必须知道错误发生在哪里、影响谁，以及用户是否能够发现和修正。",
        bodyEn:
          "Higher accuracy does not automatically improve the experience. We need to know where errors happen, who they affect and whether users can recover.",
      },
      {
        headingZh: "把不确定性设计进界面",
        headingEn: "Design uncertainty into the interface",
        bodyZh:
          "当模型没有足够把握时，界面应提供来源、置信提示或进一步确认，而不是把概率输出包装成确定答案。",
        bodyEn:
          "When confidence is low, the interface should expose sources, confidence or a confirmation step instead of presenting probability as certainty.",
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
