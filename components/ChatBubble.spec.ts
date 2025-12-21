import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatBubble from './ChatBubble.vue'

vi.mock('@vueuse/core', () => ({
  useTimeAgo: () => '2 minutes ago',
}))

vi.mock('vue3-markdown-it', () => {
  return {
    default: {
      name: 'Markdown',
      props: {
        source: {
          type: String,
          required: true,
        },
      },
      template: `<div data-testid="markdown">{{ source }}</div>`,
    },
  }
})

describe('ChatBubble.vue', () => {
  const user = {
    id: 'user-1',
    name: 'Alice',
    avatar: 'alice.png',
  }

  const message = {
    id: 'msg-1',
    userId: 'user-1',
    text: '**Hello world**',
    createdAt: new Date(),
  }

  const mountBubble = (props: any, slots?: any) =>
    mount(ChatBubble, { props, slots })

  it('renders message text and user name', () => {
    const wrapper = mountBubble({ message, user })

    expect(wrapper.text()).toContain('Hello world')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('2 minutes ago')
    expect(wrapper.find('img').attributes('src')).toBe('alice.png')
  })

  it('renders slot when message is not provided', () => {
    const wrapper = mountBubble(
      { user },
      { default: 'Fallback content' },
    )

    expect(wrapper.text()).toContain('Fallback content')
  })

  it('applies correct class when isMine is true', () => {
    const wrapper = mountBubble({ message, user, isMine: true })

    expect(wrapper.classes()).toContain('chat-end')
    expect(wrapper.find('.chat-bubble').classes()).toContain('bg-gray-600')
  })

  it('applies correct class when isMine is false', () => {
    const wrapper = mountBubble({ message, user, isMine: false })

    expect(wrapper.classes()).toContain('chat-start')
  })

  it('passes message text to Markdown component', () => {
    const wrapper = mountBubble({ message, user })

    const markdown = wrapper.get('[data-testid="markdown"]')
    expect(markdown.text()).toBe(message.text)
  })
})
