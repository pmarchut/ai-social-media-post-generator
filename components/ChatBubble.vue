<script lang="ts" setup>
import type { Message, User } from '~~/types';
// @ts-expect-error: no types
import Markdown from 'vue3-markdown-it';

const props = defineProps<{
  message?: Message
  user?: User
  isMine?: boolean
}>()

const relativeTime = useTimeAgo(() => props.message?.createdAt ?? new Date())
</script>

<template>
  <div class="chat" :class="{ 'chat-end': isMine, 'chat-start': !isMine }">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img :src="user?.avatar" />
      </div>
    </div>

    <div class="chat-header text-xs opacity-50 mb-2">
      <strong>{{ user?.name }}</strong>
      &nbsp;
      <time v-if="message">{{ relativeTime }}</time>
    </div>

    <div
      class="chat-bubble py-0 prose prose-sm bg-white dark:bg-gray-900 max-w-max w-full"
      :class="{
        'dark:bg-gray-700 bg-gray-600 dark:text-inherit text-white': isMine,
      }"
    >
      <Markdown v-if="message" :source="message.text" class="w-full" />
      <slot v-else></slot>
    </div>
  </div>
</template>