import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { BASE_PATH } from './site/config.mjs';

const MIME_TYPES = {
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

export default defineConfig({
  plugins: [
    react(),
    {
      // Serve static card pages from docs/ during development
      name: 'serve-card-pages',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith(`${BASE_PATH}cards/`)) return next();

          const relativePath = req.url.replace(BASE_PATH, '');
          let filePath = join('docs', relativePath);

          // Try index.html for directory-style URLs
          if (!extname(filePath)) {
            filePath = join(filePath, 'index.html');
          }

          if (existsSync(filePath) && statSync(filePath).isFile()) {
            const ext = extname(filePath);
            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            res.end(readFileSync(filePath));
            return;
          }
          next();
        });
      },
    },
  ],
  base: BASE_PATH,
  build: {
    outDir: 'docs',
    emptyOutDir: false,
  },
});
