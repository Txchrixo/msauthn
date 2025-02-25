/* eslint-disable n/no-unpublished-import */
/* eslint-disable n/no-process-exit */
/* eslint-disable n/no-extraneous-import */
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  keepNames: true,
  sourcemap: true,
  sourcesContent: false,
  target: 'node18',
  platform: 'node',
  outfile: 'dist/main.js',
  format: 'esm',
  banner: {
    js: 'import "reflect-metadata";',
  },
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
