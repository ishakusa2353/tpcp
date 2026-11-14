import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function noCacheLoaderPlugin(): Plugin {
  const serveLoader = (req: {url?: string}, res: {setHeader: (k: string, v: string) => void; end: (b: Buffer | string) => void}, next: () => void) => {
    const cleanUrl = (req.url || '').split('?')[0];
    if (cleanUrl === '/loader.js') {
      const rootFile = path.resolve(__dirname, 'loader.js');
      const pubFile = path.resolve(__dirname, 'public', 'loader.js');
      const target = fs.existsSync(rootFile) ? rootFile : pubFile;
      if (fs.existsSync(target)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(fs.readFileSync(target));
        return;
      }
    }
    next();
  };

  return {
    name: 'no-cache-loader-js',
    configureServer(server) {
      server.middlewares.use(serveLoader);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveLoader);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), noCacheLoaderPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
