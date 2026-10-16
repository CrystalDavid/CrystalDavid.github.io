import { defineConfig, presetWind3, transformerDirectives } from 'unocss';

export default defineConfig({
  presets: [presetWind3()],
  transformers: [transformerDirectives()],
  shortcuts: {
    'inline-link': 'inline-flex items-center gap-1.5',
    'quiet-label': 'text-xs uppercase tracking-[0.16em]',
  },
  theme: {
    colors: {
      ink: 'var(--ink)',
      muted: 'var(--muted)',
      accent: 'var(--accent)',
      line: 'var(--line)',
    },
  },
});
