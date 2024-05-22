/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/flow-client',

    server: {
        port: 4201,
        host: 'localhost',
    },

    preview: {
        port: 4301,
        host: 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
        outDir: '../../dist/apps/flow-client',
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },

    test: {
        alias: [
            {
                find: 'monaco-editor',
                replacement: __dirname + '/vite.config.ts',
            },
        ],
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest',
        },
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/flow-client',
            provider: 'v8',
        },
    },
});
