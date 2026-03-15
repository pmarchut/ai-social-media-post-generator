<script setup lang="ts">
import { useIsChromeExtension } from "../composables/useIsChromeExtension";
import { useChatAi } from "../composables/useChatAi";
import ImagesCard from "./ImagesCard.vue";

const route = useRoute();
const hideForm = useIsChromeExtension();

const url = ref(route.query.url || '');
const generatedTweet = ref('');
const generatedFacebook = ref('');
const generatedImage = ref('');
const scrapedTitle = ref('');
const isGeneratingTwitter = ref(false);
const isGeneratingFacebook = ref(false);
const isGeneratingImage = ref(false);

// simple gradients array for placeholder images
const gradients = [
  { from: '#01d293', to: '#00a5ff' },
  { from: '#ff5f6d', to: '#ffc371' },
  { from: '#a1c4fd', to: '#c2e9fb' },
  { from: '#ff9a9e', to: '#fad0c4' },
];

const twitterAi = useChatAi({ agent: 'twitter' });
const facebookAi = useChatAi({ agent: 'facebook' });

onMounted(() => {
  if (url.value) {
    handleFormSubmit({ url: String(url.value), temperature: 1 })
  }
});

const handleFormSubmit = async (payload: { url: string; temperature: number }) => {
  url.value = payload.url;
  generatedTweet.value = '';
  generatedFacebook.value = '';
  generatedImage.value = '';
  scrapedTitle.value = '';
  isGeneratingTwitter.value = true;
  isGeneratingFacebook.value = true;
  isGeneratingImage.value = true;

  const twitterPromise = twitterAi.chat({ url: payload.url, temperature: payload.temperature });
  const facebookPromise = facebookAi.chat({ url: payload.url, temperature: payload.temperature });
  const imagePromise = $fetch('/api/image', {
    method: 'POST',
    body: { url: payload.url, temperature: payload.temperature },
  });
  const scrapePromise = $fetch('/api/scrape', {
    method: 'POST',
    body: { url: payload.url },
  });

  const [tRes, fRes, imgRes, scrapeRes] = await Promise.allSettled([twitterPromise, facebookPromise, imagePromise, scrapePromise]);

  if (tRes.status === 'fulfilled' && tRes.value) {
    const text = tRes.value?.choices?.[0]?.message?.content;
    if (text) generatedTweet.value = text;
  } else if (twitterAi.firstMessage.value?.content) {
    generatedTweet.value = twitterAi.firstMessage.value.content;
  }

  if (fRes.status === 'fulfilled' && fRes.value) {
    const text = fRes.value?.choices?.[0]?.message?.content;
    if (text) generatedFacebook.value = text;
  } else if (facebookAi.firstMessage.value?.content) {
    generatedFacebook.value = facebookAi.firstMessage.value.content;
  }

  if (imgRes.status === 'fulfilled' && imgRes.value) {
    generatedImage.value = imgRes.value;
  }

  if (scrapeRes.status === 'fulfilled' && scrapeRes.value) {
    scrapedTitle.value = scrapeRes.value.title;
  }

  isGeneratingTwitter.value = false;
  isGeneratingFacebook.value = false;
  isGeneratingImage.value = false;
};
</script>

<template>
  <div class="container mx-auto px-4 pb-8">
    <h1 class="text-4xl my-8">Social Media Post Generator</h1>
    
    <ImportUrlForm v-if="!hideForm" @submit="handleFormSubmit" />

    <div class="grid grid-cols-1 gap-6 mt-8">
      <TwitterCard :initialTweet="generatedTweet" :isLoading="isGeneratingTwitter" />
      <FacebookCard :initialPost="generatedFacebook" :isLoading="isGeneratingFacebook" />
      <ImagesCard :gradients="gradients" :bgImage="generatedImage" :title="scrapedTitle" :isLoading="isGeneratingImage" />
    </div>
  </div>
</template>
