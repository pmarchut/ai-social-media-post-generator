<script setup lang="ts">
import { computed } from 'vue';
import { toPng } from 'html-to-image';

const props = defineProps({
  bgImage: String, // the base64 encoded string of the image generated from @cf/lykon/dreamshaper-8-lcm
  title: String, // the title of the article scrapped from the page
  gradient: Object, // the gradient background of this image
});

// compute background style from gradient prop
const bgStyle = computed(() => {
  if (props.gradient && props.gradient.from && props.gradient.to) {
    return {
      background: `linear-gradient(to right, ${props.gradient.from}, ${props.gradient.to})`
    };
  }
  return {};
});

const imageRef = ref();
const imageSrc = ref("");

onMounted(() => {
  if (!imageRef.value) return;
  toPng(imageRef.value).then(function (dataUrl) {
    imageSrc.value = dataUrl;
  })
  .catch(function (error) {
    console.error('oops, something went wrong!', error);
  })
})
</script>

<template>
  <div ref="imageRef" data-testid="image-canvas" :style="bgStyle" :class="{hidden: imageSrc}" class="w-[400px] h-[200px] relative">
    <!-- if there's an actual image use it, otherwise fall back to gradient container -->
    <template v-if="bgImage">
      <img :src="bgImage" class="absolute top-0 bottom-0 left-0 w-[40%] h-full object-cover mix-blend-soft-light" />
      <div class="bg-white absolute top-[20%] left-[30%] right-[10%] bottom-[20%] rounded text-slate-600">
        <div class="p-2 flex items-center h-full relative">
          <div class="absolute top-0 left-0 right-0 border-b border-gray-200 flex items-center gap-1 p-1">
            <div class="bg-red-500 w-1 h-1 rounded-full"></div>
            <div class="bg-yellow-500 w-1 h-1 rounded-full"></div>
            <div class="bg-green-500 w-1 h-1 rounded-full"></div>
          </div>
          <p>{{ title }}</p>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="w-full h-full flex items-center justify-center">
        <span class="text-white font-semibold text-lg text-center">{{ 'Social Image Placeholder' }}</span>
      </div>
    </template>
  </div>
  <img v-if="imageSrc" :src="imageSrc" alt="" />
</template>
