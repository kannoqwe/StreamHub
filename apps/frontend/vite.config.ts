import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        plugins: [react()],
        server: {
            host: true,
            port: 5173,
            watch: {
                usePolling: true,
            },
        },
        proxy: {
            '/api': {
                target: 'http://backend:3000',
                changeOrigin: true,
            },
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@components': resolve(__dirname, 'src/components'),
                '@features': resolve(__dirname, 'src/features'),
                '@types': resolve(__dirname, 'src/types/index.ts'),
            },
        },
    };
});
