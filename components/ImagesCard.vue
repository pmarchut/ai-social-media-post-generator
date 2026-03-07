<script setup lang="ts">
import SocialCard from "./SocialCard.vue";
import ImageCanvas from "./ImageCanvas.vue";

const props = defineProps<{
  gradients?: { from: string; to: string }[];
  bgImage?: string;
  title?: string;
  isLoading?: boolean;
}>()
</script>

<template>
  <SocialCard title="Images" :isEmpty="!gradients || gradients.length === 0" :isLoading="isLoading">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="(g) in gradients"
        :key="`${g.from}-${g.to}`"
        class="flex flex-col items-center"
      >
        <ImageCanvas
          :gradient="g"
          :bgImage="bgImage"
          :title="title"
        />
        <p class="text-sm text-gray-700 dark:text-gray-300 text-left mt-1 w-full">
          (right click image to save)
        </p>
      </div>
    </div>
  </SocialCard>
</template>
