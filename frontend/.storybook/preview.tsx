import type { Decorator, Preview } from '@storybook/react';
import { useEffect } from 'react';
import '../src/index.css';

/** Toolbar switch that toggles Tailwind's `dark` class, mirroring the app's theme store. */
const withTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === 'dark';
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.body.className = dark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  }, [dark]);
  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'padded',
    a11y: {
      // Fail stories on WCAG 2.1 AA rules in the a11y panel.
      config: {},
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } },
    },
  },
  tags: ['autodocs'],
};

export default preview;
