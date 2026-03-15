<script setup lang="ts">
import { useIsChromeExtension } from "./composables/useIsChromeExtension";

const hideChat = useIsChromeExtension();
</script>
<template>
  <div class="max-w-full w-[900px] m-auto">
    <NuxtErrorBoundary>
      <SocialMediaPostGenerator />
      <ChatWidget v-if="!hideChat" />
      <template #error="{ error }">
        <div>
          <p class="text-4xl pt-10">⚠️ A fatal error has occurred:</p>
          <p>{{ error }}</p>
        </div>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>
