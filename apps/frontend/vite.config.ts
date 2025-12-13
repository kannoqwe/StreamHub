import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        plugins: [react()],
        server: {
            port: 3000,
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@components': resolve(__dirname, 'src/components'),
                '@features': resolve(__dirname, 'src/features'),
                '@types': resolve(__dirname, 'src/types'),
            },
        },
    };
});
