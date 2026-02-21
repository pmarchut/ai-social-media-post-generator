<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <textarea
    v-auto-resize
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :placeholder="placeholder"
    :disabled="disabled"
    class="textarea p-2 bg-white dark:bg-slate-800 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary dark:text-white dark:placeholder-gray-400"
  ></textarea>
</template>

<style scoped>
textarea {
  resize: none;
  overflow: hidden;
  min-height: 4rem;
}
</style>
