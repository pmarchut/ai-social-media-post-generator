<script setup lang="ts">
import { useChatAi } from "../composables/useChatAi";

const url = ref('');
const temperature = ref(0.5);
const generatedTweet = ref('');
const generatedFacebook = ref('');
const isGeneratingTwitter = ref(false);
const isGeneratingFacebook = ref(false);

const twitterAi = useChatAi({ agent: 'twitter' });
const facebookAi = useChatAi({ agent: 'facebook' });

const handleFormSubmit = async (payload: { url: string; temperature: number }) => {
  url.value = payload.url;
  temperature.value = payload.temperature;
  generatedTweet.value = '';
  generatedFacebook.value = '';
  isGeneratingTwitter.value = true;
  isGeneratingFacebook.value = true;

  const twitterPromise = twitterAi.chat({ url: payload.url, temperature: payload.temperature });
  const facebookPromise = facebookAi.chat({ url: payload.url, temperature: payload.temperature });

  const [tRes, fRes] = await Promise.allSettled([twitterPromise, facebookPromise]);

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

  isGeneratingTwitter.value = false;
  isGeneratingFacebook.value = false;
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl my-10">Social Media Post Generator</h1>
    
    <ImportUrlForm :url="url" :temperature="temperature" @submit="handleFormSubmit" />

    <div class="grid grid-cols-1 gap-6 mt-8">
      <TwitterCard :initialTweet="generatedTweet" :isLoading="isGeneratingTwitter" />
      <FacebookCard :initialPost="generatedFacebook" :isLoading="isGeneratingFacebook" />
      <!-- Images Card Here -->
    </div>
  </div>
</template>
