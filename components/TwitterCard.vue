<script setup lang="ts">
const props = withDefaults(defineProps<{
  initialTweet?: string;
  isLoading?: boolean;
}>(), {
  initialTweet: '',
  isLoading: false,
});

const tweet = ref(props.initialTweet || '');
const isGenerated = computed(() => tweet.value.length > 0);

watch(
  () => props.initialTweet,
  (v) => {
    if (typeof v === 'string') {
      tweet.value = v;
    }
  }
);

const characterCount = computed(() => tweet.value.length);

const postToTwitter = () => {
  if (tweet.value.trim()) {
    const tweetText = encodeURIComponent(tweet.value);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank');
  }
};
</script>

<template>
  <SocialCard title="Twitter" :isLoading="props.isLoading" :isEmpty="!isGenerated">
    <div class="flex flex-col gap-4">
      <AutoResizeTextarea
        v-model="tweet"
        placeholder="Enter your tweet..."
      />

      <!-- Footer with Character Count and Post Button -->
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Character Count: <span class="text-gray-900 font-semibold dark:text-white">{{ characterCount }}</span>
        </div>
        <button
          @click="postToTwitter"
          :disabled="!tweet.trim()"
          class="btn btn-primary px-4 font-semibold"
        >
          POST
        </button>
      </div>
    </div>
  </SocialCard>
</template>
