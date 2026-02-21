import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auto-resize', {
    mounted(el: HTMLElement) {
      const ta = el as HTMLTextAreaElement & { __autoResize?: () => void };
      const resize = () => {
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
      };
      ta.__autoResize = resize;
      ta.addEventListener('input', resize);
      // initial sizing
      resize();
    },
    updated(el: HTMLElement) {
      const ta = el as HTMLTextAreaElement & { __autoResize?: () => void };
      // ensure size is corrected when value changes programmatically
      ta.__autoResize && ta.__autoResize();
    },
    beforeUnmount(el: HTMLElement) {
      const ta = el as HTMLTextAreaElement & { __autoResize?: () => void };
      if (ta.__autoResize) ta.removeEventListener('input', ta.__autoResize);
      delete ta.__autoResize;
    },
  });
});
