<script setup lang="ts">
interface Payload {
  url: string;
  temperature: number;
}

const emit = defineEmits<{
  submit: [payload: Payload];
}>();

const url = ref('');
const temperature = ref(1);

const handleSubmit = () => {
  if (url.value.trim()) {
    emit('submit', {
      url: url.value,
      temperature: temperature.value,
    });
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col">
    <!-- URL Input -->
    <div class="flex">
      <input
        v-model="url"
        type="url"
        placeholder="Full Article URL"
        class="input input-bordered rounded-r-none flex-1 bg-white text-gray-900 placeholder-gray-500 border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
      />
      <button
        type="submit"
        class="btn rounded-l-none px-8 font-semibold"
      >
        GENERATE ANNOUNCEMENTS
      </button>
    </div>

    <!-- Temperature Slider -->
    <div class="flex flex-col gap-2">
      <input
        v-model.number="temperature"
        type="range"
        min="0"
        max="1"
        step="0.1"
        class="range range-secondary range-sm"
      />
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Temperature: {{ temperature }}
        <span class="font-bold">
          {{ temperature > 0.5 ? '- More random, creative, and risky' : '- More focused, deterministic, and safe' }}
        </span>
      </label>
    </div>
  </form>
</template>
