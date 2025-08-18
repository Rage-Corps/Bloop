import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/scripts', '@nuxt/ui'],

  runtimeConfig: {
    public: {
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL,
    },
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: {
        port: 3000,
        host: '0.0.0.0'
      },
      watch: {
        usePolling: true,
        interval: 1000
      }
    }
  },

  css: ['~/assets/css/main.css'],

  imports: {
    dirs: ['composables/**'],
  },
});
