import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, './src/index.js'),
      name: '@syncify/node',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        // Exclude native Node.js modules and dependencies
        'fs',
        'path',
        'os',
        'crypto',
        'http',
        'https',
        'stream',
      ],
      output: {
        format: 'esm', // CommonJS or 'esm' for ESM
      },
    },
  },
  plugins: [dts({ tsconfigPath: './tsconfig.json.json' }), nodePolyfills()],
});
