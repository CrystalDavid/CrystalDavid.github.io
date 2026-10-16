export const profile = {
  name: 'David',
  email: 'g2811459442@gmail.com',
  github: 'https://github.com/CrystalDavid',
  location: { zh: '中国 · 深圳', en: 'Shenzhen, China' },
  school: { zh: '南方科技大学', en: 'Southern University of Science and Technology' },
  major: { zh: '数据科学与大数据技术', en: 'Data Science & Big Data Technology' },
};

export const navigation = [
  { id: 'about', number: '01', zh: '关于我', en: 'About' },
  { id: 'projects', number: '02', zh: '项目实践', en: 'Projects' },
  { id: 'writing', number: '03', zh: '文章与笔记', en: 'Writing' },
  { id: 'offscreen', number: '04', zh: '屏幕之外', en: 'Offscreen' },
];

export const projects = [
  {
    name: 'PPT-Agent',
    type: { zh: '演示文稿智能体', en: 'Presentation agent' },
    description: {
      zh: '从需求澄清、资料调研到设计与导出，把想法逐步变成真正可编辑的演示文稿。每一步，都可以停下来认真打磨。',
      en: 'From discovery and research to design and export. A step-by-step workflow that turns an idea into genuinely editable slides, with room to review along the way.',
    },
    image: '/media/ppt-agent-welcome.png',
    alt: { zh: 'PPT-Agent 欢迎界面，提供新建设计和导入项目入口', en: 'PPT-Agent welcome screen with options to start a design or import a project' },
    github: 'https://github.com/CrystalDavid/PPT-Agent',
    demo: 'https://lambent-zabaione-8eab6b.netlify.app/',
    article: 'ppt-agent-report',
  },
  {
    name: 'Evidence Tracker',
    type: { zh: '科研证据链插件', en: 'Research evidence plugin' },
    description: {
      zh: '为 OpenClaw 构建可追溯的论文证据链。从论文身份核对、全文检索到页级证据，让每一个研究结论都有据可查。',
      en: 'Traceable research evidence for OpenClaw. Paper identity checks, full-text retrieval and page-level evidence help connect research claims to their sources.',
    },
    image: '/media/evidence-tracker-workflow.svg',
    alt: { zh: 'Evidence Tracker 的论文身份核对、全文检索、Claim 核验和审计报告流程', en: 'Evidence Tracker workflow: paper identity checks, full-text evidence retrieval, claim review and an auditable report' },
    github: 'https://github.com/CrystalDavid/OpenClaw-Evidence-Tracker',
    demo: null,
    article: 'openclaw-evidence-tracker',
  },
];
