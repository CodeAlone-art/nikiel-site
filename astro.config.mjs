// @ts-check
import { defineConfig } from 'astro/config';

// Statyczny build – galerie działają, Cloudflare obsługuje funkcje z /functions/
export default defineConfig({
  output: 'static',
});
