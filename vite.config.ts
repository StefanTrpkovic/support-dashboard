import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// singlefile inlines JS + CSS so the build is one portable .html
export default defineConfig({ plugins: [react(), viteSingleFile()] });
