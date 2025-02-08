import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, './src/index.js'),
      name: "@syncify/core",
      formats: ['es'],
      fileName: 'index'
    }
  },
  plugins: [dts({tsconfigPath: './tsconfig.json'})]
})