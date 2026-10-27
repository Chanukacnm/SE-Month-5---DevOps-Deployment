import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  async viteFinal(config) {
    // The app's manualChunks split targets the SPA entry; let Storybook chunk on its own.
    const output = config.build?.rollupOptions?.output;
    if (output && !Array.isArray(output)) delete output.manualChunks;
    return config;
  },
};

export default config;
