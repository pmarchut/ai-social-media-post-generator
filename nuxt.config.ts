// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-22',
  modules: ["@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    HF_API_KEY: "",
    CF_ACCOUNT_ID: "",
    CF_API_TOKEN: "",
  },
  ssr: false,
});
