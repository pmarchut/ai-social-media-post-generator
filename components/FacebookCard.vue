<script setup lang="ts">
import { ref, watch } from 'vue';
import SocialCard from './SocialCard.vue';

const props = withDefaults(defineProps<{
  initialPost?: string;
  isLoading?: boolean;
}>(), {
  initialPost: '',
  isLoading: false,
});

const postText = ref(props.initialPost || '');

watch(() => props.initialPost, (v) => {
  postText.value = v || '';
});

const characterCount = computed(() => postText.value.length);

const copyToClipboard = async () => {
  const t = postText.value || '';
  if (!t) return;
  try {
    await navigator.clipboard.writeText(t);
  } catch (err) {
    console.error('Copy failed', err);
  }
};
</script>

<template>
  <SocialCard title="Facebook" :isLoading="props.isLoading" :isEmpty="!postText">
    <div class="flex flex-col gap-4">
      <AutoResizeTextarea
        v-model="postText"
        placeholder="Edit or review the Facebook post before copying..."
      />

      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Character Count: <span class="text-gray-900 font-semibold dark:text-white">{{ characterCount }}</span>
        </div>
        <div class="flex gap-2">
          <button @click="copyToClipboard" :disabled="!postText" class="btn btn-primary px-4 font-semibold">Copy</button>
        </div>
      </div>
    </div>
  </SocialCard>
</template>
