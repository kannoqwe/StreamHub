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
                '@': resolve(__dirname, 'src/'),
                '@api': resolve(__dirname, 'src/api/index.ts'),
                '@components': resolve(__dirname, 'src/components'),
                '@features': resolve(__dirname, 'src/features'),
                '@types': resolve(__dirname, 'src/types/index.ts'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (!id.includes('node_modules')) return;
                        if (id.includes('video.js')) return 'video';
                        if (id.includes('@heroicons') || id.includes('react-icons')) {
                            return 'icons';
                        }
                        if (
                            id.includes('react') ||
                            id.includes('react-dom') ||
                            id.includes('react-router-dom')
                        ) {
                            return 'react';
                        }
                        return 'vendor';
                    },
                },
            },
        },
    };
});
