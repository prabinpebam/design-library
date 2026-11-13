import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Features } from 'lightningcss';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
// Keep light-dark() native so a nested [data-scheme] region keeps its own scheme in a build (packages/core/AGENTS.md).
export default defineConfig({ plugins: [react()], css: { lightningcss: { exclude: Features.LightDark } }, server: { fs: { allow: [root] } } });
