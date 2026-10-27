import pptAgentWelcome from '../assets/ppt-agent-welcome.png';
import sustechEmblem from '../assets/sustech-emblem.webp';

export const profile = {
  email: 'g2811459442@gmail.com',
  github: 'https://github.com/CrystalDavid',
  school: 'Southern University of Science and Technology',
};

export const education = {
  school: profile.school,
  degree: 'Bachelor’s degree',
  major: 'Data Science and Big Data Technology',
  period: '2023 - 2027',
  emblem: sustechEmblem.src,
};

export const navigation = [
  { id: 'about', label: 'About Me' },
  { id: 'education', label: 'Education' },
  { id: 'interests', label: 'Research Interests' },
  { id: 'publications', label: 'Publications' },
  { id: 'projects', label: 'Projects' },
];

export const projects = [
  {
    name: 'PPT-Agent',
    type: 'Presentation agent',
    image: pptAgentWelcome,
    alt: 'PPT-Agent welcome screen with options to start a design or import a project',
    github: 'https://github.com/CrystalDavid/PPT-Agent',
    demo: 'https://lambent-zabaione-8eab6b.netlify.app/',
    slug: 'ppt-agent',
  },
  {
    name: 'Evidence Tracker',
    type: 'Research evidence plugin',
    image: '/media/evidence-tracker-workflow.svg',
    alt: 'Evidence Tracker workflow: paper identity checks, full-text evidence retrieval, claim review and an auditable report',
    github: 'https://github.com/CrystalDavid/OpenClaw-Evidence-Tracker',
    demo: null,
    slug: 'evidence-tracker',
  },
];
