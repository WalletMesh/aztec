import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  cacheDir: '/tmp/.vite',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'vendor/aztec-bbjs@0.65.2.js',
          dest: 'assets',
        },
      ],
    }),
    // https://github.com/AztecProtocol/aztec-packages/issues/5050
    nodePolyfills({
      include: [
        // @ts-expect-error - fs/promises is not in the types
        'fs/promises',
        'buffer',
        'util',
        'crypto',
        'path',
        'stream',
        'events',
        'string_decoder',
      ],
    }),
    topLevelAwait(),
  ],
  build: {
    rollupOptions: {
      external: ['@aztec/bb.js'],
      output: {
        paths: {
          '@aztec/bb.js': './aztec-bbjs@0.65.2.js',
        },
      },
    },
  },
});
