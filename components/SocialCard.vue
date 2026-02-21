<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
}>(), {
  title: '',
  isLoading: false,
  isEmpty: true,
});
</script>

<template>
  <div class="card bg-white shadow-md border-t-4 border-t-primary dark:bg-slate-800 dark:border-t-primary">
    <div class="card-title text-gray-900 text-xl px-6 pt-4 pb-2 dark:text-white">{{ title }}</div>
    <div class="border-b border-gray-200 mx-6 dark:border-slate-700"></div>

    <div class="card-body p-6">
      <div v-if="isLoading" class="flex justify-center items-center">
        <svg class="spinner w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="isEmpty" class="text-left pb-4">
        <p class="text-gray-500 text-sm dark:text-gray-400">Import an article to generate an announcement</p>
      </div>

      <div v-else>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }
</style>
