<script lang="ts" setup>
import { nanoid } from 'nanoid';
import type { Message, User } from '~~/types';

const props = defineProps<{
  messages: Message[]
  users: User[]
  me: User
  usersTyping?: User[]
}>()

const uniqueUsersTyping = computed(() => {
  const seen = new Set()
  return props.usersTyping?.filter((user) => {
    if (seen.has(user.id)) return false
    seen.add(user.id)
    return true
  }) || []
})

const usersTypingText = computed(() => {
  if (!uniqueUsersTyping.value?.length) return ''

  if (uniqueUsersTyping.value?.length === 1) {
    return `User ${uniqueUsersTyping.value[0].name} is typing...`
  }

  if (uniqueUsersTyping.value?.length > 2) {
    return `${uniqueUsersTyping.value.length} people are typing...`
  }

  return `${uniqueUsersTyping.value.map((user) => user.name).join(' and ')} are typing...`
})

const emit = defineEmits<{
  (event: 'newMessage', newMessage: Message): void
}>()

function getUser(userId: string) {
  return props.users.find((user) => user.id === userId)
}

const isOpen = ref(false)

const messageBox = ref<HTMLElement>()
async function scrollToBottom() {
  await nextTick()
  if (messageBox.value) {
    messageBox.value.scrollTop = messageBox.value.scrollHeight
  }
}  
watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  }
)
watch(
  () => isOpen.value,
  () => {
    if (isOpen.value)
    scrollToBottom()
  }
)

const textMessage = ref('')
function sendMessage() {
  emit('newMessage', {
    id: nanoid(),
    userId: props.me.id,
    createdAt: new Date(),
    text: textMessage.value,
  })

  textMessage.value = ''
}

function sendExampleMessage(text: string) {
  textMessage.value = text
  sendMessage()
}
</script>

<template>
  <div class="fixed bottom-[10px] right-[10px]">
    <button 
      v-show="!isOpen"
      class="bg-blue-500 p-3 rounded"
      data-test="chat-widget-trigger"
      @click="isOpen = true"
    >
      <IconChat class="w-8 h-8 text-white" />
    </button>

    <div
      v-if="isOpen"
      data-test="chat-widget-content"
      class="box bg-gray-300 dark:bg-gray-800 w-[450px]"
    >
      <header class="bg-gray-200 dark:bg-gray-900 px-4 flex justify-between items-center">
        Customer Support Chat
        <button 
          class="p-4 pr-0"
          @click="isOpen = false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </header>

      <div ref="messageBox" class="messages p-4 overflow-y-scroll max-h-[80vh]">
        <div v-if="!messages.length" class="text-center py-8">
          <p class="text-gray-600 dark:text-gray-400 mb-4">How can I help you with social media posts today?</p>
          <div class="space-y-2">
            <button 
              @click="sendExampleMessage('Help me create a social media post')" 
              class="block w-full dark:bg-gray-700 bg-gray-600 dark:text-inherit text-white py-2 px-4 rounded dark:hover:bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              Help me create a social media post
            </button>
            <button 
              @click="sendExampleMessage('How is \'Social Media Post Generator\' built?')" 
              class="block w-full dark:bg-gray-700 bg-gray-600 dark:text-inherit text-white py-2 px-4 rounded dark:hover:bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              How is 'Social Media Post Generator' built?
            </button>
            <button 
              @click="sendExampleMessage('Can I import posts from a URL?')" 
              class="block w-full dark:bg-gray-700 bg-gray-600 dark:text-inherit text-white py-2 px-4 rounded dark:hover:bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              Can I import posts from a URL?
            </button>
          </div>
        </div>

        <ChatBubble 
          v-for="message in messages"
          :key="message.id"
          :user="getUser(message.userId)"
          :message="message"
          :is-mine="me.id === message.userId"
        />

        <ChatBubble 
          v-for="user in uniqueUsersTyping"
          :user="user"
        >
          <AppLoading />
        </ChatBubble>
      </div>

      <footer class="p-2">
        <div class="h-6 px-2 text-sm italic" v-if="uniqueUsersTyping?.length">
          {{ usersTypingText }}
        </div>

        <input 
          type="text"
          v-model="textMessage"
          @keypress.enter.exact.prevent="sendMessage"
          placeholder="Type your message"
          class="input w-full block"
          data-test="chat-input"
        />
      </footer>
    </div>
  </div>
</template>
